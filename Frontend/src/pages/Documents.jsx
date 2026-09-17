import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DocumentUploadForm from './DocumentUploadForm';

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

function Documents() {
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    const [documents, setDocuments] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    // Fetch documents
    const fetchDocuments = async () => {
        setLoading(true);
        setError('');

        try {
            if (isStudent) {
                // Get students
                const studentsRes = await api.get('/students');

                const studentList = getArray(
                    studentsRes,
                    'students'
                );

                // Find current student's record
                const myStudent = studentList.find(
                    (s) => s.user_id === user?.id
                );

                if (!myStudent) {
                    setError(
                        'No student record linked to this account.'
                    );
                    setDocuments([]);
                    setLoading(false);
                    return;
                }

                // Get only current student's documents
                const docsRes = await api.get(
                    `/documents/student/${myStudent.id}`
                );

                setDocuments(
                    getArray(docsRes, 'documents')
                );

            } else {
                // Admin / teacher
                const [docsRes, studentsRes] =
                    await Promise.all([
                        api.get('/documents'),
                        api.get('/students'),
                    ]);

                setDocuments(
                    getArray(docsRes, 'documents')
                );

                setStudents(
                    getArray(studentsRes, 'students')
                );
            }

        } catch (err) {
            console.error(
                'Error loading documents:',
                err
            );

            setError(
                err.response?.data?.error ||
                'Failed to load documents.'
            );
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (user?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchDocuments();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Get student name
    const getStudentName = (id) => {
        const student = students.find(
            (s) => s.id === id
        );

        return student
            ? `${student.first_name} ${student.last_name}`
            : '—';
    };

    // Update document status
    const handleStatusChange = async (
        doc,
        newStatus
    ) => {
        try {
            await api.put(
                `/documents/${doc.id}`,
                {
                    document_type:
                        doc.document_type,

                    document_name:
                        doc.document_name,

                    status: newStatus,
                }
            );

            await fetchDocuments();

        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to update status.'
            );
        }
    };

    // Delete document
    const handleDelete = async (id) => {
        if (
            !window.confirm(
                'Delete this document?'
            )
        ) {
            return;
        }

        try {
            await api.delete(
                `/documents/${id}`
            );

            await fetchDocuments();

        } catch (err) {
            alert(
                err.response?.data?.error ||
                'Failed to delete document.'
            );
        }
    };

    // Status badge
    const statusBadge = (status) => {
        const map = {
            pending: 'bg-warning text-dark',
            approved: 'bg-success',
            rejected: 'bg-danger',
        };

        return (
            map[status] ||
            'bg-secondary'
        );
    };

    return (
        <Layout>

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2>
                    Documents
                </h2>

                {isStudent && (
                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            setShowUpload(true)
                        }
                    >
                        + Upload Document
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

            {/* DOCUMENT TABLE */}
            {!loading &&
                !error &&
                documents.length > 0 && (
                    <div className="table-responsive">

                        <table className="table table-striped table-hover">

                            <thead>
                                <tr>

                                    {!isStudent && (
                                        <th>
                                            Student
                                        </th>
                                    )}

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        File
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {documents.map(
                                    (d) => (
                                        <tr
                                            key={d.id}
                                        >

                                            {/* STUDENT */}
                                            {!isStudent && (
                                                <td>
                                                    {getStudentName(
                                                        d.student_id
                                                    )}
                                                </td>
                                            )}

                                            {/* TYPE */}
                                            <td>
                                                {
                                                    d.document_type
                                                }
                                            </td>

                                            {/* NAME */}
                                            <td>
                                                {
                                                    d.document_name
                                                }
                                            </td>

                                            {/* FILE */}
                                            <td>
                                                {d.file_url ? (
                                                    <a
                                                        href={`http://localhost:5000${d.file_url}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View
                                                    </a>
                                                ) : (
                                                    'No file'
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td>

                                                <span
                                                    className={`badge ${statusBadge(
                                                        d.status
                                                    )}`}
                                                >
                                                    {
                                                        d.status
                                                    }
                                                </span>

                                            </td>

                                            {/* ACTIONS */}
                                            <td>

                                                {/* ADMIN APPROVE / REJECT */}
                                                {isAdmin &&
                                                    d.status ===
                                                        'pending' && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-outline-success me-2"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        d,
                                                                        'approved'
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="btn btn-sm btn-outline-danger me-2"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        d,
                                                                        'rejected'
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                {/* ADMIN DELETE */}
                                                {isAdmin && (
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() =>
                                                            handleDelete(
                                                                d.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                )}

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            {/* NO DOCUMENTS */}
            {!loading &&
                !error &&
                documents.length === 0 && (
                    <p className="text-muted">
                        No documents found.
                    </p>
                )}

            {/* UPLOAD FORM */}
            {showUpload && (
                <DocumentUploadForm
                    onClose={() =>
                        setShowUpload(false)
                    }
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