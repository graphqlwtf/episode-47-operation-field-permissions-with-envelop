import { createServer } from "@graphql-yoga/node";
import { useOperationFieldPermissions } from "@envelop/operation-field-permissions";

type User = {
  id: string;
  name: string;
  permissions?: string[];
};

const users: User[] = [
  {
    id: "1",
    name: "Jamie",
    permissions: ["Query.user", "User.id"],
  },
  {
    id: "2",
    name: "Laurin",
    permissions: ["Query.user", "User.*"],
  },
  {
    id: "3",
    name: "Uri",
    permissions: [
      "Query.*",
      "User.*",
      "Mutation.promoteUser",
      "Mutation.deleteUser",
    ],
  },
];

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
  }
  type Query {
    user(id: ID!): User!
  }
  type Mutation {
    promoteUser(id: ID!): Boolean!
    deleteUser(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => users.find((u) => u.id === id),
  },
  Mutation: {
    promoteUser: () => true,
    deleteUser: () => true,
  },
};

const context = async ({ request }) => {
  const userId = request.headers.get("authorization") ?? null;
  const user = users.find((user) => user.id === userId);

  return {
    user,
  };
};

const plugins = [
  useOperationFieldPermissions({
    getPermissions: (context: any) => new Set(context?.user?.permissions),
  }),
];

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  context,
  plugins,
});

server.start();
