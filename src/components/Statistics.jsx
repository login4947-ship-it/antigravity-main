import { useMemo } from 'react';
import { formatCurrency } from '../utils/formatUtils';
import { formatDate } from '../utils/dateUtils';
import Icons from './Icons';
import { useLanguage } from '../context/LanguageContext';

/**
 * Компонент статистики
 */
function Statistics({ records, allRecords, periodLabel }) {
    const { t } = useLanguage();

    // Расчет основных показателей
    const stats = useMemo(() => {
        if (records.length === 0) return null;

        const total = records.reduce((sum, r) => sum + r.amount, 0);

        // Находим уникальные дни
        const days = new Set(records.map(r => r.date));
        const average = total / days.size;

        // Находим рекорд месяца (самый прибыльный день)
        const dayTotals = {};
        records.forEach(r => {
            dayTotals[r.date] = (dayTotals[r.date] || 0) + r.amount;
        });

        let maxDay = { date: '', amount: 0 };
        Object.entries(dayTotals).forEach(([date, amount]) => {
            if (amount > maxDay.amount) {
                maxDay = { date, amount };
            }
        });

        return {
            total,
            average,
            maxDay
        };
    }, [records]);

    if (!stats) return null;

    return (
        <div className="stats-grid fade-in">
            {/* Итого за период */}
            <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                    <Icons.Briefcase size={24} />
                </div>
                <div className="stat-info">
                    <div className="stat-label">{t('statsTotal')}</div>
                    <div className="stat-value">{formatCurrency(stats.total)}</div>
                    {periodLabel && <div className="stat-sublabel">{periodLabel}</div>}
                </div>
            </div>

            {/* Среднее в день */}
            <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <Icons.TrendUp size={24} />
                </div>
                <div className="stat-info">
                    <div className="stat-label">{t('statsDailyAvg')}</div>
                    <div className="stat-value">{formatCurrency(stats.average)}</div>
                </div>
            </div>

            {/* Самый прибыльный день */}
            <div className="stat-card highlight">
                <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Icons.Trophy size={24} />
                </div>
                <div className="stat-info">
                    <div className="stat-label">{t('statsBestDay')}</div>
                    <div className="stat-value">{formatCurrency(stats.maxDay.amount)}</div>
                    <div className="stats-sublabel" style={{ color: 'var(--warning)', fontWeight: '600' }}>
                        {formatDate(stats.maxDay.date)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Statistics;
