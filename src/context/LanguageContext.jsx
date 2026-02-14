import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
    ru: {
        // Common
        appTitle: 'Учет доходов',
        export: 'Экспорт',
        logout: 'Выйти',
        adminPanel: 'Админ-панель',
        viewMode: 'Просмотр',
        theme: 'Тема',
        language: 'Язык',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Изменить',
        add: 'Добавить',
        loading: 'Загрузка...',
        actions: 'Действия',
        search: 'Поиск...',

        // Income Form
        newRecord: 'Новая запись',
        editRecord: 'Редактирование',
        amount: 'Сумма',
        workType: 'Тип работы',
        executors: 'Исполнители',
        comment: 'Комментарий',
        date: 'Дата',
        carBrand: 'Марка авто',
        vin: 'VIN',
        placeholderAmount: '0.00',
        placeholderCarBrand: 'Напр. Toyota Camry',
        placeholderVin: '17-значный номер',
        placeholderComment: 'Дополнительные детали...',
        placeholderExecutors: 'Выберите исполнителей...',
        placeholderWorkType: 'Выберите тип работы...',

        // Table
        incomeList: 'Список доходов',
        tableEmpty: 'Записей пока нет',
        tableEmptySub: 'Добавьте первую запись о доходе',
        tableDate: 'Дата',
        tableAmount: 'Сумма',
        tableWorkType: 'Тип работы',
        tableExecutors: 'Исполнители',
        tableComment: 'Комментарий',
        tableActions: 'Действия',
        confirmDelete: 'Удалить запись?',

        // Statistics
        statsTitle: 'Статистика',
        statsMonthRecord: 'Рекорд месяца',
        statsDailyAvg: 'В среднем в день',
        statsTotal: 'Всего за период',
        statsBestDay: 'Самый прибыльный день',
        statsCurrency: 'BYN',

        // Filters
        chartTitle: 'График доходов',
        filterTitle: 'Фильтры',
        filterMonth: 'Месяц',
        filterDay: 'День',
        filterExecutor: 'Сотрудник',
        filterAllMonths: 'Все месяцы',
        filterAllDays: 'Все дни',
        filterAllExecutors: 'Все',
        daySuffix: 'число',
        filterReset: 'Сбросить',

        // Work Types
        typeDiagnostics: 'Диагностика',
        typeMaintenance: 'ТО (Масло/Фильтры)',
        typeSuspension: 'Ходовая часть',
        typeEngine: 'Двигатель',
        typeBrakes: 'Тормозная система',
        typeElectrical: 'Электрика',
        typeAirConditioning: 'Кондиционер',
        typeHeating: 'Отопление',
        typeChipTuning: 'Чип-тюнинг',
        typeBlockRepair: 'Ремонт блока',
        typeProgrammingCoding: 'Программирование и кодирование',
        typeAtRepair: 'Ремонт АКПП',
        typeOther: 'Прочее',

        // Auth
        loginTitle: 'Вход в систему',
        loginSub: 'Введите данные для доступа',
        loginUsername: 'Ваш логин',
        loginPassword: 'Ваш пароль',
        loginSubmit: 'Войти',
        loginError: 'Неверный логин или пароль',
        loginLegacyHint: 'По умолчанию admin / 1234',

        // Cloud Sync
        syncTitle: 'Обмен данными',
        syncUrlLabel: 'URL веб-приложения Google Script', // Not used anymore but kept for safety if referenced elsewhere
        syncHint: 'Синхронизация данных с облачной базой',
        syncSaveBtn: 'Записи',
        syncLoadBtn: 'Загрузить',
        syncUsersBtn: 'Инициализировать лист Users',
        syncSuccess: 'Данные успешно синхронизированы',
        syncError: 'Ошибка синхронизации',
        syncConfirmLoad: 'Это заменят локальные данные. Продолжить?',

        // User management
        usersTitle: 'Управление пользователями',
        usersList: 'Список',
        usersAddUser: 'Добавить пользователя',
        usersEditUser: 'Редактировать пользователя',
        usersUsername: 'Логин',
        usersPassword: 'Пароль',
        usersFullName: 'Полное имя',
        usersRole: 'Роль',
        usersRoleAdmin: 'Администратор',
        usersRoleEmployee: 'Сотрудник',
        usersSyncCloud: 'Сохранить в облако',
        usersConfirmDelete: 'Удалить пользователя?',

        // Roles
        roleAdmin: 'Админ',
        roleEmployee: 'Сотрудник',
        exportPeriodTitle: 'Настройка экспорта',
        exportDateFrom: 'С даты',
        exportDateTo: 'По дату',
        exportMonthBtn: 'Экспорт за текущий месяц',
        exportAllBtn: 'Экспорт всех данных',
        exportRangeBtn: 'Экспорт за выбранный период',
        exportFormat: 'Формат файла',
        formatTxt: 'Текстовый файл (.txt)',
        formatPdf: 'PDF документ (.pdf)',

        // Months (Russian)
        month1: 'Январь', month2: 'Февраль', month3: 'Март', month4: 'Апрель',
        month5: 'Май', month6: 'Июнь', month7: 'Июль', month8: 'Август',
        month9: 'Сентябрь', month10: 'Октябрь', month11: 'Ноябрь', month12: 'Декабрь'

    },
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        try {
            const stored = typeof window !== 'undefined' && window.localStorage
                ? (window.localStorage.getItem('autoservice-lang') || 'ru')
                : 'ru';
            return stored === 'ge' ? 'ru' : stored;
        } catch (e) {
            return 'ru';
        }
    });

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem('autoservice-lang', lang);
            }
            if (document.documentElement) document.documentElement.lang = lang;
        } catch (e) { /* ignore */ }
    }, [lang]);

    const t = (key) => {
        if (!key) return '';
        const langKey = lang === 'ge' ? 'ru' : (lang || 'ru');
        const tr = TRANSLATIONS[langKey] || TRANSLATIONS['ru'];
        return (tr && tr[key]) || (TRANSLATIONS['ru'] && TRANSLATIONS['ru'][key]) || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
