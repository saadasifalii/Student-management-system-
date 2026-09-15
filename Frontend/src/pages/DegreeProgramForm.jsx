import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function DegreeProgramForm({ program, onClose, onSaved }) {
    const isEditing = !!program;

    const [formData, setFormData] = useState({
        department_id: '',
        name: '',
        code: '',
        duration_years: '',
        total_semesters: '',
        description: '',
        status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (program) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                department_id: program.department_id || '',
                name: program.name || '',
                code: program.code || '',
                duration_years: program.duration_years || '',
                total_semesters: program.total_semesters || '',
                description: program.description || '',
                status: program.status || 'active',
            });
        }
    }, [program]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/degree-programs/${program.id}`, formData);
            } else {
                await api.post('/degree-programs', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Degree Program' : 'Add Degree Program'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {!isEditing && (
                            <div className="col-md-6 mb-2">
                                <label className="form-label">Department ID</label>
                                <input type="number" name="department_id" className="form-control" value={formData.department_id} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Code</label>
                            <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Duration (Years)</label>
                            <input type="number" name="duration_years" className="form-control" value={formData.duration_years} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Total Semesters</label>
                            <input type="number" name="total_semesters" className="form-control" value={formData.total_semesters} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-12 mb-2">
                            <label className="form-label">Description</label>
                            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="2" />
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

export default DegreeProgramForm;