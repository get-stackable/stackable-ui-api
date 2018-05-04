const typeDefs = `
  type Application {
    id: ID!                # "!" denotes a required field
    name: String
    description: String
    isActive: Boolean
    publicKey: String
    privateKey: String
    allowedUrls: [String]
    createdBy: String
    users: String
  }

  type ApplicationLibrary {
    id: ID!                # "!" denotes a required field
    name: String
    description: String
    containers: String
    isOfficial: Boolean
    isActive: Boolean
  }

  input ApplicationInput {
    name: String
    description: String
    isActive: Boolean
    allowedUrls: String
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    application(id: ID! ): Application    # returns a object of Application
    allApplications: [Application]    # returns a array of Application
    allApplicationLibraries: [ApplicationLibrary]    # returns a array of ApplicationLibrary
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    createApplication(input: ApplicationInput!, libraryId: ID): Application
    updateApplication(id: ID!, input: ApplicationInput!): Application
    deleteApplication(id: ID!): Application
    generateKeyApplication(id: ID!): Application
    cloneApplication(id: ID!, input: ApplicationInput!): Application
    addUserApplication(appId: ID!, userEmail: String!): Application
    removeUserApplication(appId: ID!, userId: ID!): Application
  }
`;

export default typeDefs;
