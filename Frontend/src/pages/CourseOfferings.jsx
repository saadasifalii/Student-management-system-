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

    // Since course_offerings only stores IDs, we fetch the related lists too,
    // so the table can show readable names instead of raw numbers
    const fetchData = async () => {
        setLoading(true);
        try {
            const [offeringsRes, coursesRes, teachersRes, sectionsRes, semestersRes] = await Promise.all([
                api.get('/course-offerings'),
                api.get('/courses'),
                api.get('/teachers'),
                api.get('/sections'),
                api.get('/semesters'),
            ]);
            setOfferings(offeringsRes.data);
            setCourses(coursesRes.data);
            setTeachers(teachersRes.data);
            setSections(sectionsRes.data);
            setSemesters(semestersRes.data);
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load course offerings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    // Helper functions to turn an ID into a readable name for display
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
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete course offering.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchData();
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
            )}

            {offerings.length === 0 && !loading && !error && (
                <p className="text-muted">No course offerings found.</p>
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