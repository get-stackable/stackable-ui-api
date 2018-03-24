import mongoose, { Schema } from 'mongoose-fill';
import bcrypt from 'bcryptjs';
import slugify from 'slugify';
import randomstring from 'randomstring';

mongoose.Promise = global.Promise;

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  location: { type: String, trim: true },
  about: { type: String },
});

const ReferralSchema = new mongoose.Schema({
  wasReferred: { type: Boolean, default: false },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  balance: { type: Number, default: 0 },
  referrals: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  key: { type: String, default: randomstring.generate(5) },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      trim: true,
    },
    slug: {
      type: String,
      index: true,
      trim: true,
      unique: true,
    },
    profile: ProfileSchema,
    status: { type: String, default: 'pending' }, // pending, active, not-active, banned
    isPaid: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    authKey: {
      type: String,
      index: true,
      unique: true,
    },
    apps: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Applocation' }],
      default: [],
    },
    referral: ReferralSchema,
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.password;
      },
    },
  },
);

const generateSlug = user => {
  const slug = user.profile
    ? `${user.profile.firstName || ''} ${user.profile.lastName ||
        ''} ${randomstring.generate(4)}`
    : randomstring.generate(7);
  return slugify(slug);
};

UserSchema.pre('save', async function (done) { // eslint-disable-line
  // only hash the password if it has been modified (or is new)
  if (this.isNew || this.isModified('password')) {
    try {
      const salt = await bcrypt.genSaltSync(10);
      const hash = await bcrypt.hashSync(this.password, salt);
      this.password = hash;
      this.slug = generateSlug(this);

      return done();
    } catch (err) {
      return done(err);
    }
  }

  // slugify slug on update
  if (this.isModified('slug')) {
    this.slug = generateSlug(this);
  }

  return done();
});

UserSchema.methods.comparePassword = async function (candidatePassword) { // eslint-disable-line
  const result = await bcrypt.compareSync(candidatePassword, this.password);
  return result;
};

UserSchema.virtual('profile.fullName').get(function () { // eslint-disable-line
    return this.profile.firstName + ' ' + this.profile.lastName; // eslint-disable-line
});

UserSchema.statics.findBySlug = async function (slug) { // eslint-disable-line
  const user = await this.findOne({ slug });
  return user;
};

export default mongoose.model('User', UserSchema);
