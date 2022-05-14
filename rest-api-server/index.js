const express = require("express");
const { v4: generateID } = require("uuid");
const pgp = require("pg-promise")();
const cookieParser = require("cookie-parser");

const API_VERSION = "1";

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

/**
 * REST API #3 for user registration
 * @description
 *  - Extracts email, password hash, fullname from the request
 *  - Generates unique ID for the new user
 *  - Saves the user information to the database
 *  - If success,
 *    - Sends the user ID as response
 *  - If fails,
 *    - Sends 400 status and an error message
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */

app.put(`/auth/v${API_VERSION}/register`, async (req, res) => {
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

/**
 * REST API #1 for user login
 * @description
 *  - Extracts email, passwordHash from the request
 *  - Gets user id based on email and password hash from the database
 *  - Saves user id and generated session id to the database
 *  - If success,
 *    - Sends session as "sid" cookie
 *    - Sends user information
 *  - If fails,
 *    - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.post(`/auth/v${API_VERSION}/login`, async (req, res) => {
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

/**
 * REST API #2 for user logout
 * @description
 *  - Extract session id from request
 *  - Delete session information from database
 *  - If success,
 *    - Instruct the client to clear "sid" cookie
 *  - If fails,
 *    - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.post(`/auth/v${API_VERSION}/logout`, async (req, res) => {
  try {
    const sid = req.cookies.sid;
    await db.any(`DELETE FROM APP_SESSION WHERE S_ID='${sid}';`);
    res.clearCookie("sid");
    res.end();
  } catch (error) {
    res.status(400).end();
  }
});

/**
 * REST API #6 for authenticated user info
 * @description
 * - Extract session id from request
 * - Gets user id based on seesion id from the database
 * - If success,
 *  - Sends user information
 * - If fails,
 *  - Sends 400 status
 *  - Doesn't send any user information
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.get(`/auth/v${API_VERSION}/who-am-i`, async (req, res) => {
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
    console.log(error);
    res.status(400).send({ user: null });
  }
});

/**
 * Get user id from request
 * @description
 *  - Extracts session id from request
 *  - If session id exists,
 *    - Saves user id from database
 *  - If session id not valid
 *    - Doesn't save user id from database
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @returns {string | null} User id of todo creator
 */
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

/**
 * REST API #5 for add todo
 * @description
 * - Extracts title from request
 * - Generates todo id
 * - Gets the todo creator's id
 * - If creator's id doesn't exist,
 *  - Throws an error
 * - Saves todo to the database
 * - If success,
 *  - Sends todo as response
 * - If fails,
 *  - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.put(`/api/v${API_VERSION}/add-todo`, async (req, res) => {
  try {
    const title = req.body.title;
    const todoId = generateID();
    const creatorId = await getUserIdFromRequest(req);

    if (!creatorId) {
      throw new Error();
    }

    await db.any(
      `INSERT INTO TODO VALUES ('${todoId}', '${title}', false, current_timestamp, '${creatorId}');`
    );

    const [creationTimeData] = await db.any(
      `SELECT CREATION_TIME FROM TODO WHERE ID='${todoId}';`
    );

    res.send({
      todo: {
        id: todoId,
        title,
        isDone: false,
        creationTime: new Date(creationTimeData.creation_time).getTime(),
      },
    });
  } catch (error) {
    res.status(400).end();
  }
});

/**
 * REST API #4 for geting all todos
 * @description
 * - Gets the todo creator's id
 * - If creator's id doesn't exist,
 *  - Throws an error
 * - Gets all todo of the current user from the database
 * - If success,
 *  - Sends all todos
 * - If fails,
 *  - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.get(`/api/v${API_VERSION}/all-todos`, async (req, res) => {
  try {
    const creatorId = await getUserIdFromRequest(req);

    if (!creatorId) {
      throw new Error();
    }

    const rows = await db.any(
      `SELECT * FROM TODO WHERE CREATOR_ID='${creatorId}';`
    );

    res.send({
      todos: rows.map((todoItem) => ({
        id: todoItem.id,
        title: todoItem.title,
        isDone: todoItem.is_done,
        creationTime: new Date(todoItem.creation_time).getTime(),
      })),
    });
  } catch (error) {
    res.status(400).end();
  }
});

/**
 * REST API #8 for changing todo status
 * @description
 * - Extract todo id and todo status from request
 * - Gets todo creator's data from database
 * - Gives permission to update todo status to only the todo creator
 * - Updates todo status in database
 * - Gets the updated todo information
 * - If success,
 *  - Sends information of the modified todo
 * - If fails,
 *  - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.post(`/api/v${API_VERSION}/check-todo`, async (req, res) => {
  try {
    const id = req.body.id;
    const isDone = req.body.isDone;
    const authUserId = await getUserIdFromRequest(req);

    if (!authUserId) {
      throw new Error();
    }

    const [todoCreatorData] = await db.any(
      `SELECT CREATOR_ID FROM TODO WHERE ID='${id}';`
    );

    if (todoCreatorData.creator_id !== authUserId) {
      throw new Error();
    }

    await db.any(`UPDATE TODO SET IS_DONE = ${isDone} WHERE ID='${id}';`);

    const [todoData] = await db.any(`SELECT * FROM TODO WHERE ID='${id}';`);

    res.send({
      todo: {
        id: todoData.id,
        title: todoData.title,
        isDone: todoData.is_done,
        creationTime: new Date(todoData.creation_time).getTime(),
      },
    });
  } catch (error) {
    res.status(400).end();
  }
});

/**
 * REST API #7 for deleting todo
 * @description
 * - Extracts todo id from request
 * - Gets todo creator's data from database
 * - Deletes todo from database if the requesting user is its creator
 * - If success,
 *  - Sends 200 status
 * - If fails,
 *  - Sends 400 status
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 */
app.delete(`/api/v${API_VERSION}/delete-todo`, async (req, res) => {
  try {
    const todoId = req.body.id;
    const authUserId = await getUserIdFromRequest(req);

    if (!authUserId) {
      throw new Error();
    }

    const [todoCreatorData] = await db.any(
      `SELECT CREATOR_ID FROM TODO WHERE ID='${todoId}';`
    );

    if (todoCreatorData.creator_id !== authUserId) {
      throw new Error();
    }

    await db.any(`DELETE FROM TODO WHERE ID='${todoId}';`);
    res.end();
  } catch (error) {
    res.status(400).end();
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
