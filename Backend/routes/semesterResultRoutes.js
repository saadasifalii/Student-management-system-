const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", requireRole("admin", "teacher"), academicRecordController.getAllSemesterResults);
router.get("/:id", requireRole("admin", "teacher"), academicRecordController.getSemesterResultById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, academicRecordController.getSemesterResultsByStudent);
router.post("/", requireRole("admin"), academicRecordController.createSemesterResult);
router.put("/:id", requireRole("admin"), academicRecordController.updateSemesterResult);
router.delete("/:id", requireRole("admin"), academicRecordController.deleteSemesterResult);

module.exports = router;