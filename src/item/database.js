import mongoose from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ItemSchema = new mongoose.Schema(
  {
    containerId: { type: String, required: true },
    appId: { type: String, required: true },
    ownerId: { type: String },
    data: { type: Object, required: true, index: true },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Item', ItemSchema);
