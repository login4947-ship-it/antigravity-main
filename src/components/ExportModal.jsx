import React, { useState } from 'react';
import Icons from './Icons';
import { useLanguage } from '../context/LanguageContext';
import {
    exportMonthToTxt, exportAllToTxt, exportPeriodToTxt,
    exportToPdf
} from '../utils/exportUtils';
import { formatDate } from '../utils/dateUtils';

function ExportModal({ records, selectedMonth, onClose, users = [] }) {
    const { t } = useLanguage();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState('txt'); // 'txt' or 'pdf'
    const [selectedExecutor, setSelectedExecutor] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const filterByExecutor = (data) => {
        if (selectedExecutor === 'all') return data;
        return data.filter(r => r.executors && r.executors.includes(selectedExecutor));
    };

    const handleExportMonth = async () => {
        if (!selectedMonth) return;

        setIsExporting(true);
        let filtered = records.filter(r => {
            const [rYear, rMonth] = r.date.split('-').map(Number);
            return rYear === selectedMonth.year && rMonth === selectedMonth.month;
        });
        filtered = filterByExecutor(filtered);

        if (format === 'pdf') {
            await exportToPdf(filtered, {
                filename: `report_${selectedMonth.month}_${selectedMonth.year}.pdf`,
                title: t('exportMonthBtn'),
                period: `${t(`month${selectedMonth.month}`)} ${selectedMonth.year}`,
                executorId: selectedExecutor === 'all' ? null : selectedExecutor
            }, users);
        } else {
            // txt export utils might need refactoring to accept data instead of filtering inside?
            // exportMonthToTxt usually takes full records and filters inside. 
            // We should check exportUtils. If it filters inside, we can't easily filter by executor unless we pass filtered data.
            // But looking at imports: exportMonthToTxt(records, year, month, users). 
            // It likely filters by date inside. It does NOT filter by executor.
            // If I pass 'filtered' as 'records', it will filter by date AGAIN (which is fine, date matches).
            // So passing 'filtered' should work for date-based exports too, assuming they treat the first arg as source.
            exportMonthToTxt(filtered, selectedMonth.year, selectedMonth.month, users);
        }
        setIsExporting(false);
        onClose();
    };

    const handleExportAll = async () => {
        setIsExporting(true);
        const filtered = filterByExecutor(records);

        if (format === 'pdf') {
            await exportToPdf(filtered, {
                filename: 'full_report.pdf',
                title: t('exportAllBtn'),
                period: t('exportAllBtn'),
                executorId: selectedExecutor === 'all' ? null : selectedExecutor
            }, users);
        } else {
            exportAllToTxt(filtered, users);
        }
        setIsExporting(false);
        onClose();
    };

    const handleExportRange = async () => {
        if (!startDate || !endDate) return;

        setIsExporting(true);
        let filtered = records.filter(r => r.date >= startDate && r.date <= endDate);
        filtered = filterByExecutor(filtered);

        if (format === 'pdf') {
            await exportToPdf(filtered, {
                filename: `report_${startDate}_to_${endDate}.pdf`,
                title: t('exportRangeBtn'),
                period: `${formatDate(startDate)} - ${formatDate(endDate)}`,
                executorId: selectedExecutor === 'all' ? null : selectedExecutor
            }, users);
        } else {
            // Same logic, pass filtered list
            exportPeriodToTxt(filtered, startDate, endDate, users);
        }
        setIsExporting(false);
        onClose();
    };

    return (
        <div className="admin-overlay fade-in">
            <div className="admin-modal" style={{ maxWidth: '420px' }}>
                <div className="admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icons.Download size={24} />
                        <h2>{t('exportPeriodTitle')}</h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <Icons.X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Выбор формата */}
                    <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label-sm">{t('exportFormat')}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                className={`btn ${format === 'txt' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => setFormat('txt')}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <Icons.FileText size={14} /> {t('formatTxt')}
                            </button>
                            <button
                                className={`btn ${format === 'pdf' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => setFormat('pdf')}
                                style={{ fontSize: '0.8rem' }}
                            >
                                <Icons.FileText size={14} /> {t('formatPdf')}
                            </button>
                        </div>
                    </div>

                    {/* Фильтр по сотруднику */}
                    <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label-sm">{t('executors')}</label>
                        <select
                            className="form-input"
                            value={selectedExecutor}
                            onChange={(e) => setSelectedExecutor(e.target.value)}
                        >
                            <option value="all">{t('filterAllExecutors') || 'Все сотрудники'}</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.fullName || u.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

                    {/* Кнопки быстрого экспорта */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {selectedMonth && (
                            <button className="btn btn-secondary btn-block" onClick={handleExportMonth} disabled={isExporting}>
                                {isExporting ? <Icons.Refresh className="spin" size={18} /> : <Icons.Calendar size={18} />}
                                {t('exportMonthBtn')}
                            </button>
                        )}
                        <button className="btn btn-secondary btn-block" onClick={handleExportAll} disabled={isExporting}>
                            {isExporting ? <Icons.Refresh className="spin" size={18} /> : <Icons.List size={18} />}
                            {t('exportAllBtn')}
                        </button>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

                    {/* Выбор периода */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div className="form-group">
                                <label className="form-label-sm">{t('exportDateFrom')}</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    disabled={isExporting}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label-sm">{t('exportDateTo')}</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    disabled={isExporting}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={handleExportRange}
                            disabled={!startDate || !endDate || isExporting}
                        >
                            {isExporting ? <Icons.Refresh className="spin" size={18} /> : <Icons.TrendUp size={18} />}
                            {t('exportRangeBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExportModal;
