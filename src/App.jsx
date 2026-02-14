import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

// Компоненты
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import LoginScreen from './components/LoginScreen';
import UserManagement from './components/UserManagement';
import Icons from './components/Icons';

// Страницы
import Dashboard from './pages/Dashboard';
import BookingPage from './pages/BookingPage';
import PricesPage from './pages/PricesPage';

// Контекст и Хуки
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { RecordsProvider } from './context/RecordsContext';
import { useLocalStorage } from './hooks/useLocalStorage';

// Утилиты
import { initBackupSystem, ensureDatabaseBranches } from './utils/firebaseSync';

/**
 * Основное содержимое приложения
 */
function MainApp() {
    const { isAuthenticated, currentUser, logout, loading } = useAuth();
    const { t } = useLanguage();
    const isAdmin = currentUser?.role === 'admin';

    const defaultUsers = [{ id: 'u1', username: 'admin', password: '1234', role: 'admin', fullName: 'Админ' }];
    const [storedUsers, setUsers] = useLocalStorage('autoservice-users', defaultUsers);
    const users = Array.isArray(storedUsers) ? storedUsers : defaultUsers;

    // Состояние окон
    const [isAdminOpen, setIsAdminOpen] = useState(false);

    // Подключение и создание веток MASTER, TEST, BACKUP в Firebase при старте
    useEffect(() => {
        ensureDatabaseBranches().catch((err) => console.warn('[Firebase] ensureDatabaseBranches failed:', err));
    }, []);

    // Инициализация системы бэкапов (для админа) — не должна ломать загрузку
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            initBackupSystem().catch((err) => console.warn('[Backup] init failed:', err));
        }
    }, [isAuthenticated, isAdmin]);

    if (loading) {
        return (
            <div className="app-loading-screen" role="status" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true" />
                <p className="app-loading-text">{typeof t === 'function' ? t('loading') : 'Загрузка...'}</p>
            </div>
        );
    }
    if (!isAuthenticated) return <LoginScreen />;

    const navLinkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 400,
        padding: '0 15px',
        borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
        fontSize: '0.95rem'
    });

    return (
        <BrowserRouter>
            <div className="app-container">
                {/* Шапка */}
                <header className="app-header fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                        <h1>
                            <span className="icon" style={{ display: 'inline-flex' }}>
                                <Icons.Chip size={32} />
                            </span>
                            {t('appTitle')}
                        </h1>

                        {isAdmin && (
                            <button
                                className="user-badge-btn"
                                onClick={() => setIsAdminOpen(true)}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                                <div className="user-badge" style={{
                                    marginLeft: '12px', padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: '20px',
                                    fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <Icons.Users size={14} /> {t('adminPanel')}
                                </div>
                            </button>
                        )}

                        {!isAdmin && (
                            <div className="user-badge" style={{
                                marginLeft: '12px', padding: '4px 12px', background: 'var(--bg-tertiary)', borderRadius: '20px',
                                fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)', opacity: 0.8
                            }}>
                                <Icons.User size={14} /> {currentUser?.fullName || currentUser?.username} ({t('viewMode')})
                            </div>
                        )}
                    </div>

                    <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
                        <NavLink to="/" style={navLinkStyle}>
                            <span style={{ marginRight: '8px', display: 'flex' }}><Icons.Chart size={18} /></span>
                            Доходы
                        </NavLink>
                        <NavLink to="/booking" style={navLinkStyle}>
                            <span style={{ marginRight: '8px', display: 'flex' }}><Icons.Users size={18} /></span>
                            Клиенты
                        </NavLink>
                        <NavLink to="/prices" style={navLinkStyle}>
                            <span style={{ marginRight: '8px', display: 'flex' }}><Icons.Money size={18} /></span>
                            Цены
                        </NavLink>
                    </nav>

                    <div className="header-actions" style={{ minWidth: '200px', justifyContent: 'flex-end' }}>
                        <div className="header-toolbar">
                            <LanguageToggle />
                            <ThemeToggle />
                            <button
                                className="btn btn-ghost"
                                onClick={logout}
                                title={t('logout')}
                            >
                                <Icons.LogOut size={18} />
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <Routes>
                        <Route path="/" element={<Dashboard users={users} />} />
                        <Route path="/booking" element={<BookingPage users={users} />} />
                        <Route path="/prices" element={<PricesPage />} />
                    </Routes>
                </div>

                {isAdminOpen && isAdmin && (
                    <UserManagement
                        onClose={() => setIsAdminOpen(false)}
                        users={users}
                        setUsers={setUsers}
                    />
                )}
            </div>
        </BrowserRouter>
    );
}

function App() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AuthProvider>
                    <RecordsProvider>
                        <MainApp />
                    </RecordsProvider>
                </AuthProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default App;
