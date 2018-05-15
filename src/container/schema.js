const typeDefs = `
  type Container {
    id: ID!                # "!" denotes a required field
    name: String
    appId: String
    slug: String
    fields: [ContainerField]
    isSingleItem: Boolean
    publishedAt: String
  }

  type ContainerField{
    id: ID!
    name: String
    slug: String
    description: String  # TODO: Validation And Relation
    type: String
    isRequired: Boolean
    isDisabled: Boolean
    listingOrder: Int
  }

  input ContainerFieldInput {
    name: String
    slug: String
    description: String  # TODO: Validation And Relation
    type: String
    isRequired: Boolean
    isDisabled: Boolean
    listingOrder: Int
  }

  input ContainerInput {
    name: String!
    fields: [ContainerField]
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    allContainers(appId: ID!): [Container]    # returns a array of Container
    container(id: ID!): Container    # returns a object of Container
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    createContainer(appId: ID!, input: ContainerInput!): Container
    updateContainer(id: ID!, input: ContainerInput!): Container
    deleteContainer(id: ID!): Container
    fieldArchiveContainer(containerId: ID!, fieldName: String!): String
    fieldRenameContainer(containerId: ID!, newName: String!, oldName: String!): String
  }
`;

export default typeDefs;
