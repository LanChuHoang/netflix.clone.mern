const express = require("express");
const listController = require("./list.controller");
const authorizerService = require("../../services/authorizer.service");

const router = express.Router();

router.use(authorizerService.verifyAccessToken);
// CREATE list: POST /list
// by Admin
// Output: created list
router.post("/", authorizerService.authorizeAdmin, listController.addList);

// GET Random Lists: GET /list/random?limit&type&genre
// by User
// Output: lists
router.get("/random", listController.getRandomLists);

// DELETE List: DELETE /list/:id
// by Admin
// Output: deleted list
router.delete(
  "/:id",
  authorizerService.authorizeAdmin,
  listController.deleteList
);

module.exports = router;
