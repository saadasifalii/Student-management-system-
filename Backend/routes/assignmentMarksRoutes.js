const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyTeacherOwnsOfferingFromBody, verifyTeacherOwnsOfferingFromRecord, verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", requireRole("admin", "teacher"), marksController.getAllAssignmentMarks);
router.get("/:id", requireRole("admin", "teacher"), marksController.getAssignmentMarkById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, marksController.getAssignmentMarksByStudent);
router.post("/", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromBody, marksController.createAssignmentMark);
router.put("/:id", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromRecord("assignment_marks"), marksController.updateAssignmentMark);
router.delete("/:id", requireRole("admin"), marksController.deleteAssignmentMark);

module.exports = router;