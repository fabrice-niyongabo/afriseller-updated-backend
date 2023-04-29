const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["token"];

  if (!token) {
    return res.status(401).send({
      msg: "A token is required for authentication",
      tokenError: true,
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({
      msg: "Your session has been experied, please login again to continue.",
      tokenError: true,
    });
  }
  return next();
};

module.exports = verifyToken;
