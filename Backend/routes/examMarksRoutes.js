const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyTeacherOwnsOfferingFromBody, verifyTeacherOwnsOfferingFromRecord } = require("../middleware/ownershipMiddleware");

router.get("/", marksController.getAllExamMarks);
router.get("/:id", marksController.getExamMarkById);
router.post("/", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromBody, marksController.createExamMark);
router.put("/:id", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromRecord("exam_marks"), marksController.updateExamMark);
router.delete("/:id", requireRole("admin"), marksController.deleteExamMark);

module.exports = router;