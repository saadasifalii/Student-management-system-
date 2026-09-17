import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CourseForm from './CourseForm';

function Courses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchCourses = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/courses');

            // Handle different backend response formats
            if (Array.isArray(response.data)) {
                setCourses(response.data);
            } else if (Array.isArray(response.data.courses)) {
                setCourses(response.data.courses);
            } else if (Array.isArray(response.data.data)) {
                setCourses(response.data.data);
            } else {
                setCourses([]);
            }

        } catch (err) {
            console.error('Failed to load courses:', err);
            console.error('Server response:', err.response?.data);

            setCourses([]);
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCourses();
    }, []);

    const handleAddClick = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEditClick = (course) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this course?'
            )
        ) {
            return;
        }

        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to delete course.'
            );
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchCourses();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Courses</h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={handleAddClick}
                    >
                        + Add Course
                    </button>
                )}

            </div>

            {loading && (
                <p>Loading...</p>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!loading &&
                !error &&
                courses.length > 0 && (
                    <table className="table table-striped table-hover">

                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Credit Hours</th>
                                <th>Semester #</th>
                                <th>Status</th>

                                {isAdmin && (
                                    <th>Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id}>

                                    <td>
                                        {c.course_code}
                                    </td>

                                    <td>
                                        {c.course_name}
                                    </td>

                                    <td>
                                        {c.credit_hours}
                                    </td>

                                    <td>
                                        {c.semester_number}
                                    </td>

                                    <td>
                                        <span
                                            className={`badge ${
                                                c.status === 'active'
                                                    ? 'bg-success'
                                                    : 'bg-secondary'
                                            }`}
                                        >
                                            {c.status}
                                        </span>
                                    </td>

                                    {isAdmin && (
                                        <td>

                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() =>
                                                    handleEditClick(c)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(c.id)
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

            {!loading &&
                !error &&
                courses.length === 0 && (
                    <p className="text-muted">
                        No courses found.
                    </p>
                )}

            {showForm && (
                <CourseForm
                    course={editingCourse}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}

        </Layout>
    );
}

export default Courses;