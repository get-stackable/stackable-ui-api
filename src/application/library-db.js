import mongoose from 'mongoose-fill';
import async from 'async';

import { ContainerItemSchema } from '../container/database';

mongoose.Promise = global.Promise;

const LibraryContainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  items: { type: [ContainerItemSchema], default: [] },
});

const ApplicationLibrarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String },
    containers: { type: [LibraryContainerSchema], default: [] },
    isOfficial: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
  },
  {
    collation: 'applicationLibraries',
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

ApplicationLibrarySchema.statics.createLibraryData = async function (applicationId, libraryId) { // eslint-disable-line
  const library = await this.findOne(libraryId);

  const result = await new Promise((resolve, reject) => {
    async.each(
      library.containers,
      (container, callback) => {
        // Perform operation on container here.
        // console.log(`Processing file ${container}`);

        const data = {
          name: container.name,
          app: applicationId,
          items: container.items,
        };

        // TODO:
        // Meteor.call('container.create', data);

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

  return result;
};

export default mongoose.model('ApplicationLibrary', ApplicationLibrarySchema);
