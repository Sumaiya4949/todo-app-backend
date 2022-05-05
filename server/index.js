const express = require("express");
const { v4: generateID } = require("uuid");
const pgp = require("pg-promise")();

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

app.use(express.json());

app.put("/auth/register", async (req, res) => {
  const email = req.body.email;
  const passwordHash = req.body.passwordHash;
  const fullName = req.body.fullName;
  const id = generateID();

  try {
    await db.any(
      `INSERT INTO AUTH VALUES ('${email}', '${passwordHash}', '${id}');`
    );
    await db.any(`INSERT INTO APP_USER VALUES ('${id}', '${fullName}');`);

    res.send({ success: true, id });
  } catch (error) {
    res.status(400).send({ success: false });
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

    const [userData] = rows;
    const sid = generateID();

    await db.any(
      `INSERT INTO APP_SESSION VALUES ('${userData.id}', '${sid}');`
    );

    res.cookie("sid", sid, { maxAge: 900000, httpOnly: true });
    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
