const { ApolloServer, gql } = require("apollo-server");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");

const typeDefs = loadSchemaSync("schema.graphql", {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  Query: {
    me: () => {},
  },
  Mutation: {
    addTodo: () => {},
    deleteTodo: () => {},
    changeTodoStatus: () => {},
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4000).then(({ url }) => {
  console.log("server is up on port 4000");
});
