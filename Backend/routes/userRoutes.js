const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", requireRole("admin"), userController.getAllUsers);
router.get("/:id", requireRole("admin"), userController.getUserById);
router.post("/", requireRole("admin"), userController.createUser);
router.put("/:id", requireRole("admin"), userController.updateUser);
router.put("/:id/password", requireRole("admin"), userController.changePassword);
router.delete("/:id", requireRole("admin"), userController.deleteUser);

module.exports = router;