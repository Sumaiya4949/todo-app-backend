const addTodoResolver = (parent, args, context) => {
  const { title } = args;
  const { sid, dataSources } = context;
  return dataSources.todoApi.addTodo(title, sid);
};

module.exports = { addTodoResolver };
