import mongoose, { Schema } from 'mongoose-fill';
import randomstring from 'randomstring';

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

ApplicationSchema.pre('save', async function (done) { // eslint-disable-line
  if (this.isNew) {
    try {
      this.publicKey = randomstring.generate(12);
      this.privateKey = randomstring.generate(12);
    } catch (err) {
      return done(err);
    }
  }

  return done();
});

export default mongoose.model('Applocation', ApplicationSchema);
