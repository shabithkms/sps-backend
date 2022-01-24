const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors=require('cors')
const app = express();


var adminRouter=require('./routes/admin')
var studentRouter=require('./routes/student')
var teacherRouter=require('./routes/teacher')
var reviewerRouter=require('./routes/reviewer')
const PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})

app.use('/',studentRouter)
app.use('/admin',adminRouter)
app.use('/teacher',teacherRouter)
app.use('/reviewer',reviewerRouter)

//Middlewares
app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials:true,
  
    })
  );



//Database connection
var db=require('./config/connection')
db.connect((err)=>{
    if(err){
        console.log(err); 
    }else{ 
        console.log('Databse connected');
    }
})

app.get("/api", (req, res) => {
    try {
      res.json({ message: "Sample from server" });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });

module.exports=app
