const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", teacherController.getAllTeachers);
router.get("/:id", teacherController.getTeacherById);
router.post("/", requireRole("admin"), teacherController.createTeacher);
router.put("/:id", requireRole("admin"), teacherController.updateTeacher);
router.delete("/:id", requireRole("admin"), teacherController.deleteTeacher);

module.exports = router;