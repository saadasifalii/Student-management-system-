import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const MARK_TYPES = {
    quiz: { label: 'Quiz', endpoint: '/quiz-marks', numberField: 'quiz_number', numberLabel: 'Quiz Number' },
    assignment: { label: 'Assignment', endpoint: '/assignment-marks', numberField: 'assignment_number', numberLabel: 'Assignment Number' },
    exam: { label: 'Exam', endpoint: '/exam-marks', numberField: 'exam_type', numberLabel: 'Exam Type (e.g. midterm, final)' },
};

function MarksEntry() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState('quiz');
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedOfferingId, setSelectedOfferingId] = useState('');
    const [numberValue, setNumberValue] = useState(''); // quiz_number / assignment_number / exam_type
    const [totalMarks, setTotalMarks] = useState('');
    const [rows, setRows] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingClass, setLoadingClass] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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

    const config = MARK_TYPES[activeTab];

    const switchTab = (tab) => {
        setActiveTab(tab);
        setRows([]);
        setNumberValue('');
        setTotalMarks('');
        setError('');
        setMessage('');
    };

    const loadClass = async () => {
        if (!selectedOfferingId || !numberValue) {
            setError(`Please select a course offering and enter the ${config.numberLabel}.`);
            return;
        }
        setLoadingClass(true);
        setError('');
        setMessage('');

        try {
            const [studentsRes, enrollmentsRes, marksRes] = await Promise.all([
                api.get('/students'),
                api.get('/enrollments'),
                api.get(config.endpoint),
            ]);

            const enrolledStudentIds = enrollmentsRes.data
                .filter((e) => e.course_offering_id === Number(selectedOfferingId) && e.status === 'enrolled')
                .map((e) => e.student_id);

            const existingMarks = marksRes.data.filter(
                (m) => m.course_offering_id === Number(selectedOfferingId) && String(m[config.numberField]) === String(numberValue)
            );

            const roster = enrolledStudentIds.map((studentId) => {
                const student = studentsRes.data.find((s) => s.id === studentId);
                const existing = existingMarks.find((m) => m.student_id === studentId);
                return {
                    studentId,
                    name: student ? `${student.first_name} ${student.last_name}` : `Student #${studentId}`,
                    markId: existing?.id || null,
                    marksObtained: existing?.marks_obtained ?? '',
                };
            });

            if (existingMarks.length > 0 && !totalMarks) {
                setTotalMarks(String(existingMarks[0].total_marks));
            }

            setRows(roster);
        } catch (err) {
            console.error(err);
            setError('Failed to load class roster.');
        } finally {
            setLoadingClass(false);
        }
    };

    const updateRow = (studentId, value) => {
        setRows(rows.map((r) => (r.studentId === studentId ? { ...r, marksObtained: value } : r)));
    };

    const handleSaveAll = async () => {
        if (!totalMarks) {
            setError('Please enter the total marks for this assessment.');
            return;
        }
        setSaving(true);
        setError('');
        setMessage('');

        try {
            await Promise.all(
                rows
                    .filter((r) => r.marksObtained !== '')
                    .map((r) => {
                        const payload = {
                            total_marks: Number(totalMarks),
                            marks_obtained: Number(r.marksObtained),
                        };
                        if (r.markId) {
                            return api.put(`${config.endpoint}/${r.markId}`, payload);
                        } else {
                            return api.post(config.endpoint, {
                                student_id: r.studentId,
                                course_offering_id: Number(selectedOfferingId),
                                [config.numberField]: numberValue,
                                ...payload,
                            });
                        }
                    })
            );
            setMessage('Marks saved successfully.');
            loadClass();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save marks for one or more students.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <h2 className="mb-3">Enter Marks</h2>

            <ul className="nav nav-tabs mb-3">
                {Object.entries(MARK_TYPES).map(([key, val]) => (
                    <li className="nav-item" key={key}>
                        <button
                            className={`nav-link ${activeTab === key ? 'active' : ''}`}
                            onClick={() => switchTab(key)}
                        >
                            {val.label}
                        </button>
                    </li>
                ))}
            </ul>

            {loadingOptions ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="row mb-3">
                        <div className="col-md-5">
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
                        <div className="col-md-3">
                            <label className="form-label">{config.numberLabel}</label>
                            <input
                                type="text"
                                className="form-control"
                                value={numberValue}
                                onChange={(e) => setNumberValue(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Total Marks</label>
                            <input
                                type="number"
                                className="form-control"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-primary w-100" onClick={loadClass}>
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
                                        <th style={{ width: '160px' }}>Marks Obtained (out of {totalMarks || '?'})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r) => (
                                        <tr key={r.studentId}>
                                            <td>{r.name}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    value={r.marksObtained}
                                                    onChange={(e) => updateRow(r.studentId, e.target.value)}
                                                    max={totalMarks || undefined}
                                                    min="0"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn btn-success" onClick={handleSaveAll} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Marks'}
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

export default MarksEntry;