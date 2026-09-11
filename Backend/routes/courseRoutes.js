const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post("/", requireRole("admin"), courseController.createCourse);
router.put("/:id", requireRole("admin"), courseController.updateCourse);
router.delete("/:id", requireRole("admin"), courseController.deleteCourse);

module.exports = router;