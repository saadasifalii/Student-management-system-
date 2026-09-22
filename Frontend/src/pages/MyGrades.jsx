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
    const [paginationByType, setPaginationByType] = useState({
        quiz: { currentPage: 1, totalPages: 1, totalCount: 0 },
        assignment: { currentPage: 1, totalPages: 1, totalCount: 0 },
        exam: { currentPage: 1, totalPages: 1, totalCount: 0 },
    });
    const pageLimit = 10;

    const fetchData = async (page = 1) => {
            try {
                const myStudentRes = await api.get('/students/me');
                const myStudent = myStudentRes.data;

                const [quizRes, assignmentRes, examRes, offeringsRes, coursesRes] = await Promise.all([
                    api.get(`/quiz-marks/student/${myStudent.id}?page=${page}&limit=${pageLimit}`),
                    api.get(`/assignment-marks/student/${myStudent.id}?page=${page}&limit=${pageLimit}`),
                    api.get(`/exam-marks/student/${myStudent.id}?page=${page}&limit=${pageLimit}`),
                    api.get('/course-offerings?limit=1000'),
                    api.get('/courses?limit=1000'),
                ]);

                setMarksByType({
                    quiz: extractList(quizRes.data),
                    assignment: extractList(assignmentRes.data),
                    exam: extractList(examRes.data),
                });
                setPaginationByType({
                    quiz: {
                        currentPage: quizRes.data.pagination?.currentPage || page,
                        totalPages: quizRes.data.pagination?.totalPages || 1,
                        totalCount: quizRes.data.pagination?.totalQuizMarks || 0,
                    },
                    assignment: {
                        currentPage: assignmentRes.data.pagination?.currentPage || page,
                        totalPages: assignmentRes.data.pagination?.totalPages || 1,
                        totalCount: assignmentRes.data.pagination?.totalAssignmentMarks || 0,
                    },
                    exam: {
                        currentPage: examRes.data.pagination?.currentPage || page,
                        totalPages: examRes.data.pagination?.totalPages || 1,
                        totalCount: examRes.data.pagination?.totalExamMarks || 0,
                    },
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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
    const activePagination = paginationByType[activeTab];
    const goToPage = (page) => {
        if (page < 1 || page > activePagination.totalPages) return;
        fetchData(page);
    };

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
                <>
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
                {activePagination.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="text-muted small">Showing page {activePagination.currentPage} of {activePagination.totalPages} ({activePagination.totalCount} total)</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(activePagination.currentPage - 1)} disabled={activePagination.currentPage <= 1}>Previous</button>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(activePagination.currentPage + 1)} disabled={activePagination.currentPage >= activePagination.totalPages}>Next</button>
                        </div>
                    </div>
                )}
                </>
            )}

            {currentRecords.length === 0 && !loading && !error && (
                <p className="text-muted">No {config.label.toLowerCase()} recorded yet.</p>
            )}
        </Layout>
    );
}

export default MyGrades;