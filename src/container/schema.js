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
    allContainers: [Container]    # returns a array of container
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    updateContainer(input: ContainerInput): Container
  }
`;

export default typeDefs;
