const { default: mongoose } = require("mongoose");
const { errorResponse } = require("../../configs/route.config");
const movieService = require("../../models/movie/movie.service");

async function addMovie(req, res) {
  if (await movieService.isExists(req.body))
    return res.status(400).json({ error: "Movie already exist" });
  try {
    const movie = await movieService.addMovie(req.body);
    return res.status(201).json(movie);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function getAllMovies(req, res) {
  const { after_id: afterID, limit, sort_by: sortOptions } = req.query;
  const sort = sortOptions ? {} : null;
  sortOptions?.split(",").forEach((option) => {
    [field, order] = option.split(":");
    sort[field] = order;
  });

  try {
    const movies = await movieService.getAllMovies(afterID, limit, sort);
    const responseData = {
      docs: movies,
      afterID: afterID ? afterID : null,
      limit: limit ? limit : 10,
      sort: sort,
    };
    return res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    if (
      error instanceof mongoose.Error.CastError ||
      error instanceof TypeError
    ) {
      return res.status(400).send(errorResponse.INVALID_QUERY);
      req, res;
    }
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function getMovie(req, res) {
  try {
    const movie = await movieService.findMovieByID(req.params.id);
    if (!movie) {
      return res.status(404).send(errorResponse.DEFAULT_404_ERROR);
    }
    return res.status(200).json(movie);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function getRandomMovie(req, res, next) {
  const type = req.query.type;
  if (type !== "series" && type !== "movie")
    return res.status(400).send(errorResponse.INVALID_QUERY);
  req, res;
  try {
    const movie = await movieService.getRandomMovie(type);
    return res.status(200).json(movie);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function updateMovie(req, res) {
  try {
    const updatedMovie = await movieService.updateMovie(
      req.params.id,
      req.body
    );
    if (!updatedMovie) {
      return res.status(404).send(errorR);
    }
    return res.status(200).json(updatedMovie);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

async function deleteMovie(req, res) {
  try {
    const deletedMovie = await movieService.deleteMovieByID(req.params.id);
    if (!deletedMovie) {
      return res.status(404).send(errorR);
    }
    return res.status(200).json(deletedMovie);
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse.DEFAULT_500_ERROR);
  }
}

module.exports = {
  addMovie,
  getAllMovies,
  getMovie,
  getRandomMovie,
  updateMovie,
  deleteMovie,
};
