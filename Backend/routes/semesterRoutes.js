const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semesterController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", semesterController.getAllSemesters);
router.get("/:id", semesterController.getSemesterById);
router.post("/", requireRole("admin"), semesterController.createSemester);
router.put("/:id", requireRole("admin"), semesterController.updateSemester);
router.delete("/:id", requireRole("admin"), semesterController.deleteSemester);

module.exports = router;