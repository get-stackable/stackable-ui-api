import mongoose, { Schema } from 'mongoose-fill';
import slugify from 'slugify';
import { capitalize } from 'underscore.string';

mongoose.Promise = global.Promise;

export const ContainerFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  slug: {
    type: String,
    trim: true,
    required: true,
  },
  description: { type: String },
  type: { type: String, required: true },
  validations: { type: Schema.Types.Mixed, default: {} },
  relations: { type: Schema.Types.Mixed, default: {} },
  isRequired: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  listingOrder: { type: Number, min: 1, default: 1 },
});

const ContainerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    slug: { type: String, unique: true, index: true },
    app: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    fields: [ContainerFieldSchema],
    isSingleItem: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

ContainerSchema.pre('save', async function save(done) {
  // slugify slug on update
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
    this.name = capitalize(this.name);
  }
  return done();
});

export default mongoose.model('Container', ContainerSchema);
