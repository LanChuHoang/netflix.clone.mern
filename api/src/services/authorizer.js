const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const DEFAULT_TOKEN_AVAILABLE_TIME = 30;

function generateAccessToken(user) {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: DEFAULT_TOKEN_AVAILABLE_TIME }
  );
  return token;
}

function verifyAccessToken(req, res, next) {
  const token = req.header("Authorization").split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(403).send({ error: "Invalid Token" });
    return res.status(400).send({ error: "Invalid Request" });
  }
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
};
