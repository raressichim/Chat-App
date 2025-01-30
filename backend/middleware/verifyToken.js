const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.sessionToken;
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized: Invalid or expired token");
    }
    req.username = decoded.username;
  });
  next();
};

module.exports = { verifyToken };
