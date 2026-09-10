const db = require("../db");

// GET /api/attendance
exports.getAllAttendance = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM attendance");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// GET /api/attendance/:id
exports.getAttendanceById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM attendance WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Attendance record not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// GET /api/attendance/student/:studentId
exports.getAttendanceByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM attendance WHERE student_id = ? ORDER BY attendance_date",
            [req.params.studentId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// POST /api/attendance
exports.createAttendance = async (req, res) => {
    try {
        const { student_id, course_offering_id, attendance_date, status, remarks } = req.body;

        if (!student_id || !course_offering_id || !attendance_date || !status) {
            return res.status(400).json({ error: "Missing required fields: student_id, course_offering_id, attendance_date, status" });
        }

        const [result] = await db.query(
            `INSERT INTO attendance (student_id, course_offering_id, attendance_date, status, remarks)
             VALUES (?, ?, ?, ?, ?)`,
            [student_id, course_offering_id, attendance_date, status, remarks]
        );

        res.status(201).json({ id: result.insertId, message: "Attendance recorded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Attendance already recorded for this student/offering on this date" });
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid student_id or course_offering_id" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/attendance/:id
exports.updateAttendance = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const [result] = await db.query(
            "UPDATE attendance SET status = ?, remarks = ? WHERE id = ?",
            [status, remarks, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Attendance record not found" });
        }
        res.json({ message: "Attendance updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// DELETE /api/attendance/:id
exports.deleteAttendance = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM attendance WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Attendance record not found" });
        }
        res.json({ message: "Attendance deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};