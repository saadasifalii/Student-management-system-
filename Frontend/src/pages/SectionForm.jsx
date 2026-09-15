import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function SectionForm({ section, onClose, onSaved }) {
    const isEditing = !!section;

    const [formData, setFormData] = useState({
        degree_program_id: '',
        semester_id: '',
        name: '',
        semester_number: '',
        capacity: '',
        status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (section) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                degree_program_id: section.degree_program_id || '',
                semester_id: section.semester_id || '',
                name: section.name || '',
                semester_number: section.semester_number || '',
                capacity: section.capacity || '',
                status: section.status || 'active',
            });
        }
    }, [section]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/sections/${section.id}`, formData);
            } else {
                await api.post('/sections', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Section' : 'Add Section'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {!isEditing && (
                            <>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Degree Program ID</label>
                                    <input type="number" name="degree_program_id" className="form-control" value={formData.degree_program_id} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Semester ID</label>
                                    <input type="number" name="semester_id" className="form-control" value={formData.semester_id} onChange={handleChange} required />
                                </div>
                            </>
                        )}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required placeholder="e.g. Section A" />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Semester Number</label>
                            <input type="number" name="semester_number" className="form-control" value={formData.semester_number} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Capacity</label>
                            <input type="number" name="capacity" className="form-control" value={formData.capacity} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
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

export default SectionForm;