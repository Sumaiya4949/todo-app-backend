const axios = require("axios");

const meResolver = async (obj, args, context) => {
  const { data } = await axios.get("http://localhost:5000/auth/v1/who-am-i", {
    headers: { Cookie: `sid=${context.sid};` },
  });

  return data.user;
};

module.exports = { meResolver };
