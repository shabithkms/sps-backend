const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

var adminRouter = require("./routes/admin");
var studentRouter = require("./routes/student");
var teacherRouter = require("./routes/teacher");
var reviewerRouter = require("./routes/reviewer");

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});

//Middlewaress
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//Database connection
var db = require("./config/connection");
db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});

//Routes
app.use("/", studentRouter);
app.use("/admin", adminRouter);
app.use("/teacher", teacherRouter);
app.use("/reviewer", reviewerRouter);

module.exports = app;
