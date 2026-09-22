import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import SectionForm from './SectionForm';
import { extractPaginated } from '../utils/listHelper';

function Sections() {
    const { user } = useAuth();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageLimit = 10;

    const isAdmin = user?.role === 'admin';

    const fetchSections = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/sections?page=${page}&limit=${pageLimit}`);
            const { list, pagination } = extractPaginated(response.data);
            setSections(list);
            if (pagination) {
                setCurrentPage(pagination.currentPage || page);
                setTotalPages(pagination.totalPages || 1);
            } else {
                setCurrentPage(1);
                setTotalPages(1);
            }
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to load sections.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSections(1);
    }, []);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        fetchSections(page);
    };

    const handleAddClick = () => {
        setEditingSection(null);
        setShowForm(true);
    };

    const handleEditClick = (section) => {
        setEditingSection(section);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this section?')) return;
        try {
            await api.delete(`/sections/${id}`);
            fetchSections(currentPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete section.');
        }
    };

    const handleSaved = () => {
        setShowForm(false);
        fetchSections(currentPage);
    };

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Sections</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={handleAddClick}>
                        + Add Section
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
                                <th>Name</th>
                                <th>Semester Number</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>{s.semester_number}</td>
                                    <td>{s.capacity}</td>
                                    <td>
                                        <span className={`badge ${s.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(s)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {sections.length === 0 && (
                        <p className="text-muted">No sections found.</p>
                    )}

                    {totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">Page {currentPage} of {totalPages}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                                    Previous
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <SectionForm
                    section={editingSection}
                    onClose={() => setShowForm(false)}
                    onSaved={handleSaved}
                />
            )}
        </Layout>
    );
}

export default Sections;