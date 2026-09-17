const db = require("../db");

// GET /api/documents
exports.getAllDocuments = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Prevent invalid values
        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        // Get documents for current page
        const [rows] = await db.query(
            `SELECT * FROM student_documents
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [safeLimit, offset]
        );

        // Get total documents
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS total FROM student_documents"
        );

        const totalDocuments = countResult[0].total;
        const totalPages = Math.ceil(totalDocuments / safeLimit);

        res.json({
            documents: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalDocuments,
                totalPages
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

// GET /api/documents/:id
exports.getDocumentById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_documents WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Document not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// GET /api/documents/student/:studentId
exports.getDocumentsByStudent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const safePage = page < 1 ? 1 : page;
        const safeLimit = limit < 1 ? 10 : Math.min(limit, 100);

        const offset = (safePage - 1) * safeLimit;

        const [rows] = await db.query(
            `SELECT * FROM student_documents
             WHERE student_id = ?
             ORDER BY uploaded_at DESC
             LIMIT ? OFFSET ?`,
            [req.params.studentId, safeLimit, offset]
        );

        const [countResult] = await db.query(
            `SELECT COUNT(*) AS total
             FROM student_documents
             WHERE student_id = ?`,
            [req.params.studentId]
        );

        const totalDocuments = countResult[0].total;
        const totalPages = Math.ceil(totalDocuments / safeLimit);

        res.json({
            documents: rows,
            pagination: {
                currentPage: safePage,
                limit: safeLimit,
                totalDocuments,
                totalPages
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

// POST /api/documents
exports.createDocument = async (req, res) => {
    try {
        const { document_type, document_name } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        if (!document_type || !document_name) {
            return res.status(400).json({ error: "Missing required fields: document_type, document_name" });
        }

        // A student can only ever upload for THEIR OWN student record — never for someone else
        let student_id;
        if (req.user.role === "student") {
            const [studentRows] = await db.query("SELECT id FROM students WHERE user_id = ?", [req.user.id]);
            if (studentRows.length === 0) {
                return res.status(403).json({ error: "No student record linked to this account" });
            }
            student_id = studentRows[0].id;
        } else {
            // Admin can upload on behalf of any student, using the id they provide
            student_id = req.body.student_id;
            if (!student_id) {
                return res.status(400).json({ error: "student_id is required" });
            }
        }

        const file_url = `/uploads/${req.file.filename}`;
        const file_type = req.file.mimetype;
        const file_size = req.file.size;

        const [result] = await db.query(
            `INSERT INTO student_documents (student_id, document_type, document_name, file_url, file_type, file_size, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [student_id, document_type, document_name, file_url, file_type, file_size, "pending"]
        );

        res.status(201).json({ id: result.insertId, message: "Document uploaded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/documents/:id
// Update only the fields provided in the request
exports.updateDocument = async (req, res) => {
    try {
        const allowedFields = [
            "document_type",
            "document_name",
            "status",
            "remarks"
        ];

        const updates = [];
        const values = [];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({
                error: "No fields provided for update"
            });
        }

        values.push(req.params.id);

        const [result] = await db.query(
            `UPDATE student_documents
             SET ${updates.join(", ")}
             WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Document not found"
            });
        }

        res.json({
            message: "Document updated successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Database error",
            details: err.message
        });
    }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM student_documents WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });
        res.json({ message: "Document deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};