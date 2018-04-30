import jwt from 'jsonwebtoken';

import conf from './config';

const isDev = conf.get('env') === 'development';

export const isAuthenticated = async (ctx, next) => {
  ctx.user = null;
  // turn on auth for dev
  if (isDev) {
    ctx.user = {
      id: '5ac3020c32731d0049176df6',
      email: 'admin@admin.com',
      isAdmin: true,
    };
    return next();
  }

  if (!ctx.header.authorization) {
    return next();
  }

  const token = ctx.header.authorization.substring(4);
  const data = await new Promise(resolve => {
    jwt.verify(token, conf.get('jwtSecret'), (err, decoded) => {
      if (err) {
        return resolve(null);
      }
      return resolve(decoded);
    });
  });
  ctx.user = data;
  return next();
};

export function generateToken(user) {
  const jwtToken = jwt.sign(
    { id: user._id, email: user.email },
    conf.get('jwtSecret'),
  );
  return `JWT ${jwtToken}`;
}
