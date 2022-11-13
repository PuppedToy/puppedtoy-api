const jwt = require('./jwt');

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

module.exports = {
  authMiddleware,
};
