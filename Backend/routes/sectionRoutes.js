const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", sectionController.getAllSections);
router.get("/:id", sectionController.getSectionById);
router.post("/", requireRole("admin"), sectionController.createSection);
router.put("/:id", requireRole("admin"), sectionController.updateSection);
router.delete("/:id", requireRole("admin"), sectionController.deleteSection);

module.exports = router;