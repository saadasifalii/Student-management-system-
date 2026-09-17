const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyTeacherOwnsOfferingFromBody, verifyTeacherOwnsOfferingFromRecord, verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");

router.get("/", attendanceController.getAllAttendance);
router.get("/:id", attendanceController.getAttendanceById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, attendanceController.getAttendanceByStudent);
router.get("/student/:studentId/summary", verifyStudentOwnsDataOrStaff, attendanceController.getAttendanceSummaryByStudent);
router.post("/", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromBody, attendanceController.createAttendance);
router.put("/:id", requireRole("teacher", "admin"), verifyTeacherOwnsOfferingFromRecord("attendance"), attendanceController.updateAttendance);
router.delete("/:id", requireRole("admin"), attendanceController.deleteAttendance);

module.exports = router;