const mongoose = require("mongoose");

const options = {
  timestamps: true,
};
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
  },
  options
);
// Enable the "id" virtual field to be created when "toJSON" event occurs
// userSchema.set("toJSON", {
//   virtuals: true,
// });
const users = mongoose.model("User", userSchema);

const DEFAULT_PROJECTION = {
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
  password: 0,
};

async function isExists(user) {
  return (
    (await users.exists({
      $or: [{ username: user.username }, { email: user.email }],
    })) !== null
  );
}

async function addUser(user) {
  try {
    const createdUser = await users.create(user);
    const { __v, createdAt, updatedAt, password, ...output } =
      createdUser.toObject();
    return output;
  } catch (error) {
    throw error;
  }
}

async function findUserByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await users.findById(id, projection);
  } catch (error) {
    throw error;
  }
}

async function findUserByEmail(email, projection = DEFAULT_PROJECTION) {
  try {
    return await users.findOne({ email: email }, projection);
  } catch (error) {
    throw error;
  }
}

async function getAllUsers(
  afterID = null,
  limit = 10,
  sort = null,
  projection = DEFAULT_PROJECTION
) {
  try {
    let filter = {};
    if (afterID && sort) {
      const firstSortField = Object.keys(sort)[0];
      const pivot = (await users.findById(afterID))[firstSortField];
      filter[firstSortField] = { $gt: pivot };
    } else if (afterID) {
      filter = { _id: { $gt: afterID } };
    }
    return await users.find(filter, projection).sort(sort).limit(limit);
  } catch (error) {
    throw error;
  }
}

async function getNewUsers(amount, projection = DEFAULT_PROJECTION) {
  try {
    return await users.find({}, projection).sort({ _id: -1 }).limit(amount);
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, updateData, projection = DEFAULT_PROJECTION) {
  try {
    return await users.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      projection: projection,
    });
  } catch (error) {
    throw error;
  }
}

async function deleteUserByID(id, projection = DEFAULT_PROJECTION) {
  try {
    return await users.findByIdAndDelete(id, { projection: projection });
  } catch (error) {
    throw error;
  }
}

async function getNumUserPerMonth() {
  try {
    return users.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          numUsers: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          numUsers: 1,
          _id: 0,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  isExists,
  addUser,
  findUserByID,
  findUserByEmail,
  getAllUsers,
  getNewUsers,
  updateUser,
  deleteUserByID,
  getNumUserPerMonth,
};
