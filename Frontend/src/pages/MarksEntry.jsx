import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const MARK_TYPES = {
    quiz: {
        label: 'Quiz',
        endpoint: '/quiz-marks',
        numberField: 'quiz_number',
        numberLabel: 'Quiz Number'
    },
    assignment: {
        label: 'Assignment',
        endpoint: '/assignment-marks',
        numberField: 'assignment_number',
        numberLabel: 'Assignment Number'
    },
    exam: {
        label: 'Exam',
        endpoint: '/exam-marks',
        numberField: 'exam_type',
        numberLabel: 'Exam Type (e.g. midterm, final)'
    }
};

// Safely convert API responses into arrays
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

function MarksEntry() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState('quiz');

    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);

    const [selectedOfferingId, setSelectedOfferingId] = useState('');
    const [numberValue, setNumberValue] = useState('');
    const [totalMarks, setTotalMarks] = useState('');

    const [rows, setRows] = useState([]);

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Load course offerings and courses
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [offeringsRes, coursesRes] = await Promise.all([
                    api.get('/course-offerings'),
                    api.get('/courses'),
                ]);

                let myOfferings = getArray(offeringsRes, 'offerings');
                const courseList = getArray(coursesRes, 'courses');

                // If user is not admin, only show their own course offerings
                if (!isAdmin && user?.id) {
                    const teachersRes = await api.get('/teachers');

                    const teachers = getArray(teachersRes, 'teachers');

                    const myTeacherRecord = teachers.find(
                        (t) => t.user_id === user.id
                    );

                    myOfferings = myOfferings.filter(
                        (o) => o.teacher_id === myTeacherRecord?.id
                    );
                }

                setOfferings(myOfferings);
                setCourses(courseList);

            } catch (err) {
                console.error('Error loading options:', err);
                setError('Failed to load course offerings.');
            } finally {
                setLoadingOptions(false);
            }
        };

        if (user?.id) {
            fetchOptions();
        }
    }, [isAdmin, user]);

    // Get course label for offering
    const getOfferingLabel = (offering) => {
        const course = courses.find(
            (c) => c.id === offering.course_id
        );

        return course
            ? `${course.course_code} - ${course.course_name}`
            : `Offering #${offering.id}`;
    };

    const config = MARK_TYPES[activeTab];

    // Switch between Quiz / Assignment / Exam
    const switchTab = (tab) => {
        setActiveTab(tab);
        setRows([]);
        setNumberValue('');
        setTotalMarks('');
        setError('');
        setMessage('');
    };

    // Load students enrolled in selected course offering
    const loadClass = async () => {
        if (!selectedOfferingId || !numberValue) {
            setError(
                `Please select a course offering and enter the ${config.numberLabel}.`
            );
            return;
        }

        setLoadingClass(true);
        setError('');
        setMessage('');

        try {
            const [studentsRes, enrollmentsRes, marksRes] =
                await Promise.all([
                    api.get('/students'),
                    api.get('/enrollments'),
                    api.get(config.endpoint),
                ]);

            const students = getArray(studentsRes, 'students');
            const enrollments = getArray(
                enrollmentsRes,
                'enrollments'
            );
            const marks = getArray(
                marksRes,
                activeTab === 'quiz'
                    ? 'quizMarks'
                    : activeTab === 'assignment'
                        ? 'assignmentMarks'
                        : 'examMarks'
            );

            // Get IDs of enrolled students
            const enrolledStudentIds = enrollments
                .filter(
                    (e) =>
                        e.course_offering_id ===
                            Number(selectedOfferingId) &&
                        e.status === 'enrolled'
                )
                .map((e) => e.student_id);

            // Get existing marks for selected assessment
            const existingMarks = marks.filter(
                (m) =>
                    m.course_offering_id ===
                        Number(selectedOfferingId) &&
                    String(m[config.numberField]) ===
                        String(numberValue)
            );

            // Build student roster
            const roster = enrolledStudentIds.map((studentId) => {
                const student = students.find(
                    (s) => s.id === studentId
                );

                const existing = existingMarks.find(
                    (m) => m.student_id === studentId
                );

                return {
                    studentId,
                    name: student
                        ? `${student.first_name} ${student.last_name}`
                        : `Student #${studentId}`,
                    markId: existing?.id || null,
                    marksObtained:
                        existing?.marks_obtained ?? '',
                };
            });

            // Automatically populate total marks if existing marks are found
            if (existingMarks.length > 0 && !totalMarks) {
                setTotalMarks(
                    String(existingMarks[0].total_marks)
                );
            }

            setRows(roster);

        } catch (err) {
            console.error('Error loading class:', err);
            setError('Failed to load class roster.');
        } finally {
            setLoadingClass(false);
        }
    };

    // Update individual student's marks
    const updateRow = (studentId, value) => {
        setRows((prevRows) =>
            prevRows.map((r) =>
                r.studentId === studentId
                    ? {
                        ...r,
                        marksObtained: value
                    }
                    : r
            )
        );
    };

    // Save all marks
    const handleSaveAll = async () => {
        if (!totalMarks) {
            setError(
                'Please enter the total marks for this assessment.'
            );
            return;
        }

        setSaving(true);
        setError('');
        setMessage('');

        try {
            await Promise.all(
                rows
                    .filter(
                        (r) => r.marksObtained !== ''
                    )
                    .map((r) => {
                        const payload = {
                            total_marks: Number(totalMarks),
                            marks_obtained: Number(
                                r.marksObtained
                            ),
                        };

                        // Update existing mark
                        if (r.markId) {
                            return api.put(
                                `${config.endpoint}/${r.markId}`,
                                payload
                            );
                        }

                        // Create new mark
                        return api.post(
                            config.endpoint,
                            {
                                student_id: r.studentId,
                                course_offering_id:
                                    Number(
                                        selectedOfferingId
                                    ),
                                [config.numberField]:
                                    numberValue,
                                ...payload,
                            }
                        );
                    })
            );

            setMessage('Marks saved successfully.');

            // Reload marks after saving
            await loadClass();

        } catch (err) {
            console.error('Error saving marks:', err);

            setError(
                err.response?.data?.error ||
                'Failed to save marks for one or more students.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h2 className="mb-3">Enter Marks</h2>

            {/* MARK TYPE TABS */}
            <ul className="nav nav-tabs mb-3">
                {Object.entries(MARK_TYPES).map(
                    ([key, val]) => (
                        <li
                            className="nav-item"
                            key={key}
                        >
                            <button
                                className={`nav-link ${
                                    activeTab === key
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() =>
                                    switchTab(key)
                                }
                            >
                                {val.label}
                            </button>
                        </li>
                    )
                )}
            </ul>

            {loadingOptions ? (
                <p>Loading...</p>
            ) : (
                <>
                    {/* OPTIONS */}
                    <div className="row mb-3">

                        {/* COURSE OFFERING */}
                        <div className="col-md-5">
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

                        {/* QUIZ / ASSIGNMENT / EXAM NUMBER */}
                        <div className="col-md-3">
                            <label className="form-label">
                                {config.numberLabel}
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={numberValue}
                                onChange={(e) =>
                                    setNumberValue(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* TOTAL MARKS */}
                        <div className="col-md-2">
                            <label className="form-label">
                                Total Marks
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={totalMarks}
                                onChange={(e) =>
                                    setTotalMarks(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* LOAD CLASS */}
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-primary w-100"
                                onClick={loadClass}
                            >
                                Load Class
                            </button>
                        </div>
                    </div>

                    {/* LOADING */}
                    {loadingClass && (
                        <p>Loading class roster...</p>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {message && (
                        <div className="alert alert-success">
                            {message}
                        </div>
                    )}

                    {/* STUDENT MARKS TABLE */}
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
                                                    width: '160px'
                                                }}
                                            >
                                                Marks Obtained
                                                {' '}
                                                (out of{' '}
                                                {totalMarks ||
                                                    '?'}
                                                )
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
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={
                                                            r.marksObtained
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateRow(
                                                                r.studentId,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        max={
                                                            totalMarks ||
                                                            undefined
                                                        }
                                                        min="0"
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
                                        : 'Save Marks'}
                                </button>
                            </>
                        )}

                    {/* NO STUDENTS */}
                    {rows.length === 0 &&
                        !loadingClass &&
                        selectedOfferingId && (
                            <p className="text-muted">
                                No enrolled students found,
                                or class not loaded yet.
                            </p>
                        )}
                </>
            )}
        </Layout>
    );
}

export default MarksEntry;