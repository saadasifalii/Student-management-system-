const db = require("../db");

// GET /api/sections
exports.getAllSections = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM sections");
        res.json(rows);
    } catch (err) {
        console.error("Section get all error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/sections/:id
exports.getSectionById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM sections WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Section not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Section get by ID error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/sections
exports.createSection = async (req, res) => {
    try {
        const {
            degree_program_id, semester_id, name,
            semester_number, capacity, status
        } = req.body;

        if (!degree_program_id || !semester_id || !name || !semester_number) {
            return res.status(400).json({ error: "Missing required fields: degree_program_id, semester_id, name, semester_number" });
        }

        const [result] = await db.query(
            `INSERT INTO sections
            (degree_program_id, semester_id, name, semester_number, capacity, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [degree_program_id, semester_id, name, semester_number, capacity, status || "active"]
        );

        res.status(201).json({ id: result.insertId, message: "Section created successfully" });
    } catch (err) {
        console.error("Section create error:", err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid degree_program_id or semester_id" });
        }
        res.status(500).json({ error: "Database error"});
    }
};
// PUT /api/sections/:id
exports.updateSection = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "semester_number",
            "capacity",
            "status"
        ];

        const updates = [];
        const values = [];

        // Only update fields that are actually provided
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        // Nothing to update
        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided for update"
            });
        }

        // Add section ID for WHERE condition
        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE sections
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Section not found"
            });
        }

        res.json({
            message: "Section updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error"
          
        });
    }
};

// DELETE /api/sections/:id
exports.deleteSection = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM sections WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Section not found" });
        }
        res.json({ message: "Section deleted successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — section is used in course offerings" });
        }
        console.error("Section delete error:", err);
        res.status(500).json({ error: "Database error"});
    }
};