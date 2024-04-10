const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET);
}

function isAuthenticated(req) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return false;
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  generateToken,
  isAuthenticated,
};
