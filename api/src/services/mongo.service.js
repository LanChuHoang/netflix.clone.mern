const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connect() {
  mongoose.connection.once("open", () => {
    console.log("MongoDB connected");
  });
  mongoose.connection.on("error", (err) => {
    console.log(err);
  });

  const MONGO_URL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@netflixclonecluster.qzffp.mongodb.net/?retryWrites=true&w=majority`;
  await mongoose.connect(MONGO_URL);
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = {
  connect,
  disconnect,
};
