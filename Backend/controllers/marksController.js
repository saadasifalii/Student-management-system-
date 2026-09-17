const db = require("../db");

/* ---------- QUIZ MARKS ---------- */

// GET /api/quiz-marks
exports.getAllQuizMarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const [rows] = await db.query(
            `SELECT * FROM quiz_marks
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM quiz_marks"
        );

        const totalQuizMarks = countResult[0].total;
        const totalPages = Math.ceil(totalQuizMarks / safeLimit);

        res.json({
            quizMarks: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalQuizMarks,
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

exports.getQuizMarksByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM quiz_marks WHERE student_id = ?",
            [req.params.studentId]
        );
        res.json(rows);
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

// PUT /api/quiz-marks/:id
exports.updateQuizMark = async (req, res) => {
    try {
        const allowedFields = [
            "total_marks",
            "marks_obtained",
            "quiz_date"
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
            `UPDATE quiz_marks
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Quiz mark not found"
            });
        }

        res.json({
            message: "Quiz mark updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
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

// GET /api/assignment-marks
exports.getAllAssignmentMarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const [rows] = await db.query(
            `SELECT * FROM assignment_marks
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM assignment_marks"
        );

        const totalAssignmentMarks = countResult[0].total;
        const totalPages = Math.ceil(totalAssignmentMarks / safeLimit);

        res.json({
            assignmentMarks: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalAssignmentMarks,
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

exports.getAssignmentMarksByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM assignment_marks WHERE student_id = ?",
            [req.params.studentId]
        );
        res.json(rows);
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

// PUT /api/assignment-marks/:id
exports.updateAssignmentMark = async (req, res) => {
    try {
        const allowedFields = [
            "total_marks",
            "marks_obtained",
            "due_date",
            "submission_date",
            "feedback"
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
            `UPDATE assignment_marks
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Assignment mark not found"
            });
        }

        res.json({
            message: "Assignment mark updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
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

// GET /api/exam-marks
exports.getAllExamMarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const [rows] = await db.query(
            `SELECT * FROM exam_marks
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM exam_marks"
        );

        const totalExamMarks = countResult[0].total;
        const totalPages = Math.ceil(totalExamMarks / safeLimit);

        res.json({
            examMarks: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalExamMarks,
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

exports.getExamMarksByStudent = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM exam_marks WHERE student_id = ?",
            [req.params.studentId]
        );
        res.json(rows);
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

// PUT /api/exam-marks/:id
exports.updateExamMark = async (req, res) => {
    try {
        const allowedFields = [
            "total_marks",
            "marks_obtained",
            "exam_date"
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
            `UPDATE exam_marks
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Exam mark not found"
            });
        }

        res.json({
            message: "Exam mark updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
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