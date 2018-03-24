import mongoose, { Schema } from 'mongoose-fill';

mongoose.Promise = global.Promise;

const ApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    publicKey: { type: String },
    privateKey: { type: String },
    allowedUrls: { type: [String], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: { type: [String], default: [] },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

export default mongoose.model('Applocation', ApplicationSchema);
