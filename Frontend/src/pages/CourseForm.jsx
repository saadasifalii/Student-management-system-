import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function CourseForm({ course, onClose, onSaved }) {
    const isEditing = !!course;

    const [formData, setFormData] = useState({
        department_id: '',
        course_code: '',
        course_name: '',
        description: '',
        credit_hours: '',
        semester_number: '',
        status: 'active',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (course) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                department_id: course.department_id || '',
                course_code: course.course_code || '',
                course_name: course.course_name || '',
                description: course.description || '',
                credit_hours: course.credit_hours || '',
                semester_number: course.semester_number || '',
                status: course.status || 'active',
            });
        }
    }, [course]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(`/courses/${course.id}`, formData);
            } else {
                await api.post('/courses', formData);
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
                <h4 className="mb-3">{isEditing ? 'Edit Course' : 'Add Course'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {!isEditing && (
                            <div className="col-md-6 mb-2">
                                <label className="form-label">Department ID</label>
                                <input type="number" name="department_id" className="form-control" value={formData.department_id} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Course Code</label>
                            <input type="text" name="course_code" className="form-control" value={formData.course_code} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Course Name</label>
                            <input type="text" name="course_name" className="form-control" value={formData.course_name} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Credit Hours</label>
                            <input type="number" name="credit_hours" className="form-control" value={formData.credit_hours} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-2">
                            <label className="form-label">Semester Number</label>
                            <input type="number" name="semester_number" className="form-control" value={formData.semester_number} onChange={handleChange} />
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

export default CourseForm;