const db = require("../db");

// GET /api/courses
exports.getAllCourses = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get courses for current page
        const [rows] = await db.query(
            `SELECT * FROM courses
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        // Get total number of courses
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM courses"
        );

        const totalCourses = countResult[0].total;
        const totalPages = Math.ceil(totalCourses / safeLimit);

        res.json({
            courses: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalCourses,
                totalPages
            }
        });

    } catch (err) {
        console.error("Course get all error:", err);
        res.status(500).json({
            error: "Database error"
        });
    }
};

// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM courses WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Course get by ID error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/courses
exports.createCourse = async (req, res) => {
    try {
        const {
            department_id, course_code, course_name,
            description, credit_hours, semester_number, status
        } = req.body;

        if (!department_id || !course_code || !course_name || !credit_hours) {
            return res.status(400).json({ error: "Missing required fields: department_id, course_code, course_name, credit_hours" });
        }

        const [result] = await db.query(
            `INSERT INTO courses
            (department_id, course_code, course_name, description, credit_hours, semester_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [department_id, course_code, course_name, description, credit_hours, semester_number, status || "active"]
        );

        res.status(201).json({ id: result.insertId, message: "Course created successfully" });
    } catch (err) {
        console.error("Course create error:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Course code already exists" });
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid department_id — department does not exist" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const allowedFields = [
            "course_code",
            "course_name",
            "description",
            "credit_hours",
            "semester_number",
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
            `UPDATE courses
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        res.json({
            message: "Course updated successfully"
        });

    } catch (err) {
        console.error("Course update error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Course code already exists"
            });
        }

        res.status(500).json({
            error: "Database error"
         
        });
    }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM courses WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("Course delete error:", err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — course is used in course offerings" });
        }
        res.status(500).json({ error: "Database error" });
    }
};