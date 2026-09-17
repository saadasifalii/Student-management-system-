const db = require("../db");

// GET /api/attendance
exports.getAllAttendance = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get attendance records for current page
        const [rows] = await db.query(
            `SELECT * FROM attendance
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        // Get total attendance records
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM attendance"
        );

        const totalAttendance = countResult[0].total;
        const totalPages = Math.ceil(totalAttendance / safeLimit);

        res.json({
            attendance: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalAttendance,
                totalPages
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
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
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get student's attendance for current page
        const [rows] = await db.query(
            `SELECT * FROM attendance
             WHERE student_id = ?
             ORDER BY attendance_date DESC
             LIMIT ? OFFSET ?`,
            [req.params.studentId, safeLimit, offset]
        );

        // Get total attendance records for this student
        const [countResult] = await db.query(
            `SELECT COUNT(*) AS total
             FROM attendance
             WHERE student_id = ?`,
            [req.params.studentId]
        );

        const totalAttendance = countResult[0].total;
        const totalPages = Math.ceil(totalAttendance / safeLimit);

        res.json({
            attendance: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalAttendance,
                totalPages
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

// GET /api/attendance/student/:studentId/summary
exports.getAttendanceSummaryByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT status, COUNT(*) as count FROM attendance WHERE student_id = ? GROUP BY status",
            [req.params.studentId]
        );

        const summary = { present: 0, absent: 0, late: 0, total: 0 };
        rows.forEach((r) => {
            summary[r.status] = r.count;
            summary.total += r.count;
        });

        const percentage = summary.total > 0
            ? Number(((summary.present / summary.total) * 100).toFixed(1))
            : null;

        res.json({ ...summary, percentage });
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
        const allowedFields = [
            "status",
            "remarks"
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
            `UPDATE attendance
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Attendance record not found"
            });
        }

        res.json({
            message: "Attendance updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
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