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
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [rows, setRows] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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

    // Load offerings and courses
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [offeringsRes, coursesRes] = await Promise.all([
                    api.get('/course-offerings?limit=1000'),
                    api.get('/courses?limit=1000'),
                ]);

                let offeringsData = getArray(
                    offeringsRes,
                    'offerings'
                );

                const coursesData = getArray(
                    coursesRes,
                    'courses'
                );

                if (!isAdmin) {
                    const teachersRes = await api.get('/teachers');

                    const teachersData = getArray(
                        teachersRes,
                        'teachers'
                    );

                    const myTeacherRecord = teachersData.find(
                        (t) => t.user_id === user.id
                    );

                    offeringsData = offeringsData.filter(
                        (o) =>
                            o.teacher_id ===
                            myTeacherRecord?.id
                    );
                }

                setOfferings(offeringsData);
                setCourses(coursesData);

            } catch (err) {
                console.error(
                    'Failed to load course offerings:',
                    err
                );

                console.error(
                    'Server response:',
                    err.response?.data
                );

                setOfferings([]);
                setCourses([]);

                setError(
                    'Failed to load course offerings.'
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        if (user?.id) {
            fetchOptions();
        }
    }, [isAdmin, user]);

    const getOfferingLabel = (offering) => {
        const course = courses.find(
            (c) => c.id === offering.course_id
        );

        return course
            ? `${course.course_code} - ${course.course_name}`
            : `Offering #${offering.id}`;
    };

    // Load class roster
    const loadClass = async () => {
        if (!selectedOfferingId || !selectedDate) {
            return;
        }

        setLoadingClass(true);
        setError('');
        setMessage('');

        try {
            const [
                studentsRes,
                enrollmentsRes,
                attendanceRes
            ] = await Promise.all([
                api.get('/students?limit=1000'),
                api.get('/enrollments?limit=1000'),
                api.get('/attendance?limit=1000'),
            ]);

            const students = getArray(
                studentsRes,
                'students'
            );

            const enrollments = getArray(
                enrollmentsRes,
                'enrollments'
            );

            const attendance = getArray(
                attendanceRes,
                'attendance'
            );

            const enrolledStudentIds = enrollments
                .filter(
                    (e) =>
                        e.course_offering_id ===
                            Number(selectedOfferingId) &&
                        e.status === 'enrolled'
                )
                .map((e) => e.student_id);

            const existingAttendance = attendance.filter(
                (a) =>
                    a.course_offering_id ===
                        Number(selectedOfferingId) &&
                    a.attendance_date
                        ?.split('T')[0] === selectedDate
            );

            const roster = enrolledStudentIds.map(
                (studentId) => {
                    const student = students.find(
                        (s) => s.id === studentId
                    );

                    const existing =
                        existingAttendance.find(
                            (a) =>
                                a.student_id ===
                                studentId
                        );

                    return {
                        studentId,
                        name: student
                            ? `${student.first_name} ${student.last_name}`
                            : `Student #${studentId}`,
                        attendanceId:
                            existing?.id || null,
                        status:
                            existing?.status ||
                            'present',
                        remarks:
                            existing?.remarks || '',
                    };
                }
            );

            setRows(roster);

        } catch (err) {
            console.error(
                'Failed to load class roster:',
                err
            );

            console.error(
                'Server response:',
                err.response?.data
            );

            setRows([]);
            setError(
                'Failed to load class roster.'
            );
        } finally {
            setLoadingClass(false);
        }
    };

    const updateRow = (
        studentId,
        field,
        value
    ) => {
        setRows((currentRows) =>
            currentRows.map((r) =>
                r.studentId === studentId
                    ? {
                          ...r,
                          [field]: value,
                      }
                    : r
            )
        );
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            await Promise.all(
                rows.map((r) => {
                    if (r.attendanceId) {
                        return api.put(
                            `/attendance/${r.attendanceId}`,
                            {
                                status: r.status,
                                remarks: r.remarks,
                            }
                        );
                    }

                    return api.post(
                        '/attendance',
                        {
                            student_id: r.studentId,
                            course_offering_id:
                                Number(
                                    selectedOfferingId
                                ),
                            attendance_date:
                                selectedDate,
                            status: r.status,
                            remarks: r.remarks,
                        }
                    );
                })
            );

            setMessage(
                'Attendance saved successfully.'
            );

            loadClass();

        } catch (err) {
            console.error(
                'Failed to save attendance:',
                err
            );

            setError(
                err.response?.data?.error ||
                'Failed to save attendance for one or more students.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h2 className="mb-3">
                Mark Attendance
            </h2>

            {loadingOptions ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="row mb-3">

                        <div className="col-md-6">
                            <label className="form-label">
                                Course Offering
                            </label>

                            <select
                                className="form-select"
                                value={selectedOfferingId}
                                onChange={(e) =>
                                    setSelectedOfferingId(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select a course offering
                                </option>

                                {offerings.map((o) => (
                                    <option
                                        key={o.id}
                                        value={o.id}
                                    >
                                        {getOfferingLabel(o)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">
                                Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-primary w-100"
                                onClick={loadClass}
                                disabled={
                                    !selectedOfferingId
                                }
                            >
                                Load Class
                            </button>
                        </div>

                    </div>

                    {loadingClass && (
                        <p>
                            Loading class roster...
                        </p>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {rows.length > 0 &&
                        !loadingClass && (
                            <>
                                <table className="table table-striped">

                                    <thead>
                                        <tr>
                                            <th>
                                                Student
                                            </th>

                                            <th
                                                style={{
                                                    width: '160px',
                                                }}
                                            >
                                                Status
                                            </th>

                                            <th>
                                                Remarks
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((r) => (
                                            <tr
                                                key={
                                                    r.studentId
                                                }
                                            >
                                                <td>
                                                    {r.name}
                                                </td>

                                                <td>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={
                                                            r.status
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateRow(
                                                                r.studentId,
                                                                'status',
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="present">
                                                            Present
                                                        </option>

                                                        <option value="absent">
                                                            Absent
                                                        </option>

                                                        <option value="late">
                                                            Late
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={
                                                            r.remarks
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateRow(
                                                                r.studentId,
                                                                'remarks',
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>

                                <button
                                    className="btn btn-success"
                                    onClick={
                                        handleSaveAll
                                    }
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : 'Save Attendance'}
                                </button>
                            </>
                        )}

                    {rows.length === 0 &&
                        !loadingClass &&
                        selectedOfferingId && (
                            <p className="text-muted">
                                No enrolled students
                                found, or class not
                                loaded yet.
                            </p>
                        )}
                </>
            )}
        </Layout>
    );
}

export default AttendanceEntry;