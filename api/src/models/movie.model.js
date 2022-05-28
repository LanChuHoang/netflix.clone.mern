const mongoose = require("mongoose");

const options = {
  timestamps: true,
};
const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    imageTitle: { type: String },
    imageThumbnail: { type: String },
    trailer: { type: String },
    video: { type: String },
    releaseDate: { type: Date },
    limit: { type: Number },
    genres: { type: [String] },
    isSeries: { type: Boolean, default: false },
  },
  options
);

const movies = mongoose.model("Movie", movieSchema);

const DEFAULT_PROJECTION = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
};

async function isExists(movie) {
  return (await movies.exists({ title: movie.title })) !== null;
}

async function addMovie(movie) {
  try {
    const createdMovie = await movies.create(movie);
    const { __v, createdAt, updatedAt, ...output } = createdMovie.toObject();
    return output;
  } catch (error) {
    throw error;
  }
}

async function addMovies(newMovies) {
  try {
    const createdMovies = await movies.insertMany(newMovies);
    // const { __v, createdAt, updatedAt, ...output } = createdMovie.toObject();
    return createdMovies;
  } catch (error) {
    throw error;
  }
}

async function findMovieByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await movies.findById(id, projection);
  } catch (error) {
    throw error;
  }
}

async function findMovieByTitle(title, projection = DEFAULT_PROJECTION) {
  try {
    return await movies.findOne({ title: title }, projection);
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
      const pivot = (await movies.findById(afterID))[firstSortField];
      filter[firstSortField] = { $gt: pivot };
    } else if (afterID) {
      filter = { _id: { $gt: afterID } };
    }
    return await movies.find(filter, projection).sort(sort).limit(limit);
  } catch (error) {
    throw error;
  }
}

async function getRandomMovie(type) {
  try {
    return await movies.aggregate([
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
    return await movies.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      projection: projection,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteMovieByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await movies.findByIdAndDelete(id, { projection: projection });
  } catch (error) {
    throw error;
  }
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
};
