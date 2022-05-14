const loginResolver = (parent, args, context) => {
  const { setSidCookie, dataSources } = context;
  const { email, passwordHash } = args;
  return dataSources.todoApi.login(email, passwordHash, setSidCookie);
};

module.exports = { loginResolver };
