const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();


var adminRouter=require('./routes/admin')
var studentRouter=require('./routes/student')
var teacherRouter=require('./routes/teacher')
var reviewerRouter=require('./routes/reviewer')
const PORT=process.env.PORT

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
})




//Middlewares
app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/',studentRouter)
// app.use('/admin',adminRouter)

//Database connection
var db=require('./config/connection')
db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('Databse connected');
    }
})

module.exports=app
