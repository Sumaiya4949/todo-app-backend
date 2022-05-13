const deleteTodoResolver = (parent, args, context) => {
  const { sid, dataSources } = context;
  const { id } = args;
  return dataSources.todoApi.deleteTodo(id, sid);
};

module.exports = { deleteTodoResolver };
