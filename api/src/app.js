const express = require("express");
const path = require("path");
const cors = require("cors");
const authRouter = require("./routes/auth/auth.route");
const userRouter = require("./routes/user/user.route");
const movieRouter = require("./routes/movie/movie.route");
const listRouter = require("./routes/list/list.route");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
// app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/auth/", authRouter);
app.use("/api/user", userRouter);
app.use("/api/movie", movieRouter);
app.use("/api/list", listRouter);

module.exports = app;
