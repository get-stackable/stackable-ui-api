export default {
  Query: {
    allItems: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      check(appId, String);
      const itemFind = {};
      const options = { sort: { createdAt: -1 } };

      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      if (!_.isUndefined(containerId)) {
        check(containerId, String);
        itemFind.containerId = containerId;
      }

      // check only app owners can get data
      const app = Application.findOne({ _id: appId, users: this.userId });
      itemFind.appId = app._id;

      if (this.userId && app) {
        return Item.find(itemFind, options);
      }
      this.ready();
    },
    item: async (root, args, ctx) => {
      const oid = new Meteor.Collection.ObjectID(id);

      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = Item.findOne({ _id: oid });
      const app = Application.findOne({ _id: item.appId, users: this.userId });

      // check only app owners can get data
      if (this.userId && app) {
        return [
          Container.find({ _id: item.containerId }),
          Item.find({ _id: item._id }),
        ];
      }
      this.ready();
    },
  },
  Mutation: {
    createItem: async () => {
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

      const user = User.findOne(this.userId);
      const container = Container.findOne({ _id: doc.containerId });

      const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = new Item();
      item.set({
        container: container.slug,
        containerId: container._id,
        data: doc.data,
        appId: app._id,
        ownerId: this.userId,
      });

      item.validate();

      if (item.hasValidationErrors()) {
        item.throwValidationException();
      } else {
        item.save();
        return item;
      }
    },
    updateItem: async () => {
      // check(id, String);
      if (_.isUndefined(id._str)) {
        id = new Meteor.Collection.ObjectID(id);
      }

      if (_.isNull(this.userId)) {
        // if not logged in
        throw new Meteor.Error('not-logged-in', 'Please login to continue.');
      }

      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = Item.findOne({ _id: id });

      // check if current user own this app
      const app = Application.findOne({ _id: item.appId, users: this.userId });
      if (_.isUndefined(app)) {
        throw new Meteor.Error(
          'not-allowed',
          'You are not allowed to manage this app.',
        );
      }

      // todo quick fix
      const ItemDirect = user.isPaid ? ItemsPaid : ItemsFree;
      ItemDirect.update({ _id: id }, { $set: { data } });

      return item;
    },
    deleteItem: async () => {
      // check(docId, String);
      if (_.isUndefined(id._str)) {
        id = new Meteor.Collection.ObjectID(id);
      }

      const user = User.findOne(this.userId);
      const Item = user.isPaid ? ItemPaid : ItemFree;

      const item = Item.findOne({ _id: id });

      // check if current user own this app
      const app = Application.findOne({ _id: item.appId, users: this.userId });
      if (_.isUndefined(app)) {
        throw new Meteor.Error(
          'not-allowed',
          'You are not allowed to manage this app.',
        );
      }

      // todo quick fix
      const ItemDirect = user.isPaid ? ItemsPaid : ItemsFree;
      ItemDirect.remove({ _id: id });

      return item;
    },
  },
};
