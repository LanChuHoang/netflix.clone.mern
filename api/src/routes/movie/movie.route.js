const express = require("express");
const movieController = require("./movie.controller");
const authorizer = require("../../services/authorizer");

const router = express.Router();

router.use(authorizer.verifyAccessToken);
// CREATE movie: POST /movie
// by Admin
// Output: created movie
router.post("/", authorizer.authorizeAdmin, movieController.addMovie);

// GET All Movies: GET /movie?after_id&limit&sort
// by Admin
// Output: movies
router.get("/", authorizer.authorizeAdmin, movieController.getAllMovies);

// GET Single Movie: GET /movie/find/:id
// by Admin or User
// Output: movie
router.get("/find/:id", movieController.getMovie);

// GET Single Random Movie: GET /movie/find/:id
// by Admin or User
// Output: movie
router.get("/random", movieController.getRandomMovie);

// UPDATE Movie Info: PUT /movie/:id
// by Admin
// Output: updated movie
router.put("/:id", authorizer.authorizeAdmin, movieController.updateMovie);

// DELETE Single Movie: DELETE /movie/:id
// by Admin
// Output: deleted movie
router.delete("/:id", authorizer.authorizeAdmin, movieController.deleteMovie);

module.exports = router;
