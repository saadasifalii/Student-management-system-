import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StudentForm from './StudentForm';

function Students() {
    const { user } = useAuth();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchStudents = async () => {
        setLoading(true);

        try {
            const response = await api.get('/students');
            setStudents(response.data);
        } catch {
            setError('Failed to load students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStudents();
    }, []);

    const handleAddClick = () => {
        setEditingStudent(null);
        setShowForm(true);
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        try {
            await api.delete(`/students/${id}`);
            fetchStudents();
        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to delete student.'
            );
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchStudents();
    };

    return (
        <Layout>
            <div className="container mt-4">

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Students</h2>

                    {isAdmin && (
                        <button
                            className="btn btn-primary"
                            onClick={handleAddClick}
                        >
                            + Add Student
                        </button>
                    )}
                </div>

                {loading && <p>Loading...</p>}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {!loading && !error && (
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

                                    <td>
                                        {s.first_name} {s.last_name}
                                    </td>

                                    <td>{s.registration_number}</td>

                                    <td>{s.batch_year}</td>

                                    <td>
                                        <span
                                            className={`badge ${
                                                s.status === 'active'
                                                    ? 'bg-success'
                                                    : 'bg-secondary'
                                            }`}
                                        >
                                            {s.status}
                                        </span>
                                    </td>

                                    {isAdmin && (
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() =>
                                                    handleEditClick(s)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDelete(s.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {students.length === 0 &&
                    !loading &&
                    !error && (
                        <p className="text-muted">
                            No students found.
                        </p>
                    )}

            </div>

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