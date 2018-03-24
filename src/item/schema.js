const typeDefs = `
  type Item {
    id: ID!                # "!" denotes a required field
    containerId: String
    appId: String
    ownerId: String
    data: String
    publishedAt: String
  }

  input ItemInput {
    containerId: String!
    appId: String!
    data: String!
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    allItems: [Item]    # returns a array of Item
    item(id: ID!): Item    # returns a object of Item
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    createItem(ItemInput): Item
    updateItem(id: ID!, input: ItemInput): Item
    deleteItem(id: ID!): Item
  }
`;

export default typeDefs;
