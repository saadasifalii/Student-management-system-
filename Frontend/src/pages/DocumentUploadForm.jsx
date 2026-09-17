import { useState } from 'react';
import api from '../api/axiosConfig';

function DocumentUploadForm({ onClose, onSaved }) {
    const [documentType, setDocumentType] = useState('');
    const [documentName, setDocumentName] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please select a file.');
            return;
        }

        setSaving(true);
        try {
            const formPayload = new FormData();
            formPayload.append('document_type', documentType);
            formPayload.append('document_name', documentName);
            formPayload.append('file', file);

            await api.post('/documents', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload document.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h4 className="mb-3">Upload Document</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label className="form-label">Document Type</label>
                        <input
                            type="text"
                            className="form-control"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            placeholder="e.g. Transcript, ID Card"
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Document Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-2">
                        <label className="form-label">File</label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </div>
                    {error && <div className="alert alert-danger py-2 mt-2">{error}</div>}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DocumentUploadForm;