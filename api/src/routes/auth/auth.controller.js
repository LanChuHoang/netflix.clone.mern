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
    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
}

async function authenticateUser(req, res) {
  const user = await userModel.findUserByEmail(req.body.email, null);
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

module.exports = {
  validateRegisterInput,
  registerUser,
  authenticateUser,
};
