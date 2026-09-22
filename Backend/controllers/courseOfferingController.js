const db = require("../db");

// GET /api/course-offerings
exports.getAllCourseOfferings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        let rows;
        let countResult;

        // ADMIN → see all course offerings
        if (req.user.role === "admin") {
            [rows] = await db.query(
                `SELECT * FROM course_offerings
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`,
                [safeLimit, offset]
            );

            [countResult] = await db.query(
                "SELECT COUNT(*) AS total FROM course_offerings"
            );
        }

        // TEACHER → only their own course offerings
        else if (req.user.role === "teacher") {
            const [teacherRows] = await db.query(
                "SELECT id FROM teachers WHERE user_id = ?",
                [req.user.id]
            );

            if (teacherRows.length === 0) {
                return res.status(403).json({
                    error: "No teacher record linked to this account"
                });
            }

            const teacherId = teacherRows[0].id;

            [rows] = await db.query(
                `SELECT * FROM course_offerings
                 WHERE teacher_id = ?
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`,
                [teacherId, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM course_offerings
                 WHERE teacher_id = ?`,
                [teacherId]
            );
        }

        // STUDENT → only offerings they are actually enrolled in
        else if (req.user.role === "student") {
            const [studentRows] = await db.query(
                "SELECT id FROM students WHERE user_id = ?",
                [req.user.id]
            );

            if (studentRows.length === 0) {
                return res.status(403).json({
                    error: "No student record linked to this account"
                });
            }

            const studentId = studentRows[0].id;

            [rows] = await db.query(
                `SELECT DISTINCT co.*
                 FROM course_offerings co
                 INNER JOIN enrollments e ON e.course_offering_id = co.id
                 WHERE e.student_id = ?
                 ORDER BY co.id DESC
                 LIMIT ? OFFSET ?`,
                [studentId, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(DISTINCT co.id) AS total
                 FROM course_offerings co
                 INNER JOIN enrollments e ON e.course_offering_id = co.id
                 WHERE e.student_id = ?`,
                [studentId]
            );
        }

        else {
            return res.status(403).json({ error: "You do not have permission to view course offerings" });
        }

        const totalCourseOfferings = countResult[0].total;
        const totalPages = Math.ceil(totalCourseOfferings / safeLimit);

        res.json({
            courseOfferings: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalCourseOfferings,
                totalPages
            }
        });

    } catch (err) {
        console.error("Course offering get all error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/course-offerings/:id
exports.getCourseOfferingById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM course_offerings WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Course offering not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Course offering get by ID error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/course-offerings
exports.createCourseOffering = async (req, res) => {
    try {
        const {
            course_id, teacher_id, section_id, semester_id,
            room, schedule
        } = req.body;

        if (!course_id || !teacher_id || !section_id || !semester_id) {
            return res.status(400).json({ error: "Missing required fields: course_id, teacher_id, section_id, semester_id" });
        }

        const [result] = await db.query(
            `INSERT INTO course_offerings
            (course_id, teacher_id, section_id, semester_id, room, schedule)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [course_id, teacher_id, section_id, semester_id, room, schedule]
        );

        res.status(201).json({ id: result.insertId, message: "Course offering created successfully" });
    } catch (err) {
        console.error("Course offering create error:", err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid course_id, teacher_id, section_id, or semester_id" });
        }
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "This course offering already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/course-offerings/:id
exports.updateCourseOffering = async (req, res) => {
    try {
        const allowedFields = ["teacher_id", "room", "schedule"];
        const updates = [];
        const values = [];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields provided for update" });
        }

        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE course_offerings SET ${updates.join(", ")} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course offering not found" });
        }

        res.json({ message: "Course offering updated successfully" });
    } catch (err) {
        console.error("Course offering update error:", err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid teacher_id" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// DELETE /api/course-offerings/:id
exports.deleteCourseOffering = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM course_offerings WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course offering not found" });
        }
        res.json({ message: "Course offering deleted successfully" });
    } catch (err) {
        console.error("Course offering delete error:", err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — students are enrolled in this offering" });
        }
        res.status(500).json({ error: "Database error" });
    }
};