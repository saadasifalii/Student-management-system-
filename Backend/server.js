const express = require("express");
const cors = require("cors");
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];
const { verifyToken } = require("./middleware/authMiddleware");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

const departmentRoutes = require("./routes/departmentRoutes");
const semesterRoutes = require("./routes/semesterRoutes");

const degreeProgramRoutes = require("./routes/degreeProgramRoutes");
const courseRoutes = require("./routes/courseRoutes");

const sectionRoutes = require("./routes/sectionRoutes");
const courseOfferingRoutes = require("./routes/courseOfferingRoutes");

const enrollmentRoutes = require("./routes/enrollmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const quizMarksRoutes = require("./routes/quizMarksRoutes");
const assignmentMarksRoutes = require("./routes/assignmentMarksRoutes");
const examMarksRoutes = require("./routes/examMarksRoutes");

const documentRoutes = require("./routes/documentRoutes");
const semesterResultRoutes = require("./routes/semesterResultRoutes");
const cgpaRoutes = require("./routes/cgpaRoutes");

const userRoutes = require("./routes/userRoutes");

const authRoutes = require("./routes/authRoutes");

const path = require("path");


const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Student Management System Backend is running!");
});
app.use("/api/auth", authRoutes);

console.log("AUTH ROUTE LOADED");

app.use(verifyToken);

app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/degree-programs", degreeProgramRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/course-offerings", courseOfferingRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/quiz-marks", quizMarksRoutes);
app.use("/api/assignment-marks", assignmentMarksRoutes);
app.use("/api/exam-marks", examMarksRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/semester-results", semesterResultRoutes);
app.use("/api/cgpa", cgpaRoutes);

// ...
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});