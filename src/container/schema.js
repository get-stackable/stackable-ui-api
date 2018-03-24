const typeDefs = `
  type Container {
    id: ID!                # "!" denotes a required field
    name: String
    appId: String
    publishedAt: String
  }

  input ContainerInput {
    name: String!
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    allContainers: [Container]    # returns a array of Container
    container(id: ID!): Container    # returns a object of Container
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    createContainer(ContainerInput): Container
    updateContainer(id: ID!, input: ContainerInput): Container
    deleteContainer(id: ID!): Container
    fieldArchiveContainer(containerId: ID!, fieldName: String!): String
    fieldRenameContainer(containerId: ID!, newName: String!, oldName: String!): String
  }
`;

export default typeDefs;
