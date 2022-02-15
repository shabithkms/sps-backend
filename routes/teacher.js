var express = require('express');
var router = express.Router();
var teacherController = require('../controllers/teacher-controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Teacher login with email and password
router.post('/login', teacherController.teacherLogin);

// Register teacher with email ,name and password
router.post('/signup', teacherController.teacherSignup);

// Teacher profile
// Get teacher data for eddit profile
router.get('/getTeacherData/:id', teacherController.getTeacherData);
// For updating the profile with updated data
router.post('/editProfile', teacherController.updateProfile);
// For edit profile photo with cropped image
router.post('/editPhoto', upload.single('image'), teacherController.editPhoto);

// Domain Management
// Get all domains for display table
router.get('/getAllDomains', teacherController.getDomains);
// Add new domain with name
router.post('/addNewDomain', teacherController.addNewDomain);
// Delete domain
router.post('/deleteDomain', teacherController.deleteDomain);

// Student Management
// Get all batches
router.get('/getAllBatches', teacherController.getAllBatches);
// Add student with batch and name
router.post('/addStudent', teacherController.addStudent);
// Get all students details
router.get('/getAllStudents', teacherController.getAllStudents);

// Reviewer Management
// Get all reviewer details
router.get('/getAllReviewer', teacherController.getAllReviewer);
// Add new reviewer
router.post('/addNewReviewer', teacherController.addNewReviewer);
// Delete reviewer with id
router.delete('/deleteReviewer/:id', teacherController.deleteReviewer);

module.exports = router;
