const db = require("../db");

// GET /api/students
exports.getAllStudents = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get students for current page
        const [rows] = await db.query(
            "SELECT * FROM students ORDER BY id DESC LIMIT ? OFFSET ?",
            [safeLimit, offset]
        );

        // Get total number of students
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM students"
        );

        const totalStudents = countResult[0].total;
        const totalPages = Math.ceil(totalStudents / safeLimit);

        res.json({
            students: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalStudents,
                totalPages
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// GET /api/students/:id
exports.getStudentById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};

// POST /api/students
exports.createStudent = async (req, res) => {
    try {
        const {
            user_id, department_id, degree_program_id,
            roll_number, registration_number,
            first_name, last_name, date_of_birth,
            gender, phone, address, admission_date, batch_year
        } = req.body;

        if (!user_id || !department_id || !degree_program_id ||
            !roll_number || !registration_number || !first_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await db.query(
            `INSERT INTO students 
            (user_id, department_id, degree_program_id, roll_number, registration_number, 
             first_name, last_name, date_of_birth, gender, phone, address, admission_date, batch_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, department_id, degree_program_id,
                roll_number, registration_number,
                first_name, last_name, date_of_birth,
                gender, phone, address, admission_date, batch_year
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Student created successfully"
        });

    } catch (err) {
        console.error(err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Roll number or registration number already exists"
            });
        }

        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
    try {
        const allowedFields = [
            "first_name",
            "last_name",
            "date_of_birth",
            "gender",
            "phone",
            "address",
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

        // Nothing was provided to update
        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided for update"
            });
        }

        // Add student ID for WHERE condition
        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE students
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error"
        });
    }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({ message: "Student deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
};