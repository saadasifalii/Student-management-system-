const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.post("/", requireRole("admin"), departmentController.createDepartment);
router.put("/:id", requireRole("admin"), departmentController.updateDepartment);
router.delete("/:id", requireRole("admin"), departmentController.deleteDepartment);

module.exports = router;