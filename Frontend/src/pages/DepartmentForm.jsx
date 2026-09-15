import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function DepartmentForm({ department, onClose, onSaved }) {
    const isEditing = !!department;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (department) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: department.name || '',
                code: department.code || '',
                description: department.description || '',
            });
        }
    }, [department]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/departments/${department.id}`, formData);
            } else {
                await api.post('/departments', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Department' : 'Add Department'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Code</label>
                        <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Description</label>
                        <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="3" />
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

export default DepartmentForm;