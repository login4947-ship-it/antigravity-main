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
        statsCurrency: '₾',

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
    ge: {
        // Common
        appTitle: 'შემოსავლების აღრიცხვა',
        export: 'ექსპორტი',
        logout: 'გასვლა',
        adminPanel: 'ადმინ-პანელი',
        viewMode: 'ნახვა',
        theme: 'თემა',
        language: 'ენა',
        save: 'შენახვა',
        cancel: 'გაუქმება',
        delete: 'წაშლა',
        edit: 'შეცვლა',
        add: 'დამატება',
        loading: 'იტვირთება...',
        actions: 'მოქმედებები',
        search: 'ძებნა...',

        // Income Form
        newRecord: 'ახალი ჩანაწერი',
        editRecord: 'რედაქტირება',
        amount: 'თანხა',
        workType: 'სამუშაოს ტიპი',
        executors: 'შემსრულებლები',
        comment: 'კომენტარი',
        date: 'თარიღი',
        carBrand: 'ავტომობილის მარკა',
        vin: 'VIN',
        placeholderAmount: '0.00',
        placeholderCarBrand: 'მაგ. Toyota Camry',
        placeholderVin: '17-ნიშნა ნომერი',
        placeholderComment: 'დამატებითი დეტალები...',
        placeholderExecutors: 'აირჩიეთ შემსრულებლები...',
        placeholderWorkType: 'აირჩიეთ სამუშაოს ტიპი...',

        // Table
        incomeList: 'შემოსავლების სია',
        tableEmpty: 'ჩანაწერები არ არის',
        tableEmptySub: 'დაამატეთ პირველი ჩანაწერი',
        tableDate: 'თარიღი',
        tableAmount: 'თანხა',
        tableWorkType: 'სამუშაოს ტიპი',
        tableExecutors: 'შემსრულებლები',
        tableComment: 'კომენტარი',
        tableActions: 'მოქმედებები',
        confirmDelete: 'წავშალოთ ჩანაწერი?',

        // Statistics
        statsTitle: 'სტატისტიკა',
        statsMonthRecord: 'თვის რეკორდი',
        statsDailyAvg: 'საშუალო დღეში',
        statsTotal: 'ჯამი პერიოდისთვის',
        statsBestDay: 'ყველაზე შემოსავლიანი დღე',
        statsCurrency: '₾',

        // Filters
        chartTitle: 'შემოსავლების გრაფიკი',
        filterTitle: 'ფილტრები',
        filterMonth: 'თვე',
        filterDay: 'დღე',
        filterExecutor: 'თანამშრომელი',
        filterAllMonths: 'ყველა თვე',
        filterAllDays: 'ყველა დღე',
        filterAllExecutors: 'ყველა',
        daySuffix: 'რიცხვი',
        filterReset: 'გასუფთავება',

        // Work Types
        typeDiagnostics: 'დიაგნოსტიკა',
        typeMaintenance: 'ტექ. დათვალიერება',
        typeSuspension: 'სავალი ნაწილი',
        typeEngine: 'ძრავი',
        typeBrakes: 'სამუხრუჭე სისტემა',
        typeElectrical: 'ელექტროობა',
        typeAirConditioning: 'კონდიციონერი',
        typeHeating: 'გათბობა',
        typeChipTuning: 'ჩიპ-ტიუნინგი',
        typeBlockRepair: 'ბლოკის რემონტი',
        typeProgrammingCoding: 'პროგრამირება და კოდირება',
        typeAtRepair: 'ავტომატური ტრანსმისიის რემონტი',
        typeOther: 'სხვა',

        // Auth
        loginTitle: 'სისტემაში შესვლა',
        loginSub: 'შეიყვანეთ მონაცემები წვდომისთვის',
        loginUsername: 'თქვენი ლოგინი',
        loginPassword: 'თქვენი პაროლი',
        loginSubmit: 'შესვლა',
        loginError: 'ლოგინი ან პაროლი არასწორია',
        loginLegacyHint: 'სტანდარტული: admin / 1234',

        // Cloud Sync
        syncTitle: 'მონაცემთა გაცვლა',
        syncUrlLabel: 'Google Script-ის URL',
        syncHint: 'სინქრონიზაცია ღრუბლოვან ბაზასთან',
        syncSaveBtn: 'ჩანაწერები',
        syncLoadBtn: 'ჩამოტვირთვა',
        syncUsersBtn: 'Users ფურცლის ინიციალიზაცია',
        syncSuccess: 'მონაცემები წარმატებით შესრულდა',
        syncError: 'სინქრონიზაციის შეცდომა',
        syncConfirmLoad: 'ეს შეცვლის ლოკალურ მონაცემებს. გავაგრძელოთ?',

        // User management
        usersTitle: 'მომხმარებლების მართვა',
        usersList: 'სია',
        usersAddUser: 'მომხმარებლის დამატება',
        usersEditUser: 'რედაქტირება',
        usersUsername: 'ლოგინი',
        usersPassword: 'პაროლი',
        usersFullName: 'სრული სახელი',
        usersRole: 'როლი',
        usersRoleAdmin: 'ადმინისტრატორი',
        usersRoleEmployee: 'თანამშრომელი',
        usersSyncCloud: 'ღრუბელში შენახვა',
        usersConfirmDelete: 'წავშალოთ მომხმარებელი?',

        // Roles
        roleAdmin: 'ადმინი',
        roleEmployee: 'თანამშრომელი',
        exportPeriodTitle: 'ექსპორტის პარამეტრები',
        exportDateFrom: 'თარიღიდან',
        exportDateTo: 'თარიღამდე',
        exportMonthBtn: 'ექსპორტი მიმდინარე თვისთვის',
        exportAllBtn: 'ყველა მონაცემის ექსპორტი',
        exportRangeBtn: 'ექსპორტი არჩეული პერიოდისთვის',
        exportFormat: 'ფაილის ფორმატი',
        formatTxt: 'ტექსტური ფაილი (.txt)',
        formatPdf: 'PDF დოკუმენტი (.pdf)',

        // Months (Georgian)
        month1: 'იანვარი', month2: 'თებერვალი', month3: 'მარტი', month4: 'აპრილი',
        month5: 'მაისი', month6: 'ივნისი', month7: 'ივლისი', month8: 'აგვისტო',
        month9: 'სექტემბერი', month10: 'ოქტომბერი', month11: 'ნოემბერი', month12: 'დეკემბერი'

    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        try {
            return typeof window !== 'undefined' && window.localStorage
                ? (window.localStorage.getItem('autoservice-lang') || 'ru')
                : 'ru';
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
        const tr = TRANSLATIONS[lang] || TRANSLATIONS['ru'];
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
