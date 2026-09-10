const db = require("../db");

// GET /api/courses
exports.getAllCourses = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM courses");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Course code already exists" });
        }
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid department_id — department does not exist" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
    try {
        const {
            course_code, course_name, description,
            credit_hours, semester_number, status
        } = req.body;

        const [result] = await db.query(
            `UPDATE courses SET
             course_code = ?, course_name = ?, description = ?,
             credit_hours = ?, semester_number = ?, status = ?
             WHERE id = ?`,
            [course_code, course_name, description, credit_hours, semester_number, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json({ message: "Course updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Course code already exists" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — course is used in course offerings" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};