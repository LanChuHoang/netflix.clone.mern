const express = require("express");
const userController = require("./user.controller");
const authorizer = require("../../services/authorizer");

const router = express.Router();

// GET All Users: GET /user
// by Admin
// Output user infor except password, __v, createdAt, updateAt
router.get(
  "/",
  authorizer.verifyAccessToken,
  authorizer.checkPermission,
  userController.getAllUsers
);

// GET Single User: GET /user/:id
// by Admin or Owner User
// Output user infor except password, __v, createdAt, updateAt
router.get(
  "/find/:id",
  authorizer.verifyAccessToken,
  authorizer.checkPermission,
  userController.getUser
);

// UPDATE User Profile: PUT /user/:id
// by Admin or Owner User
// Output updated user infor except password, __v, createdAt, updateAt
router.put(
  "/:id",
  authorizer.verifyAccessToken,
  authorizer.checkPermission,
  userController.updateUser
);

// DELETE Single User: DELETE /user/:id
// by Admin or Owner User
// Output deleted user infor except password, __v, createdAt, updateAt
router.delete(
  "/:id",
  authorizer.verifyAccessToken,
  authorizer.checkPermission,
  userController.deleteUser
);

// GET Number of user per month: GET /user/stats/
// by Admin
// Output user infor except password, __v, createdAt, updateAt
router.get(
  "/stats/",
  authorizer.verifyAccessToken,
  authorizer.checkPermission,
  userController.getNumUserPerMonth
);

module.exports = router;
