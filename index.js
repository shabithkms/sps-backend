const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const db = require('./config/connection');

var adminRouter = require('./routes/admin');
var studentRouter = require('./routes/student');
var teacherRouter = require('./routes/teacher');
var reviewerRouter = require('./routes/reviewer');

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
console.log(process.env.REACT_BASE_URL);
//Middlewaress
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.REACT_BASE_URL,
    credentials: true,
  })
);

app.get('/api', (req, res) => {
  res.send('Welcome to SPS Api service');
});

//Database connection
db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database connected');
  }
});

//Routes
app.use('/api', studentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/reviewer', reviewerRouter);

module.exports = app;
