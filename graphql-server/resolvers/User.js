const axios = require("axios");

const userResolver = {
  fullname: (parent) => parent.fullname,

  id: (parent) => parent.id,

  todos: async (parent, arg, context) => {
    const { data } = await axios.get("http://localhost:5000/api/v1/all-todos", {
      headers: { Cookie: `sid=${context.sid};` },
    });

    return data.todos;
  },
};

module.exports = {
  userResolver,
};
