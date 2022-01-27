const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const app = express();

var adminRouter = require("./routes/admin");
var studentRouter = require("./routes/student");
var teacherRouter = require("./routes/teacher");
var reviewerRouter = require("./routes/reviewer");
app.get("/", (req, res) => {
  console.log("Api call");
  res.send("Hi iam shabith");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});



//Middlewaress
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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


app.use("/", studentRouter);
app.use("/admin", adminRouter);
app.use("/teacher", teacherRouter);
app.use("/reviewer", reviewerRouter);

module.exports = app;
