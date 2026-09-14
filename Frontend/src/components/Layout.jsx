import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1">
                <div className="topbar d-flex justify-content-end align-items-center px-4 py-2 bg-white border-bottom">
                    <span className="me-3">{user?.name} ({user?.role})</span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;