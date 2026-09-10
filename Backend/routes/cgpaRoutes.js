const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");

router.get("/", academicRecordController.getAllCgpa);
router.get("/student/:studentId", academicRecordController.getCgpaByStudent);
router.post("/", academicRecordController.createOrUpdateCgpa);
router.delete("/student/:studentId", academicRecordController.deleteCgpa);

module.exports = router;