import React, { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            if (typeof window === 'undefined' || !window.sessionStorage) {
                setLoading(false);
                return;
            }
            const sessionAuth = window.sessionStorage.getItem('autoservice-is-auth');
            const sessionUser = window.sessionStorage.getItem('autoservice-user');

            if (sessionAuth === 'true' && sessionUser) {
                const user = JSON.parse(sessionUser);
                if (user && typeof user === 'object') {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                }
            }
        } catch (e) {
            try {
                window.sessionStorage.removeItem('autoservice-is-auth');
                window.sessionStorage.removeItem('autoservice-user');
            } catch (_) { /* ignore */ }
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (username, password) => {
        let users = [{ id: 'u1', username: 'admin', password: '1234', role: 'admin', fullName: 'Админ' }];
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const usersStr = window.localStorage.getItem('autoservice-users');
                if (usersStr) {
                    const parsed = JSON.parse(usersStr);
                    if (Array.isArray(parsed)) users = parsed;
                }
            }
        } catch (e) {
            users = [{ id: 'u1', username: 'admin', password: '1234', role: 'admin', fullName: 'Админ' }];
        }

        // Если это первый вход и пароль только что установлен (старая логика для совместимости)
        let usersStr = '';
        try { usersStr = window.localStorage ? window.localStorage.getItem('autoservice-users') : ''; } catch (_) {}
        const legacyPassword = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('autoservice-auth-password') : null;
        if (legacyPassword && !usersStr) {
            if (username === 'admin' && password === legacyPassword) {
                const admin = users[0];
                setIsAuthenticated(true);
                setCurrentUser(admin);
                try {
                    if (window.sessionStorage) {
                        window.sessionStorage.setItem('autoservice-is-auth', 'true');
                        window.sessionStorage.setItem('autoservice-user', JSON.stringify(admin));
                    }
                } catch (_) { /* ignore */ }
                return true;
            }
        }

        // Проверка по списку (регистронезависимая для логина)
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

        if (user) {
            setIsAuthenticated(true);
            setCurrentUser(user);
            try {
                if (window.sessionStorage) {
                    window.sessionStorage.setItem('autoservice-is-auth', 'true');
                    window.sessionStorage.setItem('autoservice-user', JSON.stringify(user));
                }
            } catch (_) { /* ignore */ }
            return true;
        }

        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeItem('autoservice-is-auth');
                window.sessionStorage.removeItem('autoservice-user');
            }
        } catch (_) { /* ignore */ }
    };

    const value = {
        isAuthenticated,
        currentUser,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
