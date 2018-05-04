import randomstring from 'randomstring';
import async from 'async';

import Application from './database';
import ApplicationLibrary from './library-db';
import User from '../user/database';
import Container from '../container/database';
import Item from '../item/database';

export default {
  Query: {
    allApplications: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const apps = await Application.find({ users: ctx.user.id }).sort({
        createdAt: -1,
      });

      return apps;
    },
    allApplicationLibraries: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const appLibraries = await ApplicationLibrary.find({
        isActive: true,
      }).sort({
        createdAt: -1,
      });

      return appLibraries;
    },
    application: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;

      const app = await Application.findOne({ _id: id, users: ctx.user.id });
      return app;
    },
  },
  Mutation: {
    createApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { libraryId, input } = args;

      const user = await User.findOne({ _id: ctx.user.id });

      const data = {
        users: [ctx.user.id],
        createdBy: ctx.user.id,
        ...input,
      };
      console.log(data);
      const application = new Application(data);
      await application.save();

      // add application to user
      user.apps.push(application._id);
      await user.save();

      if (libraryId) {
        await ApplicationLibrary.createLibraryData(application._id, libraryId);
      }

      return application;
    },
    updateApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id, input } = args;

      const app = await Application.findOne({ _id: id, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      app.set(input);
      await app.save();
      return app;
    },
    deleteApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;
      const app = await Application.findOne({ _id: id, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // remove all related containers
      await Container.remove({ app: app._id });

      // remove all related items
      Item.remove({ app: app._id });
      // ItemPaid.remove({ appId: app._id });
      // ItemFree.remove({ appId: app._id });

      await app.remove();
      return app;
    },
    generateKeyApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;

      const app = await Application.findOne({ _id: id, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      app.set({
        publicKey: randomstring.generate(12),
        privateKey: randomstring.generate(12),
      });

      await app.save();
      return app;
    },
    cloneApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { id } = args;

      const app = await Application.findOne({ _id: id, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // clone app
      const data = {
        name: args.input.name,
        description: args.input.description,
        users: [ctx.user.id],
        createdBy: ctx.user.id,
      };

      console.log(args);

      const appCopy = new Application(data);
      await appCopy.save();

      // clone containers
      const containers = await Container.find({ appId: app._id });
      await new Promise((resolve, reject) => {
        async.each(
          containers,
          async (container, callback) => {
            // Perform operation on container here.
            // console.log(`Processing file ${container}`);

            const dataContainer = {
              name: container.name,
              app: appCopy._id,
              items: container.items,
            };
            const newContainer = new Container(dataContainer);
            await newContainer.save();

            callback();
          },
          err => {
            if (err) {
              reject(new Error('Container library failed to process'));
            } else {
              resolve('All items have been processed successfully');
            }
          },
        );
      });

      return appCopy;
    },
    addUserApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { appId, userEmail } = args;

      // todo check if user already admin
      const app = await Application.findOne({ _id: appId, users: ctx.user.id });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      const user = await User.findOne({ email: userEmail });

      // if user not found
      // todo invite user to site
      if (!user) {
        throw new Error('User not found, make sure user is registered.');
      }

      // add domain to user
      user.push('apps', app._id);
      await user.save();

      // add user id to app
      app.push('users', user._id);
      await app.save();

      return app;
    },
    removeUserApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { appId, userId } = args;

      const app = await Application.findOne({ _id: appId, users: ctx.user.id });
      const user = await User.findOne({ _id: userId });

      // check if current user own this app
      if (!app) {
        throw new Error('You are not allowed to manage this app.');
      }

      // stack owner cannot be deleted
      if (user._id === app.createdBy) {
        throw new Error('You cannot remove owner of the app.');
      }

      // remove domain from user
      user.pull('apps', app._id);
      await user.save();

      // remove user id from domain
      app.pull('users', user._id);
      await app.save();

      return app;
    },
  },
};
