const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", enrollmentController.getAllEnrollments);
router.get("/:id", enrollmentController.getEnrollmentById);
router.post("/", requireRole("admin"), enrollmentController.createEnrollment);
router.put("/:id", requireRole("admin"), enrollmentController.updateEnrollment);
router.delete("/:id", requireRole("admin"), enrollmentController.deleteEnrollment);

module.exports = router;