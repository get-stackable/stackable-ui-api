import mongoose, { Schema } from 'mongoose-fill';
import randomstring from 'randomstring';
import { capitalize } from 'underscore.string';

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

ApplicationSchema.pre('save', async function save(done) {
  if (this.isModified('name')) {
    this.name = capitalize(this.name);
  }

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

export default mongoose.model('Application', ApplicationSchema);
