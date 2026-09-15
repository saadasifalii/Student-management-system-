const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields: email, password" });
        }

        // Fetch the user by email — this time we DO need password_hash, just for this one internal check
        const [rows] = await db.query(
            "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            // Deliberately vague — don't reveal whether the email exists or not
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        if (user.status !== "active") {
            return res.status(403).json({ error: "This account is inactive" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Password correct — issue a token proving who this user is
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }  catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
        error: "Unable to login right now. Please try again later."
})};
}