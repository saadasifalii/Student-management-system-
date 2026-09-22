const db = require("../db");

// GET /api/students
// GET /api/students
exports.getAllStudents = async (req, res) => {
    try {
        // Students must use their own-data endpoints instead
        if (req.user.role === "student") {
            return res.status(403).json({
                error: "Students cannot access all students"
            });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        let rows;
        let countResult;

        // ADMIN → all students
        if (req.user.role === "admin") {

            [rows] = await db.query(
                `SELECT * FROM students
                 ORDER BY id DESC
                 LIMIT ? OFFSET ?`,
                [safeLimit, offset]
            );

            [countResult] = await db.query(
                "SELECT COUNT(*) AS total FROM students"
            );
        }

        // TEACHER → only students enrolled in teacher's offerings
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
                `SELECT DISTINCT s.*
                 FROM students s
                 INNER JOIN enrollments e
                     ON e.student_id = s.id
                 INNER JOIN course_offerings co
                     ON co.id = e.course_offering_id
                 WHERE co.teacher_id = ?
                 ORDER BY s.id DESC
                 LIMIT ? OFFSET ?`,
                [teacherId, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(DISTINCT s.id) AS total
                 FROM students s
                 INNER JOIN enrollments e
                     ON e.student_id = s.id
                 INNER JOIN course_offerings co
                     ON co.id = e.course_offering_id
                 WHERE co.teacher_id = ?`,
                [teacherId]
            );
        }

        else {
            return res.status(403).json({
                error: "You do not have permission to view students"
            });
        }

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
        console.error("Student get all error:", err);

        res.status(500).json({
            error: "Database error"
        });
    }
};
// GET /api/students/me
exports.getMyStudentProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM students WHERE user_id = ?",
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: "Student profile not found"
            });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("Get my student profile error:", err);
        res.status(500).json({
            error: "Database error"
        });
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
        console.error("Student get by ID error:", err);
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
        console.error("Student create error:", err);

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
        console.error("Student update error:", err);
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
        console.error("Student delete error:", err);
        res.status(500).json({ error: "Database error" });
    }
};