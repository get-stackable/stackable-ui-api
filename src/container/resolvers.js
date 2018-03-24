export default {
  Query: {
    allContainers: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      check(appId, String);

      // check only domain owners can get data
      const app = Application.findOne({
        _id: appId,
        users: this.userId,
      });

      if (this.userId && app) {
        return Container.find({ appId: app._id }, { sort: { createdAt: -1 } });
      }
      this.ready();

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
      check(id, String);
      const container = Container.findOne({ _id: id });
      const app = Application.findOne({
        _id: container.appId,
        users: this.userId,
      });

      // check only domain owners can get data
      if (this.userId && app) {
        return Container.find({ _id: container._id });
      }
      this.ready();
    },
  },
  Mutation: {
    createContainer: async () => {
      if (_.isNull(this.userId)) {
        // if not logged in
        throw new Meteor.Error('not-logged-in', 'Please login to continue.');
      }

      // check if current user own this app
      const app = Application.findOne({ _id: doc.appId, users: this.userId });
      if (_.isUndefined(app)) {
        throw new Meteor.Error(
          'not-allowed',
          'You are not allowed to manage this app.',
        );
      }

      // check if container with same name already exists
      const checkContainer = Container.findOne({
        appId: doc.appId,
        name: doc.name,
      });
      if (!_.isUndefined(checkContainer)) {
        throw new Meteor.Error(
          'not-allowed',
          'Container with same name already exists.',
        );
      }

      const container = new Container();
      container.set(doc);

      container.validate();

      if (container.hasValidationErrors()) {
        container.throwValidationException();
      } else {
        container.save();
        return container;
      }
    },
    updateContainer: async () => {
      check(id, String);

      if (_.isNull(this.userId)) {
        // if not logged in
        throw new Meteor.Error('not-logged-in', 'Please login to continue.');
      }

      const container = Container.findOne(id);

      // check if current user own this domain
      const app = Application.findOne({
        _id: container.appId,
        users: this.userId,
      });
      if (_.isUndefined(app)) {
        throw new Meteor.Error(
          'not-allowed',
          'You are not allowed to manage this app.',
        );
      }

      container.set(doc);

      container.validate();

      if (container.hasValidationErrors()) {
        container.throwValidationException();
      } else {
        container.save();
        return container;
      }
    },
    deleteContainer: async () => {
      check(docId, String);

      const container = Container.findOne({ _id: docId });

      // check if current user own this app
      const app = Application.findOne({
        _id: container.appId,
        users: this.userId,
      });
      if (_.isUndefined(app)) {
        throw new Meteor.Error(
          'not-allowed',
          'You are not allowed to manage this app.',
        );
      }

      // remove all related entries
      ItemPaid.remove({ containerId: container._id });
      ItemFree.remove({ containerId: container._id });

      return container.remove();
    },
    fieldArchiveContainer: async () => {
      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      const items = Item.find({ containerId }).fetch();
      async.each(
        items,
        (item, callback) => {
          const data = item.data;
          const dataArchive = !_.isUndefined(item.dataArchive)
            ? item.dataArchive
            : {};

          // copy to archive
          dataArchive[fieldName] = data[fieldName];
          // remove from data
          delete data[fieldName];

          item.set({ data, dataArchive });
          if (item.validate()) {
            item.save();
            callback();
          } else {
            callback('Unable to archive');
          }
        },
        err => {
          // if any of the file processing produced an error, err would equal that error
          if (err) {
            throw new Meteor.Error(
              'not-possible',
              'Unable to archive fields data.',
            );
          } else {
            // todo better Promise callback
            console.log('All items have been processed successfully');
          }
        },
      );
    },
    fieldRenameContainer: async () => {
      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      const items = Item.find({ containerId }).fetch();

      async.each(
        items,
        (item, callback) => {
          const data = item.data;

          // copy with new key
          data[newName] = data[oldName];
          // remove with old key
          delete data[oldName];

          item.set({ data });
          if (item.validate()) {
            item.save();
            callback();
          } else {
            callback('Unable to rename data');
          }
        },
        err => {
          // if any of the file processing produced an error, err would equal that error
          if (err) {
            throw new Meteor.Error(
              'not-possible',
              'Unable to rename fields data.',
            );
          } else {
            // todo better Promise callback
            console.log('All items have been processed successfully');
          }
        },
      );
    },
  },
};
