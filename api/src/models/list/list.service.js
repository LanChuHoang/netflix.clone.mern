const listModel = require("./list.model");

const DEFAULT_PROJECTION = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
};

async function isExists(list) {
  return (await listModel.exists({ title: list.title })) !== null;
}

async function addList(list) {
  try {
    const createdlist = await listModel.create(list);
    const { __v, createdAt, updatedAt, ...output } = createdlist.toObject();
    return output;
  } catch (error) {
    throw error;
  }
}

async function addLists(newLists) {
  try {
    const createdlists = await listModel
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
    return await listModel.findById(id, projection);
  } catch (error) {
    throw error;
  }
}

async function findListByTitle(title, projection = DEFAULT_PROJECTION) {
  try {
    return await listModel
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
      const pivot = (await listModel.findById(afterID))[firstSortField];
      filter[firstSortField] = { $gt: pivot };
    } else if (afterID) {
      filter = { _id: { $gt: afterID } };
    }
    return await listModel.find(filter, projection).sort(sort).limit(limit);
  } catch (error) {
    throw error;
  }
}

async function getRandomLists(type = "movie", genre, limit = 10) {
  try {
    const matchStage = genre ? { type: type, genres: genre } : { type: type };
    const unPopulateList = await listModel.aggregate([
      {
        $match: matchStage,
      },
      {
        $sample: { size: limit },
      },
    ]);
    return await listModel.populate(unPopulateList, { path: "items" });
  } catch (error) {
    throw error;
  }
}

async function updateList(id, updateData, projection = DEFAULT_PROJECTION) {
  try {
    return await listModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      projection: projection,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteListByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await listModel.findByIdAndDelete(id, { projection: projection });
  } catch (error) {
    throw error;
  }
}

async function deleteSeriesLists() {
  await listModel.deleteMany({ type: "series" });
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
