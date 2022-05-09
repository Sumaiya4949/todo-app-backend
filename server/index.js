const express = require("express");
const { v4: generateID } = require("uuid");
const pgp = require("pg-promise")();
const cookieParser = require("cookie-parser");

const dbConnSettings = {
  host: "localhost",
  port: 9000,
  database: "postgres",
  user: "postgres",
  password: "sinthy4949",
};

const db = pgp(dbConnSettings);

const app = express();
const port = 5000;

app.use(cookieParser());
app.use(express.json());

app.put("/auth/register", async (req, res) => {
  const email = req.body.email;
  const passwordHash = req.body.passwordHash;
  const fullname = req.body.fullname;
  const id = generateID();

  try {
    await db.any(
      `INSERT INTO AUTH VALUES ('${email}', '${passwordHash}', '${id}');`
    );
  } catch (error) {
    res.status(400).send({ message: "Could not save credentials" });
    return;
  }

  try {
    await db.any(`INSERT INTO APP_USER VALUES ('${id}', '${fullname}');`);
    res.send({ id });
  } catch (error) {
    await db.any(`DELETE FROM AUTH WHERE EMAIL='${email}'`);
    res.status(400).send({ message: "Could not save user info" });
  }
});

app.post("/auth/login", async (req, res) => {
  const email = req.body.email;
  const passwordHash = req.body.passwordHash;

  try {
    const rows = await db.any(
      `SELECT ID FROM AUTH WHERE EMAIL='${email}' AND PASS_HASH='${passwordHash}';`
    );

    if (rows.length !== 1) {
      throw new Error("Not found");
    }

    const [authData] = rows;
    const sid = generateID();

    await db.any(
      `INSERT INTO APP_SESSION VALUES ('${authData.id}', '${sid}');`
    );

    const [appUserData] = await db.any(
      `SELECT FULLNAME FROM APP_USER WHERE ID='${authData.id}';`
    );

    res.cookie("sid", sid, { expires: false, httpOnly: true });
    res.send({
      user: {
        fullname: appUserData.fullname,
        id: authData.id,
      },
    });
  } catch (error) {
    res.status(400).end();
  }
});

app.post("/auth/logout", async (req, res) => {
  try {
    const sid = req.cookies.sid;
    await db.any(`DELETE FROM APP_SESSION WHERE S_ID='${sid}';`);
    res.clearCookie("sid");
    res.end();
  } catch (error) {
    res.status(400).end();
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

app.get("/auth/who-am-i", async (req, res) => {
  try {
    const sid = req.cookies.sid;

    const [userAppSessionData] = await db.any(
      `SELECT U_ID FROM APP_SESSION WHERE S_ID='${sid}';`
    );

    const [appUserData] = await db.any(
      `SELECT FULLNAME FROM APP_USER WHERE ID='${userAppSessionData.u_id}';`
    );

    res.send({
      user: {
        fullname: appUserData.fullname,
        id: userAppSessionData.u_id,
      },
    });
  } catch (error) {
    res.status(400).send({ user: null });
  }
});

const getUserIdFromRequest = async (req) => {
  const sid = req.cookies.sid;

  if (sid) {
    const rows = await db.any(
      `SELECT U_ID FROM APP_SESSION WHERE S_ID='${sid}';`
    );

    if (rows.length === 1) {
      const uid = rows[0].u_id;
      return uid;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

app.put("/api/add-todo", async (req, res) => {
  try {
    const title = req.body.title;
    const todoId = generateID();
    const creatorId = await getUserIdFromRequest(req);

    if (!creatorId) {
      throw new Error();
    }

    await db.any(
      `INSERT INTO TODO VALUES ('${todoId}', '${title}', false, '${creatorId}');`
    );

    res.send({
      todo: {
        id: todoId,
        title,
        isDone: false,
      },
    });
  } catch (error) {
    res.status(400).end();
  }
});
