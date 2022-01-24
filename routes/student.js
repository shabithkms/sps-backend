var express=require('express')
var router=express.Router()


router.get('/',(req,res)=>{
    res.send('hi Student');
})



module.exports=router;