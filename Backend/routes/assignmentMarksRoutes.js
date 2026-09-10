const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");

router.get("/", marksController.getAllAssignmentMarks);
router.get("/:id", marksController.getAssignmentMarkById);
router.post("/", marksController.createAssignmentMark);
router.put("/:id", marksController.updateAssignmentMark);
router.delete("/:id", marksController.deleteAssignmentMark);

module.exports = router;