var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const studentController = require('../controllers/student-controller');

// Authentication
router.post('/signup', studentController.doSignup);
router.post('/login', studentController.doLogin);

// Profile Management of student
// Editing the profile datas
router.post('/editProfile', upload.single('ID_Proof'), studentController.editProfile);
router.post('/editPhoto',upload.single('image'),studentController.editProfilePhoto)

module.exports = router;
