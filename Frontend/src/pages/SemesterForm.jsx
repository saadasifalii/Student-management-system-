import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function SemesterForm({ semester, onClose, onSaved }) {
    const isEditing = !!semester;

    const [formData, setFormData] = useState({
        name: '',
        term: '',
        year: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (semester) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: semester.name || '',
                term: semester.term || '',
                year: semester.year || '',
                start_date: semester.start_date?.split('T')[0] || '',
                end_date: semester.end_date?.split('T')[0] || '',
                status: semester.status || 'upcoming',
            });
        }
    }, [semester]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/semesters/${semester.id}`, formData);
            } else {
                await api.post('/semesters', formData);
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h4 className="mb-3">{isEditing ? 'Edit Semester' : 'Add Semester'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required placeholder="e.g. Fall 2026" />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Term</label>
                            <select name="term" className="form-select" value={formData.term} onChange={handleChange} required>
                                <option value="">Select</option>
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                                <option value="Fall">Fall</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Year</label>
                            <input type="number" name="year" className="form-control" value={formData.year} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Start Date</label>
                            <input type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">End Date</label>
                            <input type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger py-2 mt-2">{error}</div>}

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SemesterForm;