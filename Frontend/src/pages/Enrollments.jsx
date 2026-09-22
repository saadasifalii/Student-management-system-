import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import EnrollmentForm from './EnrollmentForm';
import { extractPaginated } from '../utils/listHelper';

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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageLimit = 10;

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

    const fetchData = async (page = 1) => {
        setLoading(true);
        setError('');

        try {
            const [
                enrollmentsRes,
                studentsRes,
                offeringsRes,
                coursesRes
            ] = await Promise.all([
                api.get(`/enrollments?page=${page}&limit=${pageLimit}`),
                api.get('/students?limit=1000'),
                api.get('/course-offerings?limit=1000'),
                api.get('/courses?limit=1000'),
            ]);

            const { list: enrollmentsData, pagination } = extractPaginated(enrollmentsRes.data);

            const studentsData = getArray(
                studentsRes,
                'students'
            );

            const offeringsData = getArray(
                offeringsRes,
                'offerings'
            );

            const coursesData = getArray(
                coursesRes,
                'courses'
            );

            setEnrollments(enrollmentsData);
            if (pagination) {
                setCurrentPage(pagination.currentPage || page);
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.totalEnrollments || 0);
            }
            setStudents(studentsData);
            setOfferings(offeringsData);
            setCourses(coursesData);

        } catch (err) {
            console.error(
                'Failed to load enrollments:',
                err
            );

            console.error(
                'Server response:',
                err.response?.data
            );

            setEnrollments([]);
            setStudents([]);
            setOfferings([]);
            setCourses([]);

            setError('Failed to load enrollments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchData(page);
    };

    // Get student name
    const getStudentName = (id) => {
        const student = students.find(
            (s) => s.id === id
        );

        return student
            ? `${student.first_name} ${student.last_name}`
            : '—';
    };

    // Get course offering name
    const getOfferingLabel = (id) => {
        const offering = offerings.find(
            (o) => o.id === id
        );

        if (!offering) {
            return '—';
        }

        const course = courses.find(
            (c) => c.id === offering.course_id
        );

        return course
            ? `${course.course_code} - ${course.course_name}`
            : `Offering #${id}`;
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
        if (
            !window.confirm(
                'Are you sure you want to delete this enrollment?'
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/enrollments/${id}`
            );

            fetchData(currentPage);

        } catch (err) {
            console.error(
                'Delete enrollment error:',
                err
            );

            alert(
                err.response?.data?.error ||
                'Failed to delete enrollment.'
            );
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchData(currentPage);
    };

    return (
        <Layout>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Enrollments</h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={handleAddClick}
                    >
                        + Add Enrollment
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
                enrollments.length > 0 && (
                    <>
                    <table className="table table-striped table-hover">

                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course Offering</th>
                                <th>Enrollment Date</th>
                                <th>Status</th>

                                {isAdmin && (
                                    <th>Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody>

                            {enrollments.map((e) => (
                                <tr key={e.id}>

                                    <td>
                                        {getStudentName(
                                            e.student_id
                                        )}
                                    </td>

                                    <td>
                                        {getOfferingLabel(
                                            e.course_offering_id
                                        )}
                                    </td>

                                    <td>
                                        {e.enrollment_date
                                            ?.split('T')[0]}
                                    </td>

                                    <td>

                                        <span
                                            className={`badge ${
                                                e.status === 'enrolled'
                                                    ? 'bg-success'
                                                    : e.status === 'completed'
                                                    ? 'bg-primary'
                                                    : 'bg-secondary'
                                            }`}
                                        >
                                            {e.status}
                                        </span>

                                    </td>

                                    {isAdmin && (
                                        <td>

                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() =>
                                                    handleEditClick(e)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(
                                                        e.id
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
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">Showing page {currentPage} of {totalPages} ({totalCount} total)</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
                            </div>
                        </div>
                    )}
                    </>
                )}

            {/* NO ENROLLMENTS */}
            {!loading &&
                !error &&
                enrollments.length === 0 && (

                    <p className="text-muted">
                        No enrollments found.
                    </p>
                )}

            {/* FORM */}
            {showForm && (
                <EnrollmentForm
                    enrollment={editingEnrollment}
                    onClose={() =>
                        setShowForm(false)
                    }
                    onSaved={handleSaved}
                />
            )}

        </Layout>
    );
}

export default Enrollments;