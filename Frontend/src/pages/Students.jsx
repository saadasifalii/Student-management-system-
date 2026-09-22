import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StudentForm from './StudentForm';
import { extractPaginated } from '../utils/listHelper';

function Students() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageLimit = 10;

    const isAdmin = user?.role === 'admin';

    const fetchStudents = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/students?page=${page}&limit=${pageLimit}`);
            const { list, pagination } = extractPaginated(response.data);
            setStudents(list);
            if (pagination) {
                setCurrentPage(pagination.currentPage || page);
                setTotalPages(pagination.totalPages || 1);
            } else {
                setCurrentPage(1);
                setTotalPages(1);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStudents(1);
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchStudents(page);
    };

    const handleAddClick = () => {
        setEditingStudent(null);
        setShowForm(true);
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.delete(`/students/${id}`);
            fetchStudents(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete student.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchStudents(currentPage);
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Students</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Student
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Roll Number</th>
                                <th>Name</th>
                                <th>Registration Number</th>
                                <th>Batch Year</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.roll_number}</td>
                                    <td>{s.first_name} {s.last_name}</td>
                                    <td>{s.registration_number}</td>
                                    <td>{s.batch_year}</td>
                                    <td>
                                        <span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(s)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {students.length === 0 && (
                        <p className="text-muted">No students found.</p>
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">Page {currentPage} of {totalPages}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                                    Previous
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <StudentForm
                    student={editingStudent}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default Students;