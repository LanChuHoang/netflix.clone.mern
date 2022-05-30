const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    type: { type: String },
    genres: { type: [String] },
    items: { type: [mongoose.SchemaTypes.ObjectId], ref: "Movie" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("List", listSchema);
