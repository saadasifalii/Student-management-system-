import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CourseForm from './CourseForm';
import { extractPaginated } from '../utils/listHelper';

function Courses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageLimit = 10;

    const isAdmin = user?.role === 'admin';

    const fetchCourses = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/courses?page=${page}&limit=${pageLimit}`);
            const { list, pagination } = extractPaginated(response.data);
            setCourses(list);
            if (pagination) {
                setCurrentPage(pagination.currentPage || page);
                setTotalPages(pagination.totalPages || 1);
            } else {
                setCurrentPage(1);
                setTotalPages(1);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCourses(1);
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchCourses(page);
    };

    const handleAddClick = () => {
        setEditingCourse(null);
        setShowForm(true);
    };

    const handleEditClick = (course) => {
        setEditingCourse(course);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete course.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchCourses(currentPage);
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Courses</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Course
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Credit Hours</th>
                                <th>Semester #</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.course_code}</td>
                                    <td>{c.course_name}</td>
                                    <td>{c.credit_hours}</td>
                                    <td>{c.semester_number}</td>
                                    <td>
                                        <span className={`badge ${c.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(c)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {courses.length === 0 && (
                        <p className="text-muted">No courses found.</p>
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">Page {currentPage} of {totalPages}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                                    Previous
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
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