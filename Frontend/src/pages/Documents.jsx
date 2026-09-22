import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DocumentUploadForm from './DocumentUploadForm';
import { extractList } from '../utils/listHelper';

function Documents() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    const [documents, setDocuments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        setError('');
        try {
            if (isStudent) {
                const myStudentRes = await api.get('/students/me');
                const docsRes = await api.get(`/documents/student/${myStudentRes.data.id}`);
                setDocuments(extractList(docsRes.data));
            } else {
                const [docsRes, studentsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/students?limit=1000'),
                ]);
                setDocuments(extractList(docsRes.data));
                setStudents(extractList(studentsRes.data));
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load documents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStudentName = (id) => {
        const s = students.find((s) => s.id === id);
        return s ? `${s.first_name} ${s.last_name}` : '—';
    };

    const handleStatusChange = async (doc, newStatus) => {
        try {
            await api.put(`/documents/${doc.id}`, {
                document_type: doc.document_type,
                document_name: doc.document_name,
                status: newStatus,
            });
            fetchDocuments();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchDocuments();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete document.');
        }
    };

    const statusBadge = (status) => {
        const map = { pending: 'bg-warning text-dark', approved: 'bg-success', rejected: 'bg-danger' };
        return map[status] || 'bg-secondary';
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Documents</h2>
                {isStudent && (
                    <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                        + Upload Document
                    </button>
                )}
            </div>

            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            {!isStudent && <th>Student</th>}
                            <th>Type</th>
                            <th>Name</th>
                            <th>File</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((d) => (
                            <tr key={d.id}>
                                {!isStudent && <td>{getStudentName(d.student_id)}</td>}
                                <td>{d.document_type}</td>
                                <td>{d.document_name}</td>
                                <td>
                                    <a href={`http://localhost:5000${d.file_url}`} target="_blank" rel="noreferrer">
                                        View
                                    </a>
                                </td>
                                <td>
                                    <span className={`badge ${statusBadge(d.status)}`}>{d.status}</span>
                                </td>
                                <td>
                                    {isAdmin && d.status === 'pending' && (
                                        <>
                                            <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleStatusChange(d, 'approved')}>
                                                Approve
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger me-2" onClick={() => handleStatusChange(d, 'rejected')}>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {isAdmin && (
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDelete(d.id)}>
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {documents.length === 0 && !loading && !error && (
                <p className="text-muted">No documents found.</p>
            )}

            {showUpload && (
                <DocumentUploadForm
                    onClose={() => setShowUpload(false)}
                    onSaved={() => {
                        setShowUpload(false);
                        fetchDocuments();
                    }}
                />
            )}
        </Layout>
    );
}

export default Documents;