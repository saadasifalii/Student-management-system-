const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");

router.get("/", marksController.getAllExamMarks);
router.get("/:id", marksController.getExamMarkById);
router.post("/", marksController.createExamMark);
router.put("/:id", marksController.updateExamMark);
router.delete("/:id", marksController.deleteExamMark);

module.exports = router;