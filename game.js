/* =========================================================
   BESTLIFE — GAME.JS
   Полный обновленный код игры
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* =========================================================
       ОСНОВНЫЕ СОСТОЯНИЯ ИГРЫ
       ========================================================= */

    const camera = {
        x: 0,
        y: 0,
        zoom: 1,
        minZoom: 0.8,
        maxZoom: 4.5,
        isDragging: false,
        lastX: 0,
        lastY: 0,
        touchPinchDist: 0
    };

    let animTimer = 0;
    let lastFrameTime = performance.now();
    let renderLoopStarted = false;
    let setupControlsInitialized = false;
    let toastTimeoutId = null;
    let taxiTimerId = null;
    let currentScreen = 'city';
    let lastExitedLocation = 'home';
    let justEnteredApartment = false;
    let isClockRunning = false;
    let isSleeping = false;

    let gameMinutes = 360;
    let currentDay = 1;
    let currentMonthIdx = 4;
    let playerMoney = 1000;
    let playerHunger = 100;
    let playerSleep = 100;
    let playerEnergy = 100;

    let soundVolume = 33;
    let musicVolume = 33;
    let currentMusicId = 'default_music';
    let unlockedMusicIds = ['default_music', 'chimaev'];

    let foodCart = [];
    let pendingFoodDeliveries = [];
    let bankHistory = [];
    let messages = [];
    let finesList = [];
    let workPenalties = [];
    let scheduledEvents = [];
    let ownedCars = [];
    let taxes = [];

    let phoneView = 'home';
    let currentPhoneApp = null;
    let currentOpenedMessage = null;
    let finesTab = 'unpaid';

    let totalOrdersCompleted = 0;
    let ordersCompletedToday = 0;
    let ordersCounterDay = null;
    let taxReminderDaysSent = {};

    let truckerTotalOrdersCompleted = 0;
    let truckerOrdersCompletedToday = 0;
    let truckerOrdersCounterDay = null;

    let cashierTotalShiftsCompleted = 0;
    let cashierCustomersServed = 0;
    let cashierCustomersSkipped = 0;

    let governmentNewYearRewardClaimed = false;
    let governmentRewardYearKey = null;

    let targetLocationSelected = null;
    let walkClicksLeft = 150;

    let jobState = {
        activeJobId: null,
        pendingJobId: null,
        interviewDay: null,
        interviewMinutes: null
    };

    let truckerJobState = {
        activeJobId: null,
        pendingJobId: null,
        interviewDay: null,
        interviewMinutes: null
    };

    let cashierJobState = {
        activeJobId: null,
        pendingJobId: null,
        interviewDay: null,
        interviewMinutes: null,
        interviewStep: 0,
        interviewAnswers: []
    };

    let pddQuizState = {
        questionIndex: 0,
        answersGiven: []
    };

    let cashierInterviewState = {
        questionIndex: 0,
        answersGiven: []
    };

    let truckerCurrentOffers = [];

    let truckerTripState = {
        active: false,
        order: null,
        currentClicks: 0,
        totalClicks: 0
    };

    let orderState = {
        active: false,
        level: null,
        title: '',
        reward: 0,
        flameCount: 0,
        flameHitsRequired: 3,
        routeProgress: 0,
        status: null,
        startedAtDay: null,
        startedAtMinutes: null
    };

    let lottoState = {
        selectedTier: null,
        selectedTicketIndexes: [],
        ticketsBought: [],
        ticketsData: [],
        drawNumbers: [],
        step: 'select_tier',
        matchesPerTicket: []
    };

    /* =========================================================
       СОСТОЯНИЕ КАССИРА
       ========================================================= */

    let cashierShiftState = {
        active: false,
        startedAtMinutes: null,
        customer: null,
        checkAmount: 0,
        customerPaid: 0,
        changeDue: 0,
        selectedChange: 0,
        selectedDenominations: [],
        shiftCompleted: false,
        salaryEarned: 0,
        onBreak: false,
        breakStartMinutes: null
    };

    let cashierCustomers = [];
    let currentCustomerIndex = 0;

    /* =========================================================
       КОНСТАНТЫ
       ========================================================= */

    const MONTH_NAMES = ['янв', 'февр', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'];
    const DAYS_IN_MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const CIRCUMFERENCE = 113.097;

    const GAME_MINUTES_PER_REAL_SECOND = 2.4;
    const HUNGER_EMPTY_HOURS = 5;
    const ENERGY_EMPTY_HOURS = 6;
    const SLEEP_EMPTY_HOURS = 15;
    const SLEEP_TIME_MULTIPLIER = 7;
    const SLEEP_RESTORE_HOURS = 8.5;
    const ENERGY_RESTORE_HOURS = 7.5;
    const SLEEP_HUNGER_SLOWDOWN = 5;

    const SALARY_TAX_RATE = 0.03;
    const CAR_TAX_RATE = 0.05;
    const LOTTERY_TAX_RATE = 0.015;
    const TAX_PAYMENT_DAYS = 7;
    const FINE_PAYMENT_DAYS = 3;
    const NEW_YEAR_REWARD = 3000;

    const CASHIER_SHIFT_START_HOUR = 9;
    const CASHIER_SHIFT_END_HOUR = 21;
    const CASHIER_BREAK_START_HOUR = 13;
    const CASHIER_BREAK_END_HOUR = 14.5;
    const CASHIER_SALARY = 11500;
    const CASHIER_LATE_FINE = 2500;
    const CASHIER_EARLY_END_FINE = 3000;
    const CASHIER_TAX_RATE = 0.03;
    const CASHIER_CHECK_MIN = 75;
    const CASHIER_CHECK_MAX = 1000;

    const CASHIER_DENOMINATIONS = [
        { id: 'rub_5000', value: 5000, label: '5000 ₽', image: 'cash/rub_5000.png' },
        { id: 'rub_2000', value: 2000, label: '2000 ₽', image: 'cash/rub_2000.png' },
        { id: 'rub_1000', value: 1000, label: '1000 ₽', image: 'cash/rub_1000.png' },
        { id: 'rub_500', value: 500, label: '500 ₽', image: 'cash/rub_500.png' },
        { id: 'rub_100', value: 100, label: '100 ₽', image: 'cash/rub_100.png' },
        { id: 'rub_50', value: 50, label: '50 ₽', image: 'cash/rub_50.png' },
        { id: 'coin_10', value: 10, label: '10 ₽', image: 'cash/coin_10.png' },
        { id: 'coin_5', value: 5, label: '5 ₽', image: 'cash/coin_5.png' },
        { id: 'coin_2', value: 2, label: '2 ₽', image: 'cash/coin_2.png' },
        { id: 'coin_1', value: 1, label: '1 ₽', image: 'cash/coin_1.png' }
    ];

    const MAP_POINTS = {
        home: { x: 0.36, y: 0.42 },
        firestation: { x: 0.65, y: 0.55 },
        truckstation: { x: 0.20, y: 0.68 },
        market: { x: 0.50, y: 0.65 }
    };

    const TAXI_ROUTE_PRICES = {
        'home->firestation': 650,
        'home->truckstation': 575,
        'home->market': 450,
        'firestation->home': 650,
        'firestation->truckstation': 700,
        'firestation->market': 550,
        'truckstation->home': 650,
        'truckstation->firestation': 575,
        'truckstation->market': 500,
        'market->home': 450,
        'market->firestation': 550,
        'market->truckstation': 500
    };

    const ORDER_TYPES = {
        easy: { key: 'easy', title: 'Лёгкий заказ', reward: 600, flames: 5, hits: 3 },
        medium: { key: 'medium', title: 'Средний заказ', reward: 700, flames: 7, hits: 3 },
        hard: { key: 'hard', title: 'Сложный заказ', reward: 850, flames: 10, hits: 5 }
    };

    const TRUCKER_ORDERS_POOL = [
        { id: 1, dist: 456, rate: 5 },
        { id: 2, dist: 570, rate: 4 },
        { id: 3, dist: 700, rate: 4.5 },
        { id: 4, dist: 900, rate: 3.3 },
        { id: 5, dist: 223, rate: 6 },
        { id: 6, dist: 1325, rate: 1.1 },
        { id: 7, dist: 767, rate: 2.67 }
    ];

    const PDD_QUESTIONS = [
        {
            title: 'Что означает дорожный знак «Въезд запрещён»?',
            image: 'pdd_brick.png',
            correct: 0,
            options: [
                'Въезд всех транспортных средств в данном направлении запрещён',
                'Главная дорога',
                'Движение без остановки запрещено',
                'Стоянка запрещена'
            ]
        },
        {
            title: 'Что означает дорожный знак «Главная дорога»?',
            image: 'pdd_main_road.png',
            correct: 1,
            options: [
                'Уступите дорогу',
                'Право преимущественного проезда нерегулируемого перекрёстка',
                'Конец главной дороги',
                'Главная дорога с односторонним движением'
            ]
        }
    ];

    const CASHIER_INTERVIEW_QUESTIONS = [
        {
            title: 'Сколько нужно дать сдачи, если покупка стоила 456 ₽, а клиент дал 550 ₽?',
            correct: 0,
            options: ['94 ₽', '104 ₽', '114 ₽', '124 ₽']
        },
        {
            title: 'Сколько бутылок воды можно купить на 500 ₽, если одна бутылка стоит 40 ₽?',
            correct: 0,
            options: ['12', '13', '14', '15']
        }
    ];

    const LOTTO_TIERS = [
        { price: 100, label: '100 ₽', icon: '🎫' },
        { price: 1000, label: '1 000 ₽', icon: '🎟️' },
        { price: 30000, label: '30 000 ₽', icon: '⭐' },
        { price: 250000, label: '250 000 ₽', icon: '💎' },
        { price: 1000000, label: '1 000 000 ₽', icon: '👑' },
        { price: 100000000, label: '100 000 000 ₽', icon: '🔥' }
    ];

    const JOBS = [
        {
            id: 'firefighter',
            title: 'Пожарный',
            icon: '🚒',
            salary: 65000,
            schedule: 'Рабочее время: 07:00–19:00',
            description: 'Тушить пожары, спасать людей и выполнять заказы МЧС.'
        },
        {
            id: 'driver',
            title: 'Дальнобойщик',
            icon: '🚛',
            salary: 90000,
            schedule: 'Рабочее время: 05:00–20:00',
            description: 'Доставлять грузы по всей стране на большегрузном автомобиле.'
        },
        {
            id: 'cashier',
            title: 'Кассир',
            icon: '🛒',
            salary: 11500,
            schedule: 'Рабочее время: 09:00–21:00',
            description: 'Работа в магазине, обслуживание покупателей, работа с кассой.'
        },
        {
            id: 'seller',
            title: 'Продавец',
            icon: '🛒',
            salary: 42000,
            schedule: '2/2, 10:00–22:00',
            description: 'Работа с покупателями и товаром.'
        },
        {
            id: 'police',
            title: 'Полицейский',
            icon: '👮',
            salary: 70000,
            schedule: '5/2, 08:00–17:00',
            description: 'Охранять порядок в городе.'
        },
        {
            id: 'electrician',
            title: 'Электрик',
            icon: '⚡',
            salary: 58000,
            schedule: '5/2, 09:00–18:00',
            description: 'Ремонтировать электросети и оборудование.'
        }
    ];

    const FOOD_ITEMS = [
        { id: 'hleb', name: 'Хлеб', hunger: 40, price: 45, image: 'food/hleb.png' },
        { id: 'voda', name: 'Вода', hunger: 10, price: 30, image: 'food/voda.png' },
        { id: 'makarony', name: 'Макароны', hunger: 50, price: 85, image: 'food/makarony.png' },
        { id: 'sok', name: 'Сок', hunger: 15, price: 95, image: 'food/sok.png' },
        { id: 'fries', name: 'Картошка фри', hunger: 35, price: 120, image: 'food/fries.png' },
        { id: 'borshch', name: 'Борщ', hunger: 40, price: 150, image: 'food/borshch.png' },
        { id: 'gercules', name: 'Геркулес', hunger: 67, price: 65, image: 'food/gercules.png' },
        { id: 'gamburger', name: 'Гамбургер', hunger: 55, price: 250, image: 'food/gamburger.png' },
        { id: 'ris', name: 'Рис', hunger: 33, price: 75, image: 'food/ris.png' },
        { id: 'snickers', name: 'Сникерс', hunger: 20, price: 70, image: 'food/snickers.png' },
        { id: 'morozhenoe', name: 'Мороженое', hunger: 20, price: 90, image: 'food/morozhenoe.png' },
        { id: 'grechka', name: 'Гречка', hunger: 44, price: 70, image: 'food/grechka.png' },
        { id: 'kartoshka', name: 'Картошка жареная', hunger: 59, price: 110, image: 'food/kartoshka.png' },
        { id: 'pure', name: 'Пюре', hunger: 54, price: 95, image: 'food/pure.png' },
        { id: 'fasol', name: 'Фасоль', hunger: 55, price: 80, image: 'food/fasol.png' }
    ];

    const CARS = [
        { id: 'vaz2107', title: 'ВАЗ 2107', price: 150000, year: 2008, power: 74, color: 'Чёрная', accel: '14.5 сек', maxSpeed: '150 км/ч', imgPrefix: 'vaz_2107', desc: 'Классический заднеприводный седан.' },
        { id: 'priora', title: 'Лада Приора', price: 380000, year: 2015, power: 106, color: 'Белая', accel: '11.5 сек', maxSpeed: '183 км/ч', imgPrefix: 'lada_priora', desc: 'Популярная отечественная модель.' },
        { id: 'niva', title: 'Лада Нива', price: 450000, year: 2018, power: 83, color: 'Чёрная', accel: '17.0 сек', maxSpeed: '142 км/ч', imgPrefix: 'lada_niva', desc: 'Надёжный внедорожник.' },
        { id: 'kia_rio', title: 'Kia Rio', price: 950000, year: 2019, power: 123, color: 'Серая', accel: '10.3 сек', maxSpeed: '193 км/ч', imgPrefix: 'kia_rio', desc: 'Комфортный городской автомобиль.' },
        { id: 'solaris', title: 'Hyundai Solaris', price: 980000, year: 2020, power: 123, color: 'Красная', accel: '10.3 сек', maxSpeed: '193 км/ч', imgPrefix: 'hyundai_solaris', desc: 'Экономичный городской седан.' },
        { id: 'tiggo4', title: 'Chery Tiggo 4', price: 1850000, year: 2023, power: 147, color: 'Белая', accel: '9.7 сек', maxSpeed: '190 км/ч', imgPrefix: 'chery_tiggo_4_ultra', desc: 'Современный кроссовер.' },
        { id: 'rav4', title: 'Toyota RAV4', price: 2900000, year: 2021, power: 149, color: 'Белая', accel: '9.8 сек', maxSpeed: '190 км/ч', imgPrefix: 'toyota_rav4', desc: 'Надёжный японский кроссовер.' },
        { id: 'camry', title: 'Toyota Camry', price: 3400000, year: 2022, power: 249, color: 'Чёрная', accel: '7.7 сек', maxSpeed: '210 км/ч', imgPrefix: 'toyota_camry', desc: 'Комфортный бизнес-седан.' },
        { id: 'cls', title: 'Mercedes CLS', price: 5200000, year: 2020, power: 367, color: 'Чёрная', accel: '4.8 сек', maxSpeed: '250 км/ч', imgPrefix: 'mercedes_cls', desc: 'Элегантное четырёхдверное купе.' },
        { id: 'range_rover', title: 'Land Rover Range Rover', price: 8500000, year: 2021, power: 400, color: 'Чёрная', accel: '5.4 сек', maxSpeed: '225 км/ч', imgPrefix: 'land_rover_range_rover', desc: 'Роскошный внедорожник.' },
        { id: 'm5_f90', title: 'BMW M5 F90', price: 9200000, year: 2021, power: 600, color: 'Чёрная', accel: '3.4 сек', maxSpeed: '305 км/ч', imgPrefix: 'bmw_m5_f90', desc: 'Мощный спортивный седан.' },
        { id: 'amg_gt4', title: 'Mercedes AMG GT 4', price: 12500000, year: 2022, power: 639, color: 'Белая', accel: '3.2 сек', maxSpeed: '315 км/ч', imgPrefix: 'mercedes_amg_gt_4', desc: 'Спортивное купе AMG.' },
        { id: 'm8', title: 'BMW M8', price: 14000000, year: 2023, power: 625, color: 'Зелёная', accel: '3.2 сек', maxSpeed: '305 км/ч', imgPrefix: 'bmw_m8', desc: 'Флагманское спортивное купе.' },
        { id: 'g_class', title: 'Mercedes-Benz G-Класс', price: 18500000, year: 2022, power: 585, color: 'Чёрная', accel: '4.5 сек', maxSpeed: '220 км/ч', imgPrefix: 'mercedes_g_class', desc: 'Легендарный G-Класс.' },
        { id: 'maybach', title: 'Mercedes Maybach', price: 28000000, year: 2023, power: 503, color: 'Чёрная', accel: '4.8 сек', maxSpeed: '250 км/ч', imgPrefix: 'mercedes_maybach', desc: 'Представительский автомобиль.' },
        { id: 'cullinan', title: 'Rolls-Royce Cullinan', price: 45000000, year: 2022, power: 571, color: 'Голубая', accel: '5.2 сек', maxSpeed: '250 км/ч', imgPrefix: 'rolls_royce_cullinan', desc: 'Роскошный внедорожник.' },
        { id: 'phantom', title: 'Rolls-Royce Phantom', price: 65000000, year: 2023, power: 571, color: 'Чёрная', accel: '5.3 сек', maxSpeed: '250 км/ч', imgPrefix: 'rolls_royce_phantom', desc: 'Вершина автомобильной роскоши.' },
        { id: 'revuelto', title: 'Lamborghini Revuelto', price: 100000000, year: 2024, power: 1015, color: 'Оранжевая', accel: '2.5 сек', maxSpeed: '350 км/ч', imgPrefix: 'lamborghini_revuelto', desc: 'Гибридный суперкар с V12.' },
        { id: 'veyron', title: 'Bugatti Veyron', price: 140000000, year: 2015, power: 1001, color: 'Голубая', accel: '2.5 сек', maxSpeed: '407 км/ч', imgPrefix: 'bugatti_veyron', desc: 'Легендарный гиперкар.' },
        { id: 'chiron', title: 'Bugatti Chiron', price: 250000000, year: 2022, power: 1500, color: 'Голубая', accel: '2.4 сек', maxSpeed: '420 км/ч', imgPrefix: 'bugatti_chiron', desc: 'Экстремально быстрый гиперкар.' }
    ];

    const MUSIC_TRACKS = [
        { id: 'default_music', title: 'Нейтральный трек', file: 'music.mp3', image: 'logo/music.png', price: 0 },
        { id: 'chimaev', title: 'Чимаев', file: 'music/Chimaev.mp3', image: 'music/Chimaev.png', price: 0 },
        { id: 'gaethje', title: 'Гейджи', file: 'music/Gaethje.mp3', image: 'music/Gaethje.png', price: 500 },
        { id: 'tsarukyan', title: 'Царукян', file: 'music/Tsarukyan.mp3', image: 'music/Tsarukyan.png', price: 1000 },
        { id: 'oliveira', title: 'Оливейра', file: 'music/Oliveira.mp3', image: 'music/Oliveira.png', price: 1200 },
        { id: 'oliveira_edit', title: 'Оливейра (Эдит)', file: 'music/Oliveira_edit.mp3', image: 'music/Oliveira_edit.png', price: 1500 },
        { id: 'khabib', title: 'Хабиб', file: 'music/Khabib.mp3', image: 'music/Khabib.png', price: 2000 },
        { id: 'makhachev', title: 'Махачев', file: 'music/Makhachev.mp3', image: 'music/Makhachev.png', price: 2200 },
        { id: 'topuria', title: 'Топурия', file: 'music/Topuria.mp3', image: 'music/Topuria.png', price: 3333 }
    ];

    const APP_NAMES = {
        taxi: 'Такси',
        work: 'Работа.ру',
        shtraf: 'Штрафы',
        plat: 'Оплата',
        business: 'Бизнес',
        karta: 'Счёт',
        avto: 'Авто.ру',
        casino: 'Лотерея',
        sms: 'СМС',
        eda: 'Еда',
        poisk: 'Поиск',
        zakaz: 'Заказ',
        kollectiv: 'Коллектив',
        imushka: 'Имущество',
        compania: 'Компания'
    };

    /* =========================================================
       DOM-ЭЛЕМЕНТЫ
       ========================================================= */

    const introScreen = document.getElementById('intro-screen');
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const genderModal = document.getElementById('gender-modal');
    const settingsModal = document.getElementById('settings-modal');
    const musicModal = document.getElementById('music-modal');
    const apartmentScreen = document.getElementById('apartment-screen');
    const firestationScreen = document.getElementById('firestation-screen');
    const truckstationScreen = document.getElementById('truckstation-screen');
    const marketScreen = document.getElementById('market-screen');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    const bedImg = document.getElementById('bed-img');
    const bedModal = document.getElementById('bed-modal');
    const bedModalTitle = document.getElementById('bed-modal-title');
    const bedModalText = document.getElementById('bed-modal-text');
    const btnSleepAction = document.getElementById('btn-sleep-action');
    const btnCloseBedModal = document.getElementById('btn-close-bed-modal');
    const sleepOverlay = document.getElementById('sleep-overlay');
    const btnWakeUp = document.getElementById('btn-wake-up');

    const btnOpenPhone = document.getElementById('btn-open-phone');
    const phoneModal = document.getElementById('phone-modal');
    const btnClosePhone = document.getElementById('btn-close-phone');
    const phoneAppsGrid = document.getElementById('phone-apps-grid');
    const phoneAppContent = document.getElementById('phone-app-content');
    const btnPhoneBack = document.getElementById('btn-phone-back');
    const phoneStatusBar = document.getElementById('phone-status-bar');
    const appTitleText = document.getElementById('app-title-text');
    const appScrollableBody = document.getElementById('app-scrollable-body');

    const hudTopBar = document.getElementById('hud-top-bar');
    const btnOpenSettingsGame = document.getElementById('btn-open-settings-game');
    const phoneBtnWrapper = document.getElementById('phone-btn-wrapper');
    const playerStatsHUD = document.getElementById('player-stats-hud');
    const phoneBadge = document.getElementById('phone-badge');
    const smsAppBadge = document.getElementById('sms-app-badge');
    const kollectivAppBadge = document.getElementById('kollectiv-app-badge');

    const toastMessage = document.getElementById('toast-message');
    const bgMusic = document.getElementById('bg-music');
    const clickSound = document.getElementById('click-sound');
    const soundSlider = document.getElementById('sound-volume-slider');
    const musicSlider = document.getElementById('music-volume-slider');
    const soundVolText = document.getElementById('sound-vol-text');
    const musicVolText = document.getElementById('music-vol-text');
    const musicTracksList = document.getElementById('music-tracks-list');

    const dialogueOverlay = document.getElementById('dialogue-overlay');
    const dialogueText = document.getElementById('dialogue-text');
    const btnDlgHiring = document.getElementById('btn-dlg-hiring');
    const btnDlgAbout = document.getElementById('btn-dlg-about');
    const btnDlgOrders = document.getElementById('btn-dlg-orders');
    const btnDlgClose = document.getElementById('btn-dlg-close');
    const firefighterNpc = document.getElementById('firefighter-npc-inroom');

    const truckerDialogueOverlay = document.getElementById('trucker-dialogue-overlay');
    const truckerDialogueText = document.getElementById('trucker-dialogue-text');
    const btnTruckerHiring = document.getElementById('btn-trucker-hiring');
    const btnTruckerAbout = document.getElementById('btn-trucker-about');
    const btnTruckerOrders = document.getElementById('btn-trucker-orders');
    const btnTruckerClose = document.getElementById('btn-trucker-close');
    const truckerNpc = document.getElementById('trucker-npc-inroom');

    const marketNpc = document.getElementById('market-npc-inroom');
    const marketDialogueOverlay = document.getElementById('market-dialogue-overlay');
    const marketDialogueText = document.getElementById('market-dialogue-text');
    const btnMarketHiring = document.getElementById('btn-market-hiring');
    const btnMarketAbout = document.getElementById('btn-market-about');
    const btnMarketWork = document.getElementById('btn-market-work');
    const btnMarketClose = document.getElementById('btn-market-close');

    const pddQuizModal = document.getElementById('pdd-quiz-modal');
    const pddStepBadge = document.getElementById('pdd-step-badge');
    const pddQuestionImg = document.getElementById('pdd-question-img');
    const pddQuestionTitle = document.getElementById('pdd-question-title');
    const pddAnswersGrid = document.getElementById('pdd-answers-grid');
    const btnClosePdd = document.getElementById('btn-close-pdd');

    const cashierInterviewModal = document.getElementById('cashier-interview-modal');
    const cashierStepBadge = document.getElementById('cashier-step-badge');
    const cashierQuestionTitle = document.getElementById('cashier-question-title');
    const cashierAnswersGrid = document.getElementById('cashier-answers-grid');
    const btnCloseCashierInterview = document.getElementById('btn-close-cashier-interview');

    const cashierWorkScreen = document.getElementById('cashier-work-screen');
    const btnExitCashierWork = document.getElementById('btn-exit-cashier-work');
    const cashierCheckDisplay = document.getElementById('cashier-check-display');
    const cashierPaidDisplay = document.getElementById('cashier-paid-display');
    const cashierChangeDueDisplay = document.getElementById('cashier-change-due-display');
    const cashierSelectedDisplay = document.getElementById('cashier-selected-display');
    const cashierSelectedItemsTray = document.getElementById('cashier-selected-items-tray');
    const cashierDenominationsGrid = document.getElementById('cashier-denominations-grid');
    const btnCashierGiveChange = document.getElementById('btn-cashier-give-change');
    const cashierCustomerImage = document.getElementById('cashier-customer-image');
    const cashierShiftStatus = document.getElementById('cashier-shift-status');
    const cashierShiftTimer = document.getElementById('cashier-shift-timer');
    const btnCashierStartShift = document.getElementById('btn-cashier-start-shift');
    const btnCashierEndShift = document.getElementById('btn-cashier-end-shift');
    const btnCashierBreak = document.getElementById('btn-cashier-break');

    const ordersModal = document.getElementById('orders-modal');
    const btnCloseOrders = document.getElementById('btn-close-orders');
    const roadFullscreen = document.getElementById('road-fullscreen');
    const btnRoadBack = document.getElementById('btn-road-back');
    const roadProgressInner = document.getElementById('road-progress-inner');
    const roadPercentText = document.getElementById('road-percent-text');
    const btnArriveDestination = document.getElementById('btn-arrive-destination');
    const fireFullscreen = document.getElementById('fire-fullscreen');
    const btnFireBack = document.getElementById('btn-fire-back');
    const flamesContainer = document.getElementById('flames-container');

    const truckerOrdersModal = document.getElementById('trucker-orders-modal');
    const truckerOrdersList = document.getElementById('trucker-orders-list');
    const btnCloseTruckerOrders = document.getElementById('btn-close-trucker-orders');
    const truckerRoadFullscreen = document.getElementById('trucker-road-fullscreen');
    const btnTruckerRoadBack = document.getElementById('btn-trucker-road-back');
    const truckerClockText = document.getElementById('trucker-clock-text');
    const truckerDateText = document.getElementById('trucker-date-text');
    const truckerMoneyText = document.getElementById('trucker-money-text');
    const truckerProgressInner = document.getElementById('trucker-progress-inner');
    const truckerPercentText = document.getElementById('trucker-percent-text');
    const truckerKmCounter = document.getElementById('trucker-km-counter');
    const truckerClickBox = document.getElementById('trucker-click-box');
    const truckerTripTitle = document.getElementById('trucker-trip-title');
    const truckerTripSub = document.getElementById('trucker-trip-sub');

    const taxiFullscreen = document.getElementById('taxi-fullscreen');
    const taxiRouteTitleText = document.getElementById('taxi-route-title-text');
    const taxiRouteSubText = document.getElementById('taxi-route-sub-text');
    const taxiProgressInner = document.getElementById('taxi-progress-inner');
    const taxiPercentText = document.getElementById('taxi-percent-text');
    const taxiClockText = document.getElementById('taxi-clock-text');
    const taxiDateText = document.getElementById('taxi-date-text');
    const taxiMoneyText = document.getElementById('taxi-money-text');
    const taxiHungerRing = document.getElementById('taxi-hunger-ring');
    const taxiEnergyRing = document.getElementById('taxi-energy-ring');
    const taxiSleepRing = document.getElementById('taxi-sleep-ring');
    const taxiHungerVal = document.getElementById('taxi-hunger-val');
    const taxiEnergyVal = document.getElementById('taxi-energy-val');
    const taxiSleepVal = document.getElementById('taxi-sleep-val');

    const travelChoiceModal = document.getElementById('travel-choice-modal');
    const travelChoiceTitle = document.getElementById('travel-choice-title');
    const btnTravelBack = document.getElementById('btn-travel-back');
    const btnTravelWalk = document.getElementById('btn-travel-walk');
    const btnTravelCar = document.getElementById('btn-travel-car');
    const travelCarDesc = document.getElementById('travel-car-desc');

    const walkFullscreen = document.getElementById('walk-fullscreen');
    const walkClickBox = document.getElementById('walk-click-box');
    const btnWalkBack = document.getElementById('btn-walk-back');
    const walkTitleText = document.getElementById('walk-title-text');
    const walkProgressInner = document.getElementById('walk-progress-inner');
    const walkPercentText = document.getElementById('walk-percent-text');

    /* =========================================================
       КАРТА
       ========================================================= */

    const mapImg = new Image();
    const playerSpriteImg = new Image();
    const possibleMapSources = ['city_map.png', 'map.png', 'gazon.png'];
    let mapSourceIndex = 0;
    let isMapLoaded = false;

    playerSpriteImg.src = 'men.png';

    function tryLoadNextMapSource() {
        if (mapSourceIndex >= possibleMapSources.length) return;
        mapImg.src = possibleMapSources[mapSourceIndex];
        mapSourceIndex += 1;
    }

    mapImg.onload = function () {
        isMapLoaded = true;
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
            fitAndCenterMap();
            render();
        }
    };

    mapImg.onerror = function () {
        tryLoadNextMapSource();
    };

    tryLoadNextMapSource();

    /* =========================================================
       ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
       ========================================================= */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getTimeString(minutes) {
        const value = minutes === undefined ? gameMinutes : minutes;
        const hours = Math.floor(value / 60) % 24;
        const mins = Math.floor(value % 60);
        return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
    }

    function getDateString(day, monthIndex) {
        const selectedDay = day === undefined ? currentDay : day;
        const selectedMonth = monthIndex === undefined ? currentMonthIdx : monthIndex;
        return selectedDay + ' ' + MONTH_NAMES[selectedMonth];
    }

    function absoluteDay() {
        let result = currentDay;
        for (let index = 0; index < currentMonthIdx; index += 1) {
            result += DAYS_IN_MONTHS[index];
        }
        return result;
    }

    function getTotalAbsoluteMinutes() {
        return absoluteDay() * 1440 + gameMinutes;
    }

    function dateAfterDays(days) {
        let day = currentDay;
        let month = currentMonthIdx;
        for (let index = 0; index < days; index += 1) {
            day += 1;
            if (day > DAYS_IN_MONTHS[month]) {
                day = 1;
                month = (month + 1) % 12;
            }
        }
        return { day: day, monthIndex: month };
    }

    function showToast(text) {
        if (!toastMessage) return;
        if (toastTimeoutId) clearTimeout(toastTimeoutId);
        toastMessage.textContent = text;
        toastMessage.classList.remove('hidden');
        toastTimeoutId = setTimeout(function () {
            toastMessage.classList.add('hidden');
        }, 3500);
    }

    function hideToast() {
        if (toastTimeoutId) clearTimeout(toastTimeoutId);
        toastTimeoutId = null;
        if (toastMessage) toastMessage.classList.add('hidden');
    }

    function playClick() {
        if (!clickSound || soundVolume <= 0) return;
        clickSound.volume = (soundVolume / 100) * 0.8;
        clickSound.currentTime = 0;
        clickSound.play().catch(function () {});
    }

    function startMusic() {
        if (!bgMusic || musicVolume <= 0) return;
        bgMusic.volume = (musicVolume / 100) * 0.4;
        bgMusic.loop = true;
        bgMusic.play().catch(function () {});
    }

    function normalizeMoney() {
        if (!Number.isFinite(playerMoney) || playerMoney < 0) {
            playerMoney = 0;
        }
    }

    function getCurrentHour() {
        return gameMinutes / 60;
    }

    function isFirefighterWorkTime() {
        return getCurrentHour() >= 7 && getCurrentHour() < 19;
    }

    function isTruckerWorkTime() {
        return getCurrentHour() >= 5 && getCurrentHour() < 20;
    }

    function isCashierWorkTime() {
        return getCurrentHour() >= CASHIER_SHIFT_START_HOUR && getCurrentHour() < CASHIER_SHIFT_END_HOUR;
    }

    function isCashierBreakTime() {
        const hour = getCurrentHour();
        return hour >= CASHIER_BREAK_START_HOUR && hour < CASHIER_BREAK_END_HOUR;
    }

    function getLocationKey() {
        if (currentScreen === 'firestation' || lastExitedLocation === 'firestation') return 'firestation';
        if (currentScreen === 'truckstation' || lastExitedLocation === 'truckstation') return 'truckstation';
        if (currentScreen === 'market' || lastExitedLocation === 'market') return 'market';
        return 'home';
    }

    function getLocationTitle(key) {
        if (key === 'firestation') return '🚒 Пожарная часть';
        if (key === 'truckstation') return '🚛 Автобаза';
        if (key === 'market') return '🛒 Магазин';
        return '🏠 Дом';
    }

    function getTaxiRoutePrice(fromKey, toKey) {
        return TAXI_ROUTE_PRICES[fromKey + '->' + toKey] || 650;
    }

    function getActiveJobsCount() {
        let count = 0;
        if (jobState.activeJobId) count += 1;
        if (truckerJobState.activeJobId) count += 1;
        if (cashierJobState.activeJobId) count += 1;
        return count;
    }

    function hasTwoActiveJobs() {
        return getActiveJobsCount() >= 2;
    }

    function getRandomTruckerOffers() {
        const pool = TRUCKER_ORDERS_POOL.slice();
        for (let index = pool.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const temporary = pool[index];
            pool[index] = pool[randomIndex];
            pool[randomIndex] = temporary;
        }
        return [pool[0], pool[1]];
    }

    function generateRandomNumbers(count, min, max) {
        const result = [];
        while (result.length < count) {
            const value = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!result.includes(value)) result.push(value);
        }
        return result.sort(function (a, b) { return a - b; });
    }

    function hasEnoughEnergyOrSleep() {
        return playerEnergy > 0 || playerSleep > 0;
    }

    /* =========================================================
       СОХРАНЕНИЕ И ЗАГРУЗКА
       ========================================================= */

    function loadSavedData() {
        try {
            const raw = localStorage.getItem('bestlife_game_data');
            const data = JSON.parse(raw || '{}');

            if (data.minutes !== undefined) gameMinutes = Number(data.minutes) || 360;
            if (data.day !== undefined) currentDay = Number(data.day) || 1;
            if (data.monthIdx !== undefined) currentMonthIdx = Number(data.monthIdx) || 4;
            if (data.money !== undefined) playerMoney = Math.max(0, Number(data.money) || 0);
            if (data.hunger !== undefined) playerHunger = clamp(Number(data.hunger), 0, 100);
            if (data.sleep !== undefined) playerSleep = clamp(Number(data.sleep), 0, 100);
            if (data.energy !== undefined) playerEnergy = clamp(Number(data.energy), 0, 100);

            if (Array.isArray(data.messages)) messages = data.messages;
            if (Array.isArray(data.bankHistory)) bankHistory = data.bankHistory;
            if (Array.isArray(data.finesList)) finesList = data.finesList;
            if (Array.isArray(data.workPenalties)) workPenalties = data.workPenalties;
            if (Array.isArray(data.pendingFoodDeliveries)) pendingFoodDeliveries = data.pendingFoodDeliveries;
            if (Array.isArray(data.scheduledEvents)) scheduledEvents = data.scheduledEvents;
            if (Array.isArray(data.foodCart)) foodCart = data.foodCart;
            if (Array.isArray(data.ownedCars)) ownedCars = data.ownedCars;
            if (Array.isArray(data.taxes)) taxes = data.taxes;

            if (data.lastExitedLocation) lastExitedLocation = data.lastExitedLocation;
            if (data.totalOrdersCompleted !== undefined) totalOrdersCompleted = Number(data.totalOrdersCompleted) || 0;
            if (data.ordersCompletedToday !== undefined) ordersCompletedToday = Number(data.ordersCompletedToday) || 0;
            if (data.ordersCounterDay !== undefined) ordersCounterDay = data.ordersCounterDay;
            if (data.taxReminderDaysSent && typeof data.taxReminderDaysSent === 'object') taxReminderDaysSent = data.taxReminderDaysSent;

            if (data.currentMusicId) currentMusicId = data.currentMusicId;
            if (Array.isArray(data.unlockedMusicIds) && data.unlockedMusicIds.length) unlockedMusicIds = data.unlockedMusicIds;
            if (data.soundVolume !== undefined) soundVolume = Number(data.soundVolume);
            if (data.musicVolume !== undefined) musicVolume = Number(data.musicVolume);

            if (data.jobState && typeof data.jobState === 'object') jobState = Object.assign(jobState, data.jobState);
            if (data.truckerJobState && typeof data.truckerJobState === 'object') truckerJobState = Object.assign(truckerJobState, data.truckerJobState);
            if (data.cashierJobState && typeof data.cashierJobState === 'object') cashierJobState = Object.assign(cashierJobState, data.cashierJobState);
            if (Array.isArray(data.truckerCurrentOffers) && data.truckerCurrentOffers.length === 2) truckerCurrentOffers = data.truckerCurrentOffers;
            if (data.truckerTripState && typeof data.truckerTripState === 'object') truckerTripState = Object.assign(truckerTripState, data.truckerTripState);
            if (data.truckerTotalOrdersCompleted !== undefined) truckerTotalOrdersCompleted = Number(data.truckerTotalOrdersCompleted) || 0;
            if (data.truckerOrdersCompletedToday !== undefined) truckerOrdersCompletedToday = Number(data.truckerOrdersCompletedToday) || 0;
            if (data.truckerOrdersCounterDay !== undefined) truckerOrdersCounterDay = data.truckerOrdersCounterDay;

            if (data.cashierTotalShiftsCompleted !== undefined) cashierTotalShiftsCompleted = Number(data.cashierTotalShiftsCompleted) || 0;
            if (data.cashierCustomersServed !== undefined) cashierCustomersServed = Number(data.cashierCustomersServed) || 0;
            if (data.cashierCustomersSkipped !== undefined) cashierCustomersSkipped = Number(data.cashierCustomersSkipped) || 0;

            if (data.governmentNewYearRewardClaimed !== undefined) governmentNewYearRewardClaimed = Boolean(data.governmentNewYearRewardClaimed);
            if (data.governmentRewardYearKey !== undefined) governmentRewardYearKey = data.governmentRewardYearKey;

            if (data.orderState && typeof data.orderState === 'object') orderState = Object.assign(orderState, data.orderState);
            if (data.cashierShiftState && typeof data.cashierShiftState === 'object') cashierShiftState = Object.assign(cashierShiftState, data.cashierShiftState);
        } catch (error) {
            console.warn('Не удалось загрузить сохранение BestLife:', error);
        }

        normalizeMoney();

        if (!unlockedMusicIds.includes('default_music')) unlockedMusicIds.unshift('default_music');
        if (!MUSIC_TRACKS.some(function (track) { return track.id === currentMusicId; })) currentMusicId = 'default_music';
        if (!truckerCurrentOffers.length) truckerCurrentOffers = getRandomTruckerOffers();
        if (!ordersCounterDay) ordersCounterDay = currentDay + '_' + currentMonthIdx;
        if (!truckerOrdersCounterDay) truckerOrdersCounterDay = currentDay + '_' + currentMonthIdx;
    }

    function saveGameData() {
        normalizeMoney();
        try {
            localStorage.setItem('bestlife_game_data', JSON.stringify({
                minutes: gameMinutes,
                day: currentDay,
                monthIdx: currentMonthIdx,
                money: playerMoney,
                hunger: playerHunger,
                sleep: playerSleep,
                energy: playerEnergy,
                messages: messages,
                bankHistory: bankHistory,
                finesList: finesList,
                workPenalties: workPenalties,
                pendingFoodDeliveries: pendingFoodDeliveries,
                scheduledEvents: scheduledEvents,
                foodCart: foodCart,
                ownedCars: ownedCars,
                taxes: taxes,
                lastExitedLocation: lastExitedLocation,
                totalOrdersCompleted: totalOrdersCompleted,
                ordersCompletedToday: ordersCompletedToday,
                ordersCounterDay: ordersCounterDay,
                taxReminderDaysSent: taxReminderDaysSent,
                currentMusicId: currentMusicId,
                unlockedMusicIds: unlockedMusicIds,
                soundVolume: soundVolume,
                musicVolume: musicVolume,
                jobState: jobState,
                truckerJobState: truckerJobState,
                cashierJobState: cashierJobState,
                truckerCurrentOffers: truckerCurrentOffers,
                truckerTripState: truckerTripState,
                truckerTotalOrdersCompleted: truckerTotalOrdersCompleted,
                truckerOrdersCompletedToday: truckerOrdersCompletedToday,
                truckerOrdersCounterDay: truckerOrdersCounterDay,
                cashierTotalShiftsCompleted: cashierTotalShiftsCompleted,
                cashierCustomersServed: cashierCustomersServed,
                cashierCustomersSkipped: cashierCustomersSkipped,
                governmentNewYearRewardClaimed: governmentNewYearRewardClaimed,
                governmentRewardYearKey: governmentRewardYearKey,
                orderState: orderState,
                cashierShiftState: cashierShiftState
            }));
        } catch (error) {
            console.warn('Не удалось сохранить игру BestLife:', error);
        }
    }

    loadSavedData();

    /* =========================================================
       АУДИО И МУЗЫКА
       ========================================================= */

    function applyAudioVolumes() {
        if (soundSlider) soundSlider.value = soundVolume;
        if (musicSlider) musicSlider.value = musicVolume;
        if (soundVolText) soundVolText.textContent = soundVolume + '%';
        if (musicVolText) musicVolText.textContent = musicVolume + '%';
        if (bgMusic) bgMusic.volume = (musicVolume / 100) * 0.4;
        if (clickSound) clickSound.volume = (soundVolume / 100) * 0.8;
    }

    function getCurrentMusic() {
        return MUSIC_TRACKS.find(function (track) { return track.id === currentMusicId; }) || MUSIC_TRACKS[0];
    }

    function selectMusic(track) {
        if (!unlockedMusicIds.includes(track.id)) return;
        currentMusicId = track.id;
        if (bgMusic) {
            bgMusic.pause();
            bgMusic.src = track.file;
            bgMusic.loop = true;
            bgMusic.currentTime = 0;
            bgMusic.volume = (musicVolume / 100) * 0.4;
            bgMusic.play().catch(function () {});
        }
        saveGameData();
        renderMusicTracks();
        showToast('Музыка «' + track.title + '» включена');
    }

    function buyMusic(track) {
        if (unlockedMusicIds.includes(track.id)) {
            selectMusic(track);
            return;
        }
        if (playerMoney < track.price) {
            showToast('Недостаточно денег для покупки музыки');
            return;
        }
        playerMoney = Math.max(0, playerMoney - track.price);
        unlockedMusicIds.push(track.id);
        addBankTransaction('Покупка музыки «' + track.title + '»', track.price, false);
        updateClockUI();
        renderMusicTracks();
        saveGameData();
        showToast('Музыка «' + track.title + '» разблокирована');
    }

    function renderMusicTracks() {
        if (!musicTracksList) return;
        musicTracksList.innerHTML = '';

        MUSIC_TRACKS.forEach(function (track) {
            const unlocked = unlockedMusicIds.includes(track.id);
            const active = currentMusicId === track.id;
            const card = document.createElement('div');
            card.className = 'music-track-card' + (active ? ' active-track' : '');

            const image = document.createElement('img');
            image.className = 'music-track-img';
            image.alt = unlocked ? track.title : '???';
            image.src = unlocked ? track.image : '';
            image.onerror = function () {
                image.removeAttribute('src');
                image.classList.add('music-question-image');
                image.alt = '???';
            };

            const info = document.createElement('div');
            info.className = 'music-track-info';
            info.innerHTML = '<span class="music-track-title">' + (unlocked ? track.title : '???') + '</span>' +
                '<span class="music-track-status">' + (active ? '▶ Сейчас играет' : (unlocked ? 'Доступна' : 'Неизвестный трек')) + '</span>';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'music-action-btn ' + (active ? 'music-btn-active' : (unlocked ? 'music-btn-select' : 'music-btn-buy'));
            button.textContent = active ? 'Играет' : (unlocked ? 'Выбрать' : track.price.toLocaleString('ru-RU') + ' ₽');
            button.addEventListener('click', function () {
                if (unlocked) selectMusic(track);
                else buyMusic(track);
            });

            card.appendChild(image);
            card.appendChild(info);
            card.appendChild(button);
            musicTracksList.appendChild(card);
        });
    }

    if (soundSlider) {
        soundSlider.addEventListener('input', function (event) {
            soundVolume = Number(event.target.value);
            applyAudioVolumes();
            saveGameData();
        });
    }

    if (musicSlider) {
        musicSlider.addEventListener('input', function (event) {
            musicVolume = Number(event.target.value);
            applyAudioVolumes();
            if (musicVolume > 0) startMusic();
            else if (bgMusic) bgMusic.pause();
            saveGameData();
        });
    }

    /* =========================================================
       HUD, ВРЕМЯ И ПОТРЕБНОСТИ
       ========================================================= */

    function updateClockUI() {
        normalizeMoney();
        const timeString = getTimeString();
        const dateString = getDateString();
        const moneyString = playerMoney.toLocaleString('ru-RU') + ' ₽';

        const setText = function (id, value) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        setText('hud-clock-text', timeString);
        setText('hud-date-text', dateString);
        setText('hud-money-text', moneyString);
        setText('phone-clock-text', timeString);
        setText('phone-date-text', dateString);
        setText('walk-clock-text', timeString);
        setText('walk-date-text', dateString);
        setText('walk-money-text', moneyString);

        if (taxiClockText) taxiClockText.textContent = timeString;
        if (taxiDateText) taxiDateText.textContent = dateString;
        if (taxiMoneyText) taxiMoneyText.textContent = moneyString;
        if (truckerClockText) truckerClockText.textContent = timeString;
        if (truckerDateText) truckerDateText.textContent = dateString;
        if (truckerMoneyText) truckerMoneyText.textContent = moneyString;

        if (cashierShiftState.active && cashierShiftTimer) {
            const elapsed = Math.floor((gameMinutes - cashierShiftState.startedAtMinutes) / 60);
            cashierShiftTimer.textContent = '⏱ Смена: ' + elapsed + ' ч';
        }
    }

    function updateStatsHUD() {
        const values = {
            hunger: playerHunger,
            energy: playerEnergy,
            sleep: playerSleep
        };

        Object.keys(values).forEach(function (key) {
            const value = clamp(values[key], 0, 100);
            const ring = document.getElementById(key + '-ring');
            const text = document.getElementById(key + '-val-text');
            if (ring) ring.style.strokeDashoffset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;
            if (text) text.textContent = Math.round(value) + '%';
        });

        if (taxiHungerRing) taxiHungerRing.style.strokeDashoffset = CIRCUMFERENCE - (playerHunger / 100) * CIRCUMFERENCE;
        if (taxiEnergyRing) taxiEnergyRing.style.strokeDashoffset = CIRCUMFERENCE - (playerEnergy / 100) * CIRCUMFERENCE;
        if (taxiSleepRing) taxiSleepRing.style.strokeDashoffset = CIRCUMFERENCE - (playerSleep / 100) * CIRCUMFERENCE;
        if (taxiHungerVal) taxiHungerVal.textContent = Math.round(playerHunger) + '%';
        if (taxiEnergyVal) taxiEnergyVal.textContent = Math.round(playerEnergy) + '%';
        if (taxiSleepVal) taxiSleepVal.textContent = Math.round(playerSleep) + '%';

        updateClockUI();
    }

    function updatePhoneBadge() {
        const unreadMessages = messages.filter(function (message) { return !message.read; }).length;

        if (phoneBadge) {
            phoneBadge.textContent = unreadMessages;
            phoneBadge.classList.toggle('hidden', unreadMessages === 0);
        }
        if (smsAppBadge) {
            smsAppBadge.textContent = unreadMessages;
            smsAppBadge.classList.toggle('hidden', unreadMessages === 0);
        }
        if (kollectivAppBadge) {
            kollectivAppBadge.classList.add('hidden');
        }
    }

    function updateAllHudVisibility(show) {
        [hudTopBar, btnOpenSettingsGame, phoneBtnWrapper, playerStatsHUD].forEach(function (element) {
            if (element) element.classList.toggle('hidden', !show);
        });
    }

    function checkResetDailyOrdersCounter() {
        const dayKey = currentDay + '_' + currentMonthIdx;
        if (ordersCounterDay !== dayKey) {
            ordersCounterDay = dayKey;
            ordersCompletedToday = 0;
        }
    }

    function checkResetDailyTruckerCounter() {
        const dayKey = currentDay + '_' + currentMonthIdx;
        if (truckerOrdersCounterDay !== dayKey) {
            truckerOrdersCounterDay = dayKey;
            truckerOrdersCompletedToday = 0;
        }
    }

    /* =========================================================
       БАНК, СМС, НАЛОГИ И ШТРАФЫ
       ========================================================= */

    function addMessage(from, avatar, text, extra) {
        const message = {
            id: Date.now() + Math.random(),
            from: from,
            avatar: avatar,
            text: text,
            day: currentDay,
            monthIdx: currentMonthIdx,
            time: getTimeString(),
            read: false
        };
        if (extra && typeof extra === 'object') Object.assign(message, extra);
        messages.unshift(message);
        updatePhoneBadge();
        saveGameData();
        showToast('Новое СМС');
    }

    function markMessageRead(id) {
        const message = messages.find(function (item) { return item.id === id; });
        if (message) message.read = true;
        updatePhoneBadge();
        saveGameData();
    }

    function addBankTransaction(description, amount, income) {
        const safeAmount = Math.max(0, Number(amount) || 0);
        bankHistory.unshift({
            description: description || 'Операция',
            amount: safeAmount,
            income: Boolean(income),
            date: getDateString(),
            time: getTimeString()
        });
        if (bankHistory.length > 60) bankHistory.pop();
        saveGameData();
    }

    function createTax(type, amount, title) {
        taxes.unshift({
            id: 'tax_' + Date.now() + '_' + Math.random(),
            type: type,
            title: title,
            amount: Math.max(1, Math.round(amount)),
            createdAt: getTotalAbsoluteMinutes(),
            createdDate: getDateString(),
            createdTime: getTimeString(),
            dueAt: getTotalAbsoluteMinutes() + TAX_PAYMENT_DAYS * 1440,
            status: 'unpaid',
            paidDate: null,
            paidTime: null,
            overdueAmount: 0
        });
        saveGameData();
        showToast('Новый налог добавлен в приложение «Оплата»');
    }

    function createFine(amount, reason) {
        finesList.unshift({
            id: 'fine_' + Date.now() + '_' + Math.random(),
            amount: Math.max(1, Math.round(amount)),
            reason: reason,
            createdDate: getDateString(),
            createdTime: getTimeString(),
            dueMinutes: getTotalAbsoluteMinutes() + FINE_PAYMENT_DAYS * 1440,
            status: 'unpaid'
        });
        addMessage('Штрафы ГИБДД/МЧС', '⚠️', 'Вам выписан штраф ' + Math.round(amount) + ' ₽. На оплату даётся 3 дня!');
        saveGameData();
    }

    function processTaxOneDayReminders() {
        const now = getTotalAbsoluteMinutes();
        taxes.forEach(function (tax) {
            if (tax.status !== 'unpaid') return;
            if (tax.dueAt - now > 0 && tax.dueAt - now <= 1440 && !taxReminderDaysSent[tax.id]) {
                taxReminderDaysSent[tax.id] = true;
                addMessage('Оплата', '🧾', 'Налог «' + tax.title + '» не оплачен. Остался 1 день, иначе будет начислен штраф.');
            }
        });
    }

    function processTaxesExpiration() {
        const now = getTotalAbsoluteMinutes();
        taxes.forEach(function (tax) {
            if (tax.status !== 'unpaid' || now < tax.dueAt) return;
            const penalty = Math.round(tax.amount * 1.5);
            const totalCharge = tax.amount + penalty;
            playerMoney = Math.max(0, playerMoney - totalCharge);
            tax.status = 'overdue';
            tax.overdueAmount = penalty;
            tax.paidDate = getDateString();
            tax.paidTime = getTimeString();
            addBankTransaction('Налог и просрочка', totalCharge, false);
            createFine(penalty, 'Просрочка оплаты налога: ' + tax.title);
            addMessage('Оплата', '⚠️', 'Налог «' + tax.title + '» просрочен. Списан налог и штраф.');
        });
        saveGameData();
    }

    function processFinesExpiration() {
        const now = getTotalAbsoluteMinutes();
        finesList.forEach(function (fine) {
            if (fine.status !== 'unpaid' || now < fine.dueMinutes) return;
            const penaltyAmount = fine.amount * 3;
            playerMoney = Math.max(0, playerMoney - penaltyAmount);
            fine.status = 'expired_penalty';
            fine.paidDate = getDateString();
            fine.paidTime = getTimeString();
            addBankTransaction('Просрочка штрафа', penaltyAmount, false);
            addMessage('Штрафы', '❌', 'Штраф «' + fine.reason + '» просрочен. Списано ' + penaltyAmount + ' ₽.');
        });
        saveGameData();
    }

    function payAllTaxes() {
        const unpaid = taxes.filter(function (tax) { return tax.status === 'unpaid'; });
        const total = unpaid.reduce(function (sum, tax) { return sum + tax.amount; }, 0);
        if (!unpaid.length) {
            showToast('Все налоги уже оплачены');
            return;
        }
        if (playerMoney < total) {
            showToast('Недостаточно денег для оплаты всех налогов');
            return;
        }
        playerMoney = Math.max(0, playerMoney - total);
        unpaid.forEach(function (tax) {
            tax.status = 'paid';
            tax.paidDate = getDateString();
            tax.paidTime = getTimeString();
        });
        addBankTransaction('Оплата всех налогов', total, false);
        saveGameData();
        updateClockUI();
        renderTaxesApp();
        showToast('Все налоги успешно оплачены');
    }

    function payFine(fine) {
        if (playerMoney < fine.amount) {
            showToast('Недостаточно денег для оплаты штрафа');
            return;
        }
        playerMoney = Math.max(0, playerMoney - fine.amount);
        fine.status = 'paid';
        fine.paidDate = getDateString();
        fine.paidTime = getTimeString();
        addBankTransaction('Оплата штрафа', fine.amount, false);
        saveGameData();
        updateClockUI();
        renderFinesApp();
        showToast('Штраф успешно оплачен');
    }

    /* =========================================================
       НОВОГОДНЕЕ ПОЩРЕНИЕ
       ========================================================= */

    function processNewYearReward(previousDay, previousMonth, nextDay, nextMonth) {
        const crossedNewYear = previousDay === 31 && previousMonth === 11 && nextDay === 1 && nextMonth === 0;
        if (!crossedNewYear) return;

        const yearKey = String(absoluteDay());
        if (governmentRewardYearKey === yearKey) return;

        governmentRewardYearKey = yearKey;
        governmentNewYearRewardClaimed = true;
        playerMoney += NEW_YEAR_REWARD;
        addBankTransaction('Премия от государства', NEW_YEAR_REWARD, true);
        addMessage('Государство', '🎄', 'Поздравляем с Новым годом! Вам начислено государственное поощрение — 3 000 ₽.');
        showToast('🎄 С Новым годом! Вам начислено 3 000 ₽');
        saveGameData();
    }

    function advanceCalendar() {
        while (gameMinutes >= 1440) {
            const previousDay = currentDay;
            const previousMonth = currentMonthIdx;

            gameMinutes -= 1440;
            currentDay += 1;

            if (currentDay > DAYS_IN_MONTHS[currentMonthIdx]) {
                currentDay = 1;
                currentMonthIdx = (currentMonthIdx + 1) % 12;
            }

            processNewYearReward(previousDay, previousMonth, currentDay, currentMonthIdx);
            checkResetDailyOrdersCounter();
            checkResetDailyTruckerCounter();
        }
    }

    /* =========================================================
       ТЕЛЕФОН: НАЛОГИ, ШТРАФЫ, БАНК, СМС, ЕДА
       ========================================================= */

    function renderBankApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'bank-app-wrapper';
        wrapper.innerHTML = '<div class="bank-card-premium"><div class="bank-card-logo">BestBank Premium</div><div class="bank-balance-title">Ваш баланс</div><div class="bank-balance-value">' + playerMoney.toLocaleString('ru-RU') + ' ₽</div><div class="bank-card-number">•••• 4412</div></div><div class="bank-history-section"><div class="bank-section-title">История операций</div><div class="bank-history-list" id="bank-history-list-box"></div></div>';
        appScrollableBody.appendChild(wrapper);

        const historyBox = wrapper.querySelector('#bank-history-list-box');
        if (!bankHistory.length) {
            historyBox.innerHTML = '<div class="empty-app-page"><h3>История пуста</h3><p>Здесь будут отображаться операции.</p></div>';
            return;
        }

        bankHistory.forEach(function (item) {
            const card = document.createElement('div');
            card.className = 'bank-history-item';
            card.innerHTML = '<div class="bank-hist-left"><span class="bank-hist-desc">' + item.description + '</span><span class="bank-hist-time">' + (item.date || '') + ', ' + (item.time || '') + '</span></div><div class="bank-hist-amount ' + (item.income ? 'income' : 'expense') + '">' + (item.income ? '+' : '-') + ' ' + item.amount.toLocaleString('ru-RU') + ' ₽</div>';
            historyBox.appendChild(card);
        });
    }

    function renderTaxesApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'taxes-app-wrapper';

        const unpaid = taxes.filter(function (tax) { return tax.status === 'unpaid'; });
        const paid = taxes.filter(function (tax) { return tax.status !== 'unpaid'; });
        const unpaidTotal = unpaid.reduce(function (sum, tax) { return sum + tax.amount; }, 0);
        const paidTotal = paid.reduce(function (sum, tax) { return sum + tax.amount; }, 0);

        wrapper.innerHTML = '<div class="taxes-summary-card"><div class="taxes-summary-header"><span class="taxes-summary-title">🧾 Налоговый счёт</span><button class="tax-info-btn">i</button></div><div class="taxes-summary-amount">' + unpaidTotal.toLocaleString('ru-RU') + ' ₽</div><div class="taxes-summary-grid"><div class="taxes-stat-item"><span class="taxes-stat-label">Оплачено всего</span><span class="taxes-stat-value" style="color:#6ee7b7;">' + paidTotal.toLocaleString('ru-RU') + ' ₽</span></div><div class="taxes-stat-item"><span class="taxes-stat-label">Всего налогов</span><span class="taxes-stat-value">' + taxes.length + '</span></div></div></div><button class="tax-pay-all-btn" ' + (unpaid.length ? '' : 'disabled') + '>💳 Оплатить все налоги (' + unpaidTotal.toLocaleString('ru-RU') + ' ₽)</button>';
        wrapper.querySelector('.tax-pay-all-btn').addEventListener('click', payAllTaxes);
        wrapper.querySelector('.tax-info-btn').addEventListener('click', renderTaxHistoryModal);
        appScrollableBody.appendChild(wrapper);
    }

    function renderTaxHistoryModal() {
        const modal = document.createElement('div');
        modal.className = 'tax-history-overlay';
        modal.innerHTML = '<div class="tax-history-modal"><div class="tax-history-head"><h2>ℹ История налогов</h2><button class="tax-history-close">✕</button></div><p class="tax-history-note">Все текущие и оплаченные налоги.</p><div class="tax-history-list"></div></div>';
        modal.querySelector('.tax-history-close').addEventListener('click', function () { modal.remove(); });
        const list = modal.querySelector('.tax-history-list');

        if (!taxes.length) {
            list.innerHTML = '<div class="empty-app-page"><h3>История пуста</h3><p>Налогов пока нет.</p></div>';
        } else {
            taxes.forEach(function (tax) {
                const card = document.createElement('div');
                card.className = 'tax-history-card';
                const status = tax.status === 'unpaid' ? 'к оплате' : (tax.status === 'overdue' ? 'просрочен' : 'оплачен');
                card.innerHTML = '<div><strong>' + (tax.status === 'unpaid' ? '⏳ ' : (tax.status === 'overdue' ? '⚠️ ' : '✅ ')) + tax.title + '</strong><small>' + tax.amount.toLocaleString('ru-RU') + ' ₽ • ' + status + '</small></div>';
                list.appendChild(card);
            });
        }
        document.body.appendChild(modal);
    }

    function renderFinesApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = '<div class="tab-buttons-row"><button id="fine-tab-unpaid" class="tab-btn ' + (finesTab === 'unpaid' ? 'active' : '') + '">Неоплаченные</button><button id="fine-tab-paid" class="tab-btn ' + (finesTab === 'paid' ? 'active' : '') + '">Оплаченные</button></div><div id="fines-list-container"></div>';
        appScrollableBody.appendChild(wrapper);
        wrapper.querySelector('#fine-tab-unpaid').addEventListener('click', function () { finesTab = 'unpaid'; renderFinesApp(); });
        wrapper.querySelector('#fine-tab-paid').addEventListener('click', function () { finesTab = 'paid'; renderFinesApp(); });

        const container = wrapper.querySelector('#fines-list-container');
        const list = finesList.filter(function (fine) { return finesTab === 'unpaid' ? fine.status === 'unpaid' : fine.status !== 'unpaid'; });

        if (!list.length) {
            container.innerHTML = '<div class="empty-app-page"><h3>' + (finesTab === 'unpaid' ? 'Нет неоплаченных штрафов' : 'История штрафов пуста') + '</h3><p>Здесь пока нет записей.</p></div>';
            return;
        }

        list.forEach(function (fine) {
            const card = document.createElement('div');
            card.className = 'fine-card' + (fine.status !== 'unpaid' ? ' paid-card' : '');
            const remaining = Math.max(0, fine.dueMinutes - getTotalAbsoluteMinutes());
            const days = Math.floor(remaining / 1440);
            const hours = Math.floor((remaining % 1440) / 60);
            card.innerHTML = '<div class="fine-header-row"><span class="fine-title">' + (fine.status === 'unpaid' ? '⚠️ Штраф' : '✅ Оплачен') + '</span><span class="fine-amount">' + fine.amount.toLocaleString('ru-RU') + ' ₽</span></div><div class="fine-desc">' + fine.reason + '</div>' + (fine.status === 'unpaid' ? '<div class="fine-timer-box">⏰ Осталось: ' + days + ' дн. ' + hours + ' ч.</div><button class="fine-pay-btn">Оплатить ' + fine.amount.toLocaleString('ru-RU') + ' ₽</button>' : '<div class="fine-timer-box">Дата: ' + fine.paidDate + ', ' + fine.paidTime + '</div>');
            if (fine.status === 'unpaid') card.querySelector('.fine-pay-btn').addEventListener('click', function () { payFine(fine); });
            container.appendChild(card);
        });
    }

    function renderMessagesApp() {
        phoneView = 'app';
        appScrollableBody.innerHTML = '';
        if (!messages.length) {
            appScrollableBody.innerHTML = '<div class="empty-app-page"><h3>СМС пусто</h3><p>Новых сообщений пока нет.</p></div>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'messages-list';
        messages.forEach(function (message) {
            const row = document.createElement('div');
            row.className = 'message-row ' + (message.read ? 'message-read' : 'message-unread');
            row.innerHTML = '<div class="message-avatar">' + (message.avatar || '💬') + '</div><div class="message-preview"><strong>' + (message.from || 'Сообщение') + '</strong><span>' + (message.text || '') + '</span></div><time>' + (message.time || '') + '</time>';
            row.addEventListener('click', function () {
                markMessageRead(message.id);
                currentOpenedMessage = message;
                phoneView = 'message-detail';
                appScrollableBody.innerHTML = '<div class="message-full-view"><div class="message-full-card"><div class="message-full-text">' + message.text + '</div><div class="message-full-time">' + message.time + '</div></div></div>';
            });
            list.appendChild(row);
        });
        appScrollableBody.appendChild(list);
    }

    function renderFoodApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'food-app-wrapper';
        wrapper.innerHTML = '<div class="food-cart-bar"><span>В корзине: ' + foodCart.length + ' позиций</span><button class="food-cart-btn">🛒 Открыть корзину</button></div><div class="food-list" id="food-list-grid"></div>';
        appScrollableBody.appendChild(wrapper);
        wrapper.querySelector('.food-cart-btn').addEventListener('click', renderFoodCart);
        const grid = wrapper.querySelector('#food-list-grid');

        FOOD_ITEMS.forEach(function (food) {
            const card = document.createElement('div');
            card.className = 'food-card';
            card.innerHTML = '<img src="' + food.image + '" alt="' + food.name + '" onerror="this.src=\'https://via.placeholder.com/60\'"><div class="food-name">' + food.name + '</div><div class="food-info">+' + food.hunger + '% сытости</div><div class="food-price">' + food.price + ' ₽</div><button class="food-buy-btn">В корзину</button>';
            card.querySelector('button').addEventListener('click', function () {
                foodCart.push(food);
                saveGameData();
                renderFoodApp();
                showToast(food.name + ' добавлен в корзину');
            });
            grid.appendChild(card);
        });
    }

    function renderFoodCart() {
        appScrollableBody.innerHTML = '';
        let total = 0;
        let totalHunger = 0;
        foodCart.forEach(function (item) {
            total += item.price;
            totalHunger += item.hunger;
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'cart-wrapper';
        wrapper.innerHTML = '<div class="cart-header-summary"><h3>🛒 Корзина еды</h3><p>Позиций: ' + foodCart.length + ' • Сытость: +' + totalHunger + '%</p><p style="font-size:1.1rem;font-weight:900;margin-top:4px;">К оплате: ' + total.toLocaleString('ru-RU') + ' ₽</p></div><div class="cart-list" id="cart-list"></div>';
        appScrollableBody.appendChild(wrapper);

        const list = wrapper.querySelector('#cart-list');
        foodCart.forEach(function (item, index) {
            const row = document.createElement('div');
            row.className = 'cart-row';
            row.innerHTML = '<div class="cart-row-left"><span class="cart-row-title">' + item.name + '</span><span class="cart-row-val">+' + item.hunger + '% сытости</span></div><div class="cart-row-right"><span class="cart-row-price">' + item.price + ' ₽</span><button class="cart-remove-btn">×</button></div>';
            row.querySelector('.cart-remove-btn').addEventListener('click', function () {
                foodCart.splice(index, 1);
                saveGameData();
                renderFoodCart();
            });
            list.appendChild(row);
        });

        const orderButton = document.createElement('button');
        orderButton.className = 'cart-order-btn';
        orderButton.textContent = foodCart.length ? 'Оплатить заказ (' + total.toLocaleString('ru-RU') + ' ₽)' : 'Корзина пуста';
        orderButton.disabled = foodCart.length === 0;
        orderButton.addEventListener('click', function () {
            if (playerMoney < total) {
                showToast('Недостаточно денег на счёте');
                return;
            }
            playerMoney = Math.max(0, playerMoney - total);
            addBankTransaction('Покупка еды', total, false);
            pendingFoodDeliveries.push({
                deliverAtMinutes: getTotalAbsoluteMinutes() + 30,
                totalHunger: Math.min(totalHunger, Math.max(0, 100 - playerHunger)),
                totalEnergy: Math.min(totalHunger, Math.max(0, 100 - playerEnergy))
            });
            foodCart = [];
            saveGameData();
            updateClockUI();
            renderFoodApp();
            showToast('Заказ оплачен! Еда будет доставлена через 30 игровых минут');
        });
        wrapper.appendChild(orderButton);
    }

    /* =========================================================
       РАБОТА.РУ И КОЛЛЕКТИВ
       ========================================================= */

    function renderJobsApp() {
        appScrollableBody.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'jobs-list';

        JOBS.forEach(function (job) {
            const isFirefighter = job.id === 'firefighter';
            const isTrucker = job.id === 'driver';
            const isCashier = job.id === 'cashier';
            const alreadyApplied = isFirefighter
                ? Boolean(jobState.activeJobId || jobState.pendingJobId)
                : (isTrucker ? Boolean(truckerJobState.activeJobId || truckerJobState.pendingJobId) : (isCashier ? Boolean(cashierJobState.activeJobId || cashierJobState.pendingJobId) : false));
            const unavailableByLimit = hasTwoActiveJobs() && !alreadyApplied;
            const unavailable = alreadyApplied || unavailableByLimit;

            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = '<div class="job-top"><div class="job-avatar">' + job.icon + '</div><div><h3>' + job.title + '</h3><div class="job-salary">≈ ' + job.salary.toLocaleString('ru-RU') + ' ₽/мес.</div></div></div><div class="job-schedule">' + job.schedule + '</div><p>' + job.description + '</p><button class="job-apply-btn" ' + (unavailable ? 'disabled' : '') + '>' + (alreadyApplied ? 'Недоступно' : (unavailableByLimit ? 'Лимит работ' : 'Откликнуться')) + '</button>';

            card.querySelector('button').addEventListener('click', function () {
                if (unavailable) {
                    if (unavailableByLimit) showToast('Можно одновременно работать максимум на двух работах');
                    return;
                }
                if (isTrucker) applyForTruckerJob(job);
                else if (isFirefighter) applyForFirefighterJob(job);
                else if (isCashier) applyForCashierJob(job);
                else applyForSimpleJob(job);
            });
            list.appendChild(card);
        });
        appScrollableBody.appendChild(list);
    }

    function applyForFirefighterJob(job) {
        if (hasTwoActiveJobs()) {
            showToast('Можно одновременно работать максимум на двух работах');
            return;
        }
        if (jobState.activeJobId || jobState.pendingJobId) {
            showToast('У вас уже есть работа или заявка пожарного');
            return;
        }
        jobState.pendingJobId = job.id;
        jobState.interviewDay = absoluteDay() + 1;
        jobState.interviewMinutes = 780;
        addMessage('Работа.ру', job.icon, 'Вы откликнулись на вакансию «' + job.title + '». Собеседование завтра в 13:00 в Пожарной части.');
        renderJobsApp();
        saveGameData();
    }

    function applyForTruckerJob(job) {
        if (hasTwoActiveJobs()) {
            showToast('Можно одновременно работать максимум на двух работах');
            return;
        }
        if (truckerJobState.activeJobId || truckerJobState.pendingJobId) {
            showToast('У вас уже есть работа или заявка дальнобойщика');
            return;
        }
        truckerJobState.pendingJobId = job.id;
        truckerJobState.interviewDay = absoluteDay() + 1;
        truckerJobState.interviewMinutes = 780;
        addMessage('Работа.ру', job.icon, 'Вы откликнулись на вакансию «' + job.title + '». Собеседование ПДД завтра, ' + dateAfterDays(1).day + ' ' + MONTH_NAMES[dateAfterDays(1).monthIndex] + ' в 13:00 на Автобазе.');
        renderJobsApp();
        saveGameData();
    }

    function applyForCashierJob(job) {
        if (hasTwoActiveJobs()) {
            showToast('Можно одновременно работать максимум на двух работах');
            return;
        }
        if (cashierJobState.activeJobId || cashierJobState.pendingJobId) {
            showToast('У вас уже есть работа или заявка кассира');
            return;
        }
        cashierJobState.pendingJobId = job.id;
        cashierJobState.interviewDay = absoluteDay() + 1;
        cashierJobState.interviewMinutes = 600;
        cashierJobState.interviewStep = 0;
        cashierJobState.interviewAnswers = [];
        addMessage('Работа.ру', job.icon, 'Вы откликнулись на вакансию «' + job.title + '». Собеседование завтра в 10:00 в Магазине.');
        renderJobsApp();
        saveGameData();
    }

    function applyForSimpleJob(job) {
        if (hasTwoActiveJobs()) {
            showToast('Можно одновременно работать максимум на двух работах');
            return;
        }
        addMessage('Работа.ру', job.icon, 'Вы откликнулись на вакансию «' + job.title + '». Эта вакансия пока находится на этапе подготовки.');
        showToast('Заявка отправлена');
    }

    function renderCollectiveApp() {
        appScrollableBody.innerHTML = '';
        checkResetDailyOrdersCounter();
        checkResetDailyTruckerCounter();

        const fireActive = jobState.activeJobId === 'firefighter';
        const truckerActive = truckerJobState.activeJobId === 'driver';
        const cashierActive = cashierJobState.activeJobId === 'cashier';
        const firePending = jobState.pendingJobId === 'firefighter';
        const truckerPending = truckerJobState.pendingJobId === 'driver';
        const cashierPending = cashierJobState.pendingJobId === 'cashier';

        if (!fireActive && !truckerActive && !cashierActive && !firePending && !truckerPending && !cashierPending) {
            appScrollableBody.innerHTML = '<div class="empty-app-page"><h3>Вы нигде не работаете</h3><p>Устройтесь на работу через приложение «Работа.ру».</p></div>';
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding-bottom:20px;';

        if (fireActive) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🚒</div><div><div class="collective-title">Пожарный</div><div class="collective-sub">Служба активна</div></div></div><p style="font-size:.75rem;color:#475569;line-height:1.4;">Рабочее время: 07:00–19:00.<br>Принимайте вызовы МЧС.</p><div class="collective-stats-box"><div class="collective-stat-item"><span class="collective-stat-title">Заказов сегодня</span><span class="collective-stat-value">' + ordersCompletedToday + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Всего заказов</span><span class="collective-stat-value">' + totalOrdersCompleted + '</span></div></div><button id="resign-fire" class="job-decline-btn">Уволиться с пожарной части</button>';
            card.querySelector('#resign-fire').addEventListener('click', function () {
                jobState.activeJobId = null;
                saveGameData();
                renderCollectiveApp();
                showToast('Вы уволились с работы пожарного');
            });
            wrapper.appendChild(card);
        }

        if (truckerActive) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🚛</div><div><div class="collective-title">Дальнобойщик</div><div class="collective-sub" style="color:#d97706;">Служба активна</div></div></div><p style="font-size:.75rem;color:#475569;line-height:1.4;">Рабочее время: 05:00–20:00.<br>Доставляйте грузы по маршрутам.</p><div class="collective-stats-box"><div class="collective-stat-item"><span class="collective-stat-title">Заказов сегодня</span><span class="collective-stat-value" style="color:#d97706;">' + truckerOrdersCompletedToday + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Всего заказов</span><span class="collective-stat-value" style="color:#d97706;">' + truckerTotalOrdersCompleted + '</span></div></div><button id="resign-trucker" class="job-decline-btn">Уволиться с автобазы</button>';
            card.querySelector('#resign-trucker').addEventListener('click', function () {
                truckerJobState.activeJobId = null;
                saveGameData();
                renderCollectiveApp();
                showToast('Вы уволились с работы дальнобойщика');
            });
            wrapper.appendChild(card);
        }

        if (cashierActive) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🛒</div><div><div class="collective-title">Кассир</div><div class="collective-sub" style="color:#16a34a;">Смена активна</div></div></div><p style="font-size:.75rem;color:#475569;line-height:1.4;">Рабочее время: 09:00–21:00.<br>Обслуживайте покупателей на кассе.</p><div class="collective-stats-box"><div class="collective-stat-item"><span class="collective-stat-title">Всего смен</span><span class="collective-stat-value" style="color:#16a34a;">' + cashierTotalShiftsCompleted + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Обслужено клиентов</span><span class="collective-stat-value" style="color:#16a34a;">' + cashierCustomersServed + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Пропущено клиентов</span><span class="collective-stat-value" style="color:#ef4444;">' + cashierCustomersSkipped + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Статус</span><span class="collective-stat-value">' + (cashierShiftState.active ? 'Работает' : 'Не на смене') + '</span></div></div><button id="resign-cashier" class="job-decline-btn">Уволиться из магазина</button>';
            card.querySelector('#resign-cashier').addEventListener('click', function () {
                if (cashierShiftState.active) {
                    showToast('Сначала завершите смену!');
                    return;
                }
                cashierJobState.activeJobId = null;
                saveGameData();
                renderCollectiveApp();
                showToast('Вы уволились с работы кассира');
            });
            wrapper.appendChild(card);
        }

        if (firePending) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🚒</div><div><div class="collective-title">Пожарный</div><div class="collective-sub" style="color:#d97706;">Ожидает собеседования</div></div></div><p style="font-size:.75rem;color:#475569;">Собеседование завтра в 13:00 в Пожарной части.</p>';
            wrapper.appendChild(card);
        }

        if (truckerPending) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🚛</div><div><div class="collective-title">Дальнобойщик</div><div class="collective-sub" style="color:#d97706;">Ожидает экзамена ПДД</div></div></div><p style="font-size:.75rem;color:#475569;">Экзамен ПДД завтра в 13:00 на Автобазе.</p>';
            wrapper.appendChild(card);
        }

        if (cashierPending) {
            const card = document.createElement('div');
            card.className = 'collective-card';
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🛒</div><div><div class="collective-title">Кассир</div><div class="collective-sub" style="color:#d97706;">Ожидает собеседования</div></div></div><p style="font-size:.75rem;color:#475569;">Собеседование завтра в 10:00 в Магазине.</p>';
            wrapper.appendChild(card);
        }

        appScrollableBody.appendChild(wrapper);
    }

    /* =========================================================
       ТАКСИ И ПЕРЕДВИЖЕНИЕ
       ========================================================= */

    function renderTaxiApp() {
        appScrollableBody.innerHTML = '';
        const fromKey = getLocationKey();
        const fromTitle = getLocationTitle(fromKey);
        const targets = ['home', 'firestation', 'truckstation', 'market'].filter(function (key) { return key !== fromKey; });

        const wrapper = document.createElement('div');
        wrapper.className = 'taxi-app-wrapper';
        wrapper.innerHTML = '<div class="taxi-banner"><h3>🚕 Быстрое такси</h3><p>Выберите пункт назначения.</p></div><div class="taxi-location-card"><span>📍 Ваше местоположение:</span> ' + fromTitle + '</div>';

        targets.forEach(function (toKey) {
            const toTitle = getLocationTitle(toKey);
            const price = getTaxiRoutePrice(fromKey, toKey);
            const card = document.createElement('div');
            card.className = 'taxi-route-card selected-route';
            card.innerHTML = '<div class="taxi-route-header"><span class="taxi-route-title">' + fromTitle + ' → ' + toTitle + '</span><span class="taxi-route-price">' + price + ' ₽</span></div><button class="taxi-order-btn">Заказать и поехать (' + price + ' ₽)</button>';
            card.querySelector('.taxi-order-btn').addEventListener('click', function () {
                orderTaxi(fromKey, toKey, price, fromTitle, toTitle);
            });
            wrapper.appendChild(card);
        });

        appScrollableBody.appendChild(wrapper);
    }

    function orderTaxi(fromKey, toKey, price, fromTitle, toTitle) {
        if (fromKey === toKey) {
            showToast('Нельзя ехать в ту же локацию');
            return;
        }
        if (playerMoney < price) {
            showToast('Недостаточно денег для поездки на такси');
            return;
        }
        if (taxiTimerId) clearInterval(taxiTimerId);

        playerMoney = Math.max(0, playerMoney - price);
        addBankTransaction('Поездка на такси', price, false);
        phoneModal.classList.add('hidden');
        closePhoneApp();
        btnOpenSettingsGame.classList.add('hidden');
        taxiFullscreen.classList.remove('hidden');

        taxiRouteTitleText.textContent = '🚕 ' + fromTitle + ' → ' + toTitle;
        taxiRouteSubText.textContent = '';
        taxiProgressInner.style.width = '0%';
        taxiPercentText.textContent = '0%';

        const startTime = performance.now();
        const startMinutes = gameMinutes;
        const totalTaxiRealSeconds = 12;
        isClockRunning = false;

        taxiTimerId = setInterval(function () {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(1, elapsed / totalTaxiRealSeconds);
            gameMinutes = startMinutes + progress * 33;
            advanceCalendar();
            taxiProgressInner.style.width = (progress * 100).toFixed(1) + '%';
            taxiPercentText.textContent = Math.round(progress * 100) + '%';
            updateClockUI();
            updateStatsHUD();

            if (progress >= 1) {
                clearInterval(taxiTimerId);
                taxiTimerId = null;
                setTimeout(function () {
                    isClockRunning = true;
                    finishTaxiTrip(toKey, toTitle);
                }, 200);
            }
        }, 50);
    }

    function finishTaxiTrip(toKey, toTitle) {
        taxiFullscreen.classList.add('hidden');
        apartmentScreen.classList.add('hidden');
        firestationScreen.classList.add('hidden');
        truckstationScreen.classList.add('hidden');
        marketScreen.classList.add('hidden');
        lastExitedLocation = toKey;

        if (toKey === 'home') {
            currentScreen = 'apartment';
            apartmentScreen.classList.remove('hidden');
        } else if (toKey === 'firestation') {
            currentScreen = 'firestation';
            firestationScreen.classList.remove('hidden');
        } else if (toKey === 'truckstation') {
            currentScreen = 'truckstation';
            truckstationScreen.classList.remove('hidden');
        } else if (toKey === 'market') {
            currentScreen = 'market';
            marketScreen.classList.remove('hidden');
        }

        playerEnergy = clamp(playerEnergy - 3, 0, 100);
        saveGameData();
        updateStatsHUD();
        showToast('Вы приехали в ' + toTitle);
    }

    function openTravelChoiceModal(targetKey) {
        targetLocationSelected = targetKey;
        travelChoiceTitle.textContent = targetKey === 'home' ? 'Едем домой' : (targetKey === 'firestation' ? 'Едем в Пожарную часть' : (targetKey === 'truckstation' ? 'Едем на Автобазу' : 'Едем в Магазин'));
        const hasCar = ownedCars.length > 0;
        btnTravelCar.classList.toggle('disabled-card', !hasCar);
        travelCarDesc.textContent = hasCar ? 'На личном авто (' + ownedCars[0].title + ')' : 'Требуется личное авто';
        travelChoiceModal.classList.remove('hidden');
        btnOpenSettingsGame.classList.add('hidden');
    }

    function startWalkTravel() {
        travelChoiceModal.classList.add('hidden');
        walkClicksLeft = 150;
        walkFullscreen.classList.remove('hidden');
        const title = targetLocationSelected === 'home' ? 'Дом' : (targetLocationSelected === 'firestation' ? 'Пожарную часть' : (targetLocationSelected === 'truckstation' ? 'Автобазу' : 'Магазин'));
        walkTitleText.textContent = 'Идём пешком в ' + title;
        walkProgressInner.style.width = '0%';
        walkPercentText.textContent = '0%';
    }

    function handleWalkClick(event) {
        event.preventDefault();
        if (walkClicksLeft <= 0) return;
        walkClicksLeft -= 1;
        gameMinutes += 0.22;
        advanceCalendar();
        const progress = Math.round(((150 - walkClicksLeft) / 150) * 100);
        walkProgressInner.style.width = progress + '%';
        walkPercentText.textContent = progress + '%';
        updateClockUI();
        playClick();
        if (walkClicksLeft <= 0) finishWalkTravel();
    }

    function finishWalkTravel() {
        walkFullscreen.classList.add('hidden');
        apartmentScreen.classList.add('hidden');
        firestationScreen.classList.add('hidden');
        truckstationScreen.classList.add('hidden');
        marketScreen.classList.add('hidden');
        lastExitedLocation = targetLocationSelected;

        if (targetLocationSelected === 'home') {
            currentScreen = 'apartment';
            apartmentScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'firestation') {
            currentScreen = 'firestation';
            firestationScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'truckstation') {
            currentScreen = 'truckstation';
            truckstationScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'market') {
            currentScreen = 'market';
            marketScreen.classList.remove('hidden');
        }

        playerEnergy = clamp(playerEnergy - 8, 0, 100);
        playerHunger = clamp(playerHunger - 5, 0, 100);
        saveGameData();
        updateStatsHUD();
        showToast('Вы пришли пешком');
    }

    function startCarTravel() {
        if (!ownedCars.length) {
            showToast('У вас нет автомобиля');
            return;
        }
        travelChoiceModal.classList.add('hidden');
        gameMinutes += 15;
        advanceCalendar();
        apartmentScreen.classList.add('hidden');
        firestationScreen.classList.add('hidden');
        truckstationScreen.classList.add('hidden');
        marketScreen.classList.add('hidden');
        lastExitedLocation = targetLocationSelected;

        if (targetLocationSelected === 'home') {
            currentScreen = 'apartment';
            apartmentScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'firestation') {
            currentScreen = 'firestation';
            firestationScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'truckstation') {
            currentScreen = 'truckstation';
            truckstationScreen.classList.remove('hidden');
        } else if (targetLocationSelected === 'market') {
            currentScreen = 'market';
            marketScreen.classList.remove('hidden');
        }

        saveGameData();
        updateStatsHUD();
        showToast('Вы приехали на автомобиле');
    }

    /* =========================================================
       ДИАЛОГ ПОЖАРНОГО И ЗАКАЗЫ МЧС
       ========================================================= */

    function showDialogue(text) {
        if (!dialogueOverlay) return;
        dialogueOverlay.classList.remove('hidden');
        dialogueText.textContent = text;
    }

    function isFirefighterInterviewAvailableNow() {
        return jobState.pendingJobId === 'firefighter' && absoluteDay() === Number(jobState.interviewDay) && gameMinutes >= 780 && gameMinutes <= 840;
    }

    function handleHiringButton() {
        if (jobState.activeJobId === 'firefighter') {
            showDialogue('Вы уже работаете пожарным.');
            return;
        }
        if (jobState.pendingJobId !== 'firefighter') {
            showDialogue('Сначала откликнитесь на вакансию в приложении «Работа.ру».');
            return;
        }
        if (!isFirefighterInterviewAvailableNow()) {
            showDialogue('Собеседование состоится завтра в 13:00. Пройти его можно до 14:00.');
            return;
        }
        if (hasTwoActiveJobs()) {
            showDialogue('У вас уже две активные работы. Сначала увольтесь с одной из них.');
            return;
        }
        jobState.activeJobId = 'firefighter';
        jobState.pendingJobId = null;
        jobState.interviewDay = null;
        addMessage('Коллектив МЧС', '🚒', 'Поздравляем! Вы приняты на работу пожарным.');
        saveGameData();
        showDialogue('Поздравляю! Вы приняты на службу пожарным.');
    }

    function handleAboutButton() {
        showDialogue('Рабочее время пожарного: 07:00–19:00. Выполняйте вызовы МЧС и получайте зарплату.');
    }

    function handleOrdersButton() {
        if (jobState.activeJobId !== 'firefighter') {
            showDialogue('Сначала получите должность пожарного.');
            return;
        }
        if (!isFirefighterWorkTime()) {
            showDialogue('Заказы доступны с 07:00 до 19:00.');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showDialogue('У вас недостаточно энергии или сна для выполнения заказа.');
            return;
        }
        if (orderState.active) {
            showDialogue('У вас уже есть активный заказ.');
            return;
        }
        dialogueOverlay.classList.add('hidden');
        ordersModal.classList.remove('hidden');
    }

    function acceptFireOrder(level) {
        const selected = ORDER_TYPES[level];
        if (!selected || !isFirefighterWorkTime()) return;
        if (!hasEnoughEnergyOrSleep()) {
            showToast('Недостаточно энергии или сна для заказа');
            return;
        }
        orderState = {
            active: true,
            level: selected.key,
            title: selected.title,
            reward: selected.reward,
            flameCount: selected.flames,
            flameHitsRequired: selected.hits,
            routeProgress: 0,
            status: 'travel',
            startedAtDay: absoluteDay(),
            startedAtMinutes: gameMinutes
        };
        ordersModal.classList.add('hidden');
        roadFullscreen.classList.remove('hidden');
        roadProgressInner.style.width = '0%';
        roadPercentText.textContent = '0%';
        btnArriveDestination.classList.add('hidden');
        saveGameData();
        showToast('Заказ принят. Нажимайте на экран, чтобы ехать');
    }

    function updateRoadProgress() {
        if (!orderState.active || orderState.status !== 'travel') return;
        orderState.routeProgress = clamp(orderState.routeProgress + 1, 0, 100);
        roadProgressInner.style.width = orderState.routeProgress + '%';
        roadPercentText.textContent = orderState.routeProgress + '%';
        if (orderState.routeProgress >= 100) {
            orderState.status = 'arrived';
            btnArriveDestination.classList.remove('hidden');
            showToast('Вы приехали к месту пожара');
        }
        saveGameData();
    }

    function beginFirefighting() {
        if (!orderState.active || orderState.status !== 'arrived') return;
        orderState.status = 'fire';
        roadFullscreen.classList.add('hidden');
        fireFullscreen.classList.remove('hidden');
        createFlames(orderState.flameCount, orderState.flameHitsRequired);
        saveGameData();
    }

    function cancelActiveFireOrder() {
        if (!orderState.active) return;
        createFine(300, 'Отмена заказа МЧС');
        addBankTransaction('Штраф за отмену МЧС', 300, false);
        orderState = {
            active: false,
            level: null,
            title: '',
            reward: 0,
            flameCount: 0,
            flameHitsRequired: 3,
            routeProgress: 0,
            status: null,
            startedAtDay: null,
            startedAtMinutes: null
        };
        roadFullscreen.classList.add('hidden');
        fireFullscreen.classList.add('hidden');
        currentScreen = 'firestation';
        firestationScreen.classList.remove('hidden');
        saveGameData();
    }

    function completeFireOrder() {
        const reward = orderState.reward;
        playerMoney += reward;
        addBankTransaction('Зарплата: Пожарный', reward, true);
        createTax('salary', reward * SALARY_TAX_RATE, 'Налог: Пожарный 3%');
        checkResetDailyOrdersCounter();
        ordersCompletedToday += 1;
        totalOrdersCompleted += 1;
        orderState.active = false;
        saveGameData();
        fireFullscreen.classList.add('hidden');
        currentScreen = 'firestation';
        firestationScreen.classList.remove('hidden');
        updateClockUI();
        showToast('Пожар потушен! Зарплата +' + reward + ' ₽');
    }

    function createFlames(count, hitsRequired) {
        flamesContainer.innerHTML = '';
        const positions = [
            { left: 18, top: 20 }, { left: 42, top: 18 }, { left: 67, top: 22 },
            { left: 28, top: 43 }, { left: 56, top: 40 }, { left: 78, top: 45 },
            { left: 15, top: 62 }, { left: 40, top: 65 }, { left: 65, top: 67 }, { left: 83, top: 72 }
        ];

        for (let index = 0; index < count; index += 1) {
            const flame = document.createElement('button');
            flame.type = 'button';
            flame.className = 'flame-item';
            flame.textContent = '🔥';
            flame.dataset.hits = '0';
            flame.style.left = positions[index].left + '%';
            flame.style.top = positions[index].top + '%';

            const badge = document.createElement('span');
            badge.className = 'flame-hits-badge';
            badge.textContent = '0/' + hitsRequired;
            flame.appendChild(badge);

            flame.addEventListener('pointerdown', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (flame.classList.contains('extinguished')) return;
                const hits = Number(flame.dataset.hits) || 0;
                const nextHits = Math.min(hits + 1, hitsRequired);
                flame.dataset.hits = String(nextHits);
                badge.textContent = nextHits + '/' + hitsRequired;
                playClick();

                if (nextHits >= hitsRequired) {
                    flame.classList.add('extinguished');
                    flame.textContent = '💧';
                    flame.appendChild(badge);
                    const remaining = flamesContainer.querySelectorAll('.flame-item:not(.extinguished)');
                    if (remaining.length === 0) completeFireOrder();
                }
            }, { passive: false });

            flamesContainer.appendChild(flame);
        }
    }

    /* =========================================================
       ДИАЛОГ ДАЛЬНОБОЙЩИКА, ПДД И РЕЙСЫ
       ========================================================= */

    function showTruckerDialogue(text) {
        if (!truckerDialogueOverlay) return;
        truckerDialogueOverlay.classList.remove('hidden');
        truckerDialogueText.textContent = text;
    }

    function isTruckerInterviewAvailableNow() {
        return truckerJobState.pendingJobId === 'driver' && absoluteDay() === Number(truckerJobState.interviewDay) && gameMinutes >= 780 && gameMinutes <= 840;
    }

    function handleTruckerHiringButton() {
        if (truckerJobState.activeJobId === 'driver') {
            showTruckerDialogue('Вы уже работаете дальнобойщиком.');
            return;
        }
        if (truckerJobState.pendingJobId !== 'driver') {
            showTruckerDialogue('Сначала откликнитесь на вакансию в приложении «Работа.ру».');
            return;
        }
        if (!isTruckerInterviewAvailableNow()) {
            showTruckerDialogue('Экзамен ПДД состоится завтра в 13:00. Пройти его можно до 14:00.');
            return;
        }
        if (hasTwoActiveJobs()) {
            showTruckerDialogue('У вас уже две активные работы. Сначала увольтесь с одной из них.');
            return;
        }
        truckerDialogueOverlay.classList.add('hidden');
        startPddQuiz();
    }

    function startPddQuiz() {
        pddQuizState = { questionIndex: 0, answersGiven: [] };
        renderPddQuestion();
        pddQuizModal.classList.remove('hidden');
    }

    function renderPddQuestion() {
        const question = PDD_QUESTIONS[pddQuizState.questionIndex];
        pddStepBadge.textContent = 'Вопрос ' + (pddQuizState.questionIndex + 1) + ' из 2';
        pddQuestionImg.src = question.image;
        pddQuestionTitle.textContent = question.title;
        pddAnswersGrid.innerHTML = '';

        question.options.forEach(function (option, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pdd-answer-btn';
            button.textContent = (index + 1) + ') ' + option;
            button.addEventListener('click', function () {
                answerPddQuestion(index);
            });
            pddAnswersGrid.appendChild(button);
        });
    }

    function answerPddQuestion(selectedIndex) {
        const question = PDD_QUESTIONS[pddQuizState.questionIndex];
        pddQuizState.answersGiven.push(selectedIndex === question.correct);
        playClick();

        if (pddQuizState.questionIndex < PDD_QUESTIONS.length - 1) {
            pddQuizState.questionIndex += 1;
            renderPddQuestion();
            return;
        }

        pddQuizModal.classList.add('hidden');
        const allCorrect = pddQuizState.answersGiven.every(Boolean);

        if (allCorrect) {
            truckerJobState.activeJobId = 'driver';
            truckerJobState.pendingJobId = null;
            truckerJobState.interviewDay = null;
            if (!truckerCurrentOffers.length) truckerCurrentOffers = getRandomTruckerOffers();
            addMessage('Автобаза', '🚛', 'Поздравляем! Вы сдали экзамен ПДД и приняты дальнобойщиком.');
            saveGameData();
            showTruckerDialogue('Отлично! Вы сдали экзамен ПДД. Добро пожаловать в команду дальнобойщиков!');
        } else {
            truckerJobState.pendingJobId = null;
            truckerJobState.interviewDay = null;
            saveGameData();
            showTruckerDialogue('Вы допустили ошибку в экзамене ПДД. Вы сможете откликнуться повторно через приложение «Работа.ру».');
        }
    }

    function handleTruckerAboutButton() {
        showTruckerDialogue('Рабочее время дальнобойщика: 05:00–20:00. Каждый километр рейса требует одного нажатия.');
    }

    function handleTruckerOrdersButton() {
        if (truckerJobState.activeJobId !== 'driver') {
            showTruckerDialogue('Сначала получите должность дальнобойщика.');
            return;
        }
        if (!isTruckerWorkTime()) {
            showTruckerDialogue('Заказы доступны с 05:00 до 20:00.');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showTruckerDialogue('У вас недостаточно энергии или сна для рейса.');
            return;
        }
        if (truckerTripState.active) {
            showTruckerDialogue('У вас уже выполняется активный рейс.');
            return;
        }
        if (!truckerCurrentOffers.length) truckerCurrentOffers = getRandomTruckerOffers();
        truckerDialogueOverlay.classList.add('hidden');
        renderTruckerOrdersModal();
    }

    function renderTruckerOrdersModal() {
        truckerOrdersList.innerHTML = '';
        truckerCurrentOffers.forEach(function (offer, index) {
            const card = document.createElement('div');
            card.className = 'order-item-card';
            card.innerHTML = '<div class="order-item-header">🚛 Рейс №' + (index + 1) + '</div><div class="order-item-reward" style="color:#f59e0b;">Дистанция: ' + offer.dist + ' км</div><div class="order-item-desc">Тариф: ' + offer.rate + ' ₽/км</div><button class="btn btn-primary btn-select-order trucker-select-btn">Принять рейс</button>';
            card.querySelector('button').addEventListener('click', function () {
                acceptTruckerOrder(offer);
            });
            truckerOrdersList.appendChild(card);
        });
        truckerOrdersModal.classList.remove('hidden');
    }

    function acceptTruckerOrder(offer) {
        if (!hasEnoughEnergyOrSleep()) {
            showToast('Недостаточно энергии или сна для рейса');
            return;
        }
        truckerOrdersModal.classList.add('hidden');
        truckerTripState = {
            active: true,
            order: offer,
            currentClicks: 0,
            totalClicks: offer.dist
        };
        truckstationScreen.classList.add('hidden');
        truckerRoadFullscreen.classList.remove('hidden');
        truckerTripTitle.textContent = '🚛 Рейс: ' + offer.dist + ' км';
        truckerTripSub.textContent = 'Нажимайте на экран, чтобы проехать каждый километр пути';
        truckerProgressInner.style.width = '0%';
        truckerPercentText.textContent = '0%';
        truckerKmCounter.textContent = '0 / ' + offer.dist + ' км';
        saveGameData();
        showToast('Рейс принят');
    }

    function handleTruckerClick(event) {
        event.preventDefault();
        if (!truckerTripState.active) return;
        truckerTripState.currentClicks += 1;
        gameMinutes += 0.12;
        advanceCalendar();
        playClick();

        const current = Math.min(truckerTripState.currentClicks, truckerTripState.totalClicks);
        const total = truckerTripState.totalClicks;
        const percent = Math.round((current / total) * 100);
        truckerProgressInner.style.width = percent + '%';
        truckerPercentText.textContent = percent + '%';
        truckerKmCounter.textContent = current + ' / ' + total + ' км';
        updateClockUI();

        if (current >= total) completeTruckerTrip();
        saveGameData();
    }

    function completeTruckerTrip() {
        if (!truckerTripState.active || !truckerTripState.order) return;
        const order = truckerTripState.order;
        const salary = Math.round(order.dist * order.rate);

        playerMoney += salary;
        addBankTransaction('Зарплата: Дальнобойщик', salary, true);
        createTax('salary', salary * SALARY_TAX_RATE, 'Налог: Дальнобойщик 3%');
        checkResetDailyTruckerCounter();
        truckerOrdersCompletedToday += 1;
        truckerTotalOrdersCompleted += 1;
        truckerCurrentOffers = getRandomTruckerOffers();
        truckerTripState = { active: false, order: null, currentClicks: 0, totalClicks: 0 };
        saveGameData();

        truckerRoadFullscreen.classList.add('hidden');
        currentScreen = 'truckstation';
        truckstationScreen.classList.remove('hidden');
        updateClockUI();
        showToast('Рейс выполнен! Зарплата +' + salary.toLocaleString('ru-RU') + ' ₽');
    }

    function cancelTruckerTrip() {
        if (!truckerTripState.active) return;
        createFine(1200, 'Отказ от рейса');
        addBankTransaction('Штраф за отказ от рейса', 1200, false);
        truckerCurrentOffers = getRandomTruckerOffers();
        truckerTripState = { active: false, order: null, currentClicks: 0, totalClicks: 0 };
        truckerRoadFullscreen.classList.add('hidden');
        currentScreen = 'truckstation';
        truckstationScreen.classList.remove('hidden');
        saveGameData();
        showToast('Рейс отменён. Штраф 1 200 ₽');
    }

    /* =========================================================
       ДИАЛОГ КАССИРА И ПОЛНОЦЕННАЯ РАБОТА
       ========================================================= */

    function showMarketDialogue(text) {
        if (!marketDialogueOverlay) return;
        marketDialogueOverlay.classList.remove('hidden');
        marketDialogueText.textContent = text;
    }

    function openMarketDialogue() {
        if (!marketDialogueOverlay) return;
        marketDialogueOverlay.classList.remove('hidden');
        if (cashierShiftState.active) {
            showMarketDialogue('Вы сейчас находитесь на рабочей смене! Вы можете вернуться за кассу или завершить смену.');
            if (btnMarketWork) btnMarketWork.textContent = '▶ На кассу';
            if (btnMarketHiring) {
                btnMarketHiring.textContent = '🏁 Сдать смену';
                btnMarketHiring.style.display = 'block';
            }
        } else {
            showMarketDialogue('Здравствуйте! Я директор магазина. Хотите устроиться кассиром или начать рабочую смену?');
            if (btnMarketWork) btnMarketWork.textContent = 'Начать смену';
            if (btnMarketHiring) {
                btnMarketHiring.textContent = 'Трудоустройство';
                btnMarketHiring.style.display = 'block';
            }
        }
    }

    function isCashierInterviewAvailableNow() {
        return cashierJobState.pendingJobId === 'cashier' && absoluteDay() === Number(cashierJobState.interviewDay) && gameMinutes >= 600 && gameMinutes <= 660;
    }

    function handleMarketHiringButton() {
        if (cashierShiftState.active) {
            endCashierShift();
            marketDialogueOverlay.classList.add('hidden');
            return;
        }

        if (cashierJobState.activeJobId === 'cashier') {
            showMarketDialogue('Вы уже работаете кассиром.');
            return;
        }
        if (cashierJobState.pendingJobId !== 'cashier') {
            showMarketDialogue('Сначала откликнитесь на вакансию в приложении «Работа.ру».');
            return;
        }
        if (!isCashierInterviewAvailableNow()) {
            showMarketDialogue('Собеседование состоится завтра в 10:00. Пройти его можно до 11:00.');
            return;
        }
        if (hasTwoActiveJobs()) {
            showMarketDialogue('У вас уже две активные работы. Сначала увольтесь с одной из них.');
            return;
        }
        marketDialogueOverlay.classList.add('hidden');
        startCashierInterview();
    }

    function startCashierInterview() {
        cashierInterviewState = { questionIndex: 0, answersGiven: [] };
        renderCashierInterviewQuestion();
        cashierInterviewModal.classList.remove('hidden');
    }

    function renderCashierInterviewQuestion() {
        const question = CASHIER_INTERVIEW_QUESTIONS[cashierInterviewState.questionIndex];
        if (!question) {
            finishCashierInterview();
            return;
        }
        cashierStepBadge.textContent = 'Вопрос ' + (cashierInterviewState.questionIndex + 1) + ' из 2';
        cashierQuestionTitle.textContent = question.title;
        cashierAnswersGrid.innerHTML = '';

        question.options.forEach(function (option, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'cashier-answer-btn';
            button.textContent = option;
            button.addEventListener('click', function () {
                answerCashierQuestion(index);
            });
            cashierAnswersGrid.appendChild(button);
        });
    }

    function answerCashierQuestion(selectedIndex) {
        const question = CASHIER_INTERVIEW_QUESTIONS[cashierInterviewState.questionIndex];
        const correct = selectedIndex === question.correct;
        cashierInterviewState.answersGiven.push(correct);
        playClick();

        if (cashierInterviewState.questionIndex < CASHIER_INTERVIEW_QUESTIONS.length - 1) {
            cashierInterviewState.questionIndex += 1;
            renderCashierInterviewQuestion();
            return;
        }

        finishCashierInterview();
    }

    function finishCashierInterview() {
        cashierInterviewModal.classList.add('hidden');
        const allCorrect = cashierInterviewState.answersGiven.every(Boolean);

        if (allCorrect) {
            cashierJobState.activeJobId = 'cashier';
            cashierJobState.pendingJobId = null;
            cashierJobState.interviewDay = null;
            addMessage('Магазин', '🛒', 'Поздравляем! Вы приняты на работу кассиром.');
            saveGameData();
            showMarketDialogue('Отлично! Вы приняты на работу кассиром. График: 9:00–21:00.');
        } else {
            cashierJobState.pendingJobId = null;
            cashierJobState.interviewDay = null;
            saveGameData();
            showMarketDialogue('Вы допустили ошибку в собеседовании. Вы сможете откликнуться повторно через приложение «Работа.ру».');
        }
    }

    function handleMarketAboutButton() {
        showMarketDialogue('Рабочее время кассира: 09:00–21:00. Перерыв с 13:00 до 14:30. Зарплата 11 500 ₽ за смену.');
    }

    function handleMarketWorkButton() {
        if (cashierShiftState.active) {
            marketDialogueOverlay.classList.add('hidden');
            showCashierWorkScreen();
            return;
        }

        if (cashierJobState.activeJobId !== 'cashier') {
            showMarketDialogue('Сначала получите должность кассира.');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showMarketDialogue('У вас недостаточно энергии или сна для работы.');
            return;
        }
        const hour = getCurrentHour();
        if (hour > CASHIER_SHIFT_START_HOUR) {
            const fine = CASHIER_LATE_FINE;
            playerMoney = Math.max(0, playerMoney - fine);
            addBankTransaction('Штраф за опоздание', fine, false);
            createFine(fine, 'Опоздание на смену кассира');
            showToast('Штраф за опоздание: ' + fine + ' ₽');
        }
        cashierShiftState.active = true;
        cashierShiftState.startedAtMinutes = gameMinutes;
        cashierShiftState.shiftCompleted = false;
        cashierShiftState.salaryEarned = 0;
        cashierShiftState.onBreak = false;
        cashierShiftState.breakStartMinutes = null;
        cashierShiftState.customer = null;
        cashierShiftState.checkAmount = 0;
        cashierShiftState.customerPaid = 0;
        cashierShiftState.changeDue = 0;
        cashierShiftState.selectedChange = 0;
        cashierShiftState.selectedDenominations = [];

        generateCashierCustomers();
        currentCustomerIndex = 0;
        marketDialogueOverlay.classList.add('hidden');
        showCashierWorkScreen();
        showToast('Смена началась!');
    }

    function generateCashierCustomers() {
        cashierCustomers = [];
        const count = Math.floor(Math.random() * 10) + 15;
        for (let i = 0; i < count; i++) {
            const checkAmount = Math.floor(Math.random() * (CASHIER_CHECK_MAX - CASHIER_CHECK_MIN + 1)) + CASHIER_CHECK_MIN;
            const possibleAdditions = [50, 100, 200, 500, 1000];
            const paidExtra = possibleAdditions[Math.floor(Math.random() * possibleAdditions.length)];
            const paid = checkAmount + paidExtra;
            const customerIndex = (i % 3) + 1;
            cashierCustomers.push({
                checkAmount: checkAmount,
                paid: paid,
                customerImage: 'customers/customer_' + customerIndex + '.png'
            });
        }
    }

    function showCashierWorkScreen() {
        marketScreen.classList.add('hidden');
        cashierWorkScreen.classList.remove('hidden');
        btnOpenSettingsGame.classList.add('hidden');
        updateCashierUI();
        renderCashierDenominations();
    }

    function updateCashierUI() {
        if (!cashierShiftState.active || cashierShiftState.shiftCompleted) {
            cashierShiftStatus.textContent = 'Смена завершена';
            return;
        }

        const hour = getCurrentHour();
        if (isCashierBreakTime() && !cashierShiftState.onBreak) {
            cashierShiftState.onBreak = true;
            cashierShiftState.breakStartMinutes = gameMinutes;
            showToast('Перерыв! 13:00–14:30');
        }
        if (cashierShiftState.onBreak && !isCashierBreakTime()) {
            cashierShiftState.onBreak = false;
            cashierShiftState.breakStartMinutes = null;
            showToast('Перерыв окончен!');
        }

        if (cashierShiftState.onBreak) {
            cashierShiftStatus.textContent = '🔴 ПЕРЕРЫВ (13:00–14:30)';
            btnCashierBreak.classList.add('hidden');
            btnCashierEndShift.classList.add('hidden');
            return;
        } else {
            btnCashierBreak.classList.remove('hidden');
            btnCashierEndShift.classList.remove('hidden');
        }

        const elapsed = Math.floor((gameMinutes - cashierShiftState.startedAtMinutes) / 60);
        cashierShiftStatus.textContent = '🟢 Смена: ' + elapsed + ' ч';

        if (cashierShiftState.customer === null && currentCustomerIndex < cashierCustomers.length) {
            cashierShiftState.customer = cashierCustomers[currentCustomerIndex];
            cashierShiftState.checkAmount = cashierShiftState.customer.checkAmount;
            cashierShiftState.customerPaid = cashierShiftState.customer.paid;
            cashierShiftState.changeDue = cashierShiftState.customer.paid - cashierShiftState.customer.checkAmount;
            cashierShiftState.selectedChange = 0;
            cashierShiftState.selectedDenominations = [];
            currentCustomerIndex++;
            renderCashierDenominations();
        }

        if (cashierShiftState.customer) {
            cashierCheckDisplay.textContent = cashierShiftState.customer.checkAmount + ' ₽';
            cashierPaidDisplay.textContent = cashierShiftState.customer.paid + ' ₽';
            cashierChangeDueDisplay.textContent = cashierShiftState.changeDue + ' ₽';
            cashierSelectedDisplay.textContent = cashierShiftState.selectedChange + ' ₽';
            cashierCustomerImage.src = cashierShiftState.customer.customerImage;
            cashierCustomerImage.onerror = function () {
                this.src = 'https://via.placeholder.com/120x160?text=👤';
            };

            btnCashierGiveChange.disabled = cashierShiftState.selectedChange !== cashierShiftState.changeDue;
            btnCashierGiveChange.textContent = cashierShiftState.selectedChange === cashierShiftState.changeDue 
                ? 'Выдать сдачу (' + cashierShiftState.selectedChange + ' ₽)' 
                : 'Выдать сдачу (' + cashierShiftState.selectedChange + ' / ' + cashierShiftState.changeDue + ' ₽)';
        } else {
            cashierCheckDisplay.textContent = '0 ₽';
            cashierPaidDisplay.textContent = '0 ₽';
            cashierChangeDueDisplay.textContent = '0 ₽';
            cashierSelectedDisplay.textContent = '0 ₽';
            btnCashierGiveChange.disabled = true;
            btnCashierGiveChange.textContent = 'Нет покупателя';
        }

        renderSelectedDenominationsTray();

        const hourNow = getCurrentHour();
        if (hourNow >= CASHIER_SHIFT_END_HOUR && cashierShiftState.active && !cashierShiftState.shiftCompleted) {
            btnCashierEndShift.classList.remove('hidden');
            btnCashierEndShift.textContent = 'Закончить смену (получить зарплату)';
        }
    }

    function renderSelectedDenominationsTray() {
        if (!cashierSelectedItemsTray) return;
        cashierSelectedItemsTray.innerHTML = '';

        if (!cashierShiftState.selectedDenominations.length) {
            cashierSelectedItemsTray.innerHTML = '<span class="cashier-empty-tray-label">Нажимайте на купюры ниже, чтобы собрать сдачу</span>';
            return;
        }

        cashierShiftState.selectedDenominations.forEach(function (denom, index) {
            const chip = document.createElement('div');
            chip.className = 'cashier-selected-chip';
            chip.title = 'Нажмите для возврата';
            chip.innerHTML = '<span>' + denom.label + '</span><button type="button" class="cashier-chip-remove">✕</button>';
            chip.addEventListener('click', function (event) {
                event.stopPropagation();
                removeCashierDenomination(index);
            });
            cashierSelectedItemsTray.appendChild(chip);
        });
    }

    function selectCashierDenomination(denom) {
        if (!cashierShiftState.customer) return;
        if (cashierShiftState.onBreak) {
            showToast('Сейчас перерыв!');
            return;
        }
        if (cashierShiftState.selectedChange + denom.value > cashierShiftState.changeDue) {
            showToast('Слишком много! Сумма сдачи превышена.');
            return;
        }
        cashierShiftState.selectedChange += denom.value;
        cashierShiftState.selectedDenominations.push(denom);
        updateCashierUI();
        playClick();
    }

    function removeCashierDenomination(index) {
        if (index < 0 || index >= cashierShiftState.selectedDenominations.length) return;
        const removed = cashierShiftState.selectedDenominations.splice(index, 1)[0];
        if (removed) {
            cashierShiftState.selectedChange = Math.max(0, cashierShiftState.selectedChange - removed.value);
        }
        updateCashierUI();
        playClick();
    }

    function renderCashierDenominations() {
        if (!cashierDenominationsGrid) return;
        cashierDenominationsGrid.innerHTML = '';
        CASHIER_DENOMINATIONS.forEach(function (denom) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'cashier-denom-btn';
            button.innerHTML = '<span class="denom-val-title">' + denom.label + '</span>';
            button.addEventListener('click', function () {
                selectCashierDenomination(denom);
            });
            cashierDenominationsGrid.appendChild(button);
        });
    }

    function giveChange() {
        if (!cashierShiftState.customer) return;
        if (cashierShiftState.onBreak) {
            showToast('Сейчас перерыв!');
            return;
        }
        if (cashierShiftState.selectedChange !== cashierShiftState.changeDue) {
            showToast('Соберите точную сумму сдачи');
            return;
        }

        cashierCustomersServed += 1;
        cashierShiftState.customer = null;
        cashierShiftState.checkAmount = 0;
        cashierShiftState.customerPaid = 0;
        cashierShiftState.changeDue = 0;
        cashierShiftState.selectedChange = 0;
        cashierShiftState.selectedDenominations = [];
        updateCashierUI();
        playClick();

        if (currentCustomerIndex >= cashierCustomers.length) {
            showToast('Все покупатели обслужены! Все товары пробиты!');
        } else {
            showToast('Сдача выдана! Следующий покупатель');
        }
    }

    function endCashierShift() {
        if (!cashierShiftState.active) return;
        if (cashierShiftState.onBreak) {
            showToast('Сейчас перерыв!');
            return;
        }

        if (cashierCustomers && currentCustomerIndex < cashierCustomers.length) {
            cashierCustomersSkipped += (cashierCustomers.length - currentCustomerIndex);
        }

        const hour = getCurrentHour();
        if (hour < CASHIER_SHIFT_END_HOUR) {
            const fine = CASHIER_EARLY_END_FINE;
            playerMoney = Math.max(0, playerMoney - fine);
            addBankTransaction('Штраф за завершение смены', fine, false);
            createFine(fine, 'Досрочное завершение смены кассира');
            showToast('Штраф за досрочное завершение: ' + fine + ' ₽');
        } else {
            const salary = CASHIER_SALARY;
            playerMoney += salary;
            addBankTransaction('Зарплата: Кассир', salary, true);
            const tax = Math.round(salary * CASHIER_TAX_RATE);
            createTax('salary', tax, 'Налог: Кассир 3%');
            showToast('Зарплата +' + salary + ' ₽');
        }

        cashierTotalShiftsCompleted += 1;
        cashierShiftState.active = false;
        cashierShiftState.shiftCompleted = true;
        cashierShiftState.customer = null;
        cashierShiftState.checkAmount = 0;
        cashierShiftState.customerPaid = 0;
        cashierShiftState.changeDue = 0;
        cashierShiftState.selectedChange = 0;
        cashierShiftState.selectedDenominations = [];
        cashierWorkScreen.classList.add('hidden');
        currentScreen = 'market';
        marketScreen.classList.remove('hidden');
        btnOpenSettingsGame.classList.remove('hidden');
        updateClockUI();
        saveGameData();
        showToast('Смена завершена');
    }

    function handleCashierBreak() {
        const hour = getCurrentHour();
        if (hour >= CASHIER_BREAK_START_HOUR && hour < CASHIER_BREAK_END_HOUR) {
            if (!cashierShiftState.onBreak) {
                cashierShiftState.onBreak = true;
                cashierShiftState.breakStartMinutes = gameMinutes;
                showToast('Перерыв начался! Можно пользоваться телефоном.');
                updateCashierUI();
            }
        } else {
            showToast('Перерыв только с 13:00 до 14:30');
        }
    }

    /* =========================================================
       ЛОТЕРЕЯ
       ========================================================= */

    function getLottoMultiplier(matches) {
        if (matches === 1) return 1.15;
        if (matches === 2) return 1.3;
        if (matches === 3) return 2;
        if (matches === 4) return 3.3;
        if (matches === 5) return 5;
        return 0;
    }

    function renderLottoApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'lotto-wrapper';

        if (lottoState.step === 'select_tier') {
            wrapper.innerHTML = '<div class="lotto-banner"><h3>🎰 Национальная лотерея</h3><p>Выберите категорию билета и угадайте 5 чисел от 1 до 30.</p></div><div class="lotto-tiers-grid" id="lotto-tiers-box"></div>';
            appScrollableBody.appendChild(wrapper);
            const grid = wrapper.querySelector('#lotto-tiers-box');
            LOTTO_TIERS.forEach(function (tier) {
                const card = document.createElement('div');
                card.className = 'lotto-tier-card';
                card.innerHTML = '<div class="lotto-tier-icon">' + tier.icon + '</div><div class="lotto-tier-price">' + tier.label + '</div><div class="lotto-tier-sub">Выигрыш до ' + (tier.price * 5).toLocaleString('ru-RU') + ' ₽</div>';
                card.addEventListener('click', function () { startLottoTier(tier); });
                grid.appendChild(card);
            });
            return;
        }

        if (lottoState.step === 'buy_tickets') {
            const tier = lottoState.selectedTier;
            const game = document.createElement('div');
            game.className = 'lotto-game-container';
            const header = document.createElement('div');
            header.className = 'lotto-header-bar';
            header.innerHTML = '<div><strong>Категория: ' + tier.label + '</strong><br><span style="font-size:.68rem;color:#64748b;">Выбрано: ' + lottoState.selectedTicketIndexes.length + '/2</span></div>';
            const startButton = document.createElement('button');
            startButton.className = 'lotto-btn-start';
            startButton.disabled = lottoState.selectedTicketIndexes.length === 0;
            startButton.textContent = lottoState.selectedTicketIndexes.length ? '🎲 Начать игру' : 'Выберите билет';
            startButton.addEventListener('click', startLottoDraw);
            header.appendChild(startButton);
            game.appendChild(header);

            const row = document.createElement('div');
            row.className = 'lotto-tickets-row';
            lottoState.ticketsData.forEach(function (ticket, index) {
                const selected = lottoState.selectedTicketIndexes.includes(index);
                const card = document.createElement('div');
                card.className = 'lotto-ticket-card-selection' + (selected ? ' selected' : '');
                card.innerHTML = (selected ? '<span class="lotto-selected-badge">✓ Выбран</span>' : '') + '<div class="lotto-ticket-back-icon">🎟️</div><div class="lotto-ticket-back-title">БИЛЕТ №' + (index + 1) + '</div><div class="lotto-ticket-back-price-pill">' + tier.label + '</div>';
                card.addEventListener('click', function () { toggleLottoTicketSelection(index); });
                row.appendChild(card);
            });
            game.appendChild(row);
            wrapper.appendChild(game);
            appScrollableBody.appendChild(wrapper);
            return;
        }

        const game = document.createElement('div');
        game.className = 'lotto-game-container';
        const draw = document.createElement('div');
        draw.className = 'lotto-draw-section';
        draw.innerHTML = '<div class="lotto-draw-title">🎯 ВЫПАДАЮЩИЕ ЧИСЛА</div><div class="lotto-draw-balls-row"></div>';
        lottoState.drawNumbers.forEach(function (number) {
            const ball = document.createElement('div');
            ball.className = 'lotto-draw-ball';
            ball.textContent = number;
            draw.querySelector('.lotto-draw-balls-row').appendChild(ball);
        });
        game.appendChild(draw);

        lottoState.ticketsBought.forEach(function (ticketIndex) {
            const ticket = lottoState.ticketsData[ticketIndex];
            const card = document.createElement('div');
            card.className = 'lotto-ticket-revealed-card';
            let numbers = '<div class="lotto-numbers-layout"><div class="lotto-numbers-row-top">';
            ticket.numbers.forEach(function (number, index) {
                if (index === 3) numbers += '</div><div class="lotto-numbers-row-bottom">';
                numbers += '<div class="lotto-num-ball ' + (lottoState.drawNumbers.includes(number) ? 'matched' : '') + '">' + number + '</div>';
            });
            numbers += '</div></div>';
            card.innerHTML = '<div class="lotto-ticket-revealed-title">БИЛЕТ ' + lottoState.selectedTier.label + '</div>' + numbers;
            game.appendChild(card);
        });

        if (lottoState.step === 'result') {
            let payout = 0;
            const descriptions = [];
            lottoState.ticketsBought.forEach(function (ticketIndex) {
                const ticket = lottoState.ticketsData[ticketIndex];
                const matches = ticket.numbers.filter(function (number) { return lottoState.drawNumbers.includes(number); }).length;
                const amount = Math.round(lottoState.selectedTier.price * getLottoMultiplier(matches));
                payout += amount;
                descriptions.push('Билет №' + (ticketIndex + 1) + ': ' + matches + ' совпадений → +' + amount.toLocaleString('ru-RU') + ' ₽');
            });
            const result = document.createElement('div');
            result.className = 'lotto-result-box';
            result.innerHTML = payout > 0 ? '<div class="lotto-result-title">🎉 Выигрыш: ' + payout.toLocaleString('ru-RU') + ' ₽</div><div class="lotto-result-sub">Налог 1.5% добавлен в приложение «Оплата».</div><div class="lotto-result-sub">' + descriptions.join('<br>') + '</div>' : '<div class="lotto-result-title" style="color:#ef4444;">😔 Совпадений нет</div><div class="lotto-result-sub">Повезёт в следующий раз!</div>';
            const again = document.createElement('button');
            again.className = 'lotto-btn-start';
            again.textContent = '🔄 Играть ещё раз';
            again.addEventListener('click', function () { startLottoTier(lottoState.selectedTier); });
            result.appendChild(again);
            game.appendChild(result);
        }

        wrapper.appendChild(game);
        appScrollableBody.appendChild(wrapper);
    }

    function startLottoTier(tier) {
        lottoState = { selectedTier: tier, selectedTicketIndexes: [], ticketsBought: [], ticketsData: [], drawNumbers: [], step: 'buy_tickets', matchesPerTicket: [] };
        for (let index = 0; index < 5; index += 1) {
            lottoState.ticketsData.push({ numbers: generateRandomNumbers(5, 1, 30), bought: false });
        }
        renderLottoApp();
    }

    function toggleLottoTicketSelection(index) {
        const selectedIndex = lottoState.selectedTicketIndexes.indexOf(index);
        if (selectedIndex !== -1) {
            lottoState.selectedTicketIndexes.splice(selectedIndex, 1);
            renderLottoApp();
            return;
        }
        if (lottoState.selectedTicketIndexes.length >= 2) {
            showToast('Можно выбрать максимум 2 билета');
            return;
        }
        const price = lottoState.selectedTier.price;
        if (playerMoney < (lottoState.selectedTicketIndexes.length + 1) * price) {
            showToast('Недостаточно денег для покупки билетов');
            return;
        }
        lottoState.selectedTicketIndexes.push(index);
        renderLottoApp();
    }

    function startLottoDraw() {
        const tier = lottoState.selectedTier;
        const indexes = lottoState.selectedTicketIndexes.slice();
        const total = indexes.length * tier.price;
        if (!indexes.length || playerMoney < total) {
            showToast('Недостаточно денег для покупки билетов');
            return;
        }
        playerMoney = Math.max(0, playerMoney - total);
        addBankTransaction('Покупка лотереи', total, false);
        lottoState.ticketsBought = indexes;
        lottoState.step = 'drawing';
        lottoState.drawNumbers = [];
        renderLottoApp();

        const winning = generateRandomNumbers(5, 1, 30);
        let index = 0;
        const timer = setInterval(function () {
            if (index < winning.length) {
                lottoState.drawNumbers.push(winning[index]);
                index += 1;
                playClick();
                renderLottoApp();
            } else {
                clearInterval(timer);
                finishLottoRound();
            }
        }, 700);
    }

    function finishLottoRound() {
        let payout = 0;
        lottoState.ticketsBought.forEach(function (ticketIndex) {
            const ticket = lottoState.ticketsData[ticketIndex];
            const matches = ticket.numbers.filter(function (number) { return lottoState.drawNumbers.includes(number); }).length;
            payout += Math.round(lottoState.selectedTier.price * getLottoMultiplier(matches));
        });
        if (payout > 0) {
            playerMoney += payout;
            addBankTransaction('Выигрыш в лотерею', payout, true);
            createTax('lottery', payout * LOTTERY_TAX_RATE, 'Налог с выигрыша 1.5%');
        }
        lottoState.step = 'result';
        saveGameData();
        updateClockUI();
        renderLottoApp();
    }

    /* =========================================================
       АВТО.РУ И ИМУЩЕСТВО
       ========================================================= */

    function renderAutoApp() {
        appScrollableBody.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'car-list';

        CARS.forEach(function (car) {
            const owned = ownedCars.some(function (item) { return item.id === car.id; });
            const card = document.createElement('div');
            card.className = 'car-card-new';
            card.innerHTML = '<div class="car-card-top"><img class="car-thumb-new" src="cars/' + car.imgPrefix + '_1.png" alt="' + car.title + '" onerror="this.src=\'https://via.placeholder.com/110x75\'"><div class="car-info-new"><div class="car-title-new">' + car.title + '</div><div class="car-sub-new">' + car.year + ' г. • ' + car.color + '</div></div></div><div class="car-card-bottom"><div class="car-price-badge">' + car.price.toLocaleString('ru-RU') + ' ₽</div><button class="car-buy-btn-new">' + (owned ? 'Куплена' : 'Купить') + '</button></div>';
            card.addEventListener('click', function (event) {
                if (!event.target.closest('.car-buy-btn-new')) renderCarDetail(car);
            });
            card.querySelector('.car-buy-btn-new').addEventListener('click', function (event) {
                event.stopPropagation();
                buyCar(car);
            });
            list.appendChild(card);
        });
        appScrollableBody.appendChild(list);
    }

    function renderCarDetail(car) {
        appScrollableBody.innerHTML = '';
        phoneView = 'car-detail';
        const page = document.createElement('div');
        page.className = 'car-detail-page';
        page.innerHTML = '<div class="car-carousel-container"><div class="car-slider-viewport"><div class="car-slider-track"><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_1.png" alt="' + car.title + '"></div><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_2.png" alt="' + car.title + '"></div><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_3.png" alt="' + car.title + '"></div></div></div><button class="carousel-arrow car-arrow-left">‹</button><button class="carousel-arrow car-arrow-right">›</button><div class="carousel-dots"><div class="carousel-dot active"></div><div class="carousel-dot"></div><div class="carousel-dot"></div></div></div><div class="car-detail-main"><div><div class="car-detail-title">' + car.title + '</div><div style="font-size:.68rem;color:#64748b;font-weight:700;">' + car.year + ' г. • ' + car.color + '</div></div><div class="car-detail-price">' + car.price.toLocaleString('ru-RU') + ' ₽</div></div><div class="car-specs-grid"><div class="car-spec-item"><span class="car-spec-label">Год выпуска</span><span class="car-spec-value">' + car.year + '</span></div><div class="car-spec-item"><span class="car-spec-label">Мощность</span><span class="car-spec-value">' + car.power + ' л.с.</span></div><div class="car-spec-item"><span class="car-spec-label">Разгон 0–100</span><span class="car-spec-value">' + car.accel + '</span></div><div class="car-spec-item"><span class="car-spec-label">Макс. скорость</span><span class="car-spec-value">' + car.maxSpeed + '</span></div></div><div class="car-desc-box">' + car.desc + '</div>';

        const buyButton = document.createElement('button');
        buyButton.className = 'car-buy-btn-large';
        const owned = ownedCars.some(function (item) { return item.id === car.id; });
        buyButton.disabled = owned;
        buyButton.textContent = owned ? 'Автомобиль уже куплен' : 'Купить за ' + car.price.toLocaleString('ru-RU') + ' ₽';
        if (owned) buyButton.classList.add('disabled-owned');
        buyButton.addEventListener('click', function () { buyCar(car); });
        page.appendChild(buyButton);
        appScrollableBody.appendChild(page);

        const track = page.querySelector('.car-slider-track');
        const dots = page.querySelectorAll('.carousel-dot');
        let slide = 0;
        const setSlide = function (value) {
            slide = (value + 3) % 3;
            track.style.transform = 'translateX(-' + (slide * 33.3333) + '%)';
            dots.forEach(function (dot, index) { dot.classList.toggle('active', index === slide); });
        };
        page.querySelector('.car-arrow-left').addEventListener('click', function () { setSlide(slide - 1); });
        page.querySelector('.car-arrow-right').addEventListener('click', function () { setSlide(slide + 1); });
    }

    function buyCar(car) {
        if (ownedCars.some(function (item) { return item.id === car.id; })) {
            showToast('У вас уже есть этот автомобиль');
            return;
        }
        if (playerMoney < car.price) {
            showToast('Недостаточно денег на счёте');
            return;
        }
        playerMoney = Math.max(0, playerMoney - car.price);
        ownedCars.push(car);
        addBankTransaction('Покупка ' + car.title, car.price, false);
        createTax('car', car.price * CAR_TAX_RATE, 'Налог на автомобиль 5%');
        saveGameData();
        updateClockUI();
        showToast('Автомобиль успешно куплен');
        renderAutoApp();
    }

    function renderPropertyApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'property-list';
        wrapper.innerHTML = '<div class="property-card-item"><div class="property-thumb-box"><img src="house.png" class="property-thumb-img" alt="Квартира"></div><div class="property-details-col"><div class="property-details-title">Уютная квартира</div><div class="property-details-sub">Центральный район • Собственность</div><div class="property-status-badge">Основное жильё</div></div></div>';
        ownedCars.forEach(function (car) {
            const card = document.createElement('div');
            card.className = 'property-card-item';
            card.innerHTML = '<div class="property-thumb-box"><img src="cars/' + car.imgPrefix + '_1.png" class="property-thumb-img" alt="' + car.title + '"></div><div class="property-details-col"><div class="property-details-title">' + car.title + '</div><div class="property-details-sub">' + car.year + ' г. • ' + car.power + ' л.с.</div><div class="property-status-badge" style="color:#2563eb;background:#dbeafe;">В гараже</div></div>';
            wrapper.appendChild(card);
        });
        appScrollableBody.appendChild(wrapper);
    }

    /* =========================================================
       ОБНОВЛЕНИЕ ПОТРЕБНОСТЕЙ И ДОСТАВКИ
       ========================================================= */

    function processFoodDeliveries() {
        const now = getTotalAbsoluteMinutes();
        for (let index = pendingFoodDeliveries.length - 1; index >= 0; index -= 1) {
            const delivery = pendingFoodDeliveries[index];
            if (now >= delivery.deliverAtMinutes) {
                playerHunger = clamp(playerHunger + delivery.totalHunger, 0, 100);
                playerEnergy = clamp(playerEnergy + delivery.totalEnergy, 0, 100);
                pendingFoodDeliveries.splice(index, 1);
                showToast('🍕 Еда доставлена');
            }
        }
    }

    function processInterviewDeadline() {
        const now = absoluteDay() * 1440 + gameMinutes;
        if (jobState.pendingJobId && now > Number(jobState.interviewDay) * 1440 + 840) {
            jobState.pendingJobId = null;
            jobState.interviewDay = null;
            addMessage('Работа.ру', '❌', 'Вы пропустили собеседование в Пожарной части. Заявка аннулирована.');
        }
        if (truckerJobState.pendingJobId && now > Number(truckerJobState.interviewDay) * 1440 + 840) {
            truckerJobState.pendingJobId = null;
            truckerJobState.interviewDay = null;
            addMessage('Работа.ру', '❌', 'Вы пропустили экзамен ПДД на Автобазе. Заявка аннулирована.');
        }
        if (cashierJobState.pendingJobId && now > Number(cashierJobState.interviewDay) * 1440 + 660) {
            cashierJobState.pendingJobId = null;
            cashierJobState.interviewDay = null;
            addMessage('Работа.ру', '❌', 'Вы пропустили собеседование в Магазине. Заявка аннулирована.');
        }
    }

    function updateNeeds(deltaSeconds) {
        if (!isClockRunning) return;
        const multiplier = isSleeping ? SLEEP_TIME_MULTIPLIER : 1;
        const minutesPassed = deltaSeconds * GAME_MINUTES_PER_REAL_SECOND * multiplier;

        if (isSleeping) {
            playerHunger = clamp(playerHunger - (minutesPassed / (HUNGER_EMPTY_HOURS * 60)) * 100 / SLEEP_HUNGER_SLOWDOWN, 0, 100);
            playerSleep = clamp(playerSleep + (minutesPassed / (SLEEP_RESTORE_HOURS * 60)) * 100, 0, 100);
            playerEnergy = clamp(playerEnergy + (minutesPassed / (ENERGY_RESTORE_HOURS * 60)) * 100, 0, 100);
            if (playerSleep >= 100) wakeUp(true);
        } else {
            playerHunger = clamp(playerHunger - (minutesPassed / (HUNGER_EMPTY_HOURS * 60)) * 100, 0, 100);
            playerSleep = clamp(playerSleep - (minutesPassed / (SLEEP_EMPTY_HOURS * 60)) * 100, 0, 100);
            playerEnergy = clamp(playerEnergy - (minutesPassed / (ENERGY_EMPTY_HOURS * 60)) * 100, 0, 100);
        }

        gameMinutes += minutesPassed;
        advanceCalendar();
        processInterviewDeadline();
        processTaxOneDayReminders();
        processTaxesExpiration();
        processFinesExpiration();
        processFoodDeliveries();

        if (cashierShiftState.active && !cashierShiftState.onBreak && !cashierShiftState.shiftCompleted) {
            updateCashierUI();
        }

        updateClockUI();
        updateStatsHUD();
        updatePhoneBadge();
        saveGameData();
    }

    /* =========================================================
       КАРТА И МЕТКИ
       ========================================================= */

    function getMapDimensions() {
        const rawWidth = isMapLoaded ? (mapImg.naturalWidth || 2000) : 2000;
        const rawHeight = isMapLoaded ? (mapImg.naturalHeight || 2000) : 2000;
        return { rawW: rawWidth, rawH: rawHeight, w: rawWidth * camera.zoom, h: rawHeight * camera.zoom };
    }

    function fitAndCenterMap() {
        const map = getMapDimensions();
        const fit = Math.max(innerWidth / map.rawW, innerHeight / map.rawH);
        camera.minZoom = fit * 1.85;
        camera.maxZoom = fit * 4.5;
        camera.zoom = camera.minZoom;
        camera.x = innerWidth / 2;
        camera.y = innerHeight / 2;
        clampCamera();
    }

    function clampCamera() {
        const ratio = camera.zoom / camera.minZoom;
        const maxX = 12 + (ratio - 1) * innerWidth * 0.25;
        const maxY = 12 + (ratio - 1) * innerHeight * 0.25;
        camera.x = clamp(camera.x, innerWidth / 2 - maxX, innerWidth / 2 + maxX);
        camera.y = clamp(camera.y, innerHeight / 2 - maxY, innerHeight / 2 + maxY);
    }

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
    }

    function drawMarker(x, y, color, icon, label, glowColor) {
        if (x < -120 || x > innerWidth + 120 || y < -120 || y > innerHeight + 120) return { x: x, y: y };

        const markerY = y - 38 * camera.zoom + Math.sin(animTimer * 1.5) * 6;
        const width = Math.max(28, 36 * camera.zoom);
        const height = Math.max(32, 42 * camera.zoom);

        ctx.save();
        ctx.shadowColor = glowColor || color;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(x, markerY + height / 2);
        ctx.lineTo(x - width / 2, markerY - height / 2);
        ctx.lineTo(x + width / 2, markerY - height / 2);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 3 * camera.zoom);
        ctx.stroke();

        ctx.font = Math.max(16, 22 * camera.zoom) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#000000';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(icon, x, markerY - 2 * camera.zoom);

        if (label) {
            ctx.font = '900 ' + Math.max(10, Math.round(12 * camera.zoom)) + 'px Montserrat, sans-serif';
            const textWidth = ctx.measureText(label).width;
            const pillW = textWidth + 14;
            const pillH = Math.max(18, 20 * camera.zoom);
            const pillY = y + 10 * camera.zoom;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(x - pillW / 2, pillY, pillW, pillH, 8);
            } else {
                ctx.rect(x - pillW / 2, pillY, pillW, pillH);
            }
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, x, pillY + pillH / 2);
        }

        ctx.restore();
        return { x: x, y: y };
    }

    function render() {
        if (!ctx) return;
        const map = getMapDimensions();
        const left = camera.x - map.w / 2;
        const top = camera.y - map.h / 2;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.imageSmoothingEnabled = true;

        if (isMapLoaded) ctx.drawImage(mapImg, left, top, map.w, map.h);
        else {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(left, top, map.w, map.h);
        }

        const homeX = left + map.w * MAP_POINTS.home.x;
        const homeY = top + map.h * MAP_POINTS.home.y;
        const fireX = left + map.w * MAP_POINTS.firestation.x;
        const fireY = top + map.h * MAP_POINTS.firestation.y;
        const truckX = left + map.w * MAP_POINTS.truckstation.x;
        const truckY = top + map.h * MAP_POINTS.truckstation.y;
        const marketX = left + map.w * MAP_POINTS.market.x;
        const marketY = top + map.h * MAP_POINTS.market.y;

        drawMarker(homeX, homeY, '#0284c7', '🏠', 'Дом', '#38bdf8');

        if (jobState.pendingJobId === 'firefighter' || jobState.activeJobId === 'firefighter') {
            drawMarker(fireX, fireY, '#dc2626', '🚒', 'МЧС', '#f87171');
        }

        if (truckerJobState.pendingJobId === 'driver' || truckerJobState.activeJobId === 'driver') {
            drawMarker(truckX, truckY, '#d97706', '🚛', 'Автобаза', '#fbbf24');
        }

        if (cashierJobState.pendingJobId === 'cashier' || cashierJobState.activeJobId === 'cashier') {
            drawMarker(marketX, marketY, '#16a34a', '🛒', 'Магазин', '#4ade80');
        }

        let playerPoint = { x: homeX + 22 * camera.zoom, y: homeY };
        if (lastExitedLocation === 'firestation') playerPoint = { x: fireX + 22 * camera.zoom, y: fireY };
        if (lastExitedLocation === 'truckstation') playerPoint = { x: truckX + 22 * camera.zoom, y: truckY };
        if (lastExitedLocation === 'market') playerPoint = { x: marketX + 22 * camera.zoom, y: marketY };

        ctx.save();
        const size = Math.max(48, 62 * camera.zoom);
        if (playerSpriteImg.complete && playerSpriteImg.naturalWidth) {
            ctx.drawImage(playerSpriteImg, playerPoint.x - size / 2, playerPoint.y - size / 2, size, size);
        } else {
            ctx.font = size + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚶', playerPoint.x, playerPoint.y);
        }
        ctx.font = '900 ' + Math.max(11, Math.round(12 * camera.zoom)) + 'px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText('Вы здесь', playerPoint.x, playerPoint.y + size * 0.54);
        ctx.restore();
    }

    function zoomToPoint(x, y, factor) {
        const oldZoom = camera.zoom;
        const newZoom = clamp(oldZoom * factor, camera.minZoom, camera.maxZoom);
        if (oldZoom === newZoom) return;
        const scale = newZoom / oldZoom;
        camera.x = x - (x - camera.x) * scale;
        camera.y = y - (y - camera.y) * scale;
        camera.zoom = newZoom;
        clampCamera();
    }

    function checkMapPointClick(x, y) {
        const map = getMapDimensions();
        const left = camera.x - map.w / 2;
        const top = camera.y - map.h / 2;

        const points = [
            { key: 'home', x: left + map.w * MAP_POINTS.home.x, y: top + map.h * MAP_POINTS.home.y, active: true },
            { 
                key: 'firestation', 
                x: left + map.w * MAP_POINTS.firestation.x, 
                y: top + map.h * MAP_POINTS.firestation.y, 
                active: jobState.pendingJobId === 'firefighter' || jobState.activeJobId === 'firefighter' 
            },
            { 
                key: 'truckstation', 
                x: left + map.w * MAP_POINTS.truckstation.x, 
                y: top + map.h * MAP_POINTS.truckstation.y, 
                active: truckerJobState.pendingJobId === 'driver' || truckerJobState.activeJobId === 'driver' 
            },
            { 
                key: 'market', 
                x: left + map.w * MAP_POINTS.market.x, 
                y: top + map.h * MAP_POINTS.market.y, 
                active: cashierJobState.pendingJobId === 'cashier' || cashierJobState.activeJobId === 'cashier' 
            }
        ];

        for (let index = 0; index < points.length; index += 1) {
            const point = points[index];
            if (!point.active) continue;

            const markerX = point.x;
            const markerY = point.y;

            if (Math.hypot(x - markerX, y - markerY) > Math.max(45, 60 * camera.zoom)) continue;

            if (lastExitedLocation === point.key) {
                apartmentScreen.classList.add('hidden');
                firestationScreen.classList.add('hidden');
                truckstationScreen.classList.add('hidden');
                marketScreen.classList.add('hidden');
                cashierWorkScreen.classList.add('hidden');
                btnOpenSettingsGame.classList.add('hidden');
                if (point.key === 'home') {
                    currentScreen = 'apartment';
                    apartmentScreen.classList.remove('hidden');
                    justEnteredApartment = true;
                    setTimeout(function () { justEnteredApartment = false; }, 350);
                } else if (point.key === 'firestation') {
                    currentScreen = 'firestation';
                    firestationScreen.classList.remove('hidden');
                } else if (point.key === 'truckstation') {
                    currentScreen = 'truckstation';
                    truckstationScreen.classList.remove('hidden');
                } else if (point.key === 'market') {
                    currentScreen = 'market';
                    marketScreen.classList.remove('hidden');
                }
            } else {
                openTravelChoiceModal(point.key);
            }
            return;
        }
    }

    function setupControls() {
        if (setupControlsInitialized || !canvas) return;
        setupControlsInitialized = true;
        let startX = 0;
        let startY = 0;

        canvas.addEventListener('mousedown', function (event) {
            if (isSleeping) return;
            camera.isDragging = true;
            camera.lastX = event.clientX;
            camera.lastY = event.clientY;
            startX = event.clientX;
            startY = event.clientY;
        });

        window.addEventListener('mousemove', function (event) {
            if (!camera.isDragging || isSleeping) return;
            camera.x += event.clientX - camera.lastX;
            camera.y += event.clientY - camera.lastY;
            camera.lastX = event.clientX;
            camera.lastY = event.clientY;
            clampCamera();
        });

        window.addEventListener('mouseup', function (event) {
            if (!camera.isDragging) return;
            camera.isDragging = false;
            if (Math.hypot(event.clientX - startX, event.clientY - startY) < 10 && !isSleeping) checkMapPointClick(event.clientX, event.clientY);
        });

        canvas.addEventListener('touchstart', function (event) {
            if (isSleeping) return;
            if (event.touches.length === 1) {
                camera.isDragging = true;
                camera.lastX = event.touches[0].clientX;
                camera.lastY = event.touches[0].clientY;
                startX = camera.lastX;
                startY = camera.lastY;
            } else if (event.touches.length === 2) {
                camera.isDragging = false;
                camera.touchPinchDist = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', function (event) {
            if (isSleeping) return;
            if (camera.isDragging && event.touches.length === 1) {
                camera.x += event.touches[0].clientX - camera.lastX;
                camera.y += event.touches[0].clientY - camera.lastY;
                camera.lastX = event.touches[0].clientX;
                camera.lastY = event.touches[0].clientY;
                clampCamera();
            } else if (event.touches.length === 2) {
                const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
                if (camera.touchPinchDist > 0) zoomToPoint((event.touches[0].clientX + event.touches[1].clientX) / 2, (event.touches[0].clientY + event.touches[1].clientY) / 2, distance / camera.touchPinchDist);
                camera.touchPinchDist = distance;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', function (event) {
            if (camera.isDragging && event.changedTouches.length && !isSleeping) {
                const touch = event.changedTouches[0];
                if (Math.hypot(touch.clientX - startX, touch.clientY - startY) < 15) checkMapPointClick(touch.clientX, touch.clientY);
            }
            camera.isDragging = false;
        });

        canvas.addEventListener('wheel', function (event) {
            event.preventDefault();
            if (!isSleeping) zoomToPoint(event.clientX, event.clientY, event.deltaY < 0 ? 1.06 : 0.94);
        }, { passive: false });
    }

    /* =========================================================
       СОН
       ========================================================= */

    function startSleeping() {
        if (playerSleep >= 100) {
            showToast('Сон уже полностью восстановлен');
            return;
        }
        bedModal.classList.add('hidden');
        isSleeping = true;
        sleepOverlay.classList.remove('hidden');
        playClick();
    }

    function wakeUp(autoWake) {
        isSleeping = false;
        sleepOverlay.classList.add('hidden');
        if (autoWake) showToast('Вы проснулись! Сон восстановлен');
    }

    function openBedInteractionModal() {
        if (isSleeping) return;
        bedModalTitle.textContent = playerSleep >= 100 ? '😴 Сон не нужен' : '🌙 Сон';
        bedModalText.textContent = 'Во время сна время ускоряется в 7 раз.';
        btnSleepAction.classList.toggle('hidden', playerSleep >= 100);
        bedModal.classList.remove('hidden');
    }

    /* =========================================================
       ОТКРЫТИЕ ПРИЛОЖЕНИЙ
       ========================================================= */

    function openPhoneApp(name) {
        currentPhoneApp = name;
        phoneView = 'app';
        phoneAppsGrid.classList.add('hidden');
        phoneAppContent.classList.remove('hidden');
        phoneStatusBar.classList.add('dark-status');
        appTitleText.textContent = APP_NAMES[name] || 'Приложение';

        if (name === 'work') renderJobsApp();
        else if (name === 'sms') renderMessagesApp();
        else if (name === 'kollectiv') renderCollectiveApp();
        else if (name === 'eda') renderFoodApp();
        else if (name === 'avto') renderAutoApp();
        else if (name === 'plat') renderTaxesApp();
        else if (name === 'karta') renderBankApp();
        else if (name === 'imushka') renderPropertyApp();
        else if (name === 'shtraf') renderFinesApp();
        else if (name === 'taxi') renderTaxiApp();
        else if (name === 'casino') {
            lottoState.step = 'select_tier';
            renderLottoApp();
        } else {
            appScrollableBody.innerHTML = '<div class="empty-app-page"><h3>В разработке</h3><p>Функционал появится позже.</p></div>';
        }
    }

    function closePhoneApp() {
        phoneAppsGrid.classList.remove('hidden');
        phoneAppContent.classList.add('hidden');
        phoneStatusBar.classList.remove('dark-status');
        currentPhoneApp = null;
        phoneView = 'home';
        currentOpenedMessage = null;
    }

    /* =========================================================
       ЗАПУСК ИГРЫ И ИГРОВОЙ ЦИКЛ
       ========================================================= */

    function launchGame() {
        mainMenu.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        isClockRunning = true;
        currentScreen = 'city';
        updateAllHudVisibility(true);
        applyAudioVolumes();
        updateClockUI();
        updateStatsHUD();
        updatePhoneBadge();
        fitAndCenterMap();
        resizeCanvas();
        setupControls();
        bgMusic.src = getCurrentMusic().file;
        startMusic();
        lastFrameTime = performance.now();
        if (!renderLoopStarted) {
            renderLoopStarted = true;
            requestAnimationFrame(renderLoop);
        }
    }

    function renderLoop() {
        const now = performance.now();
        const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.25);
        lastFrameTime = now;
        animTimer += 0.04;
        updateNeeds(deltaSeconds);
        if (currentScreen === 'city') render();
        requestAnimationFrame(renderLoop);
    }

    /* =========================================================
       ОБРАБОТЧИКИ СОБЫТИЙ
       ========================================================= */

    if (toastMessage) toastMessage.addEventListener('pointerdown', function (event) { event.preventDefault(); hideToast(); });
    if (bedImg) bedImg.addEventListener('click', function (event) { event.stopPropagation(); if (!justEnteredApartment) openBedInteractionModal(); });
    if (btnSleepAction) btnSleepAction.addEventListener('click', startSleeping);
    if (btnWakeUp) btnWakeUp.addEventListener('click', function () { wakeUp(false); });
    if (btnCloseBedModal) btnCloseBedModal.addEventListener('click', function () { bedModal.classList.add('hidden'); });

    if (btnOpenPhone) btnOpenPhone.addEventListener('click', function () {
        if (isSleeping) {
            showToast('Нельзя пользоваться телефоном во время сна!');
            return;
        }
        if (cashierShiftState.active && !cashierShiftState.onBreak && !cashierShiftState.shiftCompleted) {
            showToast('Телефон доступен только в перерыв (13:00–14:30)');
            return;
        }
        phoneModal.classList.remove('hidden');
        closePhoneApp();
        updateClockUI();
        updatePhoneBadge();
    });

    if (btnClosePhone) btnClosePhone.addEventListener('click', function () { phoneModal.classList.add('hidden'); closePhoneApp(); });

    if (btnPhoneBack) btnPhoneBack.addEventListener('click', function () {
        if (phoneView === 'car-detail') {
            phoneView = 'app';
            renderAutoApp();
        } else if (phoneView === 'message-detail') {
            phoneView = 'app';
            renderMessagesApp();
        } else if (currentPhoneApp === 'casino' && lottoState.step !== 'select_tier') {
            lottoState = { selectedTier: null, selectedTicketIndexes: [], ticketsBought: [], ticketsData: [], drawNumbers: [], step: 'select_tier', matchesPerTicket: [] };
            renderLottoApp();
        } else {
            closePhoneApp();
        }
    });

    if (btnOpenSettingsGame) btnOpenSettingsGame.addEventListener('click', function () { settingsModal.classList.remove('hidden'); });
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', function () { settingsModal.classList.remove('hidden'); });
    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', function () { settingsModal.classList.add('hidden'); });
    const btnOpenMusic = document.getElementById('btn-open-music-modal');
    if (btnOpenMusic) btnOpenMusic.addEventListener('click', function () { settingsModal.classList.add('hidden'); musicModal.classList.remove('hidden'); renderMusicTracks(); });
    const btnCloseMusic = document.getElementById('btn-close-music-modal');
    if (btnCloseMusic) btnCloseMusic.addEventListener('click', function () { musicModal.classList.add('hidden'); });

    const exitApartment = document.getElementById('btn-exit-apartment');
    if (exitApartment) exitApartment.addEventListener('click', function () { apartmentScreen.classList.add('hidden'); currentScreen = 'city'; lastExitedLocation = 'home'; saveGameData(); btnOpenSettingsGame.classList.remove('hidden'); });
    const exitFirestation = document.getElementById('btn-exit-firestation');
    if (exitFirestation) exitFirestation.addEventListener('click', function () { firestationScreen.classList.add('hidden'); currentScreen = 'city'; lastExitedLocation = 'firestation'; saveGameData(); btnOpenSettingsGame.classList.remove('hidden'); });
    const exitTruckstation = document.getElementById('btn-exit-truckstation');
    if (exitTruckstation) exitTruckstation.addEventListener('click', function () { truckstationScreen.classList.add('hidden'); currentScreen = 'city'; lastExitedLocation = 'truckstation'; saveGameData(); btnOpenSettingsGame.classList.remove('hidden'); });
    const exitMarket = document.getElementById('btn-exit-market');
    if (exitMarket) exitMarket.addEventListener('click', function () { marketScreen.classList.add('hidden'); currentScreen = 'city'; lastExitedLocation = 'market'; saveGameData(); btnOpenSettingsGame.classList.remove('hidden'); });

    const exitCashierWork = document.getElementById('btn-exit-cashier-work');
    if (exitCashierWork) exitCashierWork.addEventListener('click', function () {
        if (cashierShiftState.active && !cashierShiftState.shiftCompleted) {
            showToast('Сначала завершите смену!');
            return;
        }
        cashierWorkScreen.classList.add('hidden');
        currentScreen = 'market';
        marketScreen.classList.remove('hidden');
        btnOpenSettingsGame.classList.remove('hidden');
    });

    if (firefighterNpc) firefighterNpc.addEventListener('click', function () { showDialogue('Здравствуйте! Я генерал-полковник МЧС, чем могу помочь?!'); });
    if (btnDlgClose) btnDlgClose.addEventListener('click', function () { dialogueOverlay.classList.add('hidden'); });
    if (btnDlgHiring) btnDlgHiring.addEventListener('click', handleHiringButton);
    if (btnDlgAbout) btnDlgAbout.addEventListener('click', handleAboutButton);
    if (btnDlgOrders) btnDlgOrders.addEventListener('click', handleOrdersButton);
    if (btnCloseOrders) btnCloseOrders.addEventListener('click', function () { ordersModal.classList.add('hidden'); });
    document.querySelectorAll('.btn-select-order').forEach(function (button) {
        button.addEventListener('click', function () { acceptFireOrder(button.dataset.level); });
    });
    if (btnRoadBack) btnRoadBack.addEventListener('click', cancelActiveFireOrder);
    if (roadFullscreen) roadFullscreen.addEventListener('pointerdown', function (event) { if (!event.target.closest('button')) updateRoadProgress(); });
    if (btnArriveDestination) btnArriveDestination.addEventListener('click', beginFirefighting);
    if (btnFireBack) btnFireBack.addEventListener('click', cancelActiveFireOrder);

    if (truckerNpc) truckerNpc.addEventListener('click', function () { showTruckerDialogue('Приветствую! Я начальник автобазы. Готов сесть за руль тягача?!'); });
    if (btnTruckerClose) btnTruckerClose.addEventListener('click', function () { truckerDialogueOverlay.classList.add('hidden'); });
    if (btnTruckerHiring) btnTruckerHiring.addEventListener('click', handleTruckerHiringButton);
    if (btnTruckerAbout) btnTruckerAbout.addEventListener('click', handleTruckerAboutButton);
    if (btnTruckerOrders) btnTruckerOrders.addEventListener('click', handleTruckerOrdersButton);
    if (btnCloseTruckerOrders) btnCloseTruckerOrders.addEventListener('click', function () { truckerOrdersModal.classList.add('hidden'); });
    if (btnClosePdd) btnClosePdd.addEventListener('click', function () { pddQuizModal.classList.add('hidden'); });
    if (btnTruckerRoadBack) btnTruckerRoadBack.addEventListener('click', cancelTruckerTrip);
    if (truckerClickBox) truckerClickBox.addEventListener('pointerdown', handleTruckerClick, { passive: false });

    if (marketNpc) marketNpc.addEventListener('click', openMarketDialogue);
    if (btnMarketClose) btnMarketClose.addEventListener('click', function () { marketDialogueOverlay.classList.add('hidden'); });
    if (btnMarketHiring) btnMarketHiring.addEventListener('click', handleMarketHiringButton);
    if (btnMarketAbout) btnMarketAbout.addEventListener('click', handleMarketAboutButton);
    if (btnMarketWork) btnMarketWork.addEventListener('click', handleMarketWorkButton);

    if (btnCloseCashierInterview) btnCloseCashierInterview.addEventListener('click', function () { cashierInterviewModal.classList.add('hidden'); });
    if (btnCashierStartShift) btnCashierStartShift.addEventListener('click', function () {
        if (cashierShiftState.active) {
            showToast('Смена уже активна');
            return;
        }
        handleMarketWorkButton();
    });
    if (btnCashierEndShift) btnCashierEndShift.addEventListener('click', function () {
        if (!cashierShiftState.active) {
            showToast('Смена не активна');
            return;
        }
        endCashierShift();
    });
    if (btnCashierBreak) btnCashierBreak.addEventListener('click', handleCashierBreak);
    if (btnCashierGiveChange) btnCashierGiveChange.addEventListener('click', giveChange);

    if (btnTravelBack) btnTravelBack.addEventListener('click', function () { travelChoiceModal.classList.add('hidden'); btnOpenSettingsGame.classList.remove('hidden'); });
    if (btnTravelWalk) btnTravelWalk.addEventListener('click', startWalkTravel);
    if (btnTravelCar) btnTravelCar.addEventListener('click', startCarTravel);
    if (walkClickBox) walkClickBox.addEventListener('pointerdown', handleWalkClick, { passive: false });
    if (btnWalkBack) btnWalkBack.addEventListener('click', function () { walkFullscreen.classList.add('hidden'); travelChoiceModal.classList.remove('hidden'); });

    document.querySelectorAll('.app-item').forEach(function (item) {
        item.addEventListener('click', function () { openPhoneApp(item.dataset.app); });
    });

    document.querySelectorAll('.stat-circle-item').forEach(function (item) {
        item.addEventListener('click', function () {
            const tooltip = item.querySelector('.stat-tooltip');
            if (!tooltip) return;
            tooltip.classList.remove('hidden');
            setTimeout(function () { tooltip.classList.add('hidden'); }, 1800);
        });
    });

    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.addEventListener('click', function () {
        startMusic();
        if (localStorage.getItem('bestlife_gender')) launchGame();
        else genderModal.classList.remove('hidden');
    });

    const genderBoy = document.getElementById('gender-boy');
    if (genderBoy) genderBoy.addEventListener('click', function () { localStorage.setItem('bestlife_gender', 'boy'); genderModal.classList.add('hidden'); launchGame(); });
    const genderGirl = document.getElementById('gender-girl');
    if (genderGirl) genderGirl.addEventListener('click', function () { localStorage.setItem('bestlife_gender', 'girl'); genderModal.classList.add('hidden'); launchGame(); });

    window.addEventListener('resize', function () {
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
            resizeCanvas();
            clampCamera();
            render();
        }
    });

    /* =========================================================
       ИНИЦИАЛИЗАЦИЯ
       ========================================================= */

    applyAudioVolumes();
    updateClockUI();
    updateStatsHUD();
    updatePhoneBadge();

    setTimeout(function () {
        if (introScreen) introScreen.classList.add('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
    }, 4400);
});
