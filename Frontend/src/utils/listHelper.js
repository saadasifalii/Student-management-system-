// Safely extracts a plain array from a "get all" response,
// whether the backend returns a plain array, or a paginated
// object like { someKey: [...], pagination: {...} }
export function extractList(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        const arrayKey = Object.keys(data).find((key) => Array.isArray(data[key]));
        if (arrayKey) return data[arrayKey];
    }
    return [];
}

// Extracts BOTH the list and pagination info, regardless of the
// exact key names each controller happens to use
export function extractPaginated(data) {
    return {
        list: extractList(data),
        pagination: data?.pagination || null,
    };
}