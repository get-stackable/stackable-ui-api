import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas';

import MainSchema from './main/schema';
import MainResolvers from './main/resolvers';
import UserSchema from './user/schema';
import UserResolvers from './user/resolvers';
import ApplicationSchema from './application/schema';
import ApplicationResolvers from './application/resolvers';
import ContainerSchema from './container/schema';
import ContainerResolvers from './container/resolvers';
import ItemSchema from './item/schema';
import ItemResolvers from './item/resolvers';

export default makeExecutableSchema({
  typeDefs: mergeTypes([
    MainSchema,
    UserSchema,
    ApplicationSchema,
    ContainerSchema,
    ItemSchema,
  ]),
  resolvers: mergeResolvers([
    MainResolvers,
    UserResolvers,
    ApplicationResolvers,
    ContainerResolvers,
    ItemResolvers,
  ]),
});
