const { ApolloServer } = require("apollo-server");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
var cookie = require("cookie");
const { meResolver } = require("./resolvers/me");
const { userResolver } = require("./resolvers/User");

const typeDefs = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  User: userResolver,

  Query: {
    me: meResolver,
    login: () => {},
    logout: () => {},
  },
  Mutation: {
    addTodo: () => {},
    deleteTodo: () => {},
    changeTodoStatus: () => {},
    register: () => {},
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      sid: cookie.parse(req.headers.cookies).sid,
    };
  },
});

server.listen(4000).then(({ url }) => {
  console.log("server is up on port 4000");
});
