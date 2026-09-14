import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function StudentForm({ student, onClose, onSaved }) {
    const isEditing = !!student;

    const [formData, setFormData] = useState({
        user_id: '',
        department_id: '',
        degree_program_id: '',
        roll_number: '',
        registration_number: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: '',
        admission_date: '',
        batch_year: '',
        status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (student) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                user_id: student.user_id || '',
                department_id: student.department_id || '',
                degree_program_id: student.degree_program_id || '',
                roll_number: student.roll_number || '',
                registration_number: student.registration_number || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                date_of_birth: student.date_of_birth?.split('T')[0] || '',
                gender: student.gender || '',
                phone: student.phone || '',
                address: student.address || '',
                admission_date: student.admission_date?.split('T')[0] || '',
                batch_year: student.batch_year || '',
                status: student.status || 'active',
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/students/${student.id}`, formData);
            } else {
                await api.post('/students', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Student' : 'Add Student'}</h4>
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
                                    <label className="form-label">Degree Program ID</label>
                                    <input type="number" name="degree_program_id" className="form-control" value={formData.degree_program_id} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Roll Number</label>
                                    <input type="text" name="roll_number" className="form-control" value={formData.roll_number} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <label className="form-label">Registration Number</label>
                                    <input type="text" name="registration_number" className="form-control" value={formData.registration_number} onChange={handleChange} required />
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
                            <label className="form-label">Date of Birth</label>
                            <input type="date" name="date_of_birth" className="form-control" value={formData.date_of_birth} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Phone</label>
                            <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Batch Year</label>
                            <input type="number" name="batch_year" className="form-control" value={formData.batch_year} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Admission Date</label>
                            <input type="date" name="admission_date" className="form-control" value={formData.admission_date} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="active">Active</option>
                                <option value="graduated">Graduated</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                        </div>
                        <div className="col-12 mb-2">
                            <label className="form-label">Address</label>
                            <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
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

export default StudentForm;