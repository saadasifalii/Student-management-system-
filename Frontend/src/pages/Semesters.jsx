import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import SemesterForm from './SemesterForm';

function Semesters() {
    const { user } = useAuth();
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchSemesters = async () => {
        setLoading(true);
        try {
            const response = await api.get('/semesters');
            setSemesters(response.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load semesters.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSemesters();
    }, []);

    const handleAddClick = () => {
        setEditingSemester(null);
        setShowForm(true);
    };

    const handleEditClick = (semester) => {
        setEditingSemester(semester);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this semester?')) return;
        try {
            await api.delete(`/semesters/${id}`);
            fetchSemesters();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete semester.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchSemesters();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Semesters</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Semester
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Term</th>
                            <th>Year</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {semesters.map((s) => (
                            <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.term}</td>
                                <td>{s.year}</td>
                                <td>{s.start_date?.split('T')[0]}</td>
                                <td>{s.end_date?.split('T')[0]}</td>
                                <td>
                                    <span className={`badge ${s.status === 'active' ? 'bg-success' : s.status === 'completed' ? 'bg-secondary' : 'bg-info'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(s)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {semesters.length === 0 && !loading && !error && (
                <p className="text-muted">No semesters found.</p>
            )}

            {showForm && (
                <SemesterForm
                    semester={editingSemester}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default Semesters;