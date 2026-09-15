import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DegreeProgramForm from './DegreeProgramForm';

function DegreePrograms() {
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const response = await api.get('/degree-programs');
            setPrograms(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load degree programs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPrograms();
    }, []);

    const handleAddClick = () => {
        setEditingProgram(null);
        setShowForm(true);
    };

    const handleEditClick = (program) => {
        setEditingProgram(program);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this degree program?')) return;
        try {
            await api.delete(`/degree-programs/${id}`);
            fetchPrograms();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete degree program.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchPrograms();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Degree Programs</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Degree Program
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
                            <th>Duration (Years)</th>
                            <th>Total Semesters</th>
                            <th>Status</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {programs.map((p) => (
                            <tr key={p.id}>
                                <td>{p.code}</td>
                                <td>{p.name}</td>
                                <td>{p.duration_years}</td>
                                <td>{p.total_semesters}</td>
                                <td>
                                    <span className={`badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(p)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {programs.length === 0 && !loading && !error && (
                <p className="text-muted">No degree programs found.</p>
            )}

            {showForm && (
                <DegreeProgramForm
                    program={editingProgram}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default DegreePrograms;