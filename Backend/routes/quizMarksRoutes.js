const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyTeacherOwnsOfferingFromBody, verifyTeacherOwnsOfferingFromRecord, verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", requireRole("admin", "teacher"), marksController.getAllQuizMarks);
router.get("/:id", requireRole("admin", "teacher"), marksController.getQuizMarkById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, marksController.getQuizMarksByStudent);
router.post("/", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromBody, marksController.createQuizMark);
router.put("/:id", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromRecord("quiz_marks"), marksController.updateQuizMark);
router.delete("/:id", requireRole("admin"), marksController.deleteQuizMark);

module.exports = router;