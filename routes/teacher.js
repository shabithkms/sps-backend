var express = require("express");
const adminController = require("../controllers/admin-controller");
var router = express.Router();
var teacherController = require("../controllers/teacher-controller");

router.post("/login", teacherController.teacherLogin);
router.post("/signup", teacherController.teacherSignup);

router.get("/getTeacherData/:id", teacherController.getTeacherData);

module.exports = router;
