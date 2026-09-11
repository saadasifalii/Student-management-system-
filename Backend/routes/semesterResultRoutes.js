const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", academicRecordController.getAllSemesterResults);
router.get("/:id", academicRecordController.getSemesterResultById);
router.get("/student/:studentId", academicRecordController.getSemesterResultsByStudent);
router.post("/", requireRole("admin"), academicRecordController.createSemesterResult);
router.put("/:id", requireRole("admin"), academicRecordController.updateSemesterResult);
router.delete("/:id", requireRole("admin"), academicRecordController.deleteSemesterResult);

module.exports = router;