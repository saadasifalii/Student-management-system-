import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CourseOfferingForm from './CourseOfferingForm';

function CourseOfferings() {
    const { user } = useAuth();

    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editingOffering, setEditingOffering] = useState(null);

    const isAdmin = user?.role === 'admin';

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

    // Fetch all required data
    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const [
                offeringsRes,
                coursesRes,
                teachersRes,
                sectionsRes,
                semestersRes
            ] = await Promise.all([
                api.get('/course-offerings'),
                api.get('/courses'),
                api.get('/teachers'),
                api.get('/sections'),
                api.get('/semesters'),
            ]);

            const offeringsData = getArray(
                offeringsRes,
                'offerings'
            );

            const coursesData = getArray(
                coursesRes,
                'courses'
            );

            const teachersData = getArray(
                teachersRes,
                'teachers'
            );

            const sectionsData = getArray(
                sectionsRes,
                'sections'
            );

            const semestersData = getArray(
                semestersRes,
                'semesters'
            );

            setOfferings(offeringsData);
            setCourses(coursesData);
            setTeachers(teachersData);
            setSections(sectionsData);
            setSemesters(semestersData);

        } catch (err) {
            console.error(
                'Failed to load course offerings:',
                err
            );

            console.error(
                'Server response:',
                err.response?.data
            );

            setOfferings([]);
            setCourses([]);
            setTeachers([]);
            setSections([]);
            setSemesters([]);

            setError(
                'Failed to load course offerings.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get course name
    const getCourseName = (id) => {
        return (
            courses.find((c) => c.id === id)?.course_name ||
            '—'
        );
    };

    // Get teacher name
    const getTeacherName = (id) => {
        const teacher = teachers.find(
            (t) => t.id === id
        );

        return teacher
            ? `${teacher.first_name} ${teacher.last_name}`
            : '—';
    };

    // Get section name
    const getSectionName = (id) => {
        return (
            sections.find((s) => s.id === id)?.name ||
            '—'
        );
    };

    // Get semester name
    const getSemesterName = (id) => {
        return (
            semesters.find((s) => s.id === id)?.name ||
            '—'
        );
    };

    // Add course offering
    const handleAddClick = () => {
        setEditingOffering(null);
        setShowForm(true);
    };

    // Edit course offering
    const handleEditClick = (offering) => {
        setEditingOffering(offering);
        setShowForm(true);
    };

    // Delete course offering
    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this course offering?'
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/course-offerings/${id}`
            );

            fetchData();

        } catch (err) {
            console.error(
                'Delete course offering error:',
                err
            );

            alert(
                err.response?.data?.error ||
                'Failed to delete course offering.'
            );
        }
    };

    // After saving
    const handleSaved = () => {
        setShowForm(false);
        fetchData();
    };

    return (
        <Layout>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Course Offerings</h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={handleAddClick}
                    >
                        + Add Course Offering
                    </button>
                )}

            </div>

            {/* LOADING */}
            {loading && (
                <p>Loading...</p>
            )}

            {/* ERROR */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* TABLE */}
            {!loading &&
                !error &&
                offerings.length > 0 && (

                    <table className="table table-striped table-hover">

                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Teacher</th>
                                <th>Section</th>
                                <th>Semester</th>
                                <th>Room</th>
                                <th>Schedule</th>

                                {isAdmin && (
                                    <th>Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>

                            {offerings.map((o) => (
                                <tr key={o.id}>

                                    <td>
                                        {getCourseName(
                                            o.course_id
                                        )}
                                    </td>

                                    <td>
                                        {getTeacherName(
                                            o.teacher_id
                                        )}
                                    </td>

                                    <td>
                                        {getSectionName(
                                            o.section_id
                                        )}
                                    </td>

                                    <td>
                                        {getSemesterName(
                                            o.semester_id
                                        )}
                                    </td>

                                    <td>
                                        {o.room}
                                    </td>

                                    <td>
                                        {o.schedule}
                                    </td>

                                    {isAdmin && (
                                        <td>

                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() =>
                                                    handleEditClick(o)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        o.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>
                                    )}

                                </tr>
                            ))}

                        </tbody>

                    </table>
                )}

            {/* NO DATA */}
            {!loading &&
                !error &&
                offerings.length === 0 && (

                    <p className="text-muted">
                        No course offerings found.
                    </p>
                )}

            {/* FORM */}
            {showForm && (
                <CourseOfferingForm
                    offering={editingOffering}
                    onClose={() =>
                        setShowForm(false)
                    }
                    onSaved={handleSaved}
                />
            )}

        </Layout>
    );
}

export default CourseOfferings;