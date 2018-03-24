import mongoose, { Schema } from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ItemSchema = new mongoose.Schema(
  {
    container: {
      type: Schema.Types.ObjectId,
      ref: 'Container',
      required: true,
    },
    app: {
      type: Schema.Types.ObjectId,
      ref: 'Applocation',
      required: true,
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Schema.Types.Mixed, required: true, index: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Item', ItemSchema);
