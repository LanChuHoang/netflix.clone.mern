const express = require("express");
const authController = require("./auth.controller");

const router = express.Router();

router.post(
  "/register",
  authController.validateRegisterInput,
  authController.registerUser
);

router.post("/login", authController.authenticateUser);

router.get("/authorize", authController.authorizeUser, (req, res) => {
  res.send("Authorize success");
});

module.exports = router;
