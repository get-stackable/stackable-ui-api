import async from 'async';
import { isUndefined } from 'underscore';

import Application from '../application/database';
import Container from './database';
import Item from '../item/database';
// import User from '../user/database';

export default {
  Query: {
    allContainers: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { appId } = args;

      // check only domain owners can get data
      const app = await Application.findOne({
        _id: appId,
        users: ctx.user.id,
      });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      const conatiners = await Container.find({ appId: app._id }).sort({
        createdAt: -1,
      });

      return conatiners;

      // TO FIND (search)
      // todo optimise and secure it
      // find by query
      // let find = {};

      // if (!_.isNull(query)) {
      //   const queryRegex = `.*${  query  }.*`;
      //   find = {
      //     $or: [
      //       {
      //         name: {
      //           $regex: queryRegex,
      //           $options: 'i',
      //         },
      //       },
      //     ],
      //   };
      // }

      // return Container.find(find, { sort: { createdAt: -1 } });
    },
    container: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;

      const container = await Container.findOne({ _id: id });
      const app = Application.findOne({
        _id: container.appId,
        users: ctx.user.id,
      });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      return container;
    },
  },
  Mutation: {
    createContainer: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { appId } = args;

      const app = await Application.findOne({ _id: appId, users: ctx.user.id });
      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // check if container with same name already exists
      const checkContainer = await Container.findOne({
        app: appId,
        name: args.name,
      });

      if (checkContainer) {
        throw new Error('Container with same name already exists.');
      }

      const container = new Container(args);
      await container.save();

      return container;
    },
    updateContainer: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id, input } = args;

      const container = await Container.findOne(id);

      // check if current user own this domain
      const app = Application.findOne({
        _id: container.app,
        users: ctx.user.id,
      });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      container.set(input);
      await container.save();

      return container;
    },
    deleteContainer: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;

      const container = await Container.findOne({ _id: id });

      // check if current user own this app
      const app = await Application.findOne({
        _id: container.appId,
        users: ctx.user.id,
      });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // remove all related entries
      await Item.remove({ container: container._id });
      // ItemPaid.remove({ container: container._id });
      // ItemFree.remove({ container: container._id });

      await container.remove();

      return container;
    },
    fieldArchiveContainer: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { containerId, fieldName } = args;
      // const user = await User.findOne(ctx.user.id);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const items = await Item.find({ containerId });
      const result = await async.each(
        items,
        async (item, callback) => {
          const data = item.data; // eslint-disable-line
          const dataArchive = !isUndefined(item.dataArchive)
            ? item.dataArchive
            : {};

          // copy to archive
          dataArchive[fieldName] = data[fieldName];
          // remove from data
          delete data[fieldName];

          item.set({ data, dataArchive });
          await item.save();
          callback();
        },
        () => {
          console.log('All items have been processed successfully');
        },
      );

      return result;
    },
    fieldRenameContainer: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { containerId, newName, oldName } = args;

      // const user = await User.findOne(ctx.user.id);
      // const Item = user.isPaid ? ItemPaid : ItemFree;

      const items = await Item.find({ containerId });

      const result = await async.each(
        items,
        async (item, callback) => {
          const data = item.data; // eslint-disable-line

          // copy with new key
          data[newName] = data[oldName];
          // remove with old key
          delete data[oldName];

          item.set({ data });
          await item.save();
          callback();
        },
        () => {
          console.log('All items have been processed successfully');
        },
      );

      return result;
    },
  },
};
