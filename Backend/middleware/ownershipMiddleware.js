const db = require("../db");

// For CREATE (POST) requests — course_offering_id comes from req.body
exports.verifyTeacherOwnsOfferingFromBody = async (req, res, next) => {
    try {
        // Admins bypass ownership checks entirely
        if (req.user.role === "admin") return next();

        if (req.user.role !== "teacher") {
            return res.status(403).json({ error: "Only teachers or admins can perform this action" });
        }

        const { course_offering_id } = req.body;
        if (!course_offering_id) {
            return res.status(400).json({ error: "course_offering_id is required" });
        }

        // Find this logged-in user's teacher record
        const [teacherRows] = await db.query(
            "SELECT id FROM teachers WHERE user_id = ?",
            [req.user.id]
        );
        if (teacherRows.length === 0) {
            return res.status(403).json({ error: "No teacher record linked to this account" });
        }
        const teacherId = teacherRows[0].id;

        // Confirm this teacher actually teaches this course offering
        const [offeringRows] = await db.query(
            "SELECT teacher_id FROM course_offerings WHERE id = ?",
            [course_offering_id]
        );
        if (offeringRows.length === 0) {
            return res.status(400).json({ error: "Invalid course_offering_id" });
        }
        if (offeringRows[0].teacher_id !== teacherId) {
            return res.status(403).json({ error: "You are not assigned to this course offering" });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// For UPDATE/DELETE requests — need to look up the record first to find its course_offering_id
// tableName must be one of: "attendance", "quiz_marks", "assignment_marks", "exam_marks"
exports.verifyTeacherOwnsOfferingFromRecord = (tableName) => {
    return async (req, res, next) => {
        try {
            if (req.user.role === "admin") return next();

            if (req.user.role !== "teacher") {
                return res.status(403).json({ error: "Only teachers or admins can perform this action" });
            }

            const [teacherRows] = await db.query("SELECT id FROM teachers WHERE user_id = ?", [req.user.id]);
            if (teacherRows.length === 0) {
                return res.status(403).json({ error: "No teacher record linked to this account" });
            }
            const teacherId = teacherRows[0].id;

            const [recordRows] = await db.query(
                `SELECT course_offering_id FROM ${tableName} WHERE id = ?`,
                [req.params.id]
            );
            if (recordRows.length === 0) {
                return res.status(404).json({ error: "Record not found" });
            }

            const [offeringRows] = await db.query(
                "SELECT teacher_id FROM course_offerings WHERE id = ?",
                [recordRows[0].course_offering_id]
            );
            if (offeringRows[0].teacher_id !== teacherId) {
                return res.status(403).json({ error: "You are not assigned to this course offering" });
            }

            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Database error", details: err.message });
        }
    };
};