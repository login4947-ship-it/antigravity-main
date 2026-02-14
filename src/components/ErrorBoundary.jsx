import React from 'react';

/**
 * Ловит ошибки рендера и показывает запасной UI вместо пустого экрана.
 */
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: '#f8fafc',
                        color: '#1e293b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center'
                    }}
                >
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 12, color: '#1e293b' }}>Произошла ошибка</h1>
                    <p style={{ color: '#64748b', marginBottom: 24, maxWidth: 400, lineHeight: 1.5 }}>
                        Приложение не смогло загрузиться. Попробуйте обновить страницу или очистить данные приложения и перезагрузить.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 24px',
                                fontSize: '1rem',
                                background: '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Обновить страницу
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                try {
                                    const keysToRemove = [];
                                    for (let i = 0; i < window.localStorage.length; i++) {
                                        const key = window.localStorage.key(i);
                                        if (key && key.startsWith('autoservice-')) keysToRemove.push(key);
                                    }
                                    keysToRemove.forEach(k => window.localStorage.removeItem(k));
                                    window.sessionStorage.clear();
                                } catch (e) { /* ignore */ }
                                window.location.reload();
                            }}
                            style={{
                                padding: '10px 20px',
                                fontSize: '0.9rem',
                                background: 'transparent',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                cursor: 'pointer'
                            }}
                        >
                            Очистить данные приложения и обновить
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
