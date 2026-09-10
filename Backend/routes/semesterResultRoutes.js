const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");

router.get("/", academicRecordController.getAllSemesterResults);
router.get("/:id", academicRecordController.getSemesterResultById);
router.get("/student/:studentId", academicRecordController.getSemesterResultsByStudent);
router.post("/", academicRecordController.createSemesterResult);
router.put("/:id", academicRecordController.updateSemesterResult);
router.delete("/:id", academicRecordController.deleteSemesterResult);

module.exports = router;