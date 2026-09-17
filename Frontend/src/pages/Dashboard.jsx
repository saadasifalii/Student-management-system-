import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({});

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (user.role === 'admin') {
                    const [studentsRes, teachersRes, coursesRes, documentsRes] = await Promise.all([
                        api.get('/students'),
                        api.get('/teachers'),
                        api.get('/courses'),
                        api.get('/documents'),
                    ]);
                    setStats({
                        totalStudents: studentsRes.data.length,
                        totalTeachers: teachersRes.data.length,
                        totalCourses: coursesRes.data.length,
                        pendingDocuments: documentsRes.data.filter((d) => d.status === 'pending').length,
                    });
                } else if (user.role === 'teacher') {
                    const [offeringsRes, teachersRes, coursesRes] = await Promise.all([
                        api.get('/course-offerings'),
                        api.get('/teachers'),
                        api.get('/courses'),
                    ]);
                    const myTeacherRecord = teachersRes.data.find((t) => t.user_id === user.id);
                    const myOfferings = offeringsRes.data.filter((o) => o.teacher_id === myTeacherRecord?.id);
                    const withCourseNames = myOfferings.map((o) => {
                        const course = coursesRes.data.find((c) => c.id === o.course_id);
                        return { ...o, courseLabel: course ? `${course.course_code} - ${course.course_name}` : `Offering #${o.id}` };
                    });
                    setStats({ myOfferings: withCourseNames });
                } else if (user.role === 'student') {
                    const studentsRes = await api.get('/students');
                    const myStudent = studentsRes.data.find((s) => s.user_id === user.id);

                    if (myStudent) {
                        const [enrollmentsRes, offeringsRes, coursesRes, attendanceSummaryRes, cgpaRes] = await Promise.all([
                            api.get('/enrollments'),
                            api.get('/course-offerings'),
                            api.get('/courses'),
                            api.get(`/attendance/student/${myStudent.id}/summary`),
                            api.get(`/cgpa/student/${myStudent.id}`).catch(() => ({ data: null })),
                        ]);

                        const myEnrollments = enrollmentsRes.data.filter((e) => e.student_id === myStudent.id && e.status === 'enrolled');
                        const myCourses = myEnrollments.map((e) => {
                            const offering = offeringsRes.data.find((o) => o.id === e.course_offering_id);
                            const course = offering ? coursesRes.data.find((c) => c.id === offering.course_id) : null;
                            return course ? `${course.course_code} - ${course.course_name}` : 'Unknown course';
                        });

                        setStats({
                            enrolledCourseCount: myEnrollments.length,
                            myCourses,
                            attendancePercent: attendanceSummaryRes.data.percentage,
                            cgpa: cgpaRes.data?.cgpa || null,
                        });
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    return (
        <Layout>
            <h2 className="mb-1">Welcome, {user?.name}</h2>
            <p className="text-muted mb-4">Role: {user?.role}</p>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && user.role === 'admin' && (
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="card text-center p-3 shadow-sm">
                            <h3>{stats.totalStudents}</h3>
                            <p className="text-muted mb-0">Total Students</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center p-3 shadow-sm">
                            <h3>{stats.totalTeachers}</h3>
                            <p className="text-muted mb-0">Total Teachers</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center p-3 shadow-sm">
                            <h3>{stats.totalCourses}</h3>
                            <p className="text-muted mb-0">Total Courses</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-center p-3 shadow-sm border-warning">
                            <h3>{stats.pendingDocuments}</h3>
                            <p className="text-muted mb-0">Pending Documents</p>
                            {stats.pendingDocuments > 0 && (
                                <Link to="/documents" className="small">Review now →</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && user.role === 'teacher' && (
                <>
                    <h5 className="mb-3">My Course Offerings</h5>
                    {stats.myOfferings?.length > 0 ? (
                        <ul className="list-group mb-4">
                            {stats.myOfferings.map((o) => (
                                <li key={o.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    {o.courseLabel} — {o.room} ({o.schedule})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">You have no assigned course offerings yet.</p>
                    )}
                    <div className="d-flex gap-2">
                        <Link to="/attendance" className="btn btn-primary">Mark Attendance</Link>
                        <Link to="/marks" className="btn btn-outline-primary">Enter Marks</Link>
                    </div>
                </>
            )}

            {!loading && !error && user.role === 'student' && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card text-center p-3 shadow-sm">
                                <h3>{stats.enrolledCourseCount ?? '—'}</h3>
                                <p className="text-muted mb-0">Enrolled Courses</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center p-3 shadow-sm">
                                <h3>{stats.attendancePercent !== null && stats.attendancePercent !== undefined ? `${stats.attendancePercent}%` : '—'}</h3>
                                <p className="text-muted mb-0">Attendance</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card text-center p-3 shadow-sm">
                                <h3>{stats.cgpa ?? '—'}</h3>
                                <p className="text-muted mb-0">CGPA</p>
                            </div>
                        </div>
                    </div>
                    <h5 className="mb-3">My Courses</h5>
                    {stats.myCourses?.length > 0 ? (
                        <ul className="list-group mb-4">
                            {stats.myCourses.map((c, i) => (
                                <li key={i} className="list-group-item">{c}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">You are not enrolled in any courses yet.</p>
                    )}
                    <div className="d-flex gap-2">
                        <Link to="/my-grades" className="btn btn-primary">View My Grades</Link>
                        <Link to="/my-attendance" className="btn btn-outline-primary">View My Attendance</Link>
                    </div>
                </>
            )}
        </Layout>
    );
}

export default Dashboard;