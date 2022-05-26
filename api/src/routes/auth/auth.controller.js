const jwt = require("jsonwebtoken");
const userModel = require("../../models/user.model");
const aesCipher = require("../../services/aesCipher");

async function validateRegisterInput(req, res, next) {
  if (await userModel.isExists(req.body)) {
    return res.status(400).json({
      error: "User already registered",
    });
  }
  next();
}

async function registerUser(req, res) {
  try {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: aesCipher.encrypt(req.body.password),
    };
    const user = await userModel.addUser(userData);
    const responseData = createSuccessResponseData(user);
    res.status(201).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function authenticateUser(req, res) {
  const user = await userModel.findUserByEmail(req.body.email);
  if (!user) {
    return res.status(401).send({ error: "Wrong email or password" });
  }

  const correctPassword = aesCipher.decrypt(user.password);
  if (!req.body === correctPassword) {
    return res.status(401).send({ error: "Wrong email or password" });
  }

  const accessToken = generateAccessToken(user);
  return res.status(200).send({ accessToken: accessToken });
}

function generateAccessToken(user) {
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: 30 }
  );
  return token;
}

function authorizeUser(req, res, next) {
  const token = req.header("Authorization").split(" ")[1];
  console.log(token);
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).send({ error: "Invalid Token" });
    return res.status(400).send({ error: "Invalid Request" });
  }
  next();
}

function createSuccessResponseData(user) {
  const responseData = {
    username: user.username,
    email: user.email,
    profileImage: user.profileImage,
  };
  return responseData;
}

module.exports = {
  validateRegisterInput,
  registerUser,
  authenticateUser,
  authorizeUser,
};
