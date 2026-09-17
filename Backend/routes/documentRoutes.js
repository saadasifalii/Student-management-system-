const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { requireRole } = require("../middleware/roleMiddleware");
const { verifyStudentOwnsDataOrStaff } = require("../middleware/ownershipMiddleware");
const upload = require("../middleware/UploadMiddleware");

router.get("/", requireRole("admin", "teacher"), documentController.getAllDocuments);
router.get("/:id", requireRole("admin", "teacher"), documentController.getDocumentById);
router.get("/student/:studentId", verifyStudentOwnsDataOrStaff, documentController.getDocumentsByStudent);
router.post("/", requireRole("admin", "student"), upload.single("file"), documentController.createDocument);
router.put("/:id", requireRole("admin"), documentController.updateDocument);
router.delete("/:id", requireRole("admin"), documentController.deleteDocument);

module.exports = router;