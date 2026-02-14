/**
 * Коллекция SVG иконок для приложения
 * Каждая иконка принимает size (по умолчанию 24) и className
 */

// Базовый компонент иконки
const IconWrapper = ({ children, size = 24, className = '', style = {} }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={{ flexShrink: 0, ...style }}
    >
        {children}
    </svg>
);

// 🔲 Микросхема / Чип (логотип)
export const ChipIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
        <path d="M9 2v2" />
        <path d="M15 2v2" />
        <path d="M9 20v2" />
        <path d="M15 20v2" />
        <path d="M2 9h2" />
        <path d="M2 15h2" />
        <path d="M20 9h2" />
        <path d="M20 15h2" />
    </IconWrapper>
);

// ☁️ Облако / Синхронизация
// Облако / Синхронизация
export const CloudIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-3.9-4.4-.3-3.6-3.3-6.1-6.8-5.9-2.8.2-5.1 2.2-5.7 4.9C3.1 9.6 1 11.7 1 14.3c0 2.6 2.1 4.7 4.7 4.7z" />
    </IconWrapper>
);

// Замок (закрыто)
export const LockIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconWrapper>
);

// Замок (открыто)
export const UnlockIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </IconWrapper>
);

// Вход
export const LogInIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
    </IconWrapper>
);

// Выход
export const LogOutIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </IconWrapper>
);

// Машина / Автосервис
export const CarIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.6-3.8A2 2 0 0013.6 5H8.4a2 2 0 00-1.7 1L4 10l-2.5 1a2 2 0 00-1.5 2v3c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
    </IconWrapper>
);

// 💰 Деньги / Доход
export const MoneyIcon = (props) => (
    <IconWrapper {...props}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </IconWrapper>
);

// ➕ Плюс / Добавить
export const PlusIcon = (props) => (
    <IconWrapper {...props}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </IconWrapper>
);

// ✏️ Редактировать
export const EditIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </IconWrapper>
);

// 🗑️ Удалить
export const TrashIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </IconWrapper>
);

// 💾 Сохранить
export const SaveIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </IconWrapper>
);

// 📊 Статистика / График
export const ChartIcon = (props) => (
    <IconWrapper {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </IconWrapper>
);

// 📈 Рост / Тренд вверх
export const TrendUpIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </IconWrapper>
);

// 📅 Календарь
export const CalendarIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </IconWrapper>
);

// 📋 Список / Записи
export const ListIcon = (props) => (
    <IconWrapper {...props}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </IconWrapper>
);

// 📝 Заметка / Комментарий
export const NoteIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </IconWrapper>
);

// 🔍 Поиск / Фильтр
export const SearchIcon = (props) => (
    <IconWrapper {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </IconWrapper>
);

// 📄 Документ / Экспорт
export const FileTextIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </IconWrapper>
);

// ⬇️ Скачать
export const DownloadIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </IconWrapper>
);

// ☀️ Солнце (светлая тема)
export const SunIcon = (props) => (
    <IconWrapper {...props}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </IconWrapper>
);

// 🌙 Луна (темная тема)
export const MoonIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </IconWrapper>
);

// 🏆 Трофей / Лучший
export const TrophyIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </IconWrapper>
);

// ⌨️ Клавиатура
export const KeyboardIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
        <path d="M6 8h.001" />
        <path d="M10 8h.001" />
        <path d="M14 8h.001" />
        <path d="M18 8h.001" />
        <path d="M8 12h.001" />
        <path d="M12 12h.001" />
        <path d="M16 12h.001" />
        <path d="M7 16h10" />
    </IconWrapper>
);

// ✕ Закрыть / Крестик
export const XIcon = (props) => (
    <IconWrapper {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </IconWrapper>
);

// ✓ Галочка
export const CheckIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="20 6 9 17 4 12" />
    </IconWrapper>
);

// ⚠️ Предупреждение
export const AlertIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </IconWrapper>
);

// 📂 Папка
export const FolderIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </IconWrapper>
);

// ℹ️ Информация
export const InfoIcon = (props) => (
    <IconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </IconWrapper>
);

// 🔄 Обновить / Сбросить
export const RefreshIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </IconWrapper>
);

// 👤 Пользователь
export const UserIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </IconWrapper>
);

// 👥 Группа пользователей
export const UsersIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconWrapper>
);

// 💼 Кейс / Работа
export const BriefcaseIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </IconWrapper>
);

// 🔍 Фильтр / Воронка
export const FilterIcon = (props) => (
    <IconWrapper {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </IconWrapper>
);

// 🌍 Глобус (Язык)
export const GlobeIcon = (props) => (
    <IconWrapper {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </IconWrapper>
);

// ⬇️ Стрелка вниз
export const ChevronDownIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="6 9 12 15 18 9" />
    </IconWrapper>
);

// 📞 Телефон
export const PhoneIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </IconWrapper>
);

// 🕒 История / Бэкап
export const HistoryIcon = (props) => (
    <IconWrapper {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </IconWrapper>
);

// 🖥️ Терминал / Программирование
export const TerminalIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
    </IconWrapper>
);

// 📟 Процессор / Чип-тюнинг
export const CpuIcon = (props) => (
    <IconWrapper {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
    </IconWrapper>
);

// 📈 Активность / Диагностика
export const ActivityIcon = (props) => (
    <IconWrapper {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconWrapper>
);

// Экспорт всех иконок как объект
export const Icons = {
    Chip: ChipIcon,
    Car: CarIcon,
    Money: MoneyIcon,
    Plus: PlusIcon,
    Edit: EditIcon,
    Trash: TrashIcon,
    Save: SaveIcon,
    Chart: ChartIcon,
    TrendUp: TrendUpIcon,
    Calendar: CalendarIcon,
    List: ListIcon,
    Note: NoteIcon,
    Search: SearchIcon,
    FileText: FileTextIcon,
    Download: DownloadIcon,
    Sun: SunIcon,
    Moon: MoonIcon,
    Trophy: TrophyIcon,
    Keyboard: KeyboardIcon,
    X: XIcon,
    Check: CheckIcon,
    Alert: AlertIcon,
    Folder: FolderIcon,
    Info: InfoIcon,
    Refresh: RefreshIcon,
    User: UserIcon,
    Users: UsersIcon,
    Cloud: CloudIcon,
    Lock: LockIcon,
    Unlock: UnlockIcon,
    LogIn: LogInIcon,
    LogOut: LogOutIcon,
    Globe: GlobeIcon,
    ChevronDown: ChevronDownIcon,
    Filter: FilterIcon,
    Briefcase: BriefcaseIcon,
    Phone: PhoneIcon,
    History: HistoryIcon,
    Terminal: TerminalIcon,
    Cpu: CpuIcon,
    Activity: ActivityIcon
};


export default Icons;

