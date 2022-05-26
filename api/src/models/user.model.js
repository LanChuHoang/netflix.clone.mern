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
const users = mongoose.model("User", userSchema);

async function isExists(user) {
  return (
    (await users.exists({
      $or: [{ username: user.username }, { email: user.email }],
    })) !== null
  );
}

async function addUser(user) {
  try {
    const filters = {
      username: user.username,
    };
    const options = {
      upsert: true,
      returnDocument: "after",
    };
    return await users.findOneAndUpdate(filters, user, options);
  } catch (error) {
    throw error;
  }
}

async function findUserByEmail(email) {
  return await users.findOne({ email: email });
}

module.exports = {
  isExists,
  addUser,
  findUserByEmail,
};
