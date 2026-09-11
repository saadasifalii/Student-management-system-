const express = require("express");
const router = express.Router();
const degreeProgramController = require("../controllers/degreeProgramController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", degreeProgramController.getAllDegreePrograms);
router.get("/:id", degreeProgramController.getDegreeProgramById);
router.post("/", requireRole("admin"), degreeProgramController.createDegreeProgram);
router.put("/:id", requireRole("admin"), degreeProgramController.updateDegreeProgram);
router.delete("/:id", requireRole("admin"), degreeProgramController.deleteDegreeProgram);

module.exports = router;