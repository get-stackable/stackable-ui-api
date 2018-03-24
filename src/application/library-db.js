import mongoose from 'mongoose-fill';

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

const ApplicationSchema = new mongoose.Schema(
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

export default mongoose.model('Applocation', ApplicationSchema);
