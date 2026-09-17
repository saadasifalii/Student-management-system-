 
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function CourseOfferingForm({ offering, onClose, onSaved }) {
    const isEditing = !!offering;

    const [formData, setFormData] = useState({
        course_id: '',
        teacher_id: '',
        section_id: '',
        semester_id: '',
        room: '',
        schedule: '',
    });

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);

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

    // Fetch all dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [
                    coursesRes,
                    teachersRes,
                    sectionsRes,
                    semestersRes
                ] = await Promise.all([
                    api.get('/courses'),
                    api.get('/teachers'),
                    api.get('/sections'),
                    api.get('/semesters'),
                ]);

                setCourses(
                    getArray(coursesRes, 'courses')
                );

                setTeachers(
                    getArray(teachersRes, 'teachers')
                );

                setSections(
                    getArray(sectionsRes, 'sections')
                );

                setSemesters(
                    getArray(semestersRes, 'semesters')
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

    // Load existing offering when editing
    useEffect(() => {
        if (offering) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                course_id: offering.course_id || '',
                teacher_id: offering.teacher_id || '',
                section_id: offering.section_id || '',
                semester_id: offering.semester_id || '',
                room: offering.room || '',
                schedule: offering.schedule || '',
            });
        }
    }, [offering]);

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
                    `/course-offerings/${offering.id}`,
                    formData
                );
            } else {
                await api.post(
                    '/course-offerings',
                    formData
                );
            }

            onSaved();

        } catch (err) {
            console.error(
                'Course offering save error:',
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
                        ? 'Edit Course Offering'
                        : 'Add Course Offering'}
                </h4>

                {loadingOptions ? (
                    <p>Loading options...</p>
                ) : (
                    <form onSubmit={handleSubmit}>

                        <div className="row">

                            {/* COURSE */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Course
                                </label>

                                <select
                                    name="course_id"
                                    className="form-select"
                                    value={formData.course_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">
                                        Select a course
                                    </option>

                                    {courses.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                        >
                                            {c.course_code} - {c.course_name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* TEACHER */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Teacher
                                </label>

                                <select
                                    name="teacher_id"
                                    className="form-select"
                                    value={formData.teacher_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select a teacher
                                    </option>

                                    {teachers.map((t) => (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                        >
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* SECTION */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Section
                                </label>

                                <select
                                    name="section_id"
                                    className="form-select"
                                    value={formData.section_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">
                                        Select a section
                                    </option>

                                    {sections.map((s) => (
                                        <option
                                            key={s.id}
                                            value={s.id}
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* SEMESTER */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Semester
                                </label>

                                <select
                                    name="semester_id"
                                    className="form-select"
                                    value={formData.semester_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditing}
                                >
                                    <option value="">
                                        Select a semester
                                    </option>

                                    {semesters.map((s) => (
                                        <option
                                            key={s.id}
                                            value={s.id}
                                        >
                                            {s.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* ROOM */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Room
                                </label>

                                <input
                                    type="text"
                                    name="room"
                                    className="form-control"
                                    value={formData.room}
                                    onChange={handleChange}
                                    placeholder="e.g. Room 204"
                                />

                            </div>

                            {/* SCHEDULE */}
                            <div className="col-md-6 mb-2">

                                <label className="form-label">
                                    Schedule
                                </label>

                                <input
                                    type="text"
                                    name="schedule"
                                    className="form-control"
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    placeholder="e.g. Mon/Wed 9:00 AM"
                                />

                            </div>

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

export default CourseOfferingForm;