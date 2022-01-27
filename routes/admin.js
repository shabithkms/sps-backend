var express = require("express");
var router = express.Router();
var adminHelper=require('../controllers/admin-controller')



router.post('/addTeacher',adminHelper.addTeacher)
router.get('/getTeacher',adminHelper.getTeacherDetails)
router.post('/deleteTeacher/:id',adminHelper.deleteTeacher)

module.exports = router;
