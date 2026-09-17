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

function SemesterResults() {
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin';

    const [results, setResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        student_id: '',
        semester_id: '',
        total_credit_hours: '',
        total_quality_points: '',
        semester_gpa: '',
        academic_status: 'good',
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    // Fetch semester results, students and semesters
    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const [
                resultsRes,
                studentsRes,
                semestersRes,
            ] = await Promise.all([
                api.get('/semester-results'),
                api.get('/students'),
                api.get('/semesters'),
            ]);

            setResults(
                getArray(
                    resultsRes,
                    'results'
                )
            );

            setStudents(
                getArray(
                    studentsRes,
                    'students'
                )
            );

            setSemesters(
                getArray(
                    semestersRes,
                    'semesters'
                )
            );

        } catch (err) {
            console.error(
                'Error loading semester results:',
                err
            );

            setError(
                err.response?.data?.error ||
                'Failed to load semester results.'
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

    // Get semester name
    const getSemesterName = (id) => {
        const semester = semesters.find(
            (s) => s.id === id
        );

        return semester?.name || '—';
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

    // Submit new semester result
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError('');
        setSaving(true);

        try {
            await api.post(
                '/semester-results',
                formData
            );

            setShowForm(false);

            setFormData({
                student_id: '',
                semester_id: '',
                total_credit_hours: '',
                total_quality_points: '',
                semester_gpa: '',
                academic_status: 'good',
            });

            await fetchData();

        } catch (err) {
            console.error(
                'Error saving semester result:',
                err
            );

            setFormError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to save result.'
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete semester result
    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Delete this semester result?'
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/semester-results/${id}`
            );

            await fetchData();

        } catch (err) {
            console.error(
                'Error deleting semester result:',
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
                    Semester Results
                </h2>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setFormError('');
                            setShowForm(true);
                        }}
                    >
                        + Add Result
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

            {/* RESULTS TABLE */}
            {!loading &&
                !error &&
                results.length > 0 && (

                    <div className="table-responsive">

                        <table className="table table-striped table-hover">

                            <thead>
                                <tr>
                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Credit Hours
                                    </th>

                                    <th>
                                        Quality Points
                                    </th>

                                    <th>
                                        GPA
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    {isAdmin && (
                                        <th>
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>

                                {results.map(
                                    (r) => (
                                        <tr
                                            key={r.id}
                                        >

                                            {/* STUDENT */}
                                            <td>
                                                {getStudentName(
                                                    r.student_id
                                                )}
                                            </td>

                                            {/* SEMESTER */}
                                            <td>
                                                {getSemesterName(
                                                    r.semester_id
                                                )}
                                            </td>

                                            {/* CREDIT HOURS */}
                                            <td>
                                                {
                                                    r.total_credit_hours
                                                }
                                            </td>

                                            {/* QUALITY POINTS */}
                                            <td>
                                                {
                                                    r.total_quality_points
                                                }
                                            </td>

                                            {/* GPA */}
                                            <td>
                                                {
                                                    r.semester_gpa
                                                }
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        r.academic_status ===
                                                        'good'
                                                            ? 'bg-success'
                                                            : 'bg-warning text-dark'
                                                    }`}
                                                >
                                                    {
                                                        r.academic_status
                                                    }
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            {isAdmin && (
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                r.id
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

            {/* NO RESULTS */}
            {!loading &&
                !error &&
                results.length === 0 && (
                    <p className="text-muted">
                        No semester results found.
                    </p>
                )}

            {/* ADD RESULT MODAL */}
            {showForm && (

                <div
                    className="modal-backdrop-custom"
                    onClick={() =>
                        setShowForm(false)
                    }
                >

                    <div
                        className="modal-box"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h4 className="mb-3">
                            Add Semester Result
                        </h4>

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

                            {/* SEMESTER */}
                            <div className="mb-2">

                                <label className="form-label">
                                    Semester
                                </label>

                                <select
                                    name="semester_id"
                                    className="form-select"
                                    value={
                                        formData.semester_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >
                                    <option value="">
                                        Select a semester
                                    </option>

                                    {semesters.map(
                                        (s) => (
                                            <option
                                                key={s.id}
                                                value={s.id}
                                            >
                                                {s.name}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* MARKS / GPA */}
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
                                        required
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
                                        required
                                    />

                                </div>

                                {/* GPA */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Semester GPA
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        name="semester_gpa"
                                        className="form-control"
                                        value={
                                            formData.semester_gpa
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                                {/* ACADEMIC STATUS */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Academic Status
                                    </label>

                                    <select
                                        name="academic_status"
                                        className="form-select"
                                        value={
                                            formData.academic_status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="good">
                                            Good
                                        </option>

                                        <option value="probation">
                                            Probation
                                        </option>
                                    </select>

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

export default SemesterResults;