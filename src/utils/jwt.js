const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const jwtOptions = {
  expiresIn: '7d',
};

function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, jwtOptions);
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  sign,
  verify,
};
