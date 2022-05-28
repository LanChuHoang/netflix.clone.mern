const express = require("express");
const listController = require("./list.controller");
const authorizer = require("../../services/authorizer");

const router = express.Router();

router.use(authorizer.verifyAccessToken);
// CREATE list: POST /list
// by Admin
// Output: created list
router.post("/", authorizer.authorizeAdmin, listController.addList);

// GET Random Lists: GET /list/random?limit&type&genre
// by User
// Output: lists
router.get("/random", listController.getRandomLists);

// DELETE List: DELETE /list/:id
// by Admin
// Output: deleted list
router.delete("/:id", authorizer.authorizeAdmin, listController.deleteList);

module.exports = router;
