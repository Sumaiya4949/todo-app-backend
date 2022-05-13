const axios = require("axios");

const meResolver = async (_, obj, context) => {
  const { sid } = context;

  const { data: userData } = await axios.get(
    "http://localhost:5000/auth/v1/who-am-i",
    {
      headers: { Cookie: `sid=${sid};` },
    }
  );

  const { user } = userData;

  const { data: todosData } = await axios.get(
    "http://localhost:5000/api/v1/all-todos",
    {
      headers: { Cookie: `sid=${sid};` },
    }
  );

  const { todos } = todosData;

  return { ...user, todos };
};

module.exports = { meResolver };
