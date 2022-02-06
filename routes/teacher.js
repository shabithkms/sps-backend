var express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const adminController = require("../controllers/admin-controller");
var router = express.Router();
var teacherController = require("../controllers/teacher-controller");

router.post("/login", teacherController.teacherLogin);
router.post("/signup", teacherController.teacherSignup);

// Teacher profile
router.get("/getTeacherData/:id", teacherController.getTeacherData);
router.post("/editProfile", teacherController.updateProfile);
router.post("/editPhoto", upload.single("image"), teacherController.editPhoto);

// Domain Management
router.get("/getDomains", teacherController.getDomains);
router.post("/addNewDomain", teacherController.addNewDomain);
router.post("/deleteDomain", teacherController.deleteDomain);

// Student Management
router.get("/getAllBatches", teacherController.getAllBatches);
router.post("/addStudent", teacherController.addStudent);
router.get("/getAllStudents", teacherController.getAllStudents);

module.exports = router;
