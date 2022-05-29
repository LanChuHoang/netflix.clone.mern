const mongoose = require("mongoose");

const options = {
  timestamps: true,
};
const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    type: { type: String },
    genres: { type: [String] },
    items: { type: [mongoose.SchemaTypes.ObjectId], ref: "Movie" },
  },
  options
);

const lists = mongoose.model("List", listSchema);

const DEFAULT_PROJECTION = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
};

async function isExists(list) {
  return (await lists.exists({ title: list.title })) !== null;
}

async function addList(list) {
  try {
    const createdlist = await lists.create(list);
    const { __v, createdAt, updatedAt, ...output } = createdlist.toObject();
    return output;
  } catch (error) {
    throw error;
  }
}

async function addLists(newLists) {
  try {
    const createdlists = await lists
      .insertMany(newLists)
      .populate("items", DEFAULT_PROJECTION);
    // const { __v, createdAt, updatedAt, ...output } = createdlist.toObject();
    return createdlists;
  } catch (error) {
    throw error;
  }
}

async function findListByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await lists.findById(id, projection);
  } catch (error) {
    throw error;
  }
}

async function findListByTitle(title, projection = DEFAULT_PROJECTION) {
  try {
    return await lists
      .findOne({ title: title }, projection)
      .populate("items", DEFAULT_PROJECTION);
  } catch (error) {
    throw error;
  }
}

async function getAllLists(
  afterID = null,
  limit = 10,
  sort = null,
  projection = DEFAULT_PROJECTION
) {
  try {
    let filter = {};
    if (afterID && sort) {
      const firstSortField = Object.keys(sort)[0];
      const pivot = (await lists.findById(afterID))[firstSortField];
      filter[firstSortField] = { $gt: pivot };
    } else if (afterID) {
      filter = { _id: { $gt: afterID } };
    }
    return await lists.find(filter, projection).sort(sort).limit(limit);
  } catch (error) {
    throw error;
  }
}

async function getRandomLists(type = "movie", genre, limit = 10) {
  try {
    const matchStage = genre ? { type: type, genres: genre } : { type: type };
    const unPopulateList = await lists.aggregate([
      {
        $match: matchStage,
      },
      {
        $sample: { size: limit },
      },
    ]);
    return await lists.populate(unPopulateList, { path: "items" });
  } catch (error) {
    throw error;
  }
}

async function updateList(id, updateData, projection = DEFAULT_PROJECTION) {
  try {
    return await lists.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      projection: projection,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteListByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await lists.findByIdAndDelete(id, { projection: projection });
  } catch (error) {
    throw error;
  }
}

async function deleteSeriesLists() {
  await lists.deleteMany({ type: "series" });
}

module.exports = {
  isExists,
  addList,
  addLists,
  findListByID,
  findListByTitle,
  getAllLists,
  getRandomLists,
  updateList,
  deleteListByID,
  deleteSeriesLists,
};
