const db = require("../db");

/* ---------- SEMESTER RESULTS ---------- */

exports.getAllSemesterResults = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_semester_results");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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

exports.getSemesterResultsByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM student_semester_results WHERE student_id = ?",
            [req.params.studentId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        const { total_credit_hours, total_quality_points, semester_gpa, academic_status } = req.body;

        const [result] = await db.query(
            `UPDATE student_semester_results
             SET total_credit_hours = ?, total_quality_points = ?, semester_gpa = ?, academic_status = ?
             WHERE id = ?`,
            [total_credit_hours, total_quality_points, semester_gpa, academic_status, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "Semester result not found" });
        res.json({ message: "Semester result updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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