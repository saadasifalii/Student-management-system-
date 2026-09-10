const db = require("../db");

// GET /api/documents
exports.getAllDocuments = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM student_documents");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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
        const [rows] = await db.query(
            "SELECT * FROM student_documents WHERE student_id = ? ORDER BY uploaded_at DESC",
            [req.params.studentId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// POST /api/documents
exports.createDocument = async (req, res) => {
    try {
        const { student_id, document_type, document_name, file_url, file_type, file_size, status, remarks } = req.body;

        if (!student_id || !document_type || !document_name || !file_url) {
            return res.status(400).json({ error: "Missing required fields: student_id, document_type, document_name, file_url" });
        }

        const [result] = await db.query(
            `INSERT INTO student_documents
            (student_id, document_type, document_name, file_url, file_type, file_size, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, document_type, document_name, file_url, file_type, file_size, status || "pending", remarks]
        );

        res.status(201).json({ id: result.insertId, message: "Document uploaded successfully" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({ error: "Invalid student_id" });
        res.status(500).json({ error: "Database error", details: err.message });
    }
};

// PUT /api/documents/:id
// Typically used to approve/reject a document, or update its metadata
exports.updateDocument = async (req, res) => {
    try {
        const { document_type, document_name, status, remarks } = req.body;

        const [result] = await db.query(
            `UPDATE student_documents SET document_type = ?, document_name = ?, status = ?, remarks = ? WHERE id = ?`,
            [document_type, document_name, status, remarks, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });
        res.json({ message: "Document updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error", details: err.message });
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