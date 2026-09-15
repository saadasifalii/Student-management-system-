import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function AttendanceEntry() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [rows, setRows] = useState([]); // one entry per enrolled student
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Load offerings (filtered to "my courses" if teacher), courses (for labels)
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [offeringsRes, coursesRes] = await Promise.all([
                    api.get('/course-offerings'),
                    api.get('/courses'),
                ]);
                let myOfferings = offeringsRes.data;

                if (!isAdmin) {
                    const teachersRes = await api.get('/teachers');
                    const myTeacherRecord = teachersRes.data.find((t) => t.user_id === user.id);
                    myOfferings = offeringsRes.data.filter((o) => o.teacher_id === myTeacherRecord?.id);
                }

                setOfferings(myOfferings);
                setCourses(coursesRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load course offerings.');
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, [isAdmin, user.id]);

    const getOfferingLabel = (offering) => {
        const course = courses.find((c) => c.id === offering.course_id);
        return course ? `${course.course_code} - ${course.course_name}` : `Offering #${offering.id}`;
    };

    // Load the class roster + any existing attendance for the selected offering/date
    const loadClass = async () => {
        if (!selectedOfferingId || !selectedDate) return;
        setLoadingClass(true);
        setError('');
        setMessage('');

        try {
            const [studentsRes, enrollmentsRes, attendanceRes] = await Promise.all([
                api.get('/students'),
                api.get('/enrollments'),
                api.get('/attendance'),
            ]);

            const enrolledStudentIds = enrollmentsRes.data
                .filter((e) => e.course_offering_id === Number(selectedOfferingId) && e.status === 'enrolled')
                .map((e) => e.student_id);

            const existingAttendance = attendanceRes.data.filter(
                (a) => a.course_offering_id === Number(selectedOfferingId) && a.attendance_date?.split('T')[0] === selectedDate
            );

            const roster = enrolledStudentIds.map((studentId) => {
                const student = studentsRes.data.find((s) => s.id === studentId);
                const existing = existingAttendance.find((a) => a.student_id === studentId);
                return {
                    studentId,
                    name: student ? `${student.first_name} ${student.last_name}` : `Student #${studentId}`,
                    attendanceId: existing?.id || null,
                    status: existing?.status || 'present',
                    remarks: existing?.remarks || '',
                };
            });

            setRows(roster);
        } catch (err) {
            console.error(err);
            setError('Failed to load class roster.');
        } finally {
            setLoadingClass(false);
        }
    };

    const updateRow = (studentId, field, value) => {
        setRows(rows.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            await Promise.all(
                rows.map((r) => {
                    if (r.attendanceId) {
                        return api.put(`/attendance/${r.attendanceId}`, { status: r.status, remarks: r.remarks });
                    } else {
                        return api.post('/attendance', {
                            student_id: r.studentId,
                            course_offering_id: Number(selectedOfferingId),
                            attendance_date: selectedDate,
                            status: r.status,
                            remarks: r.remarks,
                        });
                    }
                })
            );
            setMessage('Attendance saved successfully.');
            loadClass(); // refresh so newly-created records get their attendanceId
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save attendance for one or more students.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h2 className="mb-3">Mark Attendance</h2>

            {loadingOptions ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Course Offering</label>
                            <select
                                className="form-select"
                                value={selectedOfferingId}
                                onChange={(e) => setSelectedOfferingId(e.target.value)}
                            >
                                <option value="">Select a course offering</option>
                                {offerings.map((o) => (
                                    <option key={o.id} value={o.id}>{getOfferingLabel(o)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={loadClass} disabled={!selectedOfferingId}>
                                Load Class
                            </button>
                        </div>
                    </div>

                    {loadingClass && <p>Loading class roster...</p>}
                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    {rows.length > 0 && !loadingClass && (
                        <>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th style={{ width: '160px' }}>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r) => (
                                        <tr key={r.studentId}>
                                            <td>{r.name}</td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={r.status}
                                                    onChange={(e) => updateRow(r.studentId, 'status', e.target.value)}
                                                >
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="late">Late</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={r.remarks}
                                                    onChange={(e) => updateRow(r.studentId, 'remarks', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-success" onClick={handleSaveAll} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </>
                    )}

                    {rows.length === 0 && !loadingClass && selectedOfferingId && (
                        <p className="text-muted">No enrolled students found, or class not loaded yet.</p>
                    )}
                </>
            )}
        </Layout>
    );
}

export default AttendanceEntry;