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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageLimit = 10;

    const fetchDocuments = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            if (isStudent) {
                const myStudentRes = await api.get('/students/me');
                const docsRes = await api.get(`/documents/student/${myStudentRes.data.id}?page=${page}&limit=${pageLimit}`);
                setDocuments(extractList(docsRes.data));
                if (docsRes.data.pagination) {
                    setCurrentPage(docsRes.data.pagination.currentPage);
                    setTotalPages(docsRes.data.pagination.totalPages);
                    setTotalCount(docsRes.data.pagination.totalDocuments);
                }
            } else {
                const [docsRes, studentsRes] = await Promise.all([
                    api.get(`/documents?page=${page}&limit=${pageLimit}`),
                    api.get('/students?limit=1000'),
                ]);
                setDocuments(extractList(docsRes.data));
                setStudents(extractList(studentsRes.data));
                if (docsRes.data.pagination) {
                    setCurrentPage(docsRes.data.pagination.currentPage);
                    setTotalPages(docsRes.data.pagination.totalPages);
                    setTotalCount(docsRes.data.pagination.totalDocuments);
                }
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

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchDocuments(page);
    };

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
            fetchDocuments(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update status.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchDocuments(currentPage);
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
                <>
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
                {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <span className="text-muted small">Showing page {currentPage} of {totalPages} ({totalCount} total)</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
                        </div>
                    </div>
                )}
                </>
            )}

            {documents.length === 0 && !loading && !error && (
                <p className="text-muted">No documents found.</p>
            )}

            {showUpload && (
                <DocumentUploadForm
                    onClose={() => setShowUpload(false)}
                    onSaved={() => {
                        setShowUpload(false);
                        fetchDocuments(currentPage);
                    }}
                />
            )}
        </Layout>
    );
}

export default Documents;