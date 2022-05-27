const express = require("express");
const authRouter = require("./routes/auth/auth.route");
const userRouter = require("./routes/user/user.route");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/auth/", authRouter);
app.use("/api/user", userRouter);

module.exports = app;
