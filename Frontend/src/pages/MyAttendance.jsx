import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function MyAttendance() {
    const { user } = useAuth();

    // eslint-disable-next-line no-unused-vars
    const [studentId, setStudentId] = useState(null);

    const [records, setRecords] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Find logged-in user's student record
                const studentsRes = await api.get('/students');

                const students = getArray(
                    studentsRes,
                    'students'
                );

                const myStudent = students.find(
                    (s) => s.user_id === user.id
                );

                if (!myStudent) {
                    setError(
                        'No student record linked to this account.'
                    );

                    setLoading(false);
                    return;
                }

                setStudentId(myStudent.id);

                const [
                    attendanceRes,
                    offeringsRes,
                    coursesRes
                ] = await Promise.all([
                    api.get(
                        `/attendance/student/${myStudent.id}`
                    ),
                    api.get('/course-offerings'),
                    api.get('/courses'),
                ]);

                const attendanceData = getArray(
                    attendanceRes,
                    'attendance'
                );

                const offeringsData = getArray(
                    offeringsRes,
                    'offerings'
                );

                const coursesData = getArray(
                    coursesRes,
                    'courses'
                );

                setRecords(attendanceData);
                setOfferings(offeringsData);
                setCourses(coursesData);

            } catch (err) {
                console.error(
                    'Failed to load attendance:',
                    err
                );

                console.error(
                    'Server response:',
                    err.response?.data
                );

                setRecords([]);
                setOfferings([]);
                setCourses([]);

                setError(
                    'Failed to load your attendance records.'
                );
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchData();
        }
    }, [user]);

    // Get course name
    const getCourseLabel = (offeringId) => {
        const offering = offerings.find(
            (o) => o.id === offeringId
        );

        if (!offering) {
            return '—';
        }

        const course = courses.find(
            (c) => c.id === offering.course_id
        );

        return course
            ? `${course.course_code} - ${course.course_name}`
            : `Offering #${offeringId}`;
    };

    // Attendance status badge
    const statusBadge = (status) => {
        const map = {
            present: 'bg-success',
            absent: 'bg-danger',
            late: 'bg-warning text-dark',
        };

        return map[status] || 'bg-secondary';
    };

    return (
        <Layout>

            <h2 className="mb-3">
                My Attendance
            </h2>

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
                records.length > 0 && (

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
                                .sort(
                                    (a, b) =>
                                        new Date(
                                            b.attendance_date
                                        ) -
                                        new Date(
                                            a.attendance_date
                                        )
                                )
                                .map((r) => (
                                    <tr key={r.id}>

                                        <td>
                                            {r.attendance_date
                                                ?.split('T')[0]}
                                        </td>

                                        <td>
                                            {getCourseLabel(
                                                r.course_offering_id
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`badge ${statusBadge(
                                                    r.status
                                                )}`}
                                            >
                                                {r.status}
                                            </span>
                                        </td>

                                        <td>
                                            {r.remarks}
                                        </td>

                                    </tr>
                                ))}

                        </tbody>

                    </table>
                )}

            {!loading &&
                !error &&
                records.length === 0 && (

                    <p className="text-muted">
                        No attendance records found.
                    </p>
                )}

        </Layout>
    );
}

export default MyAttendance;