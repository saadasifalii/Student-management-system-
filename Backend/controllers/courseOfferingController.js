const db = require("../db");

// GET /api/course-offerings
exports.getAllCourseOfferings = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM course_offerings");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid course_id, teacher_id, section_id, or semester_id" });
        }
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "This course offering already exists" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/course-offerings/:id
exports.updateCourseOffering = async (req, res) => {
    try {
        const { teacher_id, room, schedule } = req.body;

        const [result] = await db.query(
            `UPDATE course_offerings SET teacher_id = ?, room = ?, schedule = ? WHERE id = ?`,
            [teacher_id, room, schedule, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Course offering not found" });
        }
        res.json({ message: "Course offering updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "Invalid teacher_id" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — students are enrolled in this offering" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};