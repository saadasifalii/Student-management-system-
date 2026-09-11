const express = require("express");
const router = express.Router();
const courseOfferingController = require("../controllers/courseOfferingcontroller");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", courseOfferingController.getAllCourseOfferings);
router.get("/:id", courseOfferingController.getCourseOfferingById);
router.post("/", requireRole("admin"), courseOfferingController.createCourseOffering);
router.put("/:id", requireRole("admin"), courseOfferingController.updateCourseOffering);
router.delete("/:id", requireRole("admin"), courseOfferingController.deleteCourseOffering);

module.exports = router;