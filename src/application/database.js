import mongoose from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ApplicationSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    publicKey: { type: String },
    privateKey: { type: String },
    allowedUrls: { type: Array },
    createdBy: { type: String },
    users: { type: Array },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Applocation', ApplicationSchema);
