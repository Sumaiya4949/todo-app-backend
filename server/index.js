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

app.put("/api/register", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
