import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import UserForm from './UserForm';
import ResetPasswordForm from './ResetPasswordForm';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [resettingUser, setResettingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
    }, []);

    const handleAddClick = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEditClick = (userRecord) => {
        setEditingUser(userRecord);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchUsers();
    };

    const handlePasswordReset = () => {
        setResettingUser(null);
        alert('Password reset successfully.');
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Users</h2>
                <button className="btn btn-primary" onClick={handleAddClick}>
                    + Add User
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="badge bg-info text-dark">{u.role}</span>
                                </td>
                                <td>
                                    <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(u)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => setResettingUser(u)}>
                                        Reset Password
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {users.length === 0 && !loading && !error && (
                <p className="text-muted">No users found.</p>
            )}

            {showForm && (
                <UserForm
                    userRecord={editingUser}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}

            {resettingUser && (
                <ResetPasswordForm
                    userRecord={resettingUser}
                    onClose={() => setResettingUser(null)}
                    onSaved={handlePasswordReset}
                />
            )}
        </Layout>
    );
}

export default Users;