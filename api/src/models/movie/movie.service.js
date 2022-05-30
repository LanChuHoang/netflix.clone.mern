const movieModel = require("./movie.model");

const DEFAULT_PROJECTION = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
};

async function isExists(movie) {
  return (await movieModel.exists({ title: movie.title })) !== null;
}

async function addMovie(movie) {
  try {
    const createdMovie = await movieModel.create(movie);
    const { __v, createdAt, updatedAt, ...output } = createdMovie.toObject();
    return output;
  } catch (error) {
    throw error;
  }
}

async function addMovies(newMovies) {
  try {
    const createdMovies = await movieModel.insertMany(newMovies);
    // const { __v, createdAt, updatedAt, ...output } = createdMovie.toObject();
    return createdMovies;
  } catch (error) {
    throw error;
  }
}

async function findMovieByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await movieModel.findById(id, projection);
  } catch (error) {
    throw error;
  }
}

async function findMovieByTitle(title, projection = DEFAULT_PROJECTION) {
  try {
    return await movieModel.findOne({ title: title }, projection);
  } catch (error) {
    throw error;
  }
}

async function getAllMovies(
  afterID = null,
  limit = 10,
  sort = null,
  projection = DEFAULT_PROJECTION
) {
  try {
    let filter = {};
    if (afterID && sort) {
      const firstSortField = Object.keys(sort)[0];
      const pivot = (await movieModel.findById(afterID))[firstSortField];
      filter[firstSortField] = { $gt: pivot };
    } else if (afterID) {
      filter = { _id: { $gt: afterID } };
    }
    return await movieModel.find(filter, projection).sort(sort).limit(limit);
  } catch (error) {
    throw error;
  }
}

async function getRandomMovie(type) {
  try {
    return await movieModel.aggregate([
      {
        $match: { isSeries: type === "series" },
      },
      {
        $sample: { size: 1 },
      },
    ]);
  } catch (error) {
    throw error;
  }
}

async function updateMovie(id, updateData, projection = DEFAULT_PROJECTION) {
  try {
    return await movieModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      projection: projection,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteMovieByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await movieModel.findByIdAndDelete(id, { projection: projection });
  } catch (error) {
    throw error;
  }
}

async function deleteSeries() {
  await movieModel.deleteMany({
    isSeries: true,
  });
}

module.exports = {
  isExists,
  addMovie,
  addMovies,
  findMovieByID,
  findMovieByTitle,
  getAllMovies,
  getRandomMovie,
  updateMovie,
  deleteMovieByID,
  deleteSeries,
};
