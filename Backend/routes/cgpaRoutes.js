const express = require("express");
const router = express.Router();
const academicRecordController = require("../controllers/academicRecordController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", academicRecordController.getAllCgpa);
router.get("/student/:studentId", academicRecordController.getCgpaByStudent);
router.post("/", requireRole("admin"), academicRecordController.createOrUpdateCgpa);
router.delete("/student/:studentId", requireRole("admin"), academicRecordController.deleteCgpa);

module.exports = router;