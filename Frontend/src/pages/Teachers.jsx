import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import TeacherForm from './TeacherForm';

function Teachers() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const isAdmin = user?.role === 'admin';

    const fetchTeachers = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/teachers');

            // Handle different backend response formats
            if (Array.isArray(response.data)) {
                setTeachers(response.data);
            } else if (Array.isArray(response.data.teachers)) {
                setTeachers(response.data.teachers);
            } else if (Array.isArray(response.data.data)) {
                setTeachers(response.data.data);
            } else {
                setTeachers([]);
            }

        } catch (err) {
            console.error('Failed to load teachers:', err);
            console.error('Server response:', err.response?.data);

            setTeachers([]);
            setError('Failed to load teachers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTeachers();
    }, []);

    const handleAddClick = () => {
        setEditingTeacher(null);
        setShowForm(true);
    };

    const handleEditClick = (teacher) => {
        setEditingTeacher(teacher);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this teacher?'
            )
        ) {
            return;
        }

        try {
            await api.delete(`/teachers/${id}`);

            fetchTeachers();

        } catch (err) {
            console.error('Delete teacher error:', err);

            alert(
                err.response?.data?.error ||
                'Failed to delete teacher.'
            );
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchTeachers();
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>Teachers</h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={handleAddClick}
                    >
                        + Add Teacher
                    </button>
                )}

            </div>

            {loading && (
                <p>Loading...</p>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {!loading && !error && teachers.length > 0 && (
                <table className="table table-striped table-hover">

                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Phone</th>
                            <th>Status</th>

                            {isAdmin && (
                                <th>Actions</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {teachers.map((t) => (
                            <tr key={t.id}>

                                <td>
                                    {t.employee_id}
                                </td>

                                <td>
                                    {t.first_name} {t.last_name}
                                </td>

                                <td>
                                    {t.designation}
                                </td>

                                <td>
                                    {t.phone}
                                </td>

                                <td>
                                    <span
                                        className={`badge ${
                                            t.status === 'active'
                                                ? 'bg-success'
                                                : 'bg-secondary'
                                        }`}
                                    >
                                        {t.status}
                                    </span>
                                </td>

                                {isAdmin && (
                                    <td>

                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() =>
                                                handleEditClick(t)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() =>
                                                handleDelete(t.id)
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

            {!loading &&
                !error &&
                teachers.length === 0 && (
                    <p className="text-muted">
                        No teachers found.
                    </p>
                )}

            {showForm && (
                <TeacherForm
                    teacher={editingTeacher}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}

        </Layout>
    );
}

export default Teachers;