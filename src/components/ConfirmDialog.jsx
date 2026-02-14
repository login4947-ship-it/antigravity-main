import React from 'react';
import Icons from './Icons';

/**
 * Модальное окно подтверждения (Да/Нет) или уведомления (ОК).
 * @param {boolean} open - показывать окно
 * @param {string} title - заголовок
 * @param {string} message - текст сообщения
 * @param {'confirm'|'alert'} variant - confirm: две кнопки (Подтвердить/Отмена), alert: одна кнопка (ОК)
 * @param {function} onConfirm - при подтверждении (confirm) или нажатии ОК (alert)
 * @param {function} onCancel - при отмене (только для variant='confirm')
 * @param {string} [confirmLabel='Перейти'] - текст кнопки подтверждения
 * @param {string} [cancelLabel='Отмена'] - текст кнопки отмены
 */
function ConfirmDialog({
    open,
    title,
    message,
    variant = 'confirm',
    onConfirm,
    onCancel,
    confirmLabel = 'Перейти',
    cancelLabel = 'Отмена'
}) {
    if (!open) return null;

    return (
        <div
            className="admin-overlay fade-in"
            style={{ zIndex: 1200 }}
            onClick={(e) => {
                if (e.target !== e.currentTarget) return;
                if (variant === 'confirm') onCancel?.();
                if (variant === 'alert') onConfirm?.();
            }}
        >
            <div
                className="admin-modal"
                style={{ maxWidth: '400px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-header">
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{title}</h3>
                    {variant === 'confirm' && (
                        <button type="button" className="btn btn-ghost btn-icon" onClick={onCancel} aria-label="Закрыть">
                            <Icons.X size={20} />
                        </button>
                    )}
                </div>
                <div style={{ padding: '20px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
                    <div
                        style={{
                            marginTop: '24px',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: variant === 'alert' ? 'center' : 'flex-end'
                        }}
                    >
                        {variant === 'confirm' && (
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                {cancelLabel}
                            </button>
                        )}
                        <button type="button" className="btn btn-primary" onClick={onConfirm}>
                            {variant === 'alert' ? 'ОК' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
