const db = require("../db");

// GET /api/students
exports.getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM students");
        res.json(rows);
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

        if (!user_id || !department_id || !degree_program_id || !roll_number || !registration_number || !first_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await db.query(
            `INSERT INTO students
            (user_id, department_id, degree_program_id, roll_number, registration_number,
             first_name, last_name, date_of_birth, gender, phone, address, admission_date, batch_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, department_id, degree_program_id, roll_number, registration_number,
             first_name, last_name, date_of_birth, gender, phone, address, admission_date, batch_year]
        );

        res.status(201).json({ id: result.insertId, message: "Student created successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Roll number or registration number already exists" });
        }
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
    try {
        const {
            first_name, last_name, date_of_birth,
            gender, phone, address, status
        } = req.body;

        const [result] = await db.query(
            `UPDATE students SET
             first_name = ?, last_name = ?, date_of_birth = ?,
             gender = ?, phone = ?, address = ?, status = ?
             WHERE id = ?`,
            [first_name, last_name, date_of_birth, gender, phone, address, status, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
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
