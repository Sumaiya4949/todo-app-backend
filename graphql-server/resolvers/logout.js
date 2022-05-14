const logoutResolver = (parent, args, context) => {
  const { sid, clearSidCookie, dataSources } = context;

  return dataSources.todoApi.logout(sid, clearSidCookie);
};

module.exports = { logoutResolver };
