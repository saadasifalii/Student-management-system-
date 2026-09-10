const db = require("../db");

// GET /api/semesters
exports.getAllSemesters = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM semesters");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/semesters/:id
exports.getSemesterById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM semesters WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Semester not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/semesters
exports.createSemester = async (req, res) => {
    try {
        const { name, term, year, start_date, end_date, status } = req.body;

        if (!name || !term || !year || !start_date || !end_date) {
            return res.status(400).json({ error: "Missing required fields: name, term, year, start_date, end_date" });
        }

        const [result] = await db.query(
            `INSERT INTO semesters (name, term, year, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, term, year, start_date, end_date, status || "upcoming"]
        );

        res.status(201).json({ id: result.insertId, message: "Semester created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "A semester with this term and year already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/semesters/:id
exports.updateSemester = async (req, res) => {
    try {
        const { name, term, year, start_date, end_date, status } = req.body;

        const [result] = await db.query(
            `UPDATE semesters SET
             name = ?, term = ?, year = ?, start_date = ?, end_date = ?, status = ?
             WHERE id = ?`,
            [name, term, year, start_date, end_date, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Semester not found" });
        }
        res.json({ message: "Semester updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "A semester with this term and year already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// DELETE /api/semesters/:id
exports.deleteSemester = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM semesters WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Semester not found" });
        }
        res.json({ message: "Semester deleted successfully" });
    } catch (err) {
        console.error(err);
        // RESTRICT — blocks delete if sections, course_offerings, or student_semester_results reference it
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete semester — still in use by sections, offerings, or results" });
        }
        res.status(500).json({ error: "Database error" });
    }
};