var express = require("express");
var router = express.Router();
var adminController=require('../controllers/admin-controller')


// Teacher Management
router.post('/addTeacher',adminController.addTeacher)
router.get('/getTeacher',adminController.getTeacherDetails)
router.post('/deleteTeacher/:id',adminController.deleteTeacher)

// Batch Management
router.post('/addBatch',adminController.addBatch)
router.get('/getAllBatches',adminController.getAllBatches)
router.delete('/deleteBatch/:id',adminController.deleteBatch)

module.exports = router;
