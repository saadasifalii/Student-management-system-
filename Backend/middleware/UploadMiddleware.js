const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = new Set([
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
]);

const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeName = `${crypto.randomUUID()}${extension}`;
        cb(null, safeName);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
        allowedExtensions.has(extension) &&
        allowedMimeTypes.has(file.mimetype)
    ) {
        return cb(null, true);
    }

    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = upload;