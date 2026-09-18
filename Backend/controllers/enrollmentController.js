const db = require("../db");

// GET /api/enrollments
exports.getAllEnrollments = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get enrollments for current page
        const [rows] = await db.query(
            "SELECT * FROM enrollments ORDER BY id DESC LIMIT ? OFFSET ?",
            [safeLimit, offset]
        );

        // Get total enrollments
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM enrollments"
        );

        const totalEnrollments = countResult[0].total;
        const totalPages = Math.ceil(totalEnrollments / safeLimit);

        res.json({
            enrollments: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalEnrollments,
                totalPages
            }
        });

    } catch (err) {
        console.error("Enrollment get all error:", err);
        res.status(500).json({
            error: "Database error"
        });
    }
};

// GET /api/enrollments/:id
exports.getEnrollmentById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM enrollments WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Enrollment not found"
            });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("Enrollment get by ID error:", err);
        res.status(500).json({
            error: "Database error"
          
        });
    }
};

// POST /api/enrollments
exports.createEnrollment = async (req, res) => {
    try {
        const {
            student_id,
            course_offering_id,
            enrollment_date,
            status
        } = req.body;

        if (!student_id || !course_offering_id) {
            return res.status(400).json({
                error: "Missing required fields: student_id, course_offering_id"
            });
        }

        const [result] = await db.query(
            `INSERT INTO enrollments 
            (student_id, course_offering_id, enrollment_date, status)
            VALUES (?, ?, ?, ?)`,
            [
                student_id,
                course_offering_id,
                enrollment_date || new Date(),
                status || "enrolled"
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Enrollment created successfully"
        });

    } catch (err) {
        console.error("Enrollment create error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Student is already enrolled in this course offering"
            });
        }

        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                error: "Invalid student_id or course_offering_id"
            });
        }

        res.status(500).json({
            error: "Database error"
         
        });
    }
};

// PUT /api/enrollments/:id
exports.updateEnrollment = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "Missing required field: status"
            });
        }

        const [result] = await db.query(
            "UPDATE enrollments SET status = ? WHERE id = ?",
            [status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Enrollment not found"
            });
        }

        res.json({
            message: "Enrollment updated successfully"
        });

    } catch (err) {
        console.error("Enrollment update error:", err);
        res.status(500).json({
            error: "Database error"
        });
    }
};

// DELETE /api/enrollments/:id
exports.deleteEnrollment = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM enrollments WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Enrollment not found"
            });
        }

        res.json({
            message: "Enrollment deleted successfully"
        });

    } catch (err) {
        console.error("Enrollment delete error:", err);
        res.status(500).json({
            error: "Database error"
        });
    }
};