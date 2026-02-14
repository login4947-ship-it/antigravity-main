import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Icons from './Icons';
import LanguageToggle from './LanguageToggle';
import { fetchFromCloud } from '../utils/firebaseSync';

function LoginScreen() {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSyncUsers = async () => {
        if (!window.confirm(t('syncConfirmLoad'))) return;

        setIsSyncing(true);
        try {
            const cloudUsers = await fetchFromCloud('Users');
            if (cloudUsers && (Array.isArray(cloudUsers) || typeof cloudUsers === 'object')) {
                const usersList = Array.isArray(cloudUsers) ? cloudUsers : Object.values(cloudUsers);
                const validUsers = usersList.filter(u => u);

                if (validUsers.length > 0) {
                    localStorage.setItem('autoservice-users', JSON.stringify(validUsers));
                    alert(t('syncSuccess'));
                }
            }
        } catch (e) {
            console.error(e);
            alert(t('syncError'));
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const success = login(username, password);
        if (!success) {
            setError(t('loginError'));
            setPassword('');
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-lang-switch">
                <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={handleSyncUsers}
                    disabled={isSyncing}
                    title={t('syncLoadBtn')}
                    style={{ marginRight: '8px' }}
                >
                    <Icons.Refresh size={20} className={isSyncing ? 'spin' : ''} />
                </button>
                <LanguageToggle />
            </div>

            <div className="login-card fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <Icons.Chip size={48} />
                    </div>
                    <h1>{t('loginTitle')}</h1>
                    <p>{t('loginSub')}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <div className="input-with-icon">
                            <Icons.User size={20} className="input-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-input"
                                placeholder={t('loginUsername')}
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-with-icon">
                            <Icons.Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder={t('loginPassword')}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error fade-in">
                            <Icons.Alert size={16} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block btn-lg">
                        <Icons.LogIn size={20} /> {t('loginSubmit')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>{t('loginLegacyHint')}</p>
                </div>
            </div>
        </div>
    );
}

export default LoginScreen;
