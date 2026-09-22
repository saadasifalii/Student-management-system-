const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", requireRole("admin","teacher"), studentController.getAllStudents);
router.get("/me", requireRole("student"), studentController.getMyStudentProfile);
router.get("/:id", requireRole("admin"), studentController.getStudentById);
router.post("/", requireRole("admin"), studentController.createStudent);
router.put("/:id", requireRole("admin"), studentController.updateStudent);
router.delete("/:id", requireRole("admin"), studentController.deleteStudent);

module.exports = router;