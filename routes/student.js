var express = require("express");
var router = express.Router();
const studentController = require("../controllers/student-controller");

// Authentication
router.post("/signup", studentController.doSignup);
router.post("/login", studentController.doLogin);

// Profile Management
router.post("/editProfile", studentController.editProfile);

module.exports = router;
