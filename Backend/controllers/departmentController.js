const db = require("../db");

// GET /api/departments
exports.getAllDepartments = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM departments");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/departments/:id
exports.getDepartmentById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM departments WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/departments
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: "Missing required fields: name, code" });
        }

        const [result] = await db.query(
            "INSERT INTO departments (name, code, description) VALUES (?, ?, ?)",
            [name, code, description]
        );

        res.status(201).json({ id: result.insertId, message: "Department created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Department code already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        const [result] = await db.query(
            "UPDATE departments SET name = ?, code = ?, description = ? WHERE id = ?",
            [name, code, description, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Department code already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM departments WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        console.error(err);
        // RESTRICT — blocks delete if degree_programs, teachers, students, or courses still reference it
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete department — still in use by programs, courses, teachers, or students" });
        }
        res.status(500).json({ error: "Database error" });
    }
};