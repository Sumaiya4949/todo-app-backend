const userResolver = {
  fullname: (parent) => parent.fullname,

  id: (parent) => parent.id,

  todos: (parent, arg, context) => {
    const { sid, dataSources } = context;
    return dataSources.todoApi.getMyTodos(sid);
  },
};

module.exports = {
  userResolver,
};
