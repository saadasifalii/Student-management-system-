const express = require("express");
const router = express.Router();
const degreeProgramController = require("../controllers/degreeProgramController");

router.get("/", degreeProgramController.getAllDegreePrograms);
router.get("/:id", degreeProgramController.getDegreeProgramById);
router.post("/", degreeProgramController.createDegreeProgram);
router.put("/:id", degreeProgramController.updateDegreeProgram);
router.delete("/:id", degreeProgramController.deleteDegreeProgram);

module.exports = router;