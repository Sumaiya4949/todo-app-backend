const axios = require("axios");

const REST_API_SERVER = "http://localhost:5000";
const REST_API_VERSION = "1";

const connector = {
  async getMe(sid) {
    const { data } = await axios.get(
      `${REST_API_SERVER}/auth/v${REST_API_VERSION}/who-am-i`,
      {
        headers: { Cookie: `sid=${sid};` },
      }
    );

    return data.user;
  },

  async getMyTodos(sid) {
    const { data } = await axios.get(
      `${REST_API_SERVER}/api/v${REST_API_VERSION}/all-todos`,
      {
        headers: { Cookie: `sid=${sid};` },
      }
    );

    return data.todos;
  },

  async addTodo(title, sid) {
    const putData = { title };
    const putHeaders = { Cookie: `sid=${sid};` };

    const { data } = await axios.put(
      `${REST_API_SERVER}/api/v${REST_API_VERSION}/add-todo`,
      putData,
      {
        headers: putHeaders,
      }
    );

    return data.todo;
  },

  async deleteTodo(id, sid) {
    const delData = { id };
    const delHeaders = { Cookie: `sid=${sid};` };

    await axios.delete(
      `${REST_API_SERVER}/api/v${REST_API_VERSION}/delete-todo`,
      {
        data: delData,
        headers: delHeaders,
      }
    );

    return true;
  },

  async changeTodoStatus(id, isDone, sid) {
    const changeHeaders = { Cookie: `sid=${sid};` };

    const { data } = await axios.post(
      `${REST_API_SERVER}/api/v${REST_API_VERSION}/check-todo`,
      {
        id,
        isDone,
      },
      {
        headers: changeHeaders,
      }
    );

    return data.todo;
  },
};

module.exports = connector;
