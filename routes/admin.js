var express = require("express");
var router = express.Router();
var adminController = require("../controllers/admin-controller");

// Teacher Management

// Add teacher with Email
router.post("/addTeacher", adminController.addTeacher);
// Get all registered teacher
router.get("/getTeacher", adminController.getTeacherDetails);
// Delete teacher with teacher id
router.post("/deleteTeacher/:id", adminController.deleteTeacher);

// Batch Management

// Add batch with Name and Place
router.post("/addBatch", adminController.addBatch);
// Get all batches
router.get("/getAllBatches", adminController.getAllBatches);
// Delete batch with id
router.delete("/deleteBatch/:id", adminController.deleteBatch);

module.exports = router;
