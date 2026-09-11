const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", documentController.getAllDocuments);
router.get("/:id", documentController.getDocumentById);
router.get("/student/:studentId", documentController.getDocumentsByStudent);
router.post("/", requireRole("admin"), documentController.createDocument);
router.put("/:id", requireRole("admin"), documentController.updateDocument);
router.delete("/:id", requireRole("admin"), documentController.deleteDocument);

module.exports = router;