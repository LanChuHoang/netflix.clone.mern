const axios = require("axios").default;
const movieModel = require("../models/movie.model");
const listModel = require("../models/list.model");
const mongodb = require("../services/mongo");
const { genres } = require("./tmdb.configure");

const API_KEY = "8278c684ff956c8023741995ca3ce340";
const BASE_URL = `https://api.themoviedb.org/3`;
const BASE_IMAGE_URL = "http://image.tmdb.org/t/p";
const BACKDROP_IMAGE_SIZE = "/original";
const THUMBNAIL_IMAGE_SIZE = "/w300";

function mapTMDBToMovieModel(tmdbMovie, isSeries = false) {
  return {
    title: isSeries ? tmdbMovie.name : tmdbMovie.title,
    description: tmdbMovie.overview,
    image: `${BASE_IMAGE_URL}${BACKDROP_IMAGE_SIZE}${tmdbMovie.backdrop_path}`,
    imageThumbnail: `${BASE_IMAGE_URL}${THUMBNAIL_IMAGE_SIZE}${tmdbMovie.backdrop_path}`,
    releaseDate: isSeries ? tmdbMovie.first_air_date : tmdbMovie.release_date,
    genres: tmdbMovie.genre_ids.map((id) => genres.get(id)),
    isSeries: isSeries,
  };
}

async function upsertMovie(movie) {
  try {
    const result = await movieModel.findMovieByTitle(movie.title);
    if (result) return result;
    return await movieModel.addMovie(movie);
  } catch (error) {
    console.log(error);
  }
}

async function loadPopularMovies(numPages = 1, isSeries = false) {
  const type = isSeries ? "tv" : "movie";
  for (let currentPage = 1; currentPage <= numPages; currentPage++) {
    const url = `${BASE_URL}/${type}/popular?page=${currentPage}&api_key=${API_KEY}`;
    // console.log(url);
    try {
      const response = (await axios.get(url)).data.results;
      // console.log(response);
      const movies = response.map((r) => {
        return mapTMDBToMovieModel(r, isSeries);
      });
      // console.log(movies);
      const addedMovies = await movieModel.addMovies(movies);
      console.log(addedMovies);
    } catch (error) {
      console.log(error);
    }
  }
}

async function loadLists(startID, endID) {
  for (let listID = startID; listID <= endID; listID++) {
    const url = `${BASE_URL}/list/${listID}?api_key=${API_KEY}`;
    try {
      const { items, ...listData } = await (await axios.get(url)).data;
      const movieIDs = [];
      if (items.length === 0) {
        continue;
      }
      const genreSet = new Set();
      for (const item of items) {
        const movieData = mapTMDBToMovieModel(item);
        const upsertedMovie = await upsertMovie(movieData);
        for (const genre of upsertedMovie.genres) {
          genreSet.add(genre);
        }
        movieIDs.push(upsertedMovie._id);
      }
      const addedList =
        (await listModel.findListByTitle(listData.name)) ||
        (await listModel.addList({
          title: listData.name,
          type: "movie",
          genres: Array.from(genreSet),
          items: movieIDs,
        }));

      // Print Result
      // const { items: movies, ...list } = addedList.toObject();
      // console.log(list);
      // console.log(movies.map((m) => m.title));
      console.log(addedList);
    } catch (error) {
      console.log(`Load list ${listID} failed`);
      console.log(error);
    }
  }
}

async function fill() {
  await mongodb.connect();
  // await loadPopularMovies(5, true);
  await loadLists(1, 20);
}

fill();
