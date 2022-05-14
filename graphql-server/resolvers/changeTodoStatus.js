const changeTodoStatusResolver = (parent, args, context) => {
  const { sid, dataSources } = context;
  const { id, isDone } = args;
  return dataSources.todoApi.changeTodoStatus(id, isDone, sid);
};

module.exports = { changeTodoStatusResolver };
