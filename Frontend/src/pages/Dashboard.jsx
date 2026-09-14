import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2>Welcome, {user?.name}</h2>
                <p className="text-muted">Role: {user?.role}</p>
                <p>Dashboard content coming soon.</p>
            </div>
        </div>
    );
}

export default Dashboard;