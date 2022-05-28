const axios = require("axios").default;
const movieModel = require("../models/movie.model");
const mongodb = require("../services/mongo");
const { genres } = require("./tmdb.configure");

const API_KEY = "8278c684ff956c8023741995ca3ce340";
const BASE_URL = `https://api.themoviedb.org/3`;
const BASE_IMAGE_URL = "http://image.tmdb.org/t/p";
const BACKDROP_IMAGE_SIZE = "/original";
const THUMBNAIL_IMAGE_SIZE = "/w300";

async function loadPopularMovies(numPages = 1, isSeries = false) {
  const type = isSeries ? "tv" : "movie";
  for (let currentPage = 1; currentPage <= numPages; currentPage++) {
    const url = `${BASE_URL}/${type}/popular?page=${currentPage}&api_key=${API_KEY}`;
    // console.log(url);
    try {
      const response = (await axios.get(url)).data.results;
      // console.log(response);
      const movies = response.map((r) => {
        return {
          title: isSeries ? r.name : r.title,
          description: r.overview,
          image: `${BASE_IMAGE_URL}${BACKDROP_IMAGE_SIZE}${r.backdrop_path}`,
          imageThumbnail: `${BASE_IMAGE_URL}${THUMBNAIL_IMAGE_SIZE}${r.backdrop_path}`,
          releaseDate: isSeries ? r.first_air_date : r.release_date,
          genres: r.genre_ids.map((id) => genres.get(id)),
          isSeries: isSeries,
        };
      });
      // console.log(movies);
      const addedMovies = await movieModel.addMovies(movies);
      console.log(addedMovies);
    } catch (error) {
      console.log(error);
    }
  }
}

async function fill() {
  await mongodb.connect();
  await loadPopularMovies(5, true);
}

fill();
