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

        // Validate file
        if (!file) {
            setError('Please select a file.');
            return;
        }

        // Validate required fields
        if (!documentType.trim()) {
            setError('Please enter the document type.');
            return;
        }

        if (!documentName.trim()) {
            setError('Please enter the document name.');
            return;
        }

        setSaving(true);

        try {
            const formPayload = new FormData();

            formPayload.append(
                'document_type',
                documentType.trim()
            );

            formPayload.append(
                'document_name',
                documentName.trim()
            );

            formPayload.append(
                'file',
                file
            );

            /*
             * Do not manually set Content-Type here.
             * The browser/Axios will automatically add:
             * multipart/form-data; boundary=...
             */
            await api.post(
                '/documents',
                formPayload
            );

            // Clear form after successful upload
            setDocumentType('');
            setDocumentName('');
            setFile(null);

            // Tell parent component that upload succeeded
            onSaved();

        } catch (err) {
            console.error(
                'Document upload error:',
                err
            );

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to upload document.'
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
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <h4 className="mb-3">
                    Upload Document
                </h4>

                <form onSubmit={handleSubmit}>

                    {/* DOCUMENT TYPE */}
                    <div className="mb-2">
                        <label className="form-label">
                            Document Type
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={documentType}
                            onChange={(e) =>
                                setDocumentType(
                                    e.target.value
                                )
                            }
                            placeholder="e.g. Transcript, ID Card"
                            required
                        />
                    </div>

                    {/* DOCUMENT NAME */}
                    <div className="mb-2">
                        <label className="form-label">
                            Document Name
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={documentName}
                            onChange={(e) =>
                                setDocumentName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter document name"
                            required
                        />
                    </div>

                    {/* FILE */}
                    <div className="mb-2">
                        <label className="form-label">
                            File
                        </label>

                        <input
                            type="file"
                            className="form-control"
                            onChange={(e) =>
                                setFile(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                            required
                        />

                        {file && (
                            <small className="text-muted d-block mt-1">
                                Selected: {file.name}
                            </small>
                        )}
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
                                ? 'Uploading...'
                                : 'Upload'}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default DocumentUploadForm;