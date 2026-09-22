const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyTeacherOwnsOfferingFromBody, verifyTeacherOwnsOfferingFromRecord, verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", requireRole("admin", "teacher"), marksController.getAllExamMarks);
router.get("/:id", requireRole("admin", "teacher"), marksController.getExamMarkById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, marksController.getExamMarksByStudent);
router.post("/", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromBody, marksController.createExamMark);
router.put("/:id", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromRecord("exam_marks"), marksController.updateExamMark);
router.delete("/:id", requireRole("admin"), marksController.deleteExamMark);

module.exports = router;