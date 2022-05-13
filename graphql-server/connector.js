const axios = require("axios");

const connector = {
  async getMe(sid) {
    const { data } = await axios.get("http://localhost:5000/auth/v1/who-am-i", {
      headers: { Cookie: `sid=${sid};` },
    });

    return data.user;
  },

  async getMyTodos(sid) {
    const { data } = await axios.get("http://localhost:5000/api/v1/all-todos", {
      headers: { Cookie: `sid=${sid};` },
    });

    return data.todos;
  },
};

module.exports = connector;
