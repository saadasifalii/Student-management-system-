import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Departments from './pages/Departments';
import Semesters from './pages/Semesters';
import DegreePrograms from './pages/DegreePrograms';
import Courses from './pages/Courses';
import Sections from './pages/Sections';
import CourseOfferings from './pages/CourseOfferings';
import Enrollments from './pages/Enrollments';
import AttendanceEntry from './pages/AttendanceEntry';
import MarksEntry from './pages/MarksEntry';
import MyAttendance from './pages/MyAttendance';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                    <Route path="/teachers" element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
                    <Route path="/departments" element={<ProtectedRoute allowedRoles={['admin']}><Departments /></ProtectedRoute>} />
                    <Route path="/semesters" element={<ProtectedRoute allowedRoles={['admin']}><Semesters /></ProtectedRoute>} />
                    <Route path="/degree-programs" element={<ProtectedRoute allowedRoles={['admin']}><DegreePrograms /></ProtectedRoute>} />
                    <Route path="/courses" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><Courses /></ProtectedRoute>} />
                    <Route path="/sections" element={<ProtectedRoute allowedRoles={['admin']}><Sections /></ProtectedRoute>} />
                    <Route path="/course-offerings" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><CourseOfferings /></ProtectedRoute>} />
                    <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['admin']}><Enrollments /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AttendanceEntry /></ProtectedRoute>} />
                    <Route path="/marks" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MarksEntry /></ProtectedRoute>} />
                    <Route path="/my-attendance" element={<ProtectedRoute allowedRoles={['student']}><MyAttendance /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;