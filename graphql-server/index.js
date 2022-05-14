const { ApolloServer } = require("apollo-server");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
var cookie = require("cookie");
const { meResolver } = require("./resolvers/me");
const { userResolver } = require("./resolvers/User");
const connector = require("./connector");
const { addTodoResolver } = require("./resolvers/addTodo");
const { deleteTodoResolver } = require("./resolvers/deleteTodo");
const { changeTodoStatusResolver } = require("./resolvers/changeTodoStatus");
const { loginResolver } = require("./resolvers/login");

const typeDefs = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  User: userResolver,

  Query: {
    me: meResolver,
    logout: () => {},
    login: loginResolver,
  },

  Mutation: {
    addTodo: addTodoResolver,
    deleteTodo: deleteTodoResolver,
    changeTodoStatus: changeTodoStatusResolver,
    register: () => {},
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,

  context: ({ req, res }) => {
    return {
      sid: cookie.parse(req.headers.cookies || "").sid,
      setSidCookie: (sid) => {
        res.cookie("sid", sid, { httpOnly: true, expires: false });
      },
    };
  },

  dataSources: () => ({
    todoApi: connector,
  }),
});

server.listen(4000).then(({ url }) => {
  console.log("server is up on port 4000");
});
