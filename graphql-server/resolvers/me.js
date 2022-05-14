const meResolver = (obj, args, context) => {
  const { sid, dataSources } = context;
  return dataSources.todoApi.getMe(sid);
};

module.exports = { meResolver };
