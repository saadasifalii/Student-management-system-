import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CourseOfferingForm from './CourseOfferingForm';
import { extractList } from '../utils/listHelper';

function CourseOfferings() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingOffering, setEditingOffering] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageLimit = 10;

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const [offeringsRes, coursesRes, teachersRes, sectionsRes, semestersRes] = await Promise.all([
                api.get(`/course-offerings?page=${page}&limit=${pageLimit}`),
                api.get('/courses?limit=1000'),
                api.get('/teachers?limit=1000'),
                api.get('/sections?limit=1000'),
                api.get('/semesters?limit=1000'),
            ]);

            setOfferings(offeringsRes.data.courseOfferings || extractList(offeringsRes.data));
            if (offeringsRes.data.pagination) {
                setCurrentPage(offeringsRes.data.pagination.currentPage);
                setTotalPages(offeringsRes.data.pagination.totalPages);
                setTotalCount(offeringsRes.data.pagination.totalCourseOfferings);
            }

            setCourses(extractList(coursesRes.data));
            setTeachers(extractList(teachersRes.data));
            setSections(extractList(sectionsRes.data));
            setSemesters(extractList(semestersRes.data));
        } catch (err) {
            console.error(err);
            setError('Failed to load course offerings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData(1);
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchData(page);
    };

    const getCourseName = (id) => courses.find((c) => c.id === id)?.course_name || '—';
    const getTeacherName = (id) => {
        const t = teachers.find((t) => t.id === id);
        return t ? `${t.first_name} ${t.last_name}` : '—';
    };
    const getSectionName = (id) => sections.find((s) => s.id === id)?.name || '—';
    const getSemesterName = (id) => semesters.find((s) => s.id === id)?.name || '—';

    const handleAddClick = () => {
        setEditingOffering(null);
        setShowForm(true);
    };

    const handleEditClick = (offering) => {
        setEditingOffering(offering);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course offering?')) return;
        try {
            await api.delete(`/course-offerings/${id}`);
            fetchData(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete course offering.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchData(currentPage);
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Course Offerings</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Course Offering
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
                                <th>Course</th>
                                <th>Teacher</th>
                                <th>Section</th>
                                <th>Semester</th>
                                <th>Room</th>
                                <th>Schedule</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {offerings.map((o) => (
                                <tr key={o.id}>
                                    <td>{getCourseName(o.course_id)}</td>
                                    <td>{getTeacherName(o.teacher_id)}</td>
                                    <td>{getSectionName(o.section_id)}</td>
                                    <td>{getSemesterName(o.semester_id)}</td>
                                    <td>{o.room}</td>
                                    <td>{o.schedule}</td>
                                    {isAdmin && (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(o)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(o.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {offerings.length === 0 && (
                        <p className="text-muted">No course offerings found.</p>
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">
                                Showing page {currentPage} of {totalPages} ({totalCount} total)
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <CourseOfferingForm
                    offering={editingOffering}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default CourseOfferings;