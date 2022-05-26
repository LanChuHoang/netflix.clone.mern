const userModel = require("../../models/user.model");
const aesCipher = require("../../services/aesCipher");
const authorizer = require("../../services/authorizer");

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

  const accessToken = authorizer.generateAccessToken(user);
  return res.status(200).send({ accessToken: accessToken });
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
};
