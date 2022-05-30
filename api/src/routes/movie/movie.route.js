const express = require("express");
const movieController = require("./movie.controller");
const authorizerService = require("../../services/authorizer.service");

const router = express.Router();

router.use(authorizerService.verifyAccessToken);
// CREATE movie: POST /movie
// by Admin
// Output: created movie
router.post("/", authorizerService.authorizeAdmin, movieController.addMovie);

// GET All Movies: GET /movie?after_id&limit&sort
// by Admin
// Output: movies
router.get("/", authorizerService.authorizeAdmin, movieController.getAllMovies);

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
router.put(
  "/:id",
  authorizerService.authorizeAdmin,
  movieController.updateMovie
);

// DELETE Single Movie: DELETE /movie/:id
// by Admin
// Output: deleted movie
router.delete(
  "/:id",
  authorizerService.authorizeAdmin,
  movieController.deleteMovie
);

module.exports = router;
