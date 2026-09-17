import { useState } from 'react';
import api from '../api/axiosConfig';

function ResetPasswordForm({ userRecord, onClose, onSaved }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.put(`/users/${userRecord.id}/password`, { password });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="modal-box" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
                <h4 className="mb-3">Reset Password for {userRecord.name}</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2 mt-2">{error}</div>}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordForm;