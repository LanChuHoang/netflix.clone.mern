const axios = require("axios").default;
const config = require("./tmdb.configure");
const movieModel = require("../models/movie.model");
const listModel = require("../models/list.model");
const mongodb = require("../services/mongo");

async function mapMovieToMongoModel(movie) {
  return {
    title: movie.title,
    description: movie.overview,
    image: config.getBackgroundImage(movie.backdrop_path),
    imageThumbnail: config.getThumbnailImage(movie.backdrop_path),
    trailer: await getTrailerURL("movie", movie.id),
    releaseDate: movie.release_date,
    adult: movie.adult,
    runtime: movie.runtime,
    genres: movie.genres.map((g) => g.name),
  };
}

async function mapTVToMongoModel(tv) {
  return {
    title: tv.name,
    description: tv.overview,
    image: config.getBackgroundImage(tv.backdrop_path),
    imageThumbnail: config.getThumbnailImage(tv.backdrop_path),
    trailer: await getTrailerURL("tv", tv.id),
    releaseDate: tv.last_air_date ? tv.last_air_date : tv.first_air_date,
    adult: tv.adult,
    numEpisodes: tv.number_of_episodes,
    numSeasons: tv.number_of_seasons,
    genres: tv.genres.map((g) => g.name),
    isSeries: true,
  };
}

async function getItem(type, id) {
  try {
    const url = config.getSingleItemURL(type, id);
    const { data } = await axios.get(url);
    // console.log(data);
    return data;
  } catch (error) {
    throw error;
  }
}

async function getMovie(id) {
  try {
    const unconvertedMovie = await getItem("movie", id);
    return await mapMovieToMongoModel(unconvertedMovie);
  } catch (error) {
    throw error;
  }
}

async function getTV(id) {
  try {
    const unconvertedTV = await getItem("tv", id);
    return await mapTVToMongoModel(unconvertedTV);
  } catch (error) {
    throw error;
  }
}

async function getClips(type, id) {
  try {
    const url = `${config.BASE_URL}/${type}/${id}/videos?api_key=${config.API_KEY}`;
    const { data } = await axios.get(url);
    return data.results;
  } catch (error) {
    throw error;
  }
}

async function getTrailerURL(type, id) {
  const isTrailer = (clip) => {
    return clip.site === "YouTube" && clip.type === "Trailer";
  };
  const clips = await getClips(type, id);
  if (!clips) return null;
  const trailer = clips.find((c) => isTrailer(c));
  if (!trailer) return null;
  const url = `https://www.youtube.com/watch?v=${trailer.key}`;
  return url;
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

async function upsertList(list) {
  try {
    const result = await listModel.findListByTitle(list.title);
    if (result) return result;
    return await listModel.addList(list);
  } catch (error) {
    console.log(error);
  }
}

async function loadOfficialListPage(listName, itemType, page) {
  try {
    const url = `${config.BASE_URL}/${itemType}/${listName}?page=${page}&api_key=${config.API_KEY}`;
    const { results } = (await axios.get(url)).data;

    const genres = [];
    const ids = [];
    for (const result of results) {
      const title = itemType === "movie" ? result.title : result.name;
      let savedModel = await movieModel.findMovieByTitle(title);
      if (!savedModel) {
        const modelData =
          itemType === "movie"
            ? await getMovie(result.id)
            : await getTV(result.id);
        savedModel = await movieModel.addMovie(modelData);
      }
      // console.log(savedModel);
      genres.push(...savedModel.genres);
      ids.push(savedModel._id);
    }

    return { genres, ids };
  } catch (error) {
    throw error;
  }
}

async function loadOfficialList(listName, itemType, numPages) {
  const formatListName = (listName) => {
    const capitalize = (phrase) => {
      return phrase
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };
    return capitalize(listName.replaceAll("_", " "));
  };

  try {
    let savedList = await listModel.findListByTitle(formatListName(listName));
    if (savedList) {
      console.log(
        "List already loaded",
        savedList.title,
        itemType,
        savedList.items.length
      );
      return savedList;
    }

    const genres = [];
    const ids = [];
    for (let page = 1; page <= numPages; page++) {
      const { genres: pageGenres, ids: pageIds } = await loadOfficialListPage(
        listName,
        itemType,
        page
      );
      genres.push(...pageGenres);
      ids.push(...pageIds);
    }

    const listData = {
      title: formatListName(listName),
      type: itemType === "movie" ? "movie" : "series",
      genres: Array.from(new Set(genres)),
      items: ids,
    };
    savedList = await listModel.addList(listData);
    console.log(savedList.title, itemType, savedList.items.length);
    return savedList;
  } catch (error) {
    console.log(error);
  }
}

async function loadOfficialLists(itemType, numPages) {
  const listNames =
    itemType === "movie" ? config.movieOfficialLists : config.tvOfficialLists;
  for (const listName of listNames) {
    const savedList = await loadOfficialList(listName, itemType, numPages);
  }
}

async function loadUserCreatedMovieLists(startID, endID) {
  for (let listID = startID; listID <= endID; listID++) {
    const url = `${config.BASE_URL}/list/${listID}?api_key=${config.API_KEY}`;
    try {
      const { items, ...listData } = await (await axios.get(url)).data;
      if (items.length < 2) {
        continue;
      }

      const upsertedMovieIDs = [];
      const listGenresSet = new Set();
      for (const item of items) {
        const upsertedMovie = await upsertMovie(await getMovie(item.id));
        upsertedMovie.genres.forEach((g) => listGenresSet.add(g));
        upsertedMovieIDs.push(upsertedMovie._id);
      }
      const savedList = await upsertList({
        title: listData.name,
        type: "movie",
        genres: Array.from(listGenresSet),
        items: upsertedMovieIDs,
      });

      console.log(savedList.title, savedList.items.length);
    } catch (error) {
      console.log(`Load list ${listID} failed`);
      console.log(error);
    }
  }
}

async function test() {
  await mongodb.connect();
  // console.log(await getMovie(634649));
  // console.log(await getTV(92749));
  // await loadUserCreatedMovieLists(1, 20);
  // await loadOfficialList("airing_today", "tv", 1);
  await loadOfficialLists("tv", 1);
  // await movieModel.deleteSeries();
  // await listModel.deleteSeriesLists();
  await mongodb.disconnect();
}

test();

module.exports = {
  getMovie,
  getTV,
};
