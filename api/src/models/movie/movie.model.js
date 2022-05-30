const mongoose = require("mongoose");

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
    adult: { type: Boolean },
    runtime: { type: Number },
    numEpisodes: { type: Number },
    numSeasons: { type: Number },
    genres: { type: [String] },
    isSeries: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
