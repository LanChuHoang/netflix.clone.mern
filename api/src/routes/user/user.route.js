const express = require("express");
const userController = require("./user.controller");
const authorizer = require("../../services/authorizer");

const router = express.Router();

router.use(authorizer.verifyAccessToken);

// GET All Users: GET /user
// by Admin
// Output user infor except password, __v, createdAt, updateAt
router.get("/", authorizer.authorizeAdmin, userController.getAllUsers);

// GET Single User: GET /user/:id
// by Admin or Owner User
// Output user infor except password, __v, createdAt, updateAt
router.get(
  "/find/:id",
  authorizer.authorizeUserOrAdmin,
  userController.getUser
);

// UPDATE User Profile: PUT /user/:id
// by Admin or Owner User
// Output updated user infor except password, __v, createdAt, updateAt
router.put("/:id", authorizer.authorizeUserOrAdmin, userController.updateUser);

// DELETE Single User: DELETE /user/:id
// by Admin or Owner User
// Output deleted user infor except password, __v, createdAt, updateAt
router.delete(
  "/:id",
  authorizer.authorizeUserOrAdmin,
  userController.deleteUser
);

// GET Number of user per month: GET /user/stats/
// by Admin
// Output user infor except password, __v, createdAt, updateAt
router.get(
  "/stats/",
  authorizer.authorizeAdmin,
  userController.getNumUserPerMonth
);

module.exports = router;
