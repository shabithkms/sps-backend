var express = require("express");
var router = express.Router();
var adminController=require('../controllers/admin-controller')



router.post('/addTeacher',adminController.addTeacher)
router.get('/getTeacher',adminController.getTeacherDetails)
router.post('/deleteTeacher/:id',adminController.deleteTeacher)

module.exports = router;
