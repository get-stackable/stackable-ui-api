export default {
  Query: {
    allApplications: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      return [];
    },
  },
  Mutation: {
    updateApplication: async () => ({}),
  },
};
