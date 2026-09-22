import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import UserForm from './UserForm';
import ResetPasswordForm from './ResetPasswordForm';
import { extractPaginated } from '../utils/listHelper';

function Users() {
    const [users, setUsers] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [resettingUser, setResettingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageLimit = 10;

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/users?page=${page}&limit=${pageLimit}`);
            const { list } = extractPaginated(response.data);
            setUsers(list);
            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
                setTotalCount(response.data.pagination.totalUsers);
            }
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

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchUsers(page);
    };

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
            fetchUsers(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchUsers(currentPage);
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
                <>
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

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">
                                Showing page {currentPage} of {totalPages} ({totalCount} total)
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
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