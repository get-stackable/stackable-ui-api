import mongoose from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ContainerSchema = new mongoose.Schema(
  {
    name: { type: String },
    appId: { type: String },
    items: { type: Array },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Container', ContainerSchema);
