const db = require("../db");

// GET /api/degree-programs
exports.getAllDegreePrograms = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM degree_programs");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// GET /api/degree-programs/:id
exports.getDegreeProgramById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM degree_programs WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Degree program not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// POST /api/degree-programs
exports.createDegreeProgram = async (req, res) => {
    try {
        const {
            department_id, name, code,
            duration_years, total_semesters, description, status
        } = req.body;

        if (!department_id || !name || !code || !duration_years || !total_semesters) {
            return res.status(400).json({ error: "Missing required fields: department_id, name, code, duration_years, total_semesters" });
        }

        const [result] = await db.query(
            `INSERT INTO degree_programs
            (department_id, name, code, duration_years, total_semesters, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [department_id, name, code, duration_years, total_semesters, description, status || "active"]
        );

        res.status(201).json({ id: result.insertId, message: "Degree program created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Program code already exists" });
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid department_id — department does not exist" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/degree-programs/:id
exports.updateDegreeProgram = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "code",
            "duration_years",
            "total_semesters",
            "description",
            "status"
        ];

        const updates = [];
        const values = [];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided for update"
            });
        }

        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE degree_programs
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Degree program not found"
            });
        }

        res.json({
            message: "Degree program updated successfully"
        });

    } catch (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Program code already exists"
            });
        }

        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

// DELETE /api/degree-programs/:id
exports.deleteDegreeProgram = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM degree_programs WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Degree program not found" });
        }
        res.json({ message: "Degree program deleted successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — still in use by students or sections" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};