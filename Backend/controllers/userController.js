const db = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

// GET /api/users
// Never return password_hash to the client
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, email, role, status, created_at, updated_at FROM users");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already registered" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/users/:id
// Updates profile info. Password change is handled separately (see changePassword).
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, status } = req.body;

        const [result] = await db.query(
            "UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?",
            [name, email, role, status, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already registered" });
        res.status(500).json({ error: "Database error", details: err.message });
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
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        // RESTRICT/CASCADE depends on your FK setup — teachers/students reference users.id
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({ error: "Cannot delete — user is still linked to a student or teacher record" });
        }
        res.status(500).json({ error: "Database error", details: err.message });
    }
};