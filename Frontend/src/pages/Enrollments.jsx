import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import EnrollmentForm from './EnrollmentForm';

function Enrollments() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [enrollmentsRes, studentsRes, offeringsRes, coursesRes] = await Promise.all([
                api.get('/enrollments'),
                api.get('/students'),
                api.get('/course-offerings'),
                api.get('/courses'),
            ]);
            setEnrollments(enrollmentsRes.data);
            setStudents(studentsRes.data);
            setOfferings(offeringsRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load enrollments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const getStudentName = (id) => {
        const s = students.find((s) => s.id === id);
        return s ? `${s.first_name} ${s.last_name}` : '—';
    };

    const getOfferingLabel = (id) => {
        const offering = offerings.find((o) => o.id === id);
        if (!offering) return '—';
        const course = courses.find((c) => c.id === offering.course_id);
        return course ? `${course.course_code} - ${course.course_name}` : `Offering #${id}`;
    };

    const handleAddClick = () => {
        setEditingEnrollment(null);
        setShowForm(true);
    };

    const handleEditClick = (enrollment) => {
        setEditingEnrollment(enrollment);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
        try {
            await api.delete(`/enrollments/${id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete enrollment.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchData();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Enrollments</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Enrollment
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Course Offering</th>
                            <th>Enrollment Date</th>
                            <th>Status</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map((e) => (
                            <tr key={e.id}>
                                <td>{getStudentName(e.student_id)}</td>
                                <td>{getOfferingLabel(e.course_offering_id)}</td>
                                <td>{e.enrollment_date?.split('T')[0]}</td>
                                <td>
                                    <span className={`badge ${e.status === 'enrolled' ? 'bg-success' : e.status === 'completed' ? 'bg-primary' : 'bg-secondary'}`}>
                                        {e.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(e)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)}>
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {enrollments.length === 0 && !loading && !error && (
                <p className="text-muted">No enrollments found.</p>
            )}

            {showForm && (
                <EnrollmentForm
                    enrollment={editingEnrollment}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default Enrollments;