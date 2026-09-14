const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", requireRole("admin", "teacher"), academicRecordController.getAllCgpa);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, academicRecordController.getCgpaByStudent);
router.post("/", requireRole("admin"), academicRecordController.createOrUpdateCgpa);
router.delete("/student/:studentId", requireRole("admin"), academicRecordController.deleteCgpa);

module.exports = router;