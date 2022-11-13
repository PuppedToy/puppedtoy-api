const usersDb = require('../db/users');
const jwt = require('../utils/jwt');

async function registerController(req, res, next) {
  const { name, password } = req.body;
  try {
    const result = await usersDb.create(name, password);
    const token = jwt.sign({ id: result.insertedId });
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
}

async function loginController(req, res, next) {
  const { name, password } = req.body;
  try {
    const user = await usersDb.verify(name, password);
    if (!user) {
      res.status(401).json({ message: 'User does not exist or has invalid password' });
      return;
    }
    const token = jwt.sign({ id: user._id });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerController,
  loginController,
};
