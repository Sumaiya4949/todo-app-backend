const registerResolver = (parent, args, context) => {
  const { dataSources } = context;
  const { email, passwordHash, fullname } = args;

  return dataSources.todoApi.register(email, passwordHash, fullname);
};

module.exports = { registerResolver };
