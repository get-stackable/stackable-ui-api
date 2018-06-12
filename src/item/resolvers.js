import Item from './database';
// import User from '../user/database';
import Application from '../application/database';
import Container from '../container/database';

export default {
  Query: {
    allItems: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const {  containerId, appId  } = args;
      const itemFind = {};

      // const user = await User.findOne(ctx.user.id);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      if (!containerId) {
        throw new Error('Container not provided');
      }

      itemFind.container = containerId;

      const app = await Application.findOne({ _id: appId, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      const items = await Item.find(itemFind).sort({
        createdAt: -1,
      });

      return items;
    },
    item: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const {  id  } = args;

      // const user = User.findOne(this.userId);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = await Item.findOne({ _id: id });
      const app = await Application.findOne({
        _id: item.app,
        users: ctx.user.id,
      });

      // check only app owners can get data
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      const items = await Item.find({ _id: item._id });
      return items;
    },
  },
  Mutation: {
    createItem: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const {  appId, containerId, input  } = args;

      const app = await Application.findOne({ _id: appId, users: ctx.user.id });
      // check only app owners can get data
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // const user = await User.findOne(ctx.user.id);
      const container = await Container.findOne({ _id: containerId });

      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const newDta = {
        container: container._id,
        app: app._id,
        owner: ctx.user.id,
        data: input,
      };
      const item = new Item(newDta);
      await item.save();

      return item;
    },
    updateItem: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const {  id, input  } = args;

      // const user = await User.findOne(ctx.user.id);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = await Item.findOne({ _id: id });

      const app = Application.findOne({ _id: item.app, users: ctx.user.id });
      // check only app owners can get data
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // todo quick fix
      // const ItemDirect = user.isPaid ? ItemsPaid : ItemsFree;
      // item.set(JSON.parse(input));
      item.set({ data: input });
      await item.save();

      return item;
    },
    deleteItem: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const {  id  } = args;

      // const user = await User.findOne(ctx.user.id);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = await Item.findOne({ _id: id });

      const app = await Application.findOne({
        _id: item.app,
        users: ctx.user.id,
      });
      // check only app owners can get data
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // todo quick fix
      // const ItemDirect = user.isPaid ? ItemsPaid : ItemsFree;
      await Item.remove({ _id: id });

      return item;
    },
  },
};
