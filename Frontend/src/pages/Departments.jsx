import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DepartmentForm from './DepartmentForm';

function Departments() {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDepartments();
    }, []);

    const handleAddClick = () => {
        setEditingDepartment(null);
        setShowForm(true);
    };

    const handleEditClick = (department) => {
        setEditingDepartment(department);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete department.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchDepartments();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Departments</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Department
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Description</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((d) => (
                            <tr key={d.id}>
                                <td>{d.code}</td>
                                <td>{d.name}</td>
                                <td>{d.description}</td>
                                {isAdmin && (
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(d)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {departments.length === 0 && !loading && !error && (
                <p className="text-muted">No departments found.</p>
            )}

            {showForm && (
                <DepartmentForm
                    department={editingDepartment}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default Departments;