const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", requireRole("admin"), studentController.createStudent);
router.put("/:id", requireRole("admin"), studentController.updateStudent);
router.delete("/:id", requireRole("admin"), studentController.deleteStudent);

module.exports = router;