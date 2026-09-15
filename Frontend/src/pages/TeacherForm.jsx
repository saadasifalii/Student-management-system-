import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function TeacherForm({ teacher, onClose, onSaved }) {
    const isEditing = !!teacher;

    const [formData, setFormData] = useState({
        user_id: '',
        department_id: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        designation: '',
        phone: '',
        joining_date: '',
        status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (teacher) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                user_id: teacher.user_id || '',
                department_id: teacher.department_id || '',
                employee_id: teacher.employee_id || '',
                first_name: teacher.first_name || '',
                last_name: teacher.last_name || '',
                designation: teacher.designation || '',
                phone: teacher.phone || '',
                joining_date: teacher.joining_date?.split('T')[0] || '',
                status: teacher.status || 'active',
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/teachers/${teacher.id}`, formData);
            } else {
                await api.post('/teachers', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Teacher' : 'Add Teacher'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {!isEditing && (
                            <>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">User ID</label>
                                    <input type="number" name="user_id" className="form-control" value={formData.user_id} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Department ID</label>
                                    <input type="number" name="department_id" className="form-control" value={formData.department_id} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Employee ID</label>
                                    <input type="text" name="employee_id" className="form-control" value={formData.employee_id} onChange={handleChange} required />
                                </div>
                            </>
                        )}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">First Name</label>
                            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Last Name</label>
                            <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Designation</label>
                            <input type="text" name="designation" className="form-control" value={formData.designation} onChange={handleChange} placeholder="e.g. Lecturer, Professor" />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Phone</label>
                            <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Joining Date</label>
                            <input type="date" name="joining_date" className="form-control" value={formData.joining_date} onChange={handleChange} />
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

export default TeacherForm;