export default {
  Query: {
    allApplications: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      // return [];

      if (this.userId) {
        return Application.find(
          { users: this.userId },
          { sort: { createdAt: -1 } },
        );
      }
      this.ready();
    },
    allApplicationLibraries: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      // return [];

      return ApplicationLibrary.find(
        { isActive: true },
        { sort: { createdAt: -1 } },
      );
    },
  },
  Mutation: {
    createApplication: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      // TODO:
      const user = User.findOne(this.userId);
      const libraryId = doc.libraryId;

      doc.users = [this.userId];
      doc.publicKey = getNewKey();
      doc.privateKey = getNewKey();
      doc.createdBy = this.userId;
      const app = new Application();
      app.set(doc);

      app.validate();
      if (app.hasValidationErrors()) {
        app.throwValidationException();
      }

      app.save();

      // add to domain to user collection
      user.push('apps', app._id);
      user.save();

      if (!_.isNull(libraryId)) {
        createLibraryData(app._id, libraryId);
      }

      return app;

      return [];
    },
  },
  updateApplication: async () => {
    // TODO:
    check(id, String);

    if (_.isNull(this.userId)) {
      // if not logged in
      throw new Meteor.Error('not-logged-in', 'Please login to continue.');
    }

    const app = Application.findOne({ _id: id, users: this.userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this app.',
      );
    }

    app.set(doc);

    app.validate();
    if (app.hasValidationErrors()) {
      app.throwValidationException();
    } else {
      app.save();
      return app;
    }
  },
  deleteApplication: async () => {
    check(docId, String);

    const app = Application.findOne({ _id: docId, users: this.userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this stack.',
      );
    }

    // remove all related containers
    Container.remove({ appId: app._id });

    // remove all related items
    ItemPaid.remove({ appId: app._id });
    ItemFree.remove({ appId: app._id });

    return app.remove();
  },
  generateKeyApplication: async () => {
    check(id, String);

    if (_.isNull(this.userId)) {
      // if not logged in
      throw new Meteor.Error('not-logged-in', 'Please login to continue.');
    }

    const app = Application.findOne({ _id: id, users: this.userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this app.',
      );
    }

    app.set({
      publicKey: getNewKey(),
      privateKey: getNewKey(),
    });

    app.save();
    return app;
  },
  cloneApplication: async () => {
    check(id, String);

    if (_.isNull(this.userId)) {
      // if not logged in
      throw new Meteor.Error('not-logged-in', 'Please login to continue.');
    }

    const app = Application.findOne({ _id: id, users: this.userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this app.',
      );
    }

    // clone app
    const appCopy = new Application();
    appCopy.name = doc.name;
    appCopy.description = doc.description;
    appCopy.users = [this.userId];
    appCopy.publicKey = getNewKey();
    appCopy.privateKey = getNewKey();
    appCopy.save();

    // clone containers
    const containers = Container.find({ appId: app._id }).fetch();
    containers.forEach(container => {
      const containerCopy = new Container();
      containerCopy.name = container.name;
      containerCopy.items = container.items;
      containerCopy.appId = appCopy._id;
      containerCopy.save();
    });

    return appCopy;
  },
  addUserApplication: async () => {
    check(appId, String);

    // todo check if user already admin
    const app = Application.findOne({ _id: appId, users: this.userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this stack.',
      );
    }

    const user = User.findOne({ 'emails.address': userEmail });

    // if user not found
    // todo invite user to site
    if (_.isUndefined(user)) {
      throw new Meteor.Error(
        'not-found',
        'User not found, make sure user is registered.',
      );
    }

    // add domain to user
    user.push('apps', app._id);
    user.save();

    // add user id to app
    app.push('users', user._id);
    app.save();

    return app;
  },
  removeUserApplication: async () => {
    check(appId, String);

    const app = Application.findOne({ _id: appId, users: this.userId });
    const user = User.findOne({ _id: userId });

    // check if current user own this app
    if (_.isUndefined(app)) {
      throw new Meteor.Error(
        'not-allowed',
        'You are not allowed to manage this stack.',
      );
    }

    // stack owner cannot be deleted
    if (user._id === app.createdBy) {
      throw new Meteor.Error(
        'not-allowed',
        'You cannot remove owner of the stack.',
      );
    }

    // remove domain from user
    user.pull('apps', app._id);
    user.save();

    // remove user id from domain
    app.pull('users', user._id);
    app.save();

    return app;
  },
};
