import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import { extractList } from '../utils/listHelper';

function MyAttendance() {
    const [records, setRecords] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const myStudentRes = await api.get('/students/me');
                const myStudent = myStudentRes.data;

                const [attendanceRes, offeringsRes, coursesRes] = await Promise.all([
                    api.get(`/attendance/student/${myStudent.id}`),
                    api.get('/course-offerings?limit=1000'),
                    api.get('/courses?limit=1000'),
                ]);

                setRecords(extractList(attendanceRes.data));
                setOfferings(extractList(offeringsRes.data.courseOfferings || offeringsRes.data));
                setCourses(extractList(coursesRes.data));
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load your attendance records.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCourseLabel = (offeringId) => {
        const offering = offerings.find((o) => o.id === offeringId);
        if (!offering) return '—';
        const course = courses.find((c) => c.id === offering.course_id);
        return course ? `${course.course_code} - ${course.course_name}` : `Offering #${offeringId}`;
    };

    const statusBadge = (status) => {
        const map = { present: 'bg-success', absent: 'bg-danger', late: 'bg-warning text-dark' };
        return map[status] || 'bg-secondary';
    };

    return (
        <Layout>
            <h2 className="mb-3">My Attendance</h2>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Course</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records
                            .slice()
                            .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date))
                            .map((r) => (
                                <tr key={r.id}>
                                    <td>{r.attendance_date?.split('T')[0]}</td>
                                    <td>{getCourseLabel(r.course_offering_id)}</td>
                                    <td>
                                        <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                                    </td>
                                    <td>{r.remarks}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}

            {records.length === 0 && !loading && !error && (
                <p className="text-muted">No attendance records found.</p>
            )}
        </Layout>
    );
}

export default MyAttendance;