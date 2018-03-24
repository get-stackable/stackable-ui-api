import mongoose, { Schema } from 'mongoose-fill';
import slugify from 'slugify';

mongoose.Promise = global.Promise;

export const ContainerItemSchema = new mongoose.Schema({
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
    items: [ContainerItemSchema],
    isSingleItem: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  },
);

ContainerSchema.pre('save', async function(done) { // eslint-disable-line
  // slugify slug on update
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }

  return done();
});

export default mongoose.model('Container', ContainerSchema);
