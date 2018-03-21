export default {
  Query: {
    allItems: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      return [];
    },
  },
  Mutation: {
    updateItem: async () => ({}),
  },
};
