const express = require("express");
const router = express.Router();

const academicRecordController = require("../controllers/academicRecordController");

const { verifyToken } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");


router.get(
    "/",
    verifyToken,
    requireRole("admin", "teacher"),
    academicRecordController.getAllCgpa
);

router.get(
    "/student/:studentId",
    verifyToken,
    requireRole("admin", "teacher", "student"),
    academicRecordController.getCgpaByStudent
);

router.post(
    "/",
    verifyToken,
    requireRole("admin", "teacher"),
    academicRecordController.createOrUpdateCgpa
);

router.delete(
    "/student/:studentId",
    verifyToken,
    requireRole("admin", "teacher"),
    academicRecordController.deleteCgpa
);

module.exports = router;