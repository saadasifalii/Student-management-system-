import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function SemesterForm({ semester, onClose, onSaved }) {
    const isEditing = Boolean(semester);

    const [formData, setFormData] = useState({
        name: '',
        term: '',
        year: '',
        start_date: '',
        end_date: '',
        status: 'upcoming',
    });

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Load semester data when editing
    useEffect(() => {
        if (semester) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: semester.name || '',
                term: semester.term || '',
                year: semester.year || '',
                start_date: semester.start_date
                    ? String(semester.start_date).split('T')[0]
                    : '',
                end_date: semester.end_date
                    ? String(semester.end_date).split('T')[0]
                    : '',
                status: semester.status || 'upcoming',
            });
        } else {
            setFormData({
                name: '',
                term: '',
                year: '',
                start_date: '',
                end_date: '',
                status: 'upcoming',
            });
        }

        setError('');
    }, [semester]);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        // Basic validation
        if (!formData.name.trim()) {
            setError('Please enter the semester name.');
            return;
        }

        if (!formData.term) {
            setError('Please select a term.');
            return;
        }

        if (!formData.year) {
            setError('Please enter the year.');
            return;
        }

        if (!formData.start_date) {
            setError('Please select the start date.');
            return;
        }

        if (!formData.end_date) {
            setError('Please select the end date.');
            return;
        }

        if (
            new Date(formData.end_date) <
            new Date(formData.start_date)
        ) {
            setError(
                'End date cannot be earlier than the start date.'
            );
            return;
        }

        setSaving(true);

        try {
            if (isEditing) {
                await api.put(
                    `/semesters/${semester.id}`,
                    formData
                );
            } else {
                await api.post(
                    '/semesters',
                    formData
                );
            }

            // Tell parent that the semester was saved
            onSaved();

        } catch (err) {
            console.error(
                'Semester save error:',
                err
            );

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="modal-backdrop-custom"
            onClick={() => {
                if (!saving) {
                    onClose();
                }
            }}
        >
            <div
                className="modal-box"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                {/* TITLE */}
                <h4 className="mb-3">
                    {isEditing
                        ? 'Edit Semester'
                        : 'Add Semester'}
                </h4>

                <form onSubmit={handleSubmit}>

                    {/* NAME */}
                    <div className="mb-2">
                        <label className="form-label">
                            Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Fall 2026"
                            disabled={saving}
                        />
                    </div>

                    <div className="row">

                        {/* TERM */}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">
                                Term
                            </label>

                            <select
                                name="term"
                                className="form-select"
                                value={formData.term}
                                onChange={handleChange}
                                required
                                disabled={saving}
                            >
                                <option value="">
                                    Select
                                </option>

                                <option value="Spring">
                                    Spring
                                </option>

                                <option value="Summer">
                                    Summer
                                </option>

                                <option value="Fall">
                                    Fall
                                </option>
                            </select>
                        </div>

                        {/* YEAR */}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">
                                Year
                            </label>

                            <input
                                type="number"
                                name="year"
                                className="form-control"
                                value={formData.year}
                                onChange={handleChange}
                                min="2000"
                                max="2100"
                                required
                                disabled={saving}
                            />
                        </div>

                        {/* START DATE */}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="start_date"
                                className="form-control"
                                value={
                                    formData.start_date
                                }
                                onChange={handleChange}
                                required
                                disabled={saving}
                            />
                        </div>

                        {/* END DATE */}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">
                                End Date
                            </label>

                            <input
                                type="date"
                                name="end_date"
                                className="form-control"
                                value={
                                    formData.end_date
                                }
                                onChange={handleChange}
                                required
                                disabled={saving}
                            />
                        </div>

                        {/* STATUS */}
                        <div className="col-md-6 mb-2">
                            <label className="form-label">
                                Status
                            </label>

                            <select
                                name="status"
                                className="form-select"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={saving}
                            >
                                <option value="upcoming">
                                    Upcoming
                                </option>

                                <option value="active">
                                    Active
                                </option>

                                <option value="completed">
                                    Completed
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
    );
}

export default SemesterForm;