var express=require('express')
var router=express.Router()



router.get('/',(req,res)=>{
    // console.log("api calling");
    // res.json('hi Admin');

    try {
        res.json({ message: "Sample from server" });
      } catch (error) {
        console.log(error);
        res.json(error);
      }
})

router.get('/login',(req,res)=>{
    res.json('In login page')
})




module.exports=router;