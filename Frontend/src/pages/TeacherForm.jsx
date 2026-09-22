import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function TeacherForm({ teacher, onClose, onSaved }) {
    const isEditing = !!teacher;

    const [availableUsers, setAvailableUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [formData, setFormData] = useState({
        user_id: '',
        department_id: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        designation: '',
        phone: '',
        joining_date: '',
        status: 'active',
    });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // ==========================================
    // LOAD AVAILABLE TEACHER LOGIN ACCOUNTS
    // ==========================================
    useEffect(() => {
        const fetchAvailableUsers = async () => {
            try {
                setLoadingUsers(true);
                setError('');

                const response = await api.get(
                    '/users?role=teacher&available=true'
                );

                setAvailableUsers(response.data || []);

            } catch (err) {
                console.error(
                    'Failed to load teacher login accounts:',
                    err
                );

                setError(
                    err.response?.data?.error ||
                    'Failed to load available teacher accounts.'
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        /*
         * Only load available accounts when
         * creating a new teacher.
         */
        if (!isEditing) {
            fetchAvailableUsers();
        }
    }, [isEditing]);

    // ==========================================
    // LOAD EXISTING TEACHER WHEN EDITING
    // ==========================================
    useEffect(() => {
        if (teacher) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                user_id: teacher.user_id || '',
                department_id: teacher.department_id || '',
                employee_id: teacher.employee_id || '',
                first_name: teacher.first_name || '',
                last_name: teacher.last_name || '',
                designation: teacher.designation || '',
                phone: teacher.phone || '',
                joining_date:
                    teacher.joining_date?.split('T')[0] || '',
                status: teacher.status || 'active',
            });
        }
    }, [teacher]);

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
                    `/teachers/${teacher.id}`,
                    formData
                );
            } else {
                await api.post(
                    '/teachers',
                    formData
                );
            }

            onSaved();

        } catch (err) {
            console.error('Teacher save error:', err);

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
                    {isEditing ? 'Edit Teacher' : 'Add Teacher'}
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
                                            ? 'Loading teacher accounts...'
                                            : 'Select teacher login account'}
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
                                            No available teacher login
                                            accounts found. Create a
                                            Teacher account from the
                                            Users page first.
                                        </div>
                                    )}

                                {!loadingUsers &&
                                    availableUsers.length > 0 && (
                                        <div className="form-text">
                                            Select the login account that
                                            belongs to this teacher.
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
                                    EMPLOYEE ID
                                ====================================== */}
                                <div className="col-md-6 mb-2">

                                    <label className="form-label">
                                        Employee ID
                                    </label>

                                    <input
                                        type="text"
                                        name="employee_id"
                                        className="form-control"
                                        value={formData.employee_id}
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
                            DESIGNATION
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Designation
                            </label>

                            <input
                                type="text"
                                name="designation"
                                className="form-control"
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="e.g. Lecturer, Professor"
                            />

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
                            JOINING DATE
                        ====================================== */}
                        <div className="col-md-6 mb-2">

                            <label className="form-label">
                                Joining Date
                            </label>

                            <input
                                type="date"
                                name="joining_date"
                                className="form-control"
                                value={formData.joining_date}
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

                                <option value="inactive">
                                    Inactive
                                </option>
                            </select>

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

export default TeacherForm;