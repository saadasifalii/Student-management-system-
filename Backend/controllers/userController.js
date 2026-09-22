const db = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// GET /api/users
// Never return password_hash to the client
// GET /api/users
// Optional:
// /api/users?role=student
// /api/users?role=teacher
// /api/users?role=student&available=true
// /api/users?role=teacher&available=true
// GET /api/users
// Optional:
// /api/users?page=1&limit=10
// /api/users?role=student&page=1&limit=10
// /api/users?role=teacher&page=1&limit=10
// /api/users?role=student&available=true&page=1&limit=10
// /api/users?role=teacher&available=true&page=1&limit=10

exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const { role, available } = req.query;

        let rows;
        let countResult;

        // Validate role
        if (
            role &&
            !["admin", "student", "teacher"].includes(role)
        ) {
            return res.status(400).json({
                error: "Invalid role"
            });
        }

        // =====================================================
        // ADMIN → SEE ALL USERS
        // =====================================================
        if (!role && !available) {
            [rows] = await db.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    u.status,
                    u.created_at,
                    u.updated_at
                 FROM users u
                 ORDER BY u.id DESC
                 LIMIT ? OFFSET ?`,
                [safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM users`
            );
        }

        // =====================================================
        // FILTER BY ROLE
        // =====================================================
        else if (role && available !== "true") {
            [rows] = await db.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    u.status,
                    u.created_at,
                    u.updated_at
                 FROM users u
                 WHERE u.role = ?
                 ORDER BY u.id DESC
                 LIMIT ? OFFSET ?`,
                [role, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM users
                 WHERE role = ?`,
                [role]
            );
        }

        // =====================================================
        // AVAILABLE STUDENTS
        // Users with student role who are NOT linked
        // to a student record
        // =====================================================
        else if (role === "student" && available === "true") {
            [rows] = await db.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    u.status,
                    u.created_at,
                    u.updated_at
                 FROM users u
                 LEFT JOIN students s
                    ON s.user_id = u.id
                 WHERE u.role = ?
                 AND s.id IS NULL
                 ORDER BY u.id DESC
                 LIMIT ? OFFSET ?`,
                [role, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM users u
                 LEFT JOIN students s
                    ON s.user_id = u.id
                 WHERE u.role = ?
                 AND s.id IS NULL`,
                [role]
            );
        }

        // =====================================================
        // AVAILABLE TEACHERS
        // Users with teacher role who are NOT linked
        // to a teacher record
        // =====================================================
        else if (role === "teacher" && available === "true") {
            [rows] = await db.query(
                `SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.role,
                    u.status,
                    u.created_at,
                    u.updated_at
                 FROM users u
                 LEFT JOIN teachers t
                    ON t.user_id = u.id
                 WHERE u.role = ?
                 AND t.id IS NULL
                 ORDER BY u.id DESC
                 LIMIT ? OFFSET ?`,
                [role, safeLimit, offset]
            );

            [countResult] = await db.query(
                `SELECT COUNT(*) AS total
                 FROM users u
                 LEFT JOIN teachers t
                    ON t.user_id = u.id
                 WHERE u.role = ?
                 AND t.id IS NULL`,
                [role]
            );
        }

        // =====================================================
        // FALLBACK
        // =====================================================
        else {
            return res.status(400).json({
                error: "Invalid user filter"
            });
        }

        const totalUsers = countResult[0].total;
        const totalPages = Math.ceil(totalUsers / safeLimit);

        res.json({
            users: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalUsers,
                totalPages
            }
        });

    } catch (err) {
        console.error("User get all error:", err);

        res.status(500).json({
            error: "Database error"
        });
    }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("User get by ID error:", err);
        res.status(500).json({ error: "Database error"});
    }
};

// POST /api/users
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "Missing required fields: name, email, password, role" });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await db.query(
            "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)",
            [name, email, password_hash, role, status || "active"]
        );

        res.status(201).json({ id: result.insertId, message: "User created successfully" });
    } catch (err) {
        console.error("User create error:", err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already registered" });
        res.status(500).json({ error: "Database error" });
    }
};

// PUT /api/users/:id
// Updates profile info. Password change is handled separately (see changePassword).
// PUT /api/users/:id
// Updates only the fields that are provided.
// Password change is handled separately (see changePassword).
exports.updateUser = async (req, res) => {
    try {
        const allowedFields = [
            "name",
            "email",
            "role",
            "status"
        ];

        const updates = [];
        const values = [];

        // Only include fields that were actually provided
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

        // Add ID for WHERE condition
        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE users
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        res.json({
            message: "User updated successfully"
        });

    } catch (err) {
        console.error("User update error:",err);

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        res.status(500).json({
            error: "Database error",
           
        });
    }
};

// PUT /api/users/:id/password
exports.changePassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await db.query(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [password_hash, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("User password change error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("User delete error:", err);
        // RESTRICT/CASCADE depends on your FK setup — teachers/students reference users.id
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — user is still linked to a student or teacher record" });
        }
        res.status(500).json({ error: "Database error" });
    }
};