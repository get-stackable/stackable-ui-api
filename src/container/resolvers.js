export default {
  Query: {
    allContainers: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      return [];
    },
  },
  Mutation: {
    updateContainer: async () => ({}),
  },
};
