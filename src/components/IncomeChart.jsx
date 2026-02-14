import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/formatUtils';

/**
 * Простой SVG-график доходов
 */
function IncomeChart({ records }) {
    const { t } = useLanguage();
    const [tooltip, setTooltip] = React.useState(null);

    // Обработка данных для графика
    const chartData = useMemo(() => {
        if (!records || records.length === 0) return [];

        // Группируем по датам
        const dailyTotals = {};
        records.forEach(record => {
            const date = record.date;
            dailyTotals[date] = (dailyTotals[date] || 0) + record.amount;
        });

        // Сортируем по дате
        const sortedDates = Object.keys(dailyTotals).sort();

        return sortedDates.map(date => ({
            date,
            amount: dailyTotals[date],
            label: new Date(date).getDate().toString()
        }));
    }, [records]);

    if (chartData.length < 2) return null;

    // Параметры SVG
    const width = 1000;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxAmount = Math.max(...chartData.map(d => d.amount)) || 1;

    // Генерация точек для полигона
    const points = chartData.map((d, i) => {
        const x = padding + (i * chartWidth) / (chartData.length - 1);
        const y = height - padding - (d.amount * chartHeight) / maxAmount;
        return { x, y, amount: d.amount, date: d.date };
    });

    const pathData = points.reduce((acc, p, i) => {
        return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, "");

    const areaData = pathData + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ paddingBottom: '12px' }}>
                <h2 className="card-title" style={{ fontSize: '1rem' }}>{t('chartTitle')}</h2>
            </div>
            <div className="chart-container" style={{ position: 'relative', padding: '10px 0' }}>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                    onMouseLeave={() => setTooltip(null)}
                >
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--info)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--info)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Сетка (горизонтальные линии) */}
                    {[0, 0.5, 1].map(v => (
                        <line
                            key={v}
                            x1={padding}
                            y1={padding + v * chartHeight}
                            x2={width - padding}
                            y2={padding + v * chartHeight}
                            stroke="var(--border-color)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Область под графиком */}
                    <path d={areaData} fill="url(#chartGradient)" />

                    {/* Линия графика */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="var(--info)"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        style={{ transition: 'all 0.3s ease' }}
                    />

                    {/* Точки на графике */}
                    {points.map((p, i) => (
                        <g key={i}>
                            {/* Невидимая область для увеличения "зоны попадания" курсора */}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="12"
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => {
                                    // Получаем позицию относительно родительского контейнера карты
                                    // Это немного сложно из-за viewBox. 
                                    // Проще позиционировать относительно самого элемента
                                    const rect = e.target.getBoundingClientRect();
                                    const parentRect = e.target.closest('.chart-container').getBoundingClientRect();

                                    setTooltip({
                                        x: ((p.x / width) * 100) + '%', // Используем проценты для адаптивности
                                        y: ((p.y / height) * 100) + '%', // Но здесь могут быть искажения из-за preserveAspectRatio
                                        // Лучше использовать координаты события или пересчет
                                        // Но для SVG внутри адаптивного контейнера... попробуем просто стили
                                        left: rect.left - parentRect.left + rect.width / 2,
                                        top: rect.top - parentRect.top - 10,
                                        amount: p.amount,
                                        date: p.date
                                    });
                                }}
                            />
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="4"
                                fill="var(--bg-secondary)"
                                stroke="var(--info)"
                                strokeWidth="2"
                                style={{ pointerEvents: 'none' }} // События ловит прозрачный круг выше
                            />
                        </g>
                    ))}
                </svg>

                {/* Подписи дат снизу */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                }}>
                    {chartData.map((d, i) => (
                        <div key={i}>{d.label}</div>
                    ))}
                </div>

                {/* Тултип */}
                {tooltip && (
                    <div className="chart-tooltip fade-in" style={{
                        position: 'absolute',
                        left: tooltip.left,
                        top: tooltip.top,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-color)',
                        pointerEvents: 'none',
                        zIndex: 20,
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                            {/* Форматирование даты: DD.MM.YYYY */}
                            {new Date(tooltip.date).toLocaleDateString()}
                        </div>
                        <div style={{ color: 'var(--info)', fontWeight: '700' }}>
                            {formatCurrency(tooltip.amount)}
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-5px',
                            left: '50%',
                            marginLeft: '-5px',
                            width: '0',
                            height: '0',
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '5px solid var(--border-color)'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            marginLeft: '-5px',
                            width: '0',
                            height: '0',
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: '5px solid var(--bg-secondary)'
                        }} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default IncomeChart;
