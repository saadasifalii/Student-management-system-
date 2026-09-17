import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function UserForm({ userRecord, onClose, onSaved }) {
    const isEditing = !!userRecord;

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student', status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userRecord) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: userRecord.name || '',
                email: userRecord.email || '',
                password: '',
                role: userRecord.role || 'student',
                status: userRecord.status || 'active',
            });
        }
    }, [userRecord]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                const { name, email, role, status } = formData;
                await api.put(`/users/${userRecord.id}`, { name, email, role, status });
            } else {
                await api.post('/users', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit User' : 'Add User'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                    </div>
                    {!isEditing && (
                        <div className="mb-2">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required minLength={6} />
                        </div>
                    )}
                    <div className="row">
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
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

export default UserForm;