import React, { useState, useEffect } from 'react';
import Icons from './Icons';
import { saveToCloud, fetchFromCloud } from '../utils/firebaseSync';
import { useLanguage } from '../context/LanguageContext';

/**
 * Панель управления пользователями
 */
function UserManagement({ onClose, users, setUsers }) {
    const { t } = useLanguage();

    const [isSyncing, setIsSyncing] = useState(false);
    const [status, setStatus] = useState(null);
    const [message, setMessage] = useState('');

    const [editingUserId, setEditingUserId] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'employee',
        fullName: ''
    });

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setFormData({
            username: user.username,
            password: user.password,
            role: user.role,
            fullName: user.fullName || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setFormData({ username: '', password: '', role: 'employee', fullName: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) return;

        if (editingUserId) {
            setUsers(users.map(u => u.id === editingUserId ? { ...formData, id: u.id } : u));
            setEditingUserId(null);
        } else {
            const user = {
                ...formData,
                id: 'u' + Date.now()
            };
            setUsers([...users, user]);
        }

        setFormData({ username: '', password: '', role: 'employee', fullName: '' });
    };

    const handleDeleteUser = (id) => {
        if (users.length <= 1) {
            alert('Error: Minimum 1 user');
            return;
        }
        if (window.confirm(t('usersConfirmDelete'))) {
            setUsers(users.filter(u => u.id !== id));
            if (editingUserId === id) handleCancelEdit();
        }
    };

    const syncWithCloud = async () => {
        setIsSyncing(true);
        setStatus(null);
        try {
            await saveToCloud(users, 'Users');
            setStatus('success');
            setMessage(t('syncSuccess'));
        } catch (e) {
            setStatus('error');
            setMessage(t('syncError'));
        } finally {
            setIsSyncing(false);
        }
    };

    const loadFromCloud = async () => {
        setIsSyncing(true);
        try {
            const cloudUsers = await fetchFromCloud('Users');
            if (cloudUsers && (Array.isArray(cloudUsers) || typeof cloudUsers === 'object')) {
                // Firebase might return an object if keys are used, but our saveToCloud sends array.
                // However, if we put an array, Firebase stores it as an array unless indices are sparse.
                // For safety:
                const usersList = Array.isArray(cloudUsers) ? cloudUsers : Object.values(cloudUsers);

                // Filter out nulls/undefined if any sparse array
                const validUsers = usersList.filter(u => u);

                if (validUsers.length > 0) {
                    setUsers(validUsers);
                    setStatus('success');
                    setMessage(t('syncSuccess'));
                }
            }
        } catch (e) {
            setStatus('error');
            setMessage(t('syncError'));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="admin-overlay fade-in">
            <div className="admin-modal">
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icons.Users size={24} />
                        <h2>{t('usersTitle')}</h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <Icons.X size={20} />
                    </button>
                </div>

                <div className="admin-layout">
                    <section className="admin-section">
                        <h3>
                            {editingUserId ? <Icons.Edit size={18} /> : <Icons.Plus size={18} />}
                            {editingUserId ? t('usersEditUser') : t('usersAddUser')}
                        </h3>
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-group">
                                <label className="form-label-sm">{t('usersUsername')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label-sm">{t('usersPassword')}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label-sm">{t('usersFullName')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label-sm">{t('usersRole')}</label>
                                <select
                                    className="form-input"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="admin">{t('usersRoleAdmin')}</option>
                                    <option value="employee">{t('usersRoleEmployee')}</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block">
                                {editingUserId ? t('save') : t('add')}
                            </button>
                            {editingUserId && (
                                <button type="button" className="btn btn-ghost btn-block" onClick={handleCancelEdit}>
                                    {t('cancel')}
                                </button>
                            )}
                        </form>
                    </section>

                    <section className="admin-section">
                        <div className="admin-list-header">
                            <h3>{t('usersList')} ({users.length})</h3>
                            <div className="admin-list-actions">
                                <button className="btn btn-secondary btn-sm" onClick={loadFromCloud} disabled={isSyncing} title={t('syncLoadBtn')}>
                                    <Icons.Refresh size={14} className={isSyncing ? 'spin' : ''} />
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={syncWithCloud} disabled={isSyncing} title={t('usersSyncCloud')}>
                                    <Icons.Cloud size={14} />
                                    <span className="hide-mobile">{t('usersSyncCloud')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="admin-users-list">
                            {users.map(user => (
                                <div key={user.id} className={`admin-user-item ${editingUserId === user.id ? 'editing' : ''}`}>
                                    <div className="user-info">
                                        <div className="user-main">
                                            <span className="user-name">{user.fullName || user.username}</span>
                                            <span className={`role-badge role-${user.role}`}>
                                                {user.role === 'admin' ? t('roleAdmin') : t('roleEmployee')}
                                            </span>
                                        </div>
                                        <div className="user-sub">{t('usersUsername')}: {user.username}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            onClick={() => handleEditClick(user)}
                                            title={t('edit')}
                                        >
                                            <Icons.Edit size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-icon"
                                            style={{ color: 'var(--danger)' }}
                                            onClick={() => handleDeleteUser(user.id)}
                                            title={t('delete')}
                                        >
                                            <Icons.Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {status && (
                    <div className={`status-msg msg-${status}`} style={{ margin: '15px', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                        {status === 'success' ? <Icons.Check size={14} /> : <Icons.Alert size={14} />} {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserManagement;
