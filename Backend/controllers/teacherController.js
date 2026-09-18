const db = require("../db");

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get teachers for current page
        const [rows] = await db.query(
            "SELECT * FROM teachers ORDER BY id DESC LIMIT ? OFFSET ?",
            [safeLimit, offset]
        );

        // Get total teachers
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM teachers"
        );

        const totalTeachers = countResult[0].total;
        const totalPages = Math.ceil(totalTeachers / safeLimit);

        res.json({
            teachers: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalTeachers,
                totalPages
            }
        });

    } catch (err) {
        console.error("Teacher get all error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/teachers/:id
exports.getTeacherById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM teachers WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("Teacher get by ID error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/teachers
exports.createTeacher = async (req, res) => {
    try {
        const {
            user_id, department_id, employee_id,
            first_name, last_name, designation,
            phone, joining_date
        } = req.body;

        if (!user_id || !department_id || !employee_id || !first_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await db.query(
            `INSERT INTO teachers
            (user_id, department_id, employee_id, first_name, last_name, designation, phone, joining_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, department_id, employee_id,
                first_name, last_name, designation,
                phone, joining_date
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Teacher created successfully"
        });

    } catch (err) {
        console.error("Teacher create error:", err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Employee ID or user already linked to a teacher"
            });
        }

        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
    try {
        const allowedFields = [
            "first_name",
            "last_name",
            "designation",
            "phone",
            "joining_date",
            "status"
        ];

        const updates = [];
        const values = [];

        // Only update fields that are actually provided
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        // Nothing to update
        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided for update"
            });
        }

        // Add teacher ID for WHERE condition
        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE teachers
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Teacher not found"
            });
        }

        res.json({
            message: "Teacher updated successfully"
        });

    } catch (err) {
        console.error("Teacher update error:", err);
        res.status(500).json({
            error: "Database error"
        });
    }
};
// DELETE /api/teachers/:id
exports.deleteTeacher = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM teachers WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        res.json({ message: "Teacher deleted successfully" });

    } catch (err) {
        console.error("Teacher delete error:", err);

        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                error: "Cannot delete teacher — still assigned to course offerings"
            });
        }

        res.status(500).json({ error: "Database error" });
    }
};