const typeDefs = `
  type Application {
    id: ID!                # "!" denotes a required field
    name: String
    description: String
    isActive: Boolean
    publicKey: String
    privateKey: String
    allowedUrls: String
    createdBy: String
    users: String
  }

  input ApplicationInput {
    name: String!
    description: String
    isActive: Boolean
    allowedUrls: String
  }

  # This type specifies the entry points into our API. In this case
  type Query {
    allApplications: [Application]    # returns a array of applications
  }

  # The mutation root type, used to define all mutations.
  type Mutation {
    updateApplication(input: ApplicationInput): Application
  }
`;

export default typeDefs;
