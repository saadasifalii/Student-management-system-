const db = require("../db");

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM teachers");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/teachers/:id
exports.getTeacherById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM teachers WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/teachers
exports.createTeacher = async (req, res) => {
    try {
        const {
            user_id, department_id, employee_id,
            first_name, last_name, designation,
            phone, joining_date
        } = req.body;

        if (!user_id || !department_id || !employee_id || !first_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await db.query(
            `INSERT INTO teachers
            (user_id, department_id, employee_id, first_name, last_name, designation, phone, joining_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, department_id, employee_id, first_name, last_name, designation, phone, joining_date]
        );

        res.status(201).json({ id: result.insertId, message: "Teacher created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Employee ID or user already linked to a teacher" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
    try {
        const {
            first_name, last_name, designation,
            phone, joining_date, status
        } = req.body;

        const [result] = await db.query(
            `UPDATE teachers SET
             first_name = ?, last_name = ?, designation = ?,
             phone = ?, joining_date = ?, status = ?
             WHERE id = ?`,
            [first_name, last_name, designation, phone, joining_date, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json({ message: "Teacher updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM teachers WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }
        res.json({ message: "Teacher deleted successfully" });
    } catch (err) {
        console.error(err);
        // A teacher can't be deleted if they still have course_offerings pointing at them
        // (ON DELETE RESTRICT in your schema)
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete teacher — still assigned to course offerings" });
        }
        res.status(500).json({ error: "Database error" });
    }
};