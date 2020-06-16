const jwt = require("jsonwebtoken");
exports.jwtTokenGenerator = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_PASS, {
    expiresIn:
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * process.env.JWT_EXPIRES_IN,
  });
};
