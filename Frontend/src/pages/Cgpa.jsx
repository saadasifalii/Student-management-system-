import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Cgpa() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [cgpaList, setCgpaList] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ student_id: '', total_credit_hours: '', total_quality_points: '', cgpa: '' });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cgpaRes, studentsRes] = await Promise.all([
                api.get('/cgpa'),
                api.get('/students'),
            ]);
            setCgpaList(cgpaRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load CGPA records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const getStudentName = (id) => {
        const s = students.find((s) => s.id === id);
        return s ? `${s.first_name} ${s.last_name} (${s.roll_number})` : '—';
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        try {
            await api.post('/cgpa', formData);
            setShowForm(false);
            setFormData({ student_id: '', total_credit_hours: '', total_quality_points: '', cgpa: '' });
            fetchData();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to save CGPA.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm('Delete this CGPA record?')) return;
        try {
            await api.delete(`/cgpa/student/${studentId}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete.');
        }
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>CGPA Records</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        + Add / Update CGPA
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Total Credit Hours</th>
                            <th>Total Quality Points</th>
                            <th>CGPA</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {cgpaList.map((c) => (
                            <tr key={c.id}>
                                <td>{getStudentName(c.student_id)}</td>
                                <td>{c.total_credit_hours}</td>
                                <td>{c.total_quality_points}</td>
                                <td><strong>{c.cgpa}</strong></td>
                                {isAdmin && (
                                    <td>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.student_id)}>Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showForm && (
                <div className="modal-backdrop-custom" onClick={() => setShowForm(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h4 className="mb-3">Add / Update CGPA</h4>
                        <p className="text-muted small">If this student already has a CGPA record, it will be updated with the new values.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label className="form-label">Student</label>
                                <select name="student_id" className="form-select" value={formData.student_id} onChange={handleChange} required>
                                    <option value="">Select a student</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.roll_number})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Total Credit Hours</label>
                                    <input type="number" name="total_credit_hours" className="form-control" value={formData.total_credit_hours} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Total Quality Points</label>
                                    <input type="number" step="0.01" name="total_quality_points" className="form-control" value={formData.total_quality_points} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">CGPA</label>
                                    <input type="number" step="0.01" name="cgpa" className="form-control" value={formData.cgpa} onChange={handleChange} required />
                                </div>
                            </div>
                            {formError && <div className="alert alert-danger py-2">{formError}</div>}
                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default Cgpa;