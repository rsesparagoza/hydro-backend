const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { jwtkey } = require('../keys');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ error: "You must be logged in!" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, jwtkey, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You must be logged in!" });
    }
    const userId = payload;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).send({ error: "User not found!" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Error finding user:', error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  });
};
