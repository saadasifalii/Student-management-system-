const db = require("../db");

/* ---------- QUIZ MARKS ---------- */

exports.getAllQuizMarks = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM quiz_marks");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.getQuizMarkById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM quiz_marks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Quiz mark not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.createQuizMark = async (req, res) => {
    try {
        const { student_id, course_offering_id, quiz_number, total_marks, marks_obtained, quiz_date } = req.body;

        if (!student_id || !course_offering_id || !quiz_number || total_marks == null || marks_obtained == null) {
            return res.status(400).json({ error: "Missing required fields: student_id, course_offering_id, quiz_number, total_marks, marks_obtained" });
        }
        if (marks_obtained > total_marks) {
            return res.status(400).json({ error: "marks_obtained cannot exceed total_marks" });
        }

        const [result] = await db.query(
            `INSERT INTO quiz_marks (student_id, course_offering_id, quiz_number, total_marks, marks_obtained, quiz_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, course_offering_id, quiz_number, total_marks, marks_obtained, quiz_date]
        );
        res.status(201).json({ id: result.insertId, message: "Quiz mark recorded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "This quiz number already has marks recorded for this enrollment" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id or course_offering_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.updateQuizMark = async (req, res) => {
    try {
        const { total_marks, marks_obtained, quiz_date } = req.body;
        const [result] = await db.query(
            "UPDATE quiz_marks SET total_marks = ?, marks_obtained = ?, quiz_date = ? WHERE id = ?",
            [total_marks, marks_obtained, quiz_date, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Quiz mark not found" });
        res.json({ message: "Quiz mark updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.deleteQuizMark = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM quiz_marks WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Quiz mark not found" });
        res.json({ message: "Quiz mark deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

/* ---------- ASSIGNMENT MARKS ---------- */

exports.getAllAssignmentMarks = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM assignment_marks");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.getAssignmentMarkById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM assignment_marks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Assignment mark not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.createAssignmentMark = async (req, res) => {
    try {
        const { student_id, course_offering_id, assignment_number, total_marks, marks_obtained, due_date, submission_date, feedback } = req.body;

        if (!student_id || !course_offering_id || !assignment_number || total_marks == null || marks_obtained == null) {
            return res.status(400).json({ error: "Missing required fields: student_id, course_offering_id, assignment_number, total_marks, marks_obtained" });
        }
        if (marks_obtained > total_marks) {
            return res.status(400).json({ error: "marks_obtained cannot exceed total_marks" });
        }

        const [result] = await db.query(
            `INSERT INTO assignment_marks
            (student_id, course_offering_id, assignment_number, total_marks, marks_obtained, due_date, submission_date, feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, course_offering_id, assignment_number, total_marks, marks_obtained, due_date, submission_date, feedback]
        );
        res.status(201).json({ id: result.insertId, message: "Assignment mark recorded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "This assignment number already has marks recorded for this enrollment" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id or course_offering_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.updateAssignmentMark = async (req, res) => {
    try {
        const { total_marks, marks_obtained, due_date, submission_date, feedback } = req.body;
        const [result] = await db.query(
            `UPDATE assignment_marks SET total_marks = ?, marks_obtained = ?, due_date = ?, submission_date = ?, feedback = ? WHERE id = ?`,
            [total_marks, marks_obtained, due_date, submission_date, feedback, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Assignment mark not found" });
        res.json({ message: "Assignment mark updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.deleteAssignmentMark = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM assignment_marks WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Assignment mark not found" });
        res.json({ message: "Assignment mark deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

/* ---------- EXAM MARKS ---------- */

exports.getAllExamMarks = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM exam_marks");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.getExamMarkById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM exam_marks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Exam mark not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.createExamMark = async (req, res) => {
    try {
        const { student_id, course_offering_id, exam_type, total_marks, marks_obtained, exam_date } = req.body;

        if (!student_id || !course_offering_id || !exam_type || total_marks == null || marks_obtained == null) {
            return res.status(400).json({ error: "Missing required fields: student_id, course_offering_id, exam_type, total_marks, marks_obtained" });
        }
        if (marks_obtained > total_marks) {
            return res.status(400).json({ error: "marks_obtained cannot exceed total_marks" });
        }

        const [result] = await db.query(
            `INSERT INTO exam_marks (student_id, course_offering_id, exam_type, total_marks, marks_obtained, exam_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, course_offering_id, exam_type, total_marks, marks_obtained, exam_date]
        );
        res.status(201).json({ id: result.insertId, message: "Exam mark recorded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "This exam type already has marks recorded for this enrollment" });
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id or course_offering_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.updateExamMark = async (req, res) => {
    try {
        const { total_marks, marks_obtained, exam_date } = req.body;
        const [result] = await db.query(
            "UPDATE exam_marks SET total_marks = ?, marks_obtained = ?, exam_date = ? WHERE id = ?",
            [total_marks, marks_obtained, exam_date, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Exam mark not found" });
        res.json({ message: "Exam mark updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

exports.deleteExamMark = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM exam_marks WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Exam mark not found" });
        res.json({ message: "Exam mark deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};