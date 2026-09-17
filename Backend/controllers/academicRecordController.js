const db = require("../db");

/* ---------- SEMESTER RESULTS ---------- */

// GET /api/semester-results
exports.getAllSemesterResults = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get semester results for current page
        const [rows] = await db.query(
            `SELECT * FROM student_semester_results
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        // Get total number of results
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM student_semester_results"
        );

        const totalSemesterResults = countResult[0].total;
        const totalPages = Math.ceil(totalSemesterResults / safeLimit);

        res.json({
            semesterResults: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalSemesterResults,
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

exports.getSemesterResultById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_semester_results WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Semester result not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// GET /api/semester-results/student/:studentId
exports.getSemesterResultsByStudent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const [rows] = await db.query(
            `SELECT * FROM student_semester_results
             WHERE student_id = ?
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [req.params.studentId, safeLimit, offset]
        );

        const [countResult] = await db.query(
            `SELECT COUNT(*) AS total
             FROM student_semester_results
             WHERE student_id = ?`,
            [req.params.studentId]
        );

        const totalSemesterResults = countResult[0].total;
        const totalPages = Math.ceil(totalSemesterResults / safeLimit);

        res.json({
            semesterResults: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalSemesterResults,
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

exports.createSemesterResult = async (req, res) => {
    try {
        const { student_id, semester_id, total_credit_hours, total_quality_points, semester_gpa, academic_status } = req.body;

        if (!student_id || !semester_id || total_credit_hours == null || total_quality_points == null || semester_gpa == null) {
            return res.status(400).json({ error: "Missing required fields: student_id, semester_id, total_credit_hours, total_quality_points, semester_gpa" });
        }

        const [result] = await db.query(
            `INSERT INTO student_semester_results
            (student_id, semester_id, total_credit_hours, total_quality_points, semester_gpa, academic_status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, semester_id, total_credit_hours, total_quality_points, semester_gpa, academic_status || "good"]
        );

        res.status(201).json({ id: result.insertId, message: "Semester result recorded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A result already exists for this student and semester" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id or semester_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.updateSemesterResult = async (req, res) => {
    try {
        const allowedFields = [
            "total_credit_hours",
            "total_quality_points",
            "semester_gpa",
            "academic_status"
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
            `UPDATE student_semester_results
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Semester result not found"
            });
        }

        res.json({
            message: "Semester result updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

exports.deleteSemesterResult = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM student_semester_results WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Semester result not found" });
        res.json({ message: "Semester result deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

/* ---------- CGPA ---------- */

exports.getAllCgpa = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_cgpa");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// One CGPA row per student (student_id is UNIQUE), so this doubles as "get by student"
exports.getCgpaByStudent = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_cgpa WHERE student_id = ?", [req.params.studentId]);
        if (rows.length === 0) return res.status(404).json({ error: "CGPA record not found for this student" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.createOrUpdateCgpa = async (req, res) => {
    try {
        const { student_id, total_credit_hours, total_quality_points, cgpa } = req.body;

        if (!student_id || total_credit_hours == null || total_quality_points == null || cgpa == null) {
            return res.status(400).json({ error: "Missing required fields: student_id, total_credit_hours, total_quality_points, cgpa" });
        }

        // Since student_id is UNIQUE, use "insert, or update if it already exists"
        const [result] = await db.query(
            `INSERT INTO student_cgpa (student_id, total_credit_hours, total_quality_points, cgpa)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                total_credit_hours = VALUES(total_credit_hours),
                total_quality_points = VALUES(total_quality_points),
                cgpa = VALUES(cgpa)`,
            [student_id, total_credit_hours, total_quality_points, cgpa]
        );

        res.status(200).json({ message: "CGPA saved successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.deleteCgpa = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM student_cgpa WHERE student_id = ?", [req.params.studentId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "CGPA record not found" });
        res.json({ message: "CGPA record deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};