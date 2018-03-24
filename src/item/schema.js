const typeDefs = `
  scalar JSON

  type Item {
    id: ID!                # "!" denotes a required field
    containerId: String
    appId: String
    ownerId: String
    data: JSON
    publishedAt: String
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    allItems(containerId: ID!, appId: ID!): [Item]    # returns a array of Item
    item(id: ID!): Item    # returns a object of Item
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    createItem(containerId: ID!, appId: ID!, input: JSON!): Item
    updateItem(id: ID!, input: JSON!): Item
    deleteItem(id: ID!): Item
  }
`;

export default typeDefs;
