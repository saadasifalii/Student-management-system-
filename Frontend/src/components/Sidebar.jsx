import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher', 'student'] },
    { label: 'Students', path: '/students', roles: ['admin', 'teacher'] },
    { label: 'Teachers', path: '/teachers', roles: ['admin'] },
    { label: 'Departments', path: '/departments', roles: ['admin'] },
    { label: 'Semesters', path: '/semesters', roles: ['admin'] },
    { label: 'Degree Programs', path: '/degree-programs', roles: ['admin'] },
    { label: 'Courses', path: '/courses', roles: ['admin', 'teacher'] },
    { label: 'Sections', path: '/sections', roles: ['admin'] },
    { label: 'Course Offerings', path: '/course-offerings', roles: ['admin', 'teacher'] },
    { label: 'Enrollments', path: '/enrollments', roles: ['admin'] },
    { label: 'Attendance', path: '/attendance', roles: ['admin', 'teacher'] },
    { label: 'Marks', path: '/marks', roles: ['admin', 'teacher'] },
    { label: 'Documents', path: '/documents', roles: ['admin', 'student'] },
    { label: 'Semester Results', path: '/semester-results', roles: ['admin', 'teacher'] },
    { label: 'CGPA', path: '/cgpa', roles: ['admin', 'teacher'] },
    { label: 'Users', path: '/users', roles: ['admin'] },
    { label: 'My Grades', path: '/my-grades', roles: ['student'] },
    { label: 'My Attendance', path: '/my-attendance', roles: ['student'] },
];

function Sidebar() {
    const { user } = useAuth();
    const location = useLocation();

    const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role));

    return (
        <div className="sidebar bg-dark text-light">
            <div className="sidebar-header p-3 border-bottom border-secondary">
                <h5 className="mb-0">SMS</h5>
                <small className="text-muted">Student Management</small>
            </div>
            <ul className="nav flex-column p-2">
                {visibleItems.map((item) => (
                    <li className="nav-item" key={item.path}>
                        <Link
                            to={item.path}
                            className={`nav-link sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;