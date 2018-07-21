import jwt from 'jsonwebtoken';

import conf from './config';

export const isAuthenticated = async (ctx, next) => {
  ctx.user = null;

  if (!ctx.header.authorization) {
    console.log('header', ctx.header);
    return next();
  }
  console.log('bjccbksdj', ctx.header);
  const token = ctx.header.authorization.substring(4);
  console.log('bjccbksdj', token);
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
