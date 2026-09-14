import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();

    return (
        <Layout>
            <h2>Welcome, {user?.name}</h2>
            <p className="text-muted">Role: {user?.role}</p>
            <p>Dashboard content coming soon.</p>
        </Layout>
    );
}

export default Dashboard;