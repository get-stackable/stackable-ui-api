import { generateToken } from '../utils/auth';
import User from './database';
import config from '../utils/config';

export default {
  Query: {
    allUsers: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { ids } = args;

      const users = await User.find({ _id: { $in: ids } });
      return users;
    },
    me: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }
      return User.findOne({ _id: ctx.user.id });
    },
  },
  Mutation: {
    register: async (root, args) => {
      const { email, password, firstName, lastName } = args.input;
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        throw new Error('E-mail already registered.');
      }

      const data = {
        email,
        password,
        profile: { firstName, lastName },
      };

      user = new User(data);
      await user.save();
      const token = generateToken(user);
      return { user, jwt: token };
    },
    login: async (root, args) => {
      const { email, password } = args.input;

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('Invalid username or password.');
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid username or password.');
      }

      const token = generateToken(user);
      return { user, jwt: token };
    },
    updateMe: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const objUpdate = {};
      const objFind = { _id: ctx.user.id };

      // update profile
      if (args.email) {
        objUpdate.email = args.email;
      }
      if (args.firstName) {
        objUpdate['profile.firstName'] = args.profile.firstName;
      }
      if (args.lastName) {
        objUpdate['profile.lastName'] = args.profile.lastName;
      }

      // console.log('objUpdate', objUpdate);
      // console.log('objFind', objFind);
      await User.update(objFind, objUpdate);

      return User.findOne({ _id: ctx.user.id });
    },
    payReferral: async (root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not logged in');
      }

      const { key } = args;

      const commission = config.get('referralCommission');
      const currentUser = await User.findOne(ctx.user.id);

      // get referrer
      const referrerUser = await User.findOne({ 'referral.key': key });

      // check if current user already got paid for referral signup
      if (
        currentUser.referral.wasReferred ||
        referrerUser._id === currentUser._id
      ) {
        throw new Error('You have already earned your referral payment.');
      }

      if (referrerUser.referral.balance >= 100) {
        throw new Error('Referrer is not allowed to earn more credits.');
      }

      // now pay referrer and current user both
      referrerUser.push({
        'referral.referrals': currentUser._id,
      });
      referrerUser.inc('referral.balance', commission);
      await referrerUser.save();

      // now pay referrer and current user both
      currentUser.set({
        'referral.wasReferred': true,
        'referral.referredBy': referrerUser._id,
      });
      currentUser.inc('referral.balance', commission);
      await currentUser.save();

      return currentUser;
    },
  },
};
