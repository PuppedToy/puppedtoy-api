const jwt = require('./jwt');
const usersDb = require('../db/users');

const { verify } = jwt;

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authorization.split(' ')[1];
  try {
    const decoded = verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

function checkScopesMiddleware(...scopes) {
  return async (req, res, next) => {
    const { user } = req;
    const userFromDb = await usersDb.getById(user.id);
    const isOwner = userFromDb.scopes.includes('owner');
    const hasScopes = scopes.every((scope) => userFromDb.scopes.includes(scope));
    if (!isOwner && !hasScopes) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  checkScopesMiddleware,
};
