var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const studentController = require('../controllers/student-controller');

// Authentication
router.post('/signup', studentController.doSignup);
router.post('/login', studentController.doLogin);

// Profile Management
router.post(
  '/editProfile',
  upload.single('ID_Proof'),
  studentController.editProfile
);
router.get('/getStudentData/:id', studentController.getStudentData);

module.exports = router;
