const express = require("express");
const router = express.Router();
const courseOfferingController = require("../controllers/courseOfferingcontroller");

router.get("/", courseOfferingController.getAllCourseOfferings);
router.get("/:id", courseOfferingController.getCourseOfferingById);
router.post("/", courseOfferingController.createCourseOffering);
router.put("/:id", courseOfferingController.updateCourseOffering);
router.delete("/:id", courseOfferingController.deleteCourseOffering);

module.exports = router;