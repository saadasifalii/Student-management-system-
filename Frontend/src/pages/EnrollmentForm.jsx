import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function EnrollmentForm({ enrollment, onClose, onSaved }) {
    const isEditing = !!enrollment;

    const [formData, setFormData] = useState({
        student_id: '',
        course_offering_id: '',
        enrollment_date: '',
        status: 'enrolled',
    });

    const [students, setStudents] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Convert API response into an array
    const getArray = (response, key) => {
        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (key && Array.isArray(response?.data?.[key])) {
            return response.data[key];
        }

        if (Array.isArray(response?.data?.data)) {
            return response.data.data;
        }

        return [];
    };

    // Fetch dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [
                    studentsRes,
                    offeringsRes,
                    coursesRes
                ] = await Promise.all([
                    api.get('/students'),
                    api.get('/course-offerings'),
                    api.get('/courses'),
                ]);

                setStudents(
                    getArray(studentsRes, 'students')
                );

                setOfferings(
                    getArray(offeringsRes, 'offerings')
                );

                setCourses(
                    getArray(coursesRes, 'courses')
                );

            } catch (err) {
                console.error(
                    'Failed to load dropdown options:',
                    err
                );

                setError(
                    'Failed to load dropdown options.'
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    // Load existing enrollment when editing
    useEffect(() => {
        if (enrollment) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                student_id: enrollment.student_id || '',
                course_offering_id:
                    enrollment.course_offering_id || '',
                enrollment_date:
                    enrollment.enrollment_date?.split('T')[0] || '',
                status:
                    enrollment.status || 'enrolled',
            });
        }
    }, [enrollment]);

    // Build readable course offering label
    const getOfferingLabel = (offering) => {
        const course = courses.find(
            (c) => c.id === offering.course_id
        );

        return course
            ? `${course.course_code} - ${course.course_name}`
            : `Offering #${offering.id}`;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(
                    `/enrollments/${enrollment.id}`,
                    {
                        status: formData.status,
                    }
                );
            } else {
                await api.post(
                    '/enrollments',
                    formData
                );
            }

            onSaved();

        } catch (err) {
            console.error(
                'Enrollment save error:',
                err
            );

            setError(
                err.response?.data?.error ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="modal-backdrop-custom"
            onClick={onClose}
        >
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                <h4 className="mb-3">
                    {isEditing
                        ? 'Edit Enrollment'
                        : 'Add Enrollment'}
                </h4>

                {loadingOptions ? (
                    <p>Loading options...</p>
                ) : (
                    <form onSubmit={handleSubmit}>

                        {/* STUDENT + OFFERING ONLY WHEN ADDING */}
                        {!isEditing && (
                            <>
                                {/* STUDENT */}
                                <div className="mb-2">

                                    <label className="form-label">
                                        Student
                                    </label>

                                    <select
                                        name="student_id"
                                        className="form-select"
                                        value={formData.student_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a student
                                        </option>

                                        {students.map((s) => (
                                            <option
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {s.first_name}{' '}
                                                {s.last_name}{' '}
                                                ({s.roll_number})
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* COURSE OFFERING */}
                                <div className="mb-2">

                                    <label className="form-label">
                                        Course Offering
                                    </label>

                                    <select
                                        name="course_offering_id"
                                        className="form-select"
                                        value={
                                            formData.course_offering_id
                                        }
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a course offering
                                        </option>

                                        {offerings.map((o) => (
                                            <option
                                                key={o.id}
                                                value={o.id}
                                            >
                                                {getOfferingLabel(o)}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* ENROLLMENT DATE */}
                                <div className="mb-2">

                                    <label className="form-label">
                                        Enrollment Date
                                    </label>

                                    <input
                                        type="date"
                                        name="enrollment_date"
                                        className="form-control"
                                        value={
                                            formData.enrollment_date
                                        }
                                        onChange={handleChange}
                                    />

                                </div>
                            </>
                        )}

                        {/* STATUS */}
                        <div className="mb-2">

                            <label className="form-label">
                                Status
                            </label>

                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="enrolled">
                                    Enrolled
                                </option>

                                <option value="dropped">
                                    Dropped
                                </option>

                                <option value="completed">
                                    Completed
                                </option>
                            </select>

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="alert alert-danger py-2 mt-2">
                                {error}
                            </div>
                        )}

                        {/* BUTTONS */}
                        <div className="d-flex justify-content-end gap-2 mt-3">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : 'Save'}
                            </button>

                        </div>

                    </form>
                )}

            </div>
        </div>
    );
}

export default EnrollmentForm;