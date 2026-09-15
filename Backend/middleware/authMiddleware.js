const jwt = require("jsonwebtoken");

// Checks that a valid token was sent with the request.
// If valid, attaches the decoded user info to req.user so later code can use it.
exports.verifyToken = (req, res, next) => {
  

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>" → just the token part

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, email } — whatever we put in it during login
        next(); // token is valid — let the request continue to the actual route
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};