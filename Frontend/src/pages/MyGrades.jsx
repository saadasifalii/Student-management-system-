import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
// eslint-disable-next-line no-unused-vars
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { extractList } from '../utils/listHelper';

const MARK_TYPES = {
    quiz: { label: 'Quizzes', endpoint: '/quiz-marks', numberField: 'quiz_number', numberLabel: 'Quiz #' },
    assignment: { label: 'Assignments', endpoint: '/assignment-marks', numberField: 'assignment_number', numberLabel: 'Assignment #' },
    exam: { label: 'Exams', endpoint: '/exam-marks', numberField: 'exam_type', numberLabel: 'Exam' },
};

function MyGrades() {
    const [activeTab, setActiveTab] = useState('quiz');
    const [offerings, setOfferings] = useState([]);
    const [courses, setCourses] = useState([]);
    const [marksByType, setMarksByType] = useState({ quiz: [], assignment: [], exam: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const myStudentRes = await api.get('/students/me');
                const myStudent = myStudentRes.data;

                const [quizRes, assignmentRes, examRes, offeringsRes, coursesRes] = await Promise.all([
                    api.get(`/quiz-marks/student/${myStudent.id}`),
                    api.get(`/assignment-marks/student/${myStudent.id}`),
                    api.get(`/exam-marks/student/${myStudent.id}`),
                    api.get('/course-offerings?limit=1000'),
                    api.get('/courses?limit=1000'),
                ]);

                setMarksByType({
                    quiz: extractList(quizRes.data),
                    assignment: extractList(assignmentRes.data),
                    exam: extractList(examRes.data),
                });
                setOfferings(extractList(offeringsRes.data.courseOfferings || offeringsRes.data));
                setCourses(extractList(coursesRes.data));
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load your grades.');
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

    const config = MARK_TYPES[activeTab];
    const currentRecords = marksByType[activeTab];

    return (
        <Layout>
            <h2 className="mb-3">My Grades</h2>

            <ul className="nav nav-tabs mb-3">
                {Object.entries(MARK_TYPES).map(([key, val]) => (
                    <li className="nav-item" key={key}>
                        <button
                            className={`nav-link ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {val.label}
                        </button>
                    </li>
                ))}
            </ul>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>{config.numberLabel}</th>
                            <th>Marks Obtained</th>
                            <th>Total Marks</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRecords.map((m) => (
                            <tr key={m.id}>
                                <td>{getCourseLabel(m.course_offering_id)}</td>
                                <td>{m[config.numberField]}</td>
                                <td>{m.marks_obtained}</td>
                                <td>{m.total_marks}</td>
                                <td>{((m.marks_obtained / m.total_marks) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {currentRecords.length === 0 && !loading && !error && (
                <p className="text-muted">No {config.label.toLowerCase()} recorded yet.</p>
            )}
        </Layout>
    );
}

export default MyGrades;