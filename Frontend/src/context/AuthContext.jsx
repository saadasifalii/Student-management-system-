import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

function parseStoredUser() {
    try {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
}

function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = parseStoredUser();
        const token = localStorage.getItem('token');

        if (!savedUser || !token || isTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }

        return savedUser;
    });

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}