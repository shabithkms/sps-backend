var express=require('express')
var router=express.Router()


router.get('/',(req,res)=>{
    res.send('hi Teacher');
})



module.exports=router;