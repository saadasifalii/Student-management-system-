const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");

router.get("/", marksController.getAllQuizMarks);
router.get("/:id", marksController.getQuizMarkById);
router.post("/", marksController.createQuizMark);
router.put("/:id", marksController.updateQuizMark);
router.delete("/:id", marksController.deleteQuizMark);

module.exports = router;