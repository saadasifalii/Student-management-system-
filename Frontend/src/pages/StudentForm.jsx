import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { extractPaginated } from '../utils/listHelper';

function StudentForm({ student, onClose, onSaved }) {
    const isEditing = !!student;

    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [formData, setFormData] = useState({
        user_id: '',
        department_id: '',
        degree_program_id: '',
        roll_number: '',
        registration_number: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        address: '',
        admission_date: '',
        batch_year: '',
        status: 'active',
    });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // ==========================================
    // LOAD AVAILABLE STUDENT LOGIN ACCOUNTS
    // ==========================================
    useEffect(() => {
        const fetchAvailableUsers = async () => {
            try {
                setLoadingUsers(true);
                setError('');

                const response = await api.get(
                    '/users?role=student&available=true'
                );

                const { list } = extractPaginated(response.data);
                setAvailableUsers(list);

            } catch (err) {
                console.error(
                    'Failed to load student login accounts:',
                    err
                );

                setError(
                    err.response?.data?.error ||
                    'Failed to load available student accounts.'
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        /*
         * When adding a new student, load only
         * unlinked student accounts.
         *
         * When editing, we don't need the dropdown
         * because the existing user_id is already known.
         */
        if (!isEditing) {
            fetchAvailableUsers();
        }
    }, [isEditing]);

    // ==========================================
    // LOAD EXISTING STUDENT WHEN EDITING
    // ==========================================
    useEffect(() => {
        if (student) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                user_id: student.user_id || '',
                department_id: student.department_id || '',
                degree_program_id: student.degree_program_id || '',
                roll_number: student.roll_number || '',
                registration_number: student.registration_number || '',
                first_name: student.first_name || '',
                last_name: student.last_name || '',
                date_of_birth:
                    student.date_of_birth?.split('T')[0] || '',
                gender: student.gender || '',
                phone: student.phone || '',
                address: student.address || '',
                admission_date:
                    student.admission_date?.split('T')[0] || '',
                batch_year: student.batch_year || '',
                status: student.status || 'active',
            });
        }
    }, [student]);

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ==========================================
    // SUBMIT
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSaving(true);

        try {
            if (isEditing) {
                await api.put(
                    `/students/${student.id}`,
                    formData
                );
            } else {
                await api.post(
                    '/students',
                    formData
                );
            }

            onSaved();

        } catch (err) {
            console.error('Student save error:', err);

            setError(
                err.response?.data?.error ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="modal-backdrop-custom"
            onClick={onClose}
        >
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()}
            >

                <h4 className="mb-3">
                    {isEditing ? 'Edit Student' : 'Add Student'}
                </h4>

                <form onSubmit={handleSubmit}>

                    <div className="row">

                        {/* =====================================
                            LOGIN ACCOUNT
                        ====================================== */}
                        {!isEditing && (
                            <div className="col-12 mb-3">

                                <label className="form-label">
                                    Login Account
                                </label>

                                <select
                                    name="user_id"
                                    className="form-select"
                                    value={formData.user_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingUsers}
                                >
                                    <option value="">
                                        {loadingUsers
                                            ? 'Loading student accounts...'
                                            : 'Select student login account'}
                                    </option>

                                    {availableUsers.map((user) => (
                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name} — {user.email}
                                        </option>
                                    ))}
                                </select>

                                {!loadingUsers &&
                                    availableUsers.length === 0 && (
                                        <div className="form-text text-danger">
                                            No available student login
                                            accounts found. Create a
                                            Student account from the
                                            Users page first.
                                        </div>
                                    )}

                                {!loadingUsers &&
                                    availableUsers.length > 0 && (
                                        <div className="form-text">
                                            Select the login account that
                                            belongs to this student.
                                        </div>
                                    )}

                            </div>
                        )}

                        {/* =====================================
                            DEPARTMENT
                        ====================================== */}
                        {!isEditing && (
                            <>
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Department ID
                                    </label>

                                    <input
                                        type="number"
                                        name="department_id"
                                        className="form-control"
                                        value={formData.department_id}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* =====================================
                                    DEGREE PROGRAM
                                ====================================== */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Degree Program ID
                                    </label>

                                    <input
                                        type="number"
                                        name="degree_program_id"
                                        className="form-control"
                                        value={formData.degree_program_id}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* =====================================
                                    ROLL NUMBER
                                ====================================== */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Roll Number
                                    </label>

                                    <input
                                        type="text"
                                        name="roll_number"
                                        className="form-control"
                                        value={formData.roll_number}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* =====================================
                                    REGISTRATION NUMBER
                                ====================================== */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Registration Number
                                    </label>

                                    <input
                                        type="text"
                                        name="registration_number"
                                        className="form-control"
                                        value={formData.registration_number}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>
                            </>
                        )}

                        {/* =====================================
                            FIRST NAME
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                First Name
                            </label>

                            <input
                                type="text"
                                name="first_name"
                                className="form-control"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        {/* =====================================
                            LAST NAME
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="last_name"
                                className="form-control"
                                value={formData.last_name}
                                onChange={handleChange}
                            />

                        </div>

                        {/* =====================================
                            DATE OF BIRTH
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="date_of_birth"
                                className="form-control"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />

                        </div>

                        {/* =====================================
                            GENDER
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Gender
                            </label>

                            <select
                                name="gender"
                                className="form-select"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">
                                    Select
                                </option>

                                <option value="male">
                                    Male
                                </option>

                                <option value="female">
                                    Female
                                </option>
                            </select>

                        </div>

                        {/* =====================================
                            PHONE
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                        </div>

                        {/* =====================================
                            BATCH YEAR
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Batch Year
                            </label>

                            <input
                                type="number"
                                name="batch_year"
                                className="form-control"
                                value={formData.batch_year}
                                onChange={handleChange}
                            />

                        </div>

                        {/* =====================================
                            ADMISSION DATE
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Admission Date
                            </label>

                            <input
                                type="date"
                                name="admission_date"
                                className="form-control"
                                value={formData.admission_date}
                                onChange={handleChange}
                            />

                        </div>

                        {/* =====================================
                            STATUS
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Status
                            </label>

                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="graduated">
                                    Graduated
                                </option>

                                <option value="withdrawn">
                                    Withdrawn
                                </option>
                            </select>

                        </div>

                        {/* =====================================
                            ADDRESS
                        ====================================== */}
                        <div className="col-12 mb-2">

                            <label className="form-label">
                                Address
                            </label>

                            <input
                                type="text"
                                name="address"
                                className="form-control"
                                value={formData.address}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="alert alert-danger py-2 mt-2">
                            {error}
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="d-flex justify-content-end gap-2 mt-3">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || loadingUsers}
                        >
                            {saving
                                ? 'Saving...'
                                : 'Save'}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default StudentForm;