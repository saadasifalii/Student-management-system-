import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

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

function Cgpa() {
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin';

    const [cgpaList, setCgpaList] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        total_credit_hours: '',
        total_quality_points: '',
        cgpa: '',
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Fetch CGPA records and students
    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const [cgpaRes, studentsRes] =
                await Promise.all([
                    api.get('/cgpa'),
                    api.get('/students'),
                ]);

            setCgpaList(
                getArray(cgpaRes, 'cgpa')
            );

            setStudents(
                getArray(studentsRes, 'students')
            );

        } catch (err) {
            console.error(
                'Error loading CGPA records:',
                err
            );

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to load CGPA records.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    // Get student name
    const getStudentName = (id) => {
        const student = students.find(
            (s) => s.id === id
        );

        return student
            ? `${student.first_name} ${student.last_name} (${student.roll_number})`
            : '—';
    };

    // Form input change
    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save / update CGPA
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError('');
        setSaving(true);

        try {
            await api.post(
                '/cgpa',
                formData
            );

            setShowForm(false);

            setFormData({
                student_id: '',
                total_credit_hours: '',
                total_quality_points: '',
                cgpa: '',
            });

            await fetchData();

        } catch (err) {
            console.error(
                'Error saving CGPA:',
                err
            );

            setFormError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to save CGPA.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete CGPA record
    const handleDelete = async (studentId) => {
        if (
            !window.confirm(
                'Delete this CGPA record?'
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/cgpa/student/${studentId}`
            );

            await fetchData();

        } catch (err) {
            console.error(
                'Error deleting CGPA:',
                err
            );

            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to delete.'
            );
        }
    };

    return (
        <Layout>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>
                    CGPA Records
                </h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setFormError('');
                            setShowForm(true);
                        }}
                    >
                        + Add / Update CGPA
                    </button>
                )}

            </div>

            {/* LOADING */}
            {loading && (
                <p>
                    Loading...
                </p>
            )}

            {/* ERROR */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* CGPA TABLE */}
            {!loading &&
                !error &&
                cgpaList.length > 0 && (

                    <div className="table-responsive">

                        <table className="table table-striped table-hover">

                            <thead>
                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Total Credit Hours
                                    </th>

                                    <th>
                                        Total Quality Points
                                    </th>

                                    <th>
                                        CGPA
                                    </th>

                                    {isAdmin && (
                                        <th>
                                            Actions
                                        </th>
                                    )}

                                </tr>
                            </thead>

                            <tbody>

                                {cgpaList.map(
                                    (c) => (
                                        <tr
                                            key={c.id}
                                        >

                                            <td>
                                                {getStudentName(
                                                    c.student_id
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    c.total_credit_hours
                                                }
                                            </td>

                                            <td>
                                                {
                                                    c.total_quality_points
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {c.cgpa}
                                                </strong>
                                            </td>

                                            {isAdmin && (
                                                <td>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                c.student_id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </td>
                                            )}

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            {/* NO RECORDS */}
            {!loading &&
                !error &&
                cgpaList.length === 0 && (
                    <p className="text-muted">
                        No CGPA records found.
                    </p>
                )}

            {/* ADD / UPDATE CGPA MODAL */}
            {showForm && (

                <div
                    className="modal-backdrop-custom"
                    onClick={() => {
                        if (!saving) {
                            setShowForm(false);
                        }
                    }}
                >

                    <div
                        className="modal-box"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h4 className="mb-3">
                            Add / Update CGPA
                        </h4>

                        <p className="text-muted small">
                            If this student already has a
                            CGPA record, it will be updated
                            with the new values.
                        </p>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* STUDENT */}
                            <div className="mb-2">

                                <label className="form-label">
                                    Student
                                </label>

                                <select
                                    name="student_id"
                                    className="form-select"
                                    value={
                                        formData.student_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={saving}
                                >

                                    <option value="">
                                        Select a student
                                    </option>

                                    {students.map(
                                        (s) => (
                                            <option
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {
                                                    s.first_name
                                                }{' '}
                                                {
                                                    s.last_name
                                                }{' '}
                                                (
                                                {
                                                    s.roll_number
                                                }
                                                )
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="row">

                                {/* CREDIT HOURS */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Total Credit Hours
                                    </label>

                                    <input
                                        type="number"
                                        name="total_credit_hours"
                                        className="form-control"
                                        value={
                                            formData.total_credit_hours
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        required
                                        disabled={saving}
                                    />

                                </div>

                                {/* QUALITY POINTS */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Total Quality Points
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        name="total_quality_points"
                                        className="form-control"
                                        value={
                                            formData.total_quality_points
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        required
                                        disabled={saving}
                                    />

                                </div>

                                {/* CGPA */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        CGPA
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        name="cgpa"
                                        className="form-control"
                                        value={
                                            formData.cgpa
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0"
                                        max="4"
                                        required
                                        disabled={saving}
                                    />

                                </div>

                            </div>

                            {/* FORM ERROR */}
                            {formError && (
                                <div className="alert alert-danger py-2">
                                    {formError}
                                </div>
                            )}

                            {/* BUTTONS */}
                            <div className="d-flex justify-content-end gap-2 mt-3">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : 'Save'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </Layout>
    );
}

export default Cgpa;