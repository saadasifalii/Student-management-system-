import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-dark bg-dark px-3">
            <span className="navbar-brand mb-0 h1">Student Management System</span>
            <div className="d-flex align-items-center">
                <Link to="/dashboard" className="text-light me-3 text-decoration-none">Dashboard</Link>
                <Link to="/students" className="text-light me-3 text-decoration-none">Students</Link>
                <span className="me-3 text-light">{user?.name} ({user?.role})</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;