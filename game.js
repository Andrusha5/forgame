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
    let carFuel = {};
    let gamesState = { best: {} };
    let bankState = { account: 0, registered: false, loans: [], transfers: [], recents: [], seen: [], loanSeq: 0 };
    let ytState = { channel: null, subs: 0, views: 0, likes: 0, balance: 0, counter: 0, shooting: null, editing: [], archive: [], live: [], history: [], uploads: { day: -1, count: 0 }, lastStreamDay: -1, stream: null, milestones: {}, tab: 'video' };
    let travelState = { ticket: null, trip: null, restUntil: 0, years: 0, souvenirs: [] };
    let phoneState = { model: 'basic', installed: [], layout: ['playstore', 'sms'], pendingInstalls: [], pendingRemovals: [] };
    let marketState = { owned: {}, pending: [] };
    let backpack = [];
    let pendingBackpack = [];
    let hygieneState = { lastWash: 0, warned: false };
    let energyState = { until: 0, day: -1, count: 0, dizzyUntil: 0, dizzySleep: 0 };

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
    let walkClicksLeft = 222;
    let walkClicksTotal = 222;
    let travelMode = 'walk';

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
    const NEW_YEAR_REWARD = 7000;
    const DEFENDER_DAY_REWARD = 10000;
    const WOMEN_DAY_REWARD = 10000;
    const BIRTHDAY_REWARD = 12000;
    const BIRTHDAY_STORAGE_KEY = 'bestlife_birthday';

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
        home: { x: 0.38, y: 0.48 },
        firestation: { x: 0.66, y: 0.55 },
        truckstation: { x: 0.36, y: 0.56 },
        market: { x: 0.50, y: 0.52 },
        police: { x: 0.66, y: 0.46 },
        hospital: { x: 0.50, y: 0.44 },
        taxipark: { x: 0.57, y: 0.565 },
        airport: { x: 0.88, y: 0.22 }
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
            schedule: 'Рабочее время: 06:00–22:00',
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
            id: 'police',
            title: 'Полицейский',
            icon: '🚓',
            salary: 70000,
            schedule: 'Рабочее время: 08:00–17:00',
            description: 'Патрулировать город, выезжать на происшествия и задерживать нарушителей.'
        },
        {
            id: 'doctor',
            title: 'Доктор',
            icon: '🩺',
            salary: 75000,
            schedule: 'Рабочее время: 08:00–20:00',
            description: 'Принимать пациентов, выезжать на вызовы и проводить операции.'
        },
        {
            id: 'taxi',
            title: 'Таксист',
            icon: '🚕',
            salary: 52000,
            schedule: 'Рабочее время: круглосуточно',
            description: 'Возить пассажиров по городу и получать оплату за каждую поездку.'
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
        { id: 'energy', name: 'Энергетик', hunger: 20, energy: 85, price: 150, image: 'food/energy.png', isEnergy: true },
        { id: 'ris', name: 'Рис', hunger: 33, price: 75, image: 'food/ris.png' },
        { id: 'snickers', name: 'Сникерс', hunger: 20, price: 70, image: 'food/snickers.png' },
        { id: 'morozhenoe', name: 'Мороженое', hunger: 20, price: 90, image: 'food/morozhenoe.png' },
        { id: 'grechka', name: 'Гречка', hunger: 44, price: 70, image: 'food/grechka.png' },
        { id: 'kartoshka', name: 'Картошка жареная', hunger: 59, price: 110, image: 'food/kartoshka.png' },
        { id: 'pure', name: 'Пюре', hunger: 54, price: 95, image: 'food/pure.png' },
        { id: 'fasol', name: 'Фасоль', hunger: 55, price: 80, image: 'food/fasol.png' }
    ];

    const CARS = [
        { id: 'bike', title: 'Велосипед', price: 15000, year: 2024, power: 0, color: 'Синий', accel: 'Плавный', maxSpeed: '25 км/ч', imgPrefix: 'bike', desc: 'Городской велосипед. Добираться на нём быстрее, чем пешком: всего 167 кликов вместо 222.' },
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
        { id: 'topuria', title: 'Топурия', file: 'music/Topuria.mp3', image: 'music/Topuria.png', price: 3333 },
        { id: 'merab', title: 'Мераб', file: 'music/merab.mp3', image: 'music/merab.png', price: 12000 },
        { id: 'petr', title: 'Пётр Ян', file: 'music/petr.mp3', image: 'music/petr.png', price: 33333 }
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
        compania: 'Компания',
        playstore: 'Google Play',
        market: 'Маркетплейс',
        tickets: 'Билеты.би',
        youtube: 'Ютуб',
        games: 'Игры оффлайн'
    };

    /* =========================================================
       DOM-ЭЛЕМЕНТЫ
       ========================================================= */

    window.blImgFail = function (img) {
        const exts = (img.dataset.exts || '').split(',').filter(Boolean);
        const base = img.dataset.base;
        const index = Number(img.dataset.extIndex || 0) + 1;
        if (base && index < exts.length) {
            img.dataset.extIndex = String(index);
            img.src = base + '.' + exts[index];
            return;
        }
        img.style.display = 'none';
        const sibling = img.nextElementSibling;
        if (sibling) sibling.style.display = 'flex';
    };

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
    const cashierServedDisplay = document.getElementById('cashier-served-display');
    const cashierServedBar = document.getElementById('cashier-served-bar');
    const cashierDiffDisplay = document.getElementById('cashier-diff-display');
    const cashierCustomerEmoji = document.getElementById('cashier-customer-emoji');
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
    const btnTravelBike = document.getElementById('btn-travel-bike');
    const btnTravelPersonal = document.getElementById('btn-travel-personal');
    const btnTravelTaxi = document.getElementById('btn-travel-taxi');
    const travelStepMain = document.getElementById('travel-step-main');
    const travelStepPersonal = document.getElementById('travel-step-personal');
    const travelPersonalDesc = document.getElementById('travel-personal-desc');
    const travelTaxiDesc = document.getElementById('travel-taxi-desc');
    const travelBikeDesc = document.getElementById('travel-bike-desc');
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

    /* Спрайт игрока 1920×1914 уменьшается один раз, а не при каждом кадре */
    let playerSpriteSmall = null;
    function getPlayerSpriteSmall() {
        if (playerSpriteSmall) return playerSpriteSmall;
        try {
            const small = document.createElement('canvas');
            small.width = 192;
            small.height = Math.max(1, Math.round(192 * (playerSpriteImg.naturalHeight / playerSpriteImg.naturalWidth)));
            const smallCtx = small.getContext('2d');
            smallCtx.imageSmoothingQuality = 'high';
            smallCtx.drawImage(playerSpriteImg, 0, 0, small.width, small.height);
            playerSpriteSmall = small;
            return small;
        } catch (error) {
            return playerSpriteImg;
        }
    }

    function tryLoadNextMapSource() {
        if (mapSourceIndex >= possibleMapSources.length) return;
        mapImg.src = possibleMapSources[mapSourceIndex];
        mapSourceIndex += 1;
    }

    let mapRetryCount = 0;

    mapImg.onload = function () {
        isMapLoaded = true;
        fitAndCenterMap();
        if (gameScreen && !gameScreen.classList.contains('hidden')) render();
    };

    mapImg.onerror = function () {
        if (mapSourceIndex === 1 && mapRetryCount < 6) {
            mapRetryCount += 1;
            setTimeout(function () { mapImg.src = possibleMapSources[0]; }, 600 * mapRetryCount);
            return;
        }
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
        if (!Number.isFinite(playerMoney)) {
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
        return getCurrentHour() >= 6 && getCurrentHour() < 22;
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
        if (currentScreen === 'airport' || lastExitedLocation === 'airport') return 'airport';
        if (XJ_LOCATIONS[currentScreen]) return currentScreen;
        if (XJ_LOCATIONS[lastExitedLocation]) return lastExitedLocation;
        return 'home';
    }

    function getLocationTitle(key) {
        if (key === 'firestation') return '🚒 Пожарная часть';
        if (key === 'truckstation') return '🚛 Автобаза';
        if (key === 'market') return '🛒 Магазин';
        if (key === 'airport') return '✈️ Аэропорт';
        if (XJ_LOCATIONS[key]) return XJ_LOCATIONS[key].title;
        return '🏠 Дом';
    }

    function getTaxiRoutePrice(fromKey, toKey) {
        if (fromKey === 'airport' || toKey === 'airport') return 1400;
        return TAXI_ROUTE_PRICES[fromKey + '->' + toKey] || xjTaxiPrice(fromKey, toKey);
    }

    function getActiveJobsCount() {
        let count = 0;
        if (jobState.activeJobId) count += 1;
        if (truckerJobState.activeJobId) count += 1;
        if (cashierJobState.activeJobId) count += 1;
        count += xjActiveCount();
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
        return playerEnergy > 0 && playerSleep > 0;
    }

    function isPlayerWorking() {
        if (cashierShiftState.active && !cashierShiftState.onBreak && !cashierShiftState.shiftCompleted) return true;
        if (xjGameActive || (xjTask && xjTask.active)) return true;
        return ['fire-fullscreen', 'road-fullscreen', 'trucker-road-fullscreen'].some(function (id) {
            const element = document.getElementById(id);
            return element && !element.classList.contains('hidden');
        });
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
            if (data.money !== undefined) playerMoney = Number(data.money) || 0;
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
            if (data.energyState && typeof data.energyState === 'object') energyState = Object.assign(energyState, data.energyState);
            if (data.carFuel && typeof data.carFuel === 'object') carFuel = data.carFuel;
            if (data.gamesState && typeof data.gamesState === 'object' && data.gamesState.best && typeof data.gamesState.best === 'object') gamesState = { best: data.gamesState.best };
            if (data.bankState && typeof data.bankState === 'object') {
                bankState = Object.assign(bankState, data.bankState);
                ['loans', 'transfers', 'recents', 'seen'].forEach(function (k) { if (!Array.isArray(bankState[k])) bankState[k] = []; });
            }
            if (data.ytState && typeof data.ytState === 'object') {
                ytState = Object.assign(ytState, data.ytState);
                ['editing', 'archive', 'live', 'history'].forEach(function (k) { if (!Array.isArray(ytState[k])) ytState[k] = []; });
                if (!ytState.uploads || typeof ytState.uploads !== 'object') ytState.uploads = { day: -1, count: 0 };
                if (!ytState.milestones || typeof ytState.milestones !== 'object') ytState.milestones = {};
            }
            if (data.travelState && typeof data.travelState === 'object') travelState = Object.assign(travelState, data.travelState);
            if (data.phoneState && typeof data.phoneState === 'object') phoneState = Object.assign(phoneState, data.phoneState);
            if (data.marketState && typeof data.marketState === 'object') marketState = Object.assign(marketState, data.marketState);
            if (Array.isArray(data.backpack)) backpack = data.backpack.filter(function (id) { return backpackFood(id); }).slice(0, 10);
            if (Array.isArray(data.pendingBackpack)) pendingBackpack = data.pendingBackpack.filter(function (item) { return item && backpackFood(item.id); });
            if (data.hygieneState && typeof data.hygieneState === 'object') hygieneState = Object.assign(hygieneState, data.hygieneState);

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

    /* Сохранение откладывается и склеивается: раньше игра записывала весь прогресс в память телефона каждый кадр (60 раз в секунду) */
    let saveTimerId = null;
    let saveIsDirty = false;

    function saveGameData() {
        saveIsDirty = true;
        if (saveTimerId === null) saveTimerId = setTimeout(flushGameData, 3000);
    }

    function flushGameData() {
        if (saveTimerId !== null) { clearTimeout(saveTimerId); saveTimerId = null; }
        if (!saveIsDirty) return;
        saveIsDirty = false;
        writeGameDataNow();
    }

    document.addEventListener('visibilitychange', function () { if (document.hidden) flushGameData(); });
    window.addEventListener('pagehide', flushGameData);
    window.addEventListener('beforeunload', flushGameData);

    function writeGameDataNow() {
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
                energyState: energyState,
                carFuel: carFuel,
                gamesState: gamesState,
                bankState: bankState,
                ytState: ytState,
                travelState: travelState,
                phoneState: phoneState,
                marketState: marketState,
                backpack: backpack,
                pendingBackpack: pendingBackpack,
                hygieneState: hygieneState,
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

    /* Интерфейс обновляется только если значение реально изменилось (раньше каждый кадр заново искались десятки элементов) */
    const hudCache = { nodes: {}, text: {}, style: {} };

    function hudNode(id) {
        let node = hudCache.nodes[id];
        if (node === undefined) {
            node = document.getElementById(id) || null;
            hudCache.nodes[id] = node;
        }
        return node;
    }

    function setTextCached(id, value) {
        if (hudCache.text[id] === value) return;
        const node = hudNode(id);
        if (!node) return;
        hudCache.text[id] = value;
        node.textContent = value;
    }

    function setNodeTextCached(key, node, value) {
        if (!node || hudCache.text[key] === value) return;
        hudCache.text[key] = value;
        node.textContent = value;
    }

    function setRingCached(key, node, value) {
        if (!node) return;
        const offset = (CIRCUMFERENCE - (clamp(value, 0, 100) / 100) * CIRCUMFERENCE).toFixed(2);
        if (hudCache.style[key] === offset) return;
        hudCache.style[key] = offset;
        node.style.strokeDashoffset = offset;
    }

    function updateClockUI() {
        normalizeMoney();
        const timeString = getTimeString();
        const dateString = getDateString();
        const moneyString = playerMoney.toLocaleString('ru-RU') + ' ₽';

        setTextCached('hud-clock-text', timeString);
        setTextCached('hud-date-text', dateString);
        if (hudCache.text['hud-money-text'] !== moneyString) {
            setTextCached('hud-money-text', moneyString);
            const moneyTextElement = hudNode('hud-money-text');
            if (moneyTextElement) moneyTextElement.style.color = playerMoney < 0 ? '#f87171' : '';
        }
        setTextCached('phone-clock-text', timeString);
        setTextCached('phone-date-text', dateString);
        setTextCached('walk-clock-text', timeString);
        setTextCached('walk-date-text', dateString);
        setTextCached('walk-money-text', moneyString);

        setNodeTextCached('taxiClock', taxiClockText, timeString);
        setNodeTextCached('taxiDate', taxiDateText, dateString);
        setNodeTextCached('taxiMoney', taxiMoneyText, moneyString);
        setNodeTextCached('truckerClock', truckerClockText, timeString);
        setNodeTextCached('truckerDate', truckerDateText, dateString);
        setNodeTextCached('truckerMoney', truckerMoneyText, moneyString);

        if (cashierShiftState.active && cashierShiftTimer) {
            cashierShiftTimer.textContent = '⏱ Начало: ' + getTimeString(cashierShiftState.startedAtMinutes);
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
            setRingCached(key, hudNode(key + '-ring'), value);
            setTextCached(key + '-val-text', Math.round(value) + '%');
        });

        setRingCached('taxiHunger', taxiHungerRing, playerHunger);
        setRingCached('taxiEnergy', taxiEnergyRing, playerEnergy);
        setRingCached('taxiSleep', taxiSleepRing, playerSleep);
        setNodeTextCached('taxiHungerVal', taxiHungerVal, Math.round(playerHunger) + '%');
        setNodeTextCached('taxiEnergyVal', taxiEnergyVal, Math.round(playerEnergy) + '%');
        setNodeTextCached('taxiSleepVal', taxiSleepVal, Math.round(playerSleep) + '%');

        updateClockUI();
    }

    let lastBadgeCount = -1;

    function updatePhoneBadge() {
        let unreadMessages = 0;
        for (let i = 0; i < messages.length; i += 1) if (!messages[i].read) unreadMessages += 1;
        if (unreadMessages === lastBadgeCount) return;
        lastBadgeCount = unreadMessages;

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
                addMessage('Оплата', '🧾', 'Время на исходе! Налог «' + tax.title + '» (' + tax.amount.toLocaleString('ru-RU') + ' ₽) нужно оплатить в течение дня. Иначе налог спишется автоматически, а сверху придёт штраф в 2 раза больше.');
            }
        });
    }

    function processFineOneDayReminders() {
        const now = getTotalAbsoluteMinutes();
        finesList.forEach(function (fine) {
            if (fine.status !== 'unpaid' || fine.reminderSent) return;
            const left = fine.dueMinutes - now;
            if (left > 0 && left <= 1440) {
                fine.reminderSent = true;
                addMessage('Штрафы', '⏰', 'Время на исходе! Штраф «' + fine.reason + '» (' + fine.amount.toLocaleString('ru-RU') + ' ₽) нужно оплатить в течение дня. Иначе с баланса спишется в 3 раза больше.');
            }
        });
    }

    function processTaxesExpiration() {
        const now = getTotalAbsoluteMinutes();
        taxes.forEach(function (tax) {
            if (tax.status !== 'unpaid' || now < tax.dueAt) return;
            const penalty = Math.round(tax.amount * 2);
            playerMoney -= tax.amount;
            tax.status = 'overdue';
            tax.overdueAmount = penalty;
            tax.paidDate = getDateString();
            tax.paidTime = getTimeString();
            addBankTransaction('Автосписание налога', tax.amount, false);
            addMessage('Оплата', '⚠️', 'Налог «' + tax.title + '» не оплачен за неделю. Он списан с баланса автоматически (' + tax.amount.toLocaleString('ru-RU') + ' ₽). Вам выписан штраф ' + penalty.toLocaleString('ru-RU') + ' ₽ за неуплату: на оплату даётся 3 дня.');
            createFine(penalty, 'Штраф за неуплату налога: ' + tax.title);
        });
        updateClockUI();
        saveGameData();
    }

    function processFinesExpiration() {
        const now = getTotalAbsoluteMinutes();
        finesList.forEach(function (fine) {
            if (fine.status !== 'unpaid' || now < fine.dueMinutes) return;
            const penaltyAmount = fine.amount * 3;
            playerMoney -= penaltyAmount;
            fine.status = 'expired_penalty';
            fine.paidDate = getDateString();
            fine.paidTime = getTimeString();
            addBankTransaction('Просрочка штрафа (x3)', penaltyAmount, false);
            addMessage('Штрафы', '❌', 'Штраф «' + fine.reason + '» просрочен. С баланса списано ' + penaltyAmount.toLocaleString('ru-RU') + ' ₽ (в 3 раза больше штрафа).');
        });
        updateClockUI();
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

    function getPlayerBirthday() {
        try {
            const raw = localStorage.getItem(BIRTHDAY_STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data && Number.isInteger(data.day) && Number.isInteger(data.month)) return data;
        } catch (error) {
            return null;
        }
        return null;
    }

    function giveGovernmentReward(amount, icon, title, text) {
        playerMoney += amount;
        addBankTransaction(title, amount, true);
        addMessage('Государство', icon, text);
        showToast(icon + ' ' + title + ': +' + amount.toLocaleString('ru-RU') + ' ₽');
    }

    /* Дополнительные праздники (месяцы с нуля: 0 = январь) */
    const HOLIDAY_EXTRA_LIST = [
        { d: 7, m: 0, sum: 15000, icon: '⭐', name: 'Рождество' },
        { d: 14, m: 1, sum: 10000, icon: '💝', name: 'День святого Валентина' },
        { d: 1, m: 3, sum: 10000, icon: '🤡', name: 'День смеха' },
        { d: 12, m: 3, sum: 30000, icon: '🚀', name: 'День космонавтики' },
        { d: 1, m: 4, sum: 20000, icon: '🌷', name: 'Праздник Весны и Труда' },
        { d: 9, m: 4, sum: 75000, icon: '🎖️', name: 'День Победы' },
        { d: 1, m: 5, sum: 10000, icon: '🧸', name: 'День защиты детей' },
        { d: 12, m: 5, sum: 25000, icon: '🎉', name: 'День России' },
        { d: 1, m: 8, sum: 25000, icon: '📚', name: 'День знаний' },
        { d: 5, m: 9, sum: 15000, icon: '🍎', name: 'День учителя' },
        { d: 4, m: 10, sum: 20000, icon: '🤝', name: 'День народного единства' }
    ];

    /* Награды госслужащим: каждые 30 заказов +15 000, 100 заказов +35 000, 500 заказов +100 000 */
    const GOV_MILESTONES = [
        { step: 30, sum: 15000 },
        { step: 100, sum: 35000 },
        { step: 500, sum: 100000 }
    ];

    function checkGovMilestones(jobTitle, prevTotal, newTotal) {
        GOV_MILESTONES.forEach(function (ms) {
            if (Math.floor(newTotal / ms.step) > Math.floor(prevTotal / ms.step)) {
                giveGovernmentReward(ms.sum, '🏅', 'Награда: ' + jobTitle + ', ' + Math.floor(newTotal / ms.step) * ms.step + ' заказов',
                    'Вы выполнили ' + (Math.floor(newTotal / ms.step) * ms.step) + ' заказов на службе (' + jobTitle + '). Награда: ' + ms.sum.toLocaleString('ru-RU') + ' ₽.');
            }
        });
    }

    function processHolidayRewards(day, monthIndex) {
        const gender = localStorage.getItem('bestlife_gender');
        const birthday = getPlayerBirthday();
        if (day === 1 && monthIndex === 0) {
            giveGovernmentReward(NEW_YEAR_REWARD, '🎄', 'Новогодняя премия от государства', 'Поздравляем с Новым годом! Государство начислило вам ' + NEW_YEAR_REWARD.toLocaleString('ru-RU') + ' ₽.');
        }
        if (gender === 'boy' && day === 23 && monthIndex === 1) {
            giveGovernmentReward(DEFENDER_DAY_REWARD, '🎖️', 'Выплата к 23 февраля', 'С Днём защитника Отечества! Государство начислило вам ' + DEFENDER_DAY_REWARD.toLocaleString('ru-RU') + ' ₽.');
        }
        if (gender === 'girl' && day === 8 && monthIndex === 2) {
            giveGovernmentReward(WOMEN_DAY_REWARD, '🌷', 'Выплата к 8 марта', 'С 8 Марта! Государство начислило вам ' + WOMEN_DAY_REWARD.toLocaleString('ru-RU') + ' ₽.');
        }
        if (birthday && birthday.day === day && birthday.month === monthIndex) {
            giveGovernmentReward(BIRTHDAY_REWARD, '🎂', 'Подарок ко дню рождения', 'С днём рождения! Государство дарит вам ' + BIRTHDAY_REWARD.toLocaleString('ru-RU') + ' ₽.');
        }
        HOLIDAY_EXTRA_LIST.forEach(function (h) {
            if (h.d === day && h.m === monthIndex) {
                giveGovernmentReward(h.sum, h.icon, h.name, h.name + '! Государство поздравляет вас и начисляет ' + h.sum.toLocaleString('ru-RU') + ' ₽.');
            }
        });
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

            processHolidayRewards(currentDay, currentMonthIdx);
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
        renderBankExtras(wrapper);

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
        const unreadTotal = messages.filter(function (item) { return !item.read; }).length;
        const toolbar = document.createElement('div');
        toolbar.className = 'messages-toolbar';
        toolbar.innerHTML = '<button type="button" class="messages-readall-btn"' + (unreadTotal === 0 ? ' disabled' : '') + '>✓ Прочитать все' + (unreadTotal > 0 ? ' (' + unreadTotal + ')' : '') + '</button>';
        toolbar.querySelector('button').addEventListener('click', function () {
            messages.forEach(function (item) { item.read = true; });
            updatePhoneBadge();
            saveGameData();
            renderMessagesApp();
        });
        appScrollableBody.appendChild(toolbar);
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
            card.innerHTML = '<img src="' + food.image + '" alt="' + food.name + '" onerror="this.style.visibility=\'hidden\'"><div class="food-name">' + food.name + '</div><div class="food-info">+' + food.hunger + '% сытости' + (food.energy ? ', +' + food.energy + '% энергии' : '') + '</div><div class="food-price">' + food.price + ' ₽</div><button class="food-buy-btn">В корзину</button>';
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
            const drinksInCart = foodCart.filter(function (f) { return f.isEnergy; }).length;
            if (drinksInCart > 0 && energyBlockedAtPurchase(drinksInCart)) return;
            const normalFoodHunger = foodCart.reduce(function (s, f) { return s + (f.isEnergy ? 0 : f.hunger); }, 0);
            playerMoney = Math.max(0, playerMoney - total);
            addBankTransaction('Покупка еды', total, false);
            pendingFoodDeliveries.push({
                energyDrinks: drinksInCart,
                deliverAtMinutes: getTotalAbsoluteMinutes() + 30,
                totalHunger: Math.min(normalFoodHunger, Math.max(0, 100 - playerHunger)),
                totalEnergy: Math.min(normalFoodHunger, Math.max(0, 100 - playerEnergy))
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
                : (isTrucker ? Boolean(truckerJobState.activeJobId || truckerJobState.pendingJobId) : (isCashier ? Boolean(cashierJobState.activeJobId || cashierJobState.pendingJobId) : xjIsAppliedOrActive(job.id)));
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
                else if (xjIsJob(job.id)) xjApply(job);
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

        if (!fireActive && !truckerActive && !cashierActive && !firePending && !truckerPending && !cashierPending && !xjAnyJobActiveOrPending()) {
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
            card.innerHTML = '<div class="collective-header"><div class="collective-avatar">🚛</div><div><div class="collective-title">Дальнобойщик</div><div class="collective-sub" style="color:#d97706;">Служба активна</div></div></div><p style="font-size:.75rem;color:#475569;line-height:1.4;">Рабочее время: 06:00–22:00.<br>Доставляйте грузы по маршрутам.</p><div class="collective-stats-box"><div class="collective-stat-item"><span class="collective-stat-title">Заказов сегодня</span><span class="collective-stat-value" style="color:#d97706;">' + truckerOrdersCompletedToday + '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Всего заказов</span><span class="collective-stat-value" style="color:#d97706;">' + truckerTotalOrdersCompleted + '</span></div></div><button id="resign-trucker" class="job-decline-btn">Уволиться с автобазы</button>';
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

        xjAppendCollectiveCards(wrapper);
        appScrollableBody.appendChild(wrapper);
    }

    /* =========================================================
       ТАКСИ И ПЕРЕДВИЖЕНИЕ
       ========================================================= */

    function renderTaxiApp() {
        appScrollableBody.innerHTML = '';
        const fromKey = getLocationKey();
        const fromTitle = getLocationTitle(fromKey);
        const targets = ['home', 'firestation', 'truckstation', 'market', 'police', 'hospital', 'taxipark', 'airport'].filter(function (key) { return key !== fromKey; });

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
        if (taxiTimerId) {
            showToast('Вы уже в такси');
            return;
        }
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isPlayerWorking() || truckerTripState.active || cashierShiftState.active || (xjTask && xjTask.active) || xjGameActive) {
            showToast('Сначала завершите смену или задание');
            return;
        }
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
        /* HUD всегда виден */
        taxiFullscreen.classList.remove('hidden');

        taxiRouteTitleText.textContent = '🚕 ' + fromTitle + ' → ' + toTitle;
        taxiRouteSubText.textContent = '';
        taxiProgressInner.style.width = '0%';
        taxiPercentText.textContent = '0%';

        const startTime = performance.now();
        const startMinutes = gameMinutes;
        const totalTaxiRealSeconds = 15;
        isClockRunning = false;

        taxiTimerId = setInterval(function () {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(1, elapsed / totalTaxiRealSeconds);
            gameMinutes = startMinutes + progress * ((fromKey === 'airport' || toKey === 'airport') ? 120 : 45);
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
        xjHideScreens(); hideAirportScreen();
        lastExitedLocation = toKey;

        currentScreen = 'city';

        playerEnergy = clamp(playerEnergy - 3, 0, 100);
        saveGameData();
        updateStatsHUD();
        showToast('Вы приехали: ' + toTitle + '. Нажмите на метку, чтобы войти');
    }

    function openTravelChoiceModal(targetKey) {
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        targetLocationSelected = targetKey;
        travelChoiceTitle.textContent = targetKey === 'home' ? 'Едем домой' : (targetKey === 'firestation' ? 'Едем в Пожарную часть' : (targetKey === 'truckstation' ? 'Едем на Автобазу' : (targetKey === 'market' ? 'Едем в Магазин' : xjTravelTitle(targetKey, 'choice'))));
        const realCar = ownedCars.find(function (item) { return item.id !== 'bike'; });
        const hasCar = Boolean(realCar);
        const hasBike = ownedCars.some(function (item) { return item.id === 'bike'; });
        const hasPersonal = hasCar || hasBike;
        btnTravelCar.classList.toggle('disabled-card', !hasCar);
        travelCarDesc.textContent = hasCar ? realCar.title : 'Нет машины';
        if (btnTravelBike) btnTravelBike.classList.toggle('disabled-card', !hasBike);
        if (travelBikeDesc) travelBikeDesc.textContent = hasBike ? '167 кликов' : 'Нет велосипеда';
        if (btnTravelPersonal) btnTravelPersonal.classList.toggle('disabled-card', !hasPersonal);
        if (travelPersonalDesc) travelPersonalDesc.textContent = hasPersonal ? (hasBike && hasCar ? 'Велосипед или авто' : (hasBike ? 'Велосипед' : 'Автомобиль')) : 'Нет транспорта';
        const fromKey = getLocationKey();
        const taxiPrice = getTaxiRoutePrice(fromKey, targetKey);
        if (travelTaxiDesc) travelTaxiDesc.textContent = taxiPrice.toLocaleString('ru-RU') + ' ₽';
        if (btnTravelTaxi) btnTravelTaxi.classList.toggle('disabled-card', fromKey === targetKey);
        if (travelStepMain) travelStepMain.classList.remove('hidden');
        if (travelStepPersonal) travelStepPersonal.classList.add('hidden');
        travelChoiceModal.classList.remove('hidden');
    }

    function startTaxiFromMap() {
        const fromKey = getLocationKey();
        const toKey = targetLocationSelected;
        if (fromKey === toKey) {
            showToast('Вы уже здесь');
            return;
        }
        const price = getTaxiRoutePrice(fromKey, toKey);
        if (playerMoney < price) {
            showToast('Недостаточно денег для такси');
            return;
        }
        travelChoiceModal.classList.add('hidden');
        orderTaxi(fromKey, toKey, price, getLocationTitle(fromKey), getLocationTitle(toKey));
    }

    function showPersonalTravelStep() {
        const hasAny = ownedCars.length > 0;
        if (!hasAny) {
            showToast('У вас нет личного транспорта. Купите его в приложении «Авто.ру»');
            return;
        }
        if (travelStepMain) travelStepMain.classList.add('hidden');
        if (travelStepPersonal) travelStepPersonal.classList.remove('hidden');
    }

    function travelChoiceBack() {
        if (travelStepPersonal && !travelStepPersonal.classList.contains('hidden')) {
            travelStepPersonal.classList.add('hidden');
            if (travelStepMain) travelStepMain.classList.remove('hidden');
            return;
        }
        travelChoiceModal.classList.add('hidden');
    }
    function startWalkTravel() {
        travelChoiceModal.classList.add('hidden');
        travelMode = 'walk';
        walkClicksTotal = targetLocationSelected === 'airport' ? 444 : 222;
        walkClicksLeft = walkClicksTotal;
        walkFullscreen.classList.remove('hidden');
        const title = targetLocationSelected === 'home' ? 'Дом' : (targetLocationSelected === 'firestation' ? 'Пожарную часть' : (targetLocationSelected === 'truckstation' ? 'Автобазу' : (targetLocationSelected === 'market' ? 'Магазин' : xjTravelTitle(targetLocationSelected, 'walk'))));
        walkTitleText.textContent = 'Идём пешком в ' + title;
        walkProgressInner.style.width = '0%';
        walkPercentText.textContent = '0%';
    }

    function handleWalkClick(event) {
        event.preventDefault();
        if (walkClicksLeft <= 0) return;
        walkClicksLeft -= 1;
        gameMinutes += (travelMode === 'bike' ? 0.11 : 0.22);
        advanceCalendar();
        const progress = Math.round(((walkClicksTotal - walkClicksLeft) / walkClicksTotal) * 100);
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
        xjHideScreens(); hideAirportScreen();
        lastExitedLocation = targetLocationSelected;

        currentScreen = 'city';

        const byBike = travelMode === 'bike';
        playerEnergy = clamp(playerEnergy - (byBike ? 5 : 8), 0, 100);
        playerHunger = clamp(playerHunger - (byBike ? 3 : 5), 0, 100);
        saveGameData();
        updateStatsHUD();
        showToast((byBike ? 'Вы приехали на велосипеде' : 'Вы пришли пешком') + '. Нажмите на метку, чтобы войти');
    }

    function startBikeTravel() {
        if (!ownedCars.some(function (item) { return item.id === 'bike'; })) {
            showToast('У вас нет велосипеда');
            return;
        }
        travelChoiceModal.classList.add('hidden');
        travelMode = 'bike';
        walkClicksTotal = targetLocationSelected === 'airport' ? 334 : 167;
        walkClicksLeft = walkClicksTotal;
        walkFullscreen.classList.remove('hidden');
        const placeNames = { home: 'Дом', firestation: 'Пожарную часть', truckstation: 'Автобазу', market: 'Магазин', police: 'Полицейский участок', hospital: 'Больницу', taxipark: 'Таксопарк' };
        walkTitleText.textContent = 'Едем на велосипеде в ' + (placeNames[targetLocationSelected] || 'место назначения');
        walkProgressInner.style.width = '0%';
        walkPercentText.textContent = '0%';
    }

    function startCarTravel() {
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isDizzy()) {
            showToast('🥴 Кружится голова: нельзя садиться за руль');
            return;
        }
        if (!ownedCars.some(function (item) { return item.id !== 'bike'; })) {
            showToast('У вас нет автомобиля');
            return;
        }
        startDriveGame();
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
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isDizzy()) {
            showToast('🥴 Кружится голова: нельзя работать');
            return;
        }
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
        const reward = applySalaryHygiene(orderState.reward);
        playerMoney += reward;
        addBankTransaction('Зарплата: Пожарный', reward, true);
        createTax('salary', reward * SALARY_TAX_RATE, 'Налог: Пожарный 3%');
        checkResetDailyOrdersCounter();
        ordersCompletedToday += 1;
        const prevFireTotal = totalOrdersCompleted;
        totalOrdersCompleted += 1;
        checkGovMilestones('Пожарный', prevFireTotal, totalOrdersCompleted);
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
        showTruckerDialogue('Рабочее время дальнобойщика: 06:00–22:00. Каждый километр рейса требует одного нажатия.');
    }

    function handleTruckerOrdersButton() {
        if (truckerJobState.activeJobId !== 'driver') {
            showTruckerDialogue('Сначала получите должность дальнобойщика.');
            return;
        }
        if (!isTruckerWorkTime()) {
            showTruckerDialogue('Заказы доступны с 06:00 до 22:00.');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showTruckerDialogue('Для рейса нужны и энергия, и сон. Отдохните и поспите.');
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
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isDizzy()) {
            showToast('🥴 Кружится голова: нельзя работать');
            return;
        }
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
        const salary = applySalaryHygiene(Math.round(order.dist * order.rate));

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
        showMarketDialogue('Рабочее время кассира: 09:00–21:00. Перерыв с 13:00 до 14:30. Зарплата 11 500 ₽ за смену, если смена начата не позже 09:00, закончена не раньше 21:00 и обслужено не меньше 15 клиентов. Иначе зарплата будет меньше, а за опоздание и ранний уход ещё и штраф.');
    }

    function handleMarketWorkButton() {
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isDizzy()) {
            showToast('🥴 Кружится голова: нельзя работать');
            return;
        }
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
        const startedLateNow = gameMinutes > CASHIER_SHIFT_START_HOUR * 60;
        if (startedLateNow) {
            const fine = CASHIER_LATE_FINE;
            createFine(fine, 'Опоздание на смену кассира');
            showToast('Штраф за опоздание: ' + fine + ' ₽');
        }
        cashierShiftState.active = true;
        cashierShiftState.startedAtMinutes = gameMinutes;
        cashierShiftState.startedLate = startedLateNow;
        cashierShiftState.startDayKey = currentDay + '_' + currentMonthIdx;
        cashierShiftState.servedThisShift = 0;
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

    const CASHIER_MIN_CLIENTS = 15;
    const CASHIER_CUSTOMER_EMOJI = ['👨', '👩', '👴', '👵', '👦', '👧', '👱', '👲', '👳', '👷'];
    let cashierLastImageIndex = 0;

    function generateCashierCustomers() {
        cashierCustomers = [];
    }

    function makeCashierCustomer() {
        const change = 1 + Math.floor(Math.random() * 1234);
        const check = 30 + Math.floor(Math.random() * 1471);
        let imageIndex = 1 + Math.floor(Math.random() * 10);
        if (imageIndex === cashierLastImageIndex) imageIndex = (imageIndex % 10) + 1;
        cashierLastImageIndex = imageIndex;
        return {
            checkAmount: check,
            paid: check + change,
            customerImage: 'customers/customer_' + imageIndex + '.png',
            emoji: CASHIER_CUSTOMER_EMOJI[Math.floor(Math.random() * CASHIER_CUSTOMER_EMOJI.length)]
        };
    }

    function showCashierWorkScreen() {
        marketScreen.classList.add('hidden');
        xjHideScreens(); hideAirportScreen();
        cashierWorkScreen.classList.remove('hidden');
        updateCashierUI();
        renderCashierDenominations();
    }

    function updateCashierUI() {
        if (!cashierShiftState.active || cashierShiftState.shiftCompleted) {
            cashierShiftStatus.textContent = 'Смена завершена';
            return;
        }

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

        const served = cashierShiftState.servedThisShift || 0;
        if (cashierServedDisplay) cashierServedDisplay.textContent = served;
        if (cashierServedBar) cashierServedBar.style.width = Math.min(100, (served / CASHIER_MIN_CLIENTS) * 100) + '%';

        if (cashierShiftState.onBreak) {
            cashierShiftStatus.textContent = '🔴 ПЕРЕРЫВ (13:00–14:30)';
            btnCashierBreak.classList.add('hidden');
            btnCashierEndShift.classList.add('hidden');
            return;
        }
        btnCashierBreak.classList.remove('hidden');
        btnCashierEndShift.classList.remove('hidden');

        const elapsed = Math.max(0, Math.floor((gameMinutes - cashierShiftState.startedAtMinutes) / 60));
        cashierShiftStatus.textContent = '🟢 Смена: ' + elapsed + ' ч';

        if (cashierShiftState.customer === null) {
            const customer = makeCashierCustomer();
            cashierShiftState.customer = customer;
            cashierShiftState.checkAmount = customer.checkAmount;
            cashierShiftState.customerPaid = customer.paid;
            cashierShiftState.changeDue = customer.paid - customer.checkAmount;
            cashierShiftState.selectedChange = 0;
            cashierShiftState.selectedDenominations = [];
            renderCashierDenominations();
        }

        const customer = cashierShiftState.customer;
        cashierCheckDisplay.textContent = customer.checkAmount.toLocaleString('ru-RU') + ' ₽';
        cashierPaidDisplay.textContent = customer.paid.toLocaleString('ru-RU') + ' ₽';
        cashierChangeDueDisplay.textContent = cashierShiftState.changeDue.toLocaleString('ru-RU') + ' ₽';
        cashierSelectedDisplay.textContent = cashierShiftState.selectedChange.toLocaleString('ru-RU') + ' ₽';

        if (cashierCustomerImage && cashierCustomerImage.dataset.shown !== customer.customerImage) {
            cashierCustomerImage.dataset.shown = customer.customerImage;
            if (cashierCustomerEmoji) cashierCustomerEmoji.textContent = customer.emoji || '🙂';
            cashierCustomerImage.onload = function () {
                cashierCustomerImage.style.display = 'block';
                if (cashierCustomerEmoji) cashierCustomerEmoji.style.display = 'none';
            };
            cashierCustomerImage.onerror = function () {
                cashierCustomerImage.style.display = 'none';
                if (cashierCustomerEmoji) cashierCustomerEmoji.style.display = 'flex';
            };
            cashierCustomerImage.src = customer.customerImage;
        }

        const difference = cashierShiftState.selectedChange - cashierShiftState.changeDue;
        if (cashierDiffDisplay) {
            if (difference === 0) {
                cashierDiffDisplay.textContent = '✅ Сумма верная';
                cashierDiffDisplay.className = 'cashier-diff ok';
            } else if (difference < 0) {
                cashierDiffDisplay.textContent = 'Ещё нужно: ' + Math.abs(difference).toLocaleString('ru-RU') + ' ₽';
                cashierDiffDisplay.className = 'cashier-diff need';
            } else {
                cashierDiffDisplay.textContent = 'Лишнее: ' + difference.toLocaleString('ru-RU') + ' ₽';
                cashierDiffDisplay.className = 'cashier-diff over';
            }
        }

        btnCashierGiveChange.disabled = false;
        btnCashierGiveChange.textContent = 'Выдать сдачу (' + cashierShiftState.selectedChange.toLocaleString('ru-RU') + ' ₽)';

        renderSelectedDenominationsTray();

        if (getCurrentHour() >= CASHIER_SHIFT_END_HOUR) {
            btnCashierEndShift.textContent = '🏁 Закончить смену (получить зарплату)';
        } else {
            btnCashierEndShift.textContent = '🏁 Завершить смену';
        }
    }

    function renderSelectedDenominationsTray() {
        if (!cashierSelectedItemsTray) return;
        const groups = {};
        const order = [];
        cashierShiftState.selectedDenominations.forEach(function (denom) {
            const key = String(denom.id || denom.value);
            if (!groups[key]) {
                groups[key] = { denom: denom, count: 0 };
                order.push(key);
            }
            groups[key].count += 1;
        });
        order.sort(function (a, b) { return groups[b].denom.value - groups[a].denom.value; });
        const signature = order.map(function (key) { return key + 'x' + groups[key].count; }).join(',');
        if (cashierSelectedItemsTray.dataset.signature === signature) return;
        cashierSelectedItemsTray.dataset.signature = signature;
        cashierSelectedItemsTray.innerHTML = '';

        if (!order.length) {
            cashierSelectedItemsTray.innerHTML = '<span class="cashier-empty-tray-label">Нажимайте на деньги ниже, чтобы собрать сдачу. Нажатие на выданную купюру вернёт её обратно.</span>';
            return;
        }

        order.forEach(function (key) {
            const group = groups[key];
            const chip = document.createElement('div');
            chip.className = 'cashier-selected-chip';
            chip.title = 'Нажмите, чтобы вернуть одну купюру';
            chip.innerHTML = '<img src="' + group.denom.image + '" alt="' + group.denom.label + '" onerror="this.style.display=\'none\'"><span class="chip-label">' + group.denom.label + '</span>' + (group.count > 1 ? '<b class="chip-count">×' + group.count + '</b>' : '');
            chip.addEventListener('click', function (event) {
                event.stopPropagation();
                for (let index = cashierShiftState.selectedDenominations.length - 1; index >= 0; index -= 1) {
                    if (String(cashierShiftState.selectedDenominations[index].id || cashierShiftState.selectedDenominations[index].value) === key) {
                        removeCashierDenomination(index);
                        break;
                    }
                }
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
            button.innerHTML = '<img src="' + denom.image + '" alt="' + denom.label + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'"><span class="denom-fallback">' + denom.label + '</span><span class="denom-val-title">' + denom.label + '</span>';
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

        const given = cashierShiftState.selectedChange;
        const due = cashierShiftState.changeDue;
        const difference = given - due;
        if (difference === 0) {
            showToast('✅ Сдача выдана верно');
        } else if (difference > 0) {
            const fine = difference * 5;
            createFine(fine, 'Ошибка в сдаче: выдано больше на ' + difference + ' ₽ (×5)');
            showToast('Выдано больше на ' + difference + ' ₽. Штраф ' + fine.toLocaleString('ru-RU') + ' ₽');
        } else {
            const fine = Math.abs(difference) * 7;
            createFine(fine, 'Ошибка в сдаче: выдано меньше на ' + Math.abs(difference) + ' ₽ (×7)');
            showToast('Выдано меньше на ' + Math.abs(difference) + ' ₽. Штраф ' + fine.toLocaleString('ru-RU') + ' ₽');
        }

        cashierCustomersServed += 1;
        cashierShiftState.servedThisShift = (cashierShiftState.servedThisShift || 0) + 1;
        cashierShiftState.customer = null;
        cashierShiftState.checkAmount = 0;
        cashierShiftState.customerPaid = 0;
        cashierShiftState.changeDue = 0;
        cashierShiftState.selectedChange = 0;
        cashierShiftState.selectedDenominations = [];
        updateCashierUI();
        playClick();
        saveGameData();
    }

    function endCashierShift() {
        if (!cashierShiftState.active) return;
        if (cashierShiftState.onBreak) {
            showToast('Сейчас перерыв!');
            return;
        }

        const served = cashierShiftState.servedThisShift || 0;
        const sameDay = cashierShiftState.startDayKey === currentDay + '_' + currentMonthIdx;
        const endedEarly = sameDay && gameMinutes < CASHIER_SHIFT_END_HOUR * 60;
        const startedLate = Boolean(cashierShiftState.startedLate);
        const notEnoughClients = served < CASHIER_MIN_CLIENTS;

        let salary = CASHIER_SALARY;
        const notes = [];
        if (startedLate) { salary /= 3; notes.push('поздний старт: зарплата ÷3'); }
        if (endedEarly) {
            salary /= 3.3;
            notes.push('ранний уход: зарплата ÷3,3');
            createFine(CASHIER_EARLY_END_FINE, 'Досрочное завершение смены кассира');
        }
        if (notEnoughClients) { salary /= 2; notes.push('меньше ' + CASHIER_MIN_CLIENTS + ' клиентов: зарплата ÷2'); }
        salary = applySalaryHygiene(Math.round(salary));

        playerMoney += salary;
        addBankTransaction('Зарплата: Кассир', salary, true);
        createTax('salary', Math.round(salary * CASHIER_TAX_RATE), 'Налог: Кассир 3%');
        addMessage('Магазин', '🛒', 'Смена завершена. Обслужено клиентов: ' + served + '. Зарплата: ' + salary.toLocaleString('ru-RU') + ' ₽' + (notes.length ? ' (' + notes.join('; ') + ')' : '') + '.');
        showToast('Зарплата +' + salary.toLocaleString('ru-RU') + ' ₽' + (notes.length ? ' (' + notes.length + ' снижен.)' : ''));

        cashierTotalShiftsCompleted += 1;
        cashierShiftState.active = false;
        cashierShiftState.shiftCompleted = true;
        cashierShiftState.customer = null;
        cashierShiftState.checkAmount = 0;
        cashierShiftState.customerPaid = 0;
        cashierShiftState.changeDue = 0;
        cashierShiftState.selectedChange = 0;
        cashierShiftState.selectedDenominations = [];
        cashierShiftState.servedThisShift = 0;
        cashierWorkScreen.classList.add('hidden');
        currentScreen = 'market';
        marketScreen.classList.remove('hidden');
        updateClockUI();
        saveGameData();
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
            const custom = document.createElement('div');
            custom.style.cssText = 'margin-top:12px;padding:12px;border-radius:14px;background:#f1f5f9;';
            custom.innerHTML = '<div style="font-weight:800;margin-bottom:6px;">✏️ Своя сумма билета</div>' +
                '<div style="font-size:.7rem;color:#64748b;margin-bottom:8px;line-height:1.35;">От 10 до 1 000 000 000 ₽. Выигрыш считается в процентах от вашей суммы: чем больше совпадений, тем больше, а за все 5 числ выплата ×5.</div>' +
                '<div style="display:flex;gap:8px;"><input id="lotto-custom-input" type="number" inputmode="numeric" min="10" max="1000000000" placeholder="Например, 456" style="flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid #cbd5e1;font-size:1rem;"><button type="button" class="lotto-btn-start" id="lotto-custom-btn">Играть</button></div>';
            wrapper.appendChild(custom);
            custom.querySelector('#lotto-custom-btn').addEventListener('click', function () {
                const amount = Math.floor(Number(custom.querySelector('#lotto-custom-input').value));
                if (!amount || amount < 10 || amount > 1000000000) {
                    showToast('Введите сумму от 10 до 1 000 000 000 ₽');
                    return;
                }
                if (playerMoney < amount) {
                    showToast('Недостаточно денег на такой билет');
                    return;
                }
                startLottoTier({ icon: '✏️', label: amount.toLocaleString('ru-RU') + ' ₽', price: amount, custom: true });
            });
            return;
        }

        if (lottoState.step === 'buy_tickets') {
            const tier = lottoState.selectedTier;
            const game = document.createElement('div');
            game.className = 'lotto-game-container';
            const header = document.createElement('div');
            header.className = 'lotto-header-bar';
            header.innerHTML = '<div><strong>Категория: ' + tier.label + '</strong><br><span style="font-size:.68rem;color:#64748b;">Выбрано: ' + lottoState.selectedTicketIndexes.length + '/3</span></div>';
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
        if (lottoState.selectedTicketIndexes.length >= 3) {
            showToast('Можно выбрать максимум 3 билета');
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
            card.innerHTML = '<div class="car-card-top"><img class="car-thumb-new" src="cars/' + car.imgPrefix + '_1.png" alt="' + car.title + '" onerror="this.style.visibility=\'hidden\'"><div class="car-info-new"><div class="car-title-new">' + car.title + '</div><div class="car-sub-new">' + car.year + ' г. • ' + car.color + '</div></div></div><div class="car-card-bottom"><div class="car-price-badge">' + car.price.toLocaleString('ru-RU') + ' ₽</div><button class="car-buy-btn-new">' + (owned ? 'Уже есть' : 'Купить') + '</button></div>';
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
        page.innerHTML = '<div class="car-carousel-container"><div class="car-slider-viewport"><div class="car-slider-track"><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_1.png" alt="' + car.title + '"></div><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_2.png" alt="' + car.title + '"></div><div class="car-slide-item"><img src="cars/' + car.imgPrefix + '_3.png" alt="' + car.title + '"></div></div></div><button class="carousel-arrow car-arrow-left">‹</button><button class="carousel-arrow car-arrow-right">›</button><div class="carousel-dots"><div class="carousel-dot active"></div><div class="carousel-dot"></div><div class="carousel-dot"></div></div></div><div class="car-detail-main"><div><div class="car-detail-title">' + car.title + '</div><div style="font-size:.68rem;color:#64748b;font-weight:700;">' + car.year + ' г. • ' + car.color + '</div></div><div class="car-detail-price">' + car.price.toLocaleString('ru-RU') + ' ₽</div></div><div class="car-specs-grid"><div class="car-spec-item"><span class="car-spec-label">Год выпуска</span><span class="car-spec-value">' + car.year + '</span></div><div class="car-spec-item"><span class="car-spec-label">Мощность</span><span class="car-spec-value">' + (car.id === 'bike' ? 'Мускульная' : car.power + ' л.с.') + '</span></div><div class="car-spec-item"><span class="car-spec-label">Разгон 0–100</span><span class="car-spec-value">' + car.accel + '</span></div><div class="car-spec-item"><span class="car-spec-label">Макс. скорость</span><span class="car-spec-value">' + car.maxSpeed + '</span></div></div><div class="car-desc-box">' + car.desc + '</div>';

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

        /* Листание картинок пальцем: палец тянет картинку за собой, отпустили — она долистывается или возвращается */
        const viewport = page.querySelector('.car-slider-viewport');
        if (viewport) {
            let dragging = false;
            let axis = null;
            let startX = 0;
            let startY = 0;
            let deltaX = 0;
            const finishDrag = function (commit) {
                if (!dragging) return;
                dragging = false;
                track.style.transition = '';
                const threshold = Math.max(40, viewport.clientWidth * 0.18);
                if (commit && axis === 'x' && Math.abs(deltaX) > threshold) setSlide(slide + (deltaX < 0 ? 1 : -1));
                else setSlide(slide);
                axis = null;
                deltaX = 0;
            };
            viewport.addEventListener('pointerdown', function (event) {
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                dragging = true;
                axis = null;
                startX = event.clientX;
                startY = event.clientY;
                deltaX = 0;
            });
            viewport.addEventListener('pointermove', function (event) {
                if (!dragging) return;
                const moveX = event.clientX - startX;
                const moveY = event.clientY - startY;
                if (axis === null && (Math.abs(moveX) > 6 || Math.abs(moveY) > 6)) {
                    axis = Math.abs(moveX) > Math.abs(moveY) ? 'x' : 'y';
                    if (axis === 'x') {
                        track.style.transition = 'none';
                        if (event.pointerType === 'mouse') { try { viewport.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ } }
                    }
                }
                if (axis !== 'x') return;
                deltaX = moveX;
                const width = viewport.clientWidth || 1;
                const shown = ((slide === 0 && moveX > 0) || (slide === 2 && moveX < 0)) ? moveX * 0.4 : moveX;
                track.style.transform = 'translateX(' + (-slide * width + shown) + 'px)';
            });
            viewport.addEventListener('pointerup', function () { finishDrag(true); });
            viewport.addEventListener('pointercancel', function () { finishDrag(false); });
        }
    }

    function buyCar(car) {
        if (ownedCars.some(function (item) { return item.id === car.id; })) {
            showToast(car.id === 'bike' ? 'У вас уже есть велосипед' : 'У вас уже есть этот автомобиль');
            return;
        }
        if (playerMoney < car.price) {
            showToast('Недостаточно денег на счёте');
            return;
        }
        playerMoney = Math.max(0, playerMoney - car.price);
        ownedCars.push(car);
        addBankTransaction(car.id === 'bike' ? 'Покупка велосипеда' : 'Покупка автомобиля ' + car.title, car.price, false);
        if (car.id !== 'bike') createTax('car', car.price * CAR_TAX_RATE, 'Налог на автомобиль 5%');
        saveGameData();
        updateClockUI();
        showToast(car.id === 'bike' ? 'Велосипед успешно куплен' : 'Автомобиль успешно куплен');
        renderAutoApp();
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
                for (let d = 0; d < (delivery.energyDrinks || 0); d += 1) drinkEnergyDrink();
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

    /* =========================================================
       РЮКЗАК (до 10 предметов, только еда)
       ========================================================= */
    const BACKPACK_SIZE = 10;
    const BACKPACK_DELIVERY_MINUTES = 30;
    let backpackSelected = -1;

    function backpackFood(id) {
        return FOOD_ITEMS.find(function (food) { return food.id === id; });
    }

    function backpackTotal() {
        return backpack.length + pendingBackpack.length;
    }

    function renderBackpack() {
        const grid = document.getElementById('backpack-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const total = backpackTotal();
        if (backpackSelected >= backpack.length) backpackSelected = -1;
        for (let i = 0; i < BACKPACK_SIZE; i += 1) {
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.className = 'backpack-slot';
            if (i < backpack.length) {
                const food = backpackFood(backpack[i]);
                slot.classList.add('filled');
                if (i === backpackSelected) slot.classList.add('selected');
                slot.innerHTML = '<img src="' + food.image + '" alt="" onerror="this.style.visibility=\'hidden\'"><span>' + food.name + '</span>';
                slot.addEventListener('click', function () { backpackSelected = i; renderBackpack(); });
            } else if (i < total) {
                slot.classList.add('pending');
                slot.disabled = true;
                slot.innerHTML = '<b>⏳</b><span>в пути</span>';
            } else if (i === total) {
                slot.classList.add('add');
                slot.innerHTML = '<b>+</b>';
                slot.addEventListener('click', openBackpackShop);
            } else {
                slot.disabled = true;
            }
            grid.appendChild(slot);
        }
        const counter = document.getElementById('backpack-count');
        if (counter) counter.textContent = total + '/' + BACKPACK_SIZE;
        const detail = document.getElementById('backpack-detail');
        if (!detail) return;
        if (backpackSelected >= 0) {
            const food = backpackFood(backpack[backpackSelected]);
            detail.innerHTML = '<div class="bp-name">' + food.name + '</div><div class="bp-info">+' + food.hunger + '% сытости' + (food.energy ? ', +' + food.energy + '% энергии' : '') + '</div><button type="button" id="btn-backpack-use" class="btn btn-primary" style="width:100%;">Использовать</button>';
            document.getElementById('btn-backpack-use').addEventListener('click', function () { useBackpackItem(backpackSelected); });
        } else {
            detail.innerHTML = '';
        }
    }

    function openBackpack() {
        backpackSelected = -1;
        renderBackpack();
        document.getElementById('backpack-modal').classList.remove('hidden');
    }

    function closeBackpack() {
        document.getElementById('backpack-modal').classList.add('hidden');
    }

    function openBackpackShop() {
        renderBackpackShop();
        document.getElementById('backpack-shop-modal').classList.remove('hidden');
    }

    function renderBackpackShop() {
        const list = document.getElementById('backpack-shop-list');
        const hint = document.getElementById('backpack-shop-hint');
        if (!list) return;
        const free = BACKPACK_SIZE - backpackTotal();
        if (hint) hint.textContent = 'Свободных мест: ' + free + '. Еда появится в рюкзаке через ' + BACKPACK_DELIVERY_MINUTES + ' игровых минут.';
        list.innerHTML = '';
        FOOD_ITEMS.forEach(function (food) {
            const row = document.createElement('div');
            row.className = 'backpack-shop-row';
            row.innerHTML = '<img src="' + food.image + '" alt="" onerror="this.style.visibility=\'hidden\'"><div class="bp-col"><b>' + food.name + '</b>+' + food.hunger + '% сытости' + (food.energy ? ', +' + food.energy + '% энергии' : '') + ' • ' + food.price + ' ₽</div><button type="button" class="btn btn-primary">Купить</button>';
            row.querySelector('button').addEventListener('click', function () { buyToBackpack(food); });
            list.appendChild(row);
        });
    }

    function buyToBackpack(food) {
        if (backpackTotal() >= BACKPACK_SIZE) {
            showToast('Рюкзак полный (максимум ' + BACKPACK_SIZE + ' предметов)');
            return;
        }
        if (playerMoney < food.price) {
            showToast('Недостаточно денег');
            return;
        }
        playerMoney -= food.price;
        addBankTransaction('Покупка в рюкзак: ' + food.name, food.price, false);
        pendingBackpack.push({ id: food.id, at: getTotalAbsoluteMinutes() + BACKPACK_DELIVERY_MINUTES });
        saveGameData();
        updateClockUI();
        renderBackpackShop();
        renderBackpack();
        showToast(food.name + ' появится в рюкзаке через 30 игровых минут');
    }

    function useBackpackItem(index) {
        const id = backpack[index];
        const food = id ? backpackFood(id) : null;
        if (!food) return;
        if (food.isEnergy) {
            if (energyState.until > getTotalAbsoluteMinutes()) {
                showToast('Эффект энергетика ещё действует, повторно выпить нельзя');
                return;
            }
            drinkEnergyDrink();
        } else {
            if (playerHunger >= 100 && playerEnergy >= 100) {
                showToast('Вы не голодны');
                return;
            }
            playerHunger = clamp(playerHunger + food.hunger, 0, 100);
            playerEnergy = clamp(playerEnergy + food.hunger, 0, 100);
            showToast('🍽️ Вы съели: ' + food.name);
        }
        backpack.splice(index, 1);
        backpackSelected = -1;
        saveGameData();
        updateClockUI();
        updateStatsHUD();
        renderBackpack();
    }

    function processBackpackDeliveries() {
        if (!pendingBackpack.length) return;
        const now = getTotalAbsoluteMinutes();
        let changed = false;
        for (let i = 0; i < pendingBackpack.length; i += 1) {
            const item = pendingBackpack[i];
            if (item.at <= now) {
                pendingBackpack.splice(i, 1);
                i -= 1;
                if (backpackFood(item.id) && backpack.length < BACKPACK_SIZE) {
                    backpack.push(item.id);
                    showToast('🎒 В рюкзаке появилось: ' + backpackFood(item.id).name);
                }
                changed = true;
            }
        }
        if (changed) {
            const modal = document.getElementById('backpack-modal');
            if (modal && !modal.classList.contains('hidden')) renderBackpack();
            const shop = document.getElementById('backpack-shop-modal');
            if (shop && !shop.classList.contains('hidden')) renderBackpackShop();
        }
    }

    (function bindBackpackButtons() {
        const openButton = document.getElementById('btn-open-backpack');
        const closeButton = document.getElementById('btn-close-backpack');
        const closeShopButton = document.getElementById('btn-close-backpack-shop');
        if (openButton) openButton.addEventListener('click', function () { playClick(); openBackpack(); });
        if (closeButton) closeButton.addEventListener('click', closeBackpack);
        if (closeShopButton) closeShopButton.addEventListener('click', function () {
            document.getElementById('backpack-shop-modal').classList.add('hidden');
            renderBackpack();
        });
    })();

    /* =========================================================
       БЕНЗИН
       ========================================================= */
    const FUEL_PRICE = 65;
    const FUEL_PER_TRIP_SHARE = 0.045;

    function carTank(car) {
        return Math.max(30, Math.min(60, Math.round(30 + (Number(car.power) || 0) / 5)));
    }

    function getFuel(car) {
        if (carFuel[car.id] === undefined) carFuel[car.id] = carTank(car);
        return Math.max(0, Math.min(carTank(car), Number(carFuel[car.id]) || 0));
    }

    let fuelTextEl = null;
    let fuelBarEl = null;
    let fuelLastText = '';
    let fuelLastPct = -1;

    function updateFuelHud(car, tank) {
        if (!fuelTextEl || !fuelTextEl.isConnected) {
            fuelTextEl = document.getElementById('drive-fuel-text');
            fuelBarEl = document.getElementById('drive-fuel-bar');
            fuelLastText = '';
            fuelLastPct = -1;
        }
        const fuel = getFuel(car);
        const text = '⛽ ' + fuel.toFixed(1) + ' / ' + tank + ' л';
        if (fuelTextEl && text !== fuelLastText) {
            fuelTextEl.textContent = text;
            fuelLastText = text;
        }
        const pct = Math.round(fuel / tank * 100);
        if (fuelBarEl && pct !== fuelLastPct) {
            fuelBarEl.style.width = pct + '%';
            fuelBarEl.style.background = pct < 20 ? '#ef4444' : '#22c55e';
            fuelLastPct = pct;
        }
    }

    function refuelCar(car) {
        const need = Math.ceil(carTank(car) - getFuel(car));
        if (need <= 0) { showToast('Бак уже полный'); return; }
        const cost = need * FUEL_PRICE;
        if (playerMoney < cost) { showToast('Недостаточно денег для заправки'); return; }
        playerMoney -= cost;
        addBankTransaction('Бензин: ' + car.title + ' (' + need + ' л)', cost, false);
        carFuel[car.id] = carTank(car);
        saveGameData();
        updateClockUI();
        showToast('⛽ Заправлено ' + need + ' л за ' + cost.toLocaleString('ru-RU') + ' ₽');
        renderPropertyApp();
    }

    /* =========================================================
       ГИГИЕНА: если долго не мыться, зарплата уменьшается
       ========================================================= */
    function daysWithoutWash() {
        const now = getTotalAbsoluteMinutes();
        if (!hygieneState.lastWash || hygieneState.lastWash > now) hygieneState.lastWash = now;
        return Math.floor((now - hygieneState.lastWash) / 1440);
    }

    function hygienePenaltyPercent() {
        const days = daysWithoutWash();
        if (days <= 7) return 0;
        if (days <= 15) return 5;
        return Math.min(60, 15 + 5 * Math.floor((days - 15) / 5 + 1));
    }

    function applySalaryHygiene(amount) {
        const pct = hygienePenaltyPercent();
        return pct > 0 ? Math.round(amount * (1 - pct / 100)) : amount;
    }

    function checkHygieneWarning() {
        const days = daysWithoutWash();
        if (days > 7 && !hygieneState.warned) {
            hygieneState.warned = true;
            addMessage('Коллеги', '🧼', 'От вас неприятно пахнет. Помойтесь дома, иначе зарплата на работах будет снижена.');
        }
    }

    function startWashing() {
        if (isSleeping) return;
        bedModal.classList.add('hidden');
        let overlay = document.getElementById('wash-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wash-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:rgba(15,23,42,.88);color:#fff;font:800 1.2rem sans-serif;text-align:center;';
            overlay.innerHTML = '<div style="font-size:3.2rem">🚿</div><div>Вы моетесь...</div><div style="font-size:.8rem;font-weight:600;opacity:.75">25 игровых минут</div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        isClockRunning = false;
        setTimeout(function () {
            gameMinutes += 25;
            advanceCalendar();
            playerHunger = clamp(playerHunger - 1.5, 0, 100);
            hygieneState.lastWash = getTotalAbsoluteMinutes();
            hygieneState.warned = false;
            overlay.style.display = 'none';
            isClockRunning = true;
            saveGameData();
            updateClockUI();
            updateStatsHUD();
            showToast('🚿 Вы помылись. Зарплата в норме');
        }, 3000);
    }

    /* =========================================================
       ЭНЕРГЕТИК И ГОЛОВОКРУЖЕНИЕ
       ========================================================= */

    function isDizzy() {
        return energyState.dizzyUntil > getTotalAbsoluteMinutes();
    }

    function energyDecayFactor() {
        return (energyState.until > getTotalAbsoluteMinutes() ? 0.5 : 1) * (travelState.restUntil > monoNow() ? 1 / 1.15 : 1);
    }

    function drinkEnergyDrink() {
        const now = getTotalAbsoluteMinutes();
        const today = absoluteDay();
        if (energyState.day !== today) {
            energyState.day = today;
            energyState.count = 0;
        }
        energyState.count += 1;
        playerHunger = clamp(playerHunger + 20, 0, 100);
        playerEnergy = clamp(playerEnergy + 85, 0, 100);
        energyState.until = now + 120;
        showToast('⚡ Энергетик выпит: энергия +85%, голод +20%');
        if (energyState.count > 2) {
            energyState.dizzyUntil = now + 180;
            energyState.dizzySleep = 0;
            addMessage('Здоровье', '🥴', 'Вы выпили больше 2 энергетиков за день. Началось головокружение на 3 часа. Поспите хотя бы 30 минут, чтобы оно прошло. Работать и садиться за руль нельзя.');
            showToast('🥴 Кружится голова!');
        }
    }

    function energyBlockedAtPurchase(drinksInCart) {
        if (drinksInCart > 1) {
            showToast('За один заказ можно взять только один энергетик');
            return true;
        }
        if (energyState.until > getTotalAbsoluteMinutes()) {
            showToast('Эффект энергетика ещё действует, повторно выпить нельзя');
            return true;
        }
        return false;
    }

    function processEnergyEffects(sleepMinutes) {
        if (energyState.dizzyUntil > 0) {
            if (sleepMinutes > 0) energyState.dizzySleep += sleepMinutes;
            if (energyState.dizzyUntil <= getTotalAbsoluteMinutes() || energyState.dizzySleep >= 30) {
                energyState.dizzyUntil = 0;
                energyState.dizzySleep = 0;
                showToast('Головокружение прошло');
            }
        }
        document.body.classList.toggle('is-dizzy', isDizzy());
    }

    function updateNeeds(deltaSeconds) {
        if (!isClockRunning) return;
        const multiplier = isSleeping ? SLEEP_TIME_MULTIPLIER : 1;
        const minutesPassed = deltaSeconds * GAME_MINUTES_PER_REAL_SECOND * multiplier;

        if (isSleeping) {
            playerHunger = clamp(playerHunger - (minutesPassed / (HUNGER_EMPTY_HOURS * 60)) * 100 / SLEEP_HUNGER_SLOWDOWN, 0, 100);
            playerSleep = clamp(playerSleep + (minutesPassed / (SLEEP_RESTORE_HOURS * 60)) * 100, 0, 100);
            processEnergyEffects(minutesPassed);
            playerEnergy = clamp(playerEnergy + (minutesPassed / (ENERGY_RESTORE_HOURS * 60)) * 100, 0, 100);
            if (playerSleep >= 100) wakeUp(true);
        } else {
            playerHunger = clamp(playerHunger - (minutesPassed / (HUNGER_EMPTY_HOURS * 60)) * 100, 0, 100);
            playerSleep = clamp(playerSleep - (minutesPassed / (SLEEP_EMPTY_HOURS * 60)) * 100, 0, 100);
            playerEnergy = clamp(playerEnergy - (minutesPassed / (ENERGY_EMPTY_HOURS * 60)) * 100 * (isPlayerWorking() ? 1.11 : 1) * energyDecayFactor(), 0, 100);
        }

        gameMinutes += minutesPassed;
        advanceCalendar();
        processInterviewDeadline();
        xjProcessDeadlines();
        processTaxOneDayReminders();
        processFineOneDayReminders();
        processTaxesExpiration();
        processFinesExpiration();
        processFoodDeliveries();
        processEnergyEffects(0);
        processBackpackDeliveries();
        processPhoneQueues();
        processTravel();
        processYoutube();
        processBank();
        checkHygieneWarning();

        if (cashierShiftState.active && !cashierShiftState.shiftCompleted) {
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
        camera.minZoom = fit * 1.55;
        camera.maxZoom = fit * 4.5;
        camera.zoom = camera.minZoom;
        camera.x = innerWidth / 2;
        const centeredMap = getMapDimensions();
        camera.y = innerHeight / 2 + (0.5 - 0.505) * centeredMap.h;
        clampCamera();
    }

    function clampCamera() {
        const map = getMapDimensions();
        if (map.w <= innerWidth) camera.x = innerWidth / 2;
        else camera.x = clamp(camera.x, innerWidth - map.w / 2, map.w / 2);
        if (map.h <= innerHeight) camera.y = innerHeight / 2;
        else camera.y = clamp(camera.y, innerHeight - map.h / 2, map.h / 2);
    }

    let renderScale = 1;
    let forceRender = true;
    const mapLayer = document.createElement('canvas');
    const mapLayerCtx = mapLayer.getContext('2d');
    let mapLayerKey = '';

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        /* Плотность пикселей ограничена: на телефонах с 3x экраном карта рисовалась в 2,25 раза тяжелее, а разницы глазом почти нет */
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderScale = dpr;
        canvas.width = Math.round(innerWidth * dpr);
        canvas.height = Math.round(innerHeight * dpr);
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mapLayerKey = '';
        markerSpriteCache.clear();
        forceRender = true;
    }

    /* Метки рисуются один раз в маленькие картинки и дальше только копируются: свечение (shadowBlur) на телефонах очень тяжёлое */
    const markerSpriteCache = new Map();

    function makeSprite(width, height, drawFn) {
        const sprite = document.createElement('canvas');
        sprite.width = Math.ceil(width * renderScale);
        sprite.height = Math.ceil(height * renderScale);
        const spriteCtx = sprite.getContext('2d');
        spriteCtx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
        drawFn(spriteCtx);
        return { canvas: sprite, w: width, h: height };
    }

    function getMarkerBodySprite(color, icon, glowColor, zoom) {
        const key = 'b|' + color + '|' + icon + '|' + glowColor + '|' + zoom;
        let entry = markerSpriteCache.get(key);
        if (entry) return entry;
        const width = Math.max(28, 36 * zoom);
        const height = Math.max(32, 42 * zoom);
        const pad = 26;
        entry = makeSprite(width + pad * 2, height + pad * 2, function (c) {
            const cx = pad + width / 2;
            const cy = pad + height / 2;
            c.shadowColor = glowColor || color;
            c.shadowBlur = 15;
            c.beginPath();
            c.moveTo(cx, cy + height / 2);
            c.lineTo(cx - width / 2, cy - height / 2);
            c.lineTo(cx + width / 2, cy - height / 2);
            c.closePath();
            c.fillStyle = color;
            c.fill();
            c.strokeStyle = '#ffffff';
            c.lineWidth = Math.max(2, 3 * zoom);
            c.stroke();
            c.font = Math.max(16, 22 * zoom) + 'px sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.shadowBlur = 4;
            c.shadowColor = '#000000';
            c.fillStyle = '#ffffff';
            c.fillText(icon, cx, cy - 2 * zoom);
        });
        entry.cx = pad + width / 2;
        entry.cy = pad + height / 2;
        if (markerSpriteCache.size > 120) markerSpriteCache.clear();
        markerSpriteCache.set(key, entry);
        return entry;
    }

    function getMarkerLabelSprite(color, label, zoom) {
        const key = 'l|' + color + '|' + label + '|' + zoom;
        let entry = markerSpriteCache.get(key);
        if (entry) return entry;
        const pad = 10;
        const fontSize = Math.max(10, Math.round(12 * zoom));
        const measureCtx = mapLayerCtx;
        measureCtx.save();
        measureCtx.font = '900 ' + fontSize + 'px Montserrat, sans-serif';
        const textWidth = measureCtx.measureText(label).width;
        measureCtx.restore();
        const pillW = textWidth + 14;
        const pillH = Math.max(18, 20 * zoom);
        entry = makeSprite(pillW + pad * 2, pillH + pad * 2, function (c) {
            c.shadowColor = '#000000';
            c.shadowBlur = 4;
            c.font = '900 ' + fontSize + 'px Montserrat, sans-serif';
            c.textAlign = 'center';
            c.fillStyle = 'rgba(15, 23, 42, 0.88)';
            c.strokeStyle = color;
            c.lineWidth = 1.5;
            c.beginPath();
            if (c.roundRect) c.roundRect(pad, pad, pillW, pillH, 8);
            else c.rect(pad, pad, pillW, pillH);
            c.fill();
            c.stroke();
            c.fillStyle = '#ffffff';
            c.textBaseline = 'middle';
            c.fillText(label, pad + pillW / 2, pad + pillH / 2);
        });
        entry.cx = pad + pillW / 2;
        entry.top = pad;
        if (markerSpriteCache.size > 120) markerSpriteCache.clear();
        markerSpriteCache.set(key, entry);
        return entry;
    }

    if (document.fonts && document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', function () { markerSpriteCache.clear(); forceRender = true; });
    }

    function drawMarker(x, y, color, icon, label, glowColor) {
        if (x < -120 || x > innerWidth + 120 || y < -120 || y > innerHeight + 120) return { x: x, y: y };

        const zoom = Math.round(camera.zoom * 25) / 25;
        const markerY = y - 38 * camera.zoom + Math.sin(animTimer * 1.5) * 6;

        const body = getMarkerBodySprite(color, icon, glowColor, zoom);
        ctx.drawImage(body.canvas, x - body.cx, markerY - body.cy, body.w, body.h);

        if (label) {
            const pill = getMarkerLabelSprite(color, label, zoom);
            ctx.drawImage(pill.canvas, x - pill.cx, y + 10 * camera.zoom - pill.top, pill.w, pill.h);
        }
        return { x: x, y: y };
    }

    function render() {
        if (!ctx) return;
        const map = getMapDimensions();
        const left = camera.x - map.w / 2;
        const top = camera.y - map.h / 2;
        /* Огромная карта перерисовывается только когда её сдвинули или приблизили, в остальное время копируется готовая картинка экрана */
        const layerKey = canvas.width + 'x' + canvas.height + '|' + left.toFixed(1) + '|' + top.toFixed(1) + '|' + map.w.toFixed(1) + '|' + (isMapLoaded ? 1 : 0);
        if (layerKey !== mapLayerKey) {
            mapLayerKey = layerKey;
            if (mapLayer.width !== canvas.width || mapLayer.height !== canvas.height) {
                mapLayer.width = canvas.width;
                mapLayer.height = canvas.height;
            }
            mapLayerCtx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
            mapLayerCtx.clearRect(0, 0, innerWidth, innerHeight);
            mapLayerCtx.imageSmoothingEnabled = true;
            if (isMapLoaded) mapLayerCtx.drawImage(mapImg, left, top, map.w, map.h);
            else {
                mapLayerCtx.fillStyle = '#1e293b';
                mapLayerCtx.fillRect(left, top, map.w, map.h);
            }
        }
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.drawImage(mapLayer, 0, 0, innerWidth, innerHeight);

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

        xjDrawMarkers(left, top, map);
        drawMarker(left + map.w * MAP_POINTS.airport.x, top + map.h * MAP_POINTS.airport.y, '#0ea5e9', '✈️', 'Аэропорт', '#7dd3fc');
        let playerPoint = { x: homeX + 34 * camera.zoom, y: homeY };
        if (lastExitedLocation === 'firestation') playerPoint = { x: fireX + 34 * camera.zoom, y: fireY };
        if (lastExitedLocation === 'truckstation') playerPoint = { x: truckX + 34 * camera.zoom, y: truckY };
        if (lastExitedLocation === 'market') playerPoint = { x: marketX + 34 * camera.zoom, y: marketY };
        const xjPoint = xjPlayerPoint(left, top, map);
        if (xjPoint) playerPoint = xjPoint;
        if (lastExitedLocation === 'airport') playerPoint = { x: left + map.w * MAP_POINTS.airport.x + 34 * camera.zoom, y: top + map.h * MAP_POINTS.airport.y };

        ctx.save();
        const size = Math.max(48, 62 * camera.zoom);
        if (playerSpriteImg.complete && playerSpriteImg.naturalWidth) {
            ctx.drawImage(getPlayerSpriteSmall(), playerPoint.x - size / 2, playerPoint.y - size / 2, size, size);
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

        points.push({ key: 'airport', x: left + map.w * MAP_POINTS.airport.x, y: top + map.h * MAP_POINTS.airport.y, active: true });
        xjAddMapPoints(points, left, top, map);
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
        xjHideScreens(); hideAirportScreen();
                cashierWorkScreen.classList.add('hidden');
                /* HUD всегда виден */
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
                } else if (point.key === 'airport') {
                    showAirportScreen();
                } else if (XJ_LOCATIONS[point.key]) {
            currentScreen = point.key;
            xjShowScreen(point.key);
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
                if (Math.hypot(touch.clientX - startX, touch.clientY - startY) < 15) {
                    /* Без этого браузер после касания метки «нажимает» ещё раз уже по кнопке нового окна (например, сразу выбирает такси) */
                    if (event.cancelable) event.preventDefault();
                    checkMapPointClick(touch.clientX, touch.clientY);
                }
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
        const dirtyDays = daysWithoutWash();
        bedModalText.textContent = 'Во время сна время ускоряется в 7 раз. Не мылись дней: ' + dirtyDays + (hygienePenaltyPercent() > 0 ? ' (зарплата -' + hygienePenaltyPercent() + '%)' : '') + '.';
        btnSleepAction.classList.toggle('hidden', playerSleep >= 100);
        let washButton = document.getElementById('btn-wash-action');
        if (!washButton) {
            washButton = document.createElement('button');
            washButton.id = 'btn-wash-action';
            washButton.type = 'button';
            washButton.className = btnSleepAction.className;
            washButton.textContent = '🚿 Помыться (25 мин)';
            washButton.addEventListener('click', startWashing);
            btnSleepAction.parentNode.insertBefore(washButton, btnSleepAction.nextSibling);
        }
        washButton.classList.remove('hidden');
        bedModal.classList.remove('hidden');
    }

    /* =========================================================
       ОТКРЫТИЕ ПРИЛОЖЕНИЙ
       ========================================================= */

    function openPhoneApp(name) {
        stopOfflineGame();
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
        else if (name === 'compania') renderCompanyApp();
        else if (name === 'business') renderBusinessApp();
        else if (name === 'zakaz') renderOrderApp();
        else if (name === 'poisk') renderSearchApp();
        else if (name === 'playstore') renderPlayStore();
        else if (name === 'market') renderMarketApp();
        else if (name === 'tickets') renderTicketsApp();
        else if (name === 'youtube') renderYoutubeApp();
        else if (name === 'games') renderGamesApp();
        else if (name === 'casino') {
            lottoState.step = 'select_tier';
            renderLottoApp();
        } else {
            appScrollableBody.innerHTML = '<div class="empty-app-page"><h3>В разработке</h3><p>Функционал появится позже.</p></div>';
        }
    }

    function closePhoneApp() {
        stopOfflineGame();
        phoneAppsGrid.classList.remove('hidden');
        phoneAppContent.classList.add('hidden');
        phoneStatusBar.classList.remove('dark-status');
        currentPhoneApp = null;
        phoneView = 'home';
        currentOpenedMessage = null;
    }

    /* =========================================================
       ТЕЛЕФОН: GOOGLE PLAY, РАБОЧИЙ СТОЛ (3×5, свайп, перетаскивание), МАРКЕТПЛЕЙС
       ========================================================= */
    const PHONE_PAGE_SIZE = 15;
    const PHONE_MODELS = {
        basic: { title: 'Обычный телефон', cap: 6, wallpaper: 'linear-gradient(180deg, #60a5fa 0%, #c084fc 100%)' },
        phone15: { title: 'Смартфон Pro', cap: 10, wallpaper: 'linear-gradient(160deg, #38bdf8 0%, #6366f1 55%, #a78bfa 100%)' },
        phone33: { title: 'Смартфон Ultra', cap: 25, wallpaper: 'linear-gradient(155deg, #0ea5e9 0%, #8b5cf6 45%, #f472b6 100%)' }
    };

    const PLAY_CATALOG = [
        { id: 'taxi', name: 'Такси', emoji: '🚕', size: 38, desc: 'Быстро вызовите такси в любую точку города.' },
        { id: 'work', name: 'Работа.ру', emoji: '💼', size: 52, desc: 'Вакансии, собеседования и трудоустройство.' },
        { id: 'shtraf', name: 'Штрафы', emoji: '⚠️', size: 21, desc: 'Штрафы и их оплата.' },
        { id: 'plat', name: 'Оплата', emoji: '🧾', size: 18, desc: 'Налоги и платежи в одном месте.' },
        { id: 'karta', name: 'Счёт', emoji: '💳', size: 64, desc: 'Баланс, история операций и переводы.' },
        { id: 'eda', name: 'Еда', emoji: '🍔', size: 57, desc: 'Доставка продуктов и готовой еды.' },
        { id: 'avto', name: 'Авто.ру', emoji: '🚗', size: 88, desc: 'Покупка автомобилей и велосипеда.' },
        { id: 'imushka', name: 'Имущество', emoji: '🏡', size: 69, desc: 'Квартира, машины и бизнесы. Заправка авто.' },
        { id: 'business', name: 'Бизнес', emoji: '🏪', size: 96, desc: 'Свои бизнесы, склад и работники.' },
        { id: 'compania', name: 'Компания', emoji: '🌍', size: 118, desc: 'Покупка мировых компаний и прибыль.' },
        { id: 'zakaz', name: 'Заказ', emoji: '📦', size: 61, desc: 'Заказ товаров для бизнеса.' },
        { id: 'kollectiv', name: 'Коллектив', emoji: '👥', size: 47, desc: 'Ваши службы и задания коллектива.' },
        { id: 'casino', name: 'Лотерея', emoji: '🎰', size: 74, desc: 'Национальная лотерея со своей суммой.' },
        { id: 'poisk', name: 'Поиск', emoji: '🔎', size: 33, desc: 'Ответы на частые вопросы по игре.' },
        { id: 'market', name: 'Маркетплейс', emoji: '🛍️', size: 134, desc: 'Камеры, микрофон, компьютер и новые телефоны.' },
        { id: 'tickets', name: 'Билеты.би', emoji: '✈️', size: 98, desc: 'Авиабилеты на море и в другие страны. Аэропорт на карте.' },
        { id: 'youtube', name: 'Ютуб', emoji: '▶️', size: 150, desc: 'Свой канал, ролики и стримы. Нужна техника из Маркетплейса.' },
        { id: 'games', name: 'Игры оффлайн', emoji: '🎮', size: 120, desc: '5 простых игр: динозаврик, птичка, змейка, тетрис, 2048.' }
    ];

    const MARKET_ITEMS = [
        { id: 'cam_stream', name: 'Камера для стримера', emoji: '📷', price: 35000, desc: 'Нужна для стримов.' },
        { id: 'cam_youtube', name: 'Камера для ютубера', emoji: '🎥', price: 65000, desc: 'Нужна для съёмки роликов.' },
        { id: 'computer', name: 'Компьютер', emoji: '🖥️', price: 215000, desc: 'Для монтажа и стримов.' },
        { id: 'mic', name: 'Микрофон', emoji: '🎙️', price: 40000, desc: 'Студийный звук для роликов и стримов.' },
        { id: 'phone15', name: 'Смартфон Pro', emoji: '📱', price: 15000, desc: 'Вмещает 10 приложений. Новые обои.', phoneModel: 'phone15' },
        { id: 'phone33', name: 'Смартфон Ultra', emoji: '📲', price: 33000, desc: 'Вмещает 25 приложений. Премиальные обои.', phoneModel: 'phone33' }
    ];

    const APP_NODES = {};
    let phonePage = 0;
    let lastPlayRender = 0;
    let pgDown = null;
    let pgDrag = null;
    let pgSuppress = false;
    let pgEdgeTimer = null;

    function phoneModelInfo() { return PHONE_MODELS[phoneState.model] || PHONE_MODELS.basic; }
    function phoneSlotsMax() { return phoneModelInfo().cap - 1; }
    function phoneSlotsUsed() { return phoneState.installed.length + phoneState.pendingInstalls.length; }
    function playApp(id) { return PLAY_CATALOG.find(function (app) { return app.id === id; }); }
    function installMinutes(app) { return Math.round(3 + Math.min(1, Math.max(0, (app.size - 15) / 135)) * 12); }
    function pendingInstallOf(id) { return phoneState.pendingInstalls.find(function (p) { return p.id === id; }); }
    function pendingRemovalOf(id) { return phoneState.pendingRemovals.find(function (p) { return p.id === id; }); }

    function sanitizePhoneState() {
        ['installed', 'layout', 'pendingInstalls', 'pendingRemovals'].forEach(function (key) {
            if (!Array.isArray(phoneState[key])) phoneState[key] = [];
        });
        if (!Array.isArray(marketState.pending)) marketState.pending = [];
        if (!marketState.owned || typeof marketState.owned !== 'object') marketState.owned = {};
        if (!PHONE_MODELS[phoneState.model]) phoneState.model = 'basic';
        phoneState.installed = phoneState.installed.filter(function (id, i, arr) { return playApp(id) && !playApp(id).soon && arr.indexOf(id) === i; });
        const seen = {};
        const layout = [];
        phoneState.layout.concat(['playstore', 'sms'], phoneState.installed).forEach(function (id) {
            const valid = id === 'playstore' || id === 'sms' || phoneState.installed.indexOf(id) !== -1;
            if (valid && !seen[id]) { seen[id] = true; layout.push(id); }
        });
        phoneState.layout = layout;
    }

    function getAppNode(id) {
        if (APP_NODES[id]) return APP_NODES[id];
        const app = id === 'playstore' ? { name: 'Google Play', emoji: '▶️' } : (playApp(id) || { name: id, emoji: '📱' });
        const node = document.createElement('div');
        node.className = 'app-item';
        node.dataset.app = id;
        node.innerHTML = '<div class="app-icon-wrapper"><img src="logo/' + id + '.png" alt="' + app.name + '" onerror="this.style.display=\'none\';this.parentNode.setAttribute(\'data-emoji\',\'' + app.emoji + '\')"></div><span>' + app.name + '</span>';
        node.addEventListener('click', function () { openPhoneApp(id); });
        APP_NODES[id] = node;
        return node;
    }

    function renderPhoneHome() {
        sanitizePhoneState();
        phoneAppsGrid.classList.add('pg-mode');
        phoneAppsGrid.style.background = phoneModelInfo().wallpaper;
        const layout = phoneState.layout;
        const pageCount = Math.max(1, Math.ceil(layout.length / PHONE_PAGE_SIZE));
        phonePage = Math.max(0, Math.min(pageCount - 1, phonePage));
        phoneAppsGrid.innerHTML = '';
        const viewport = document.createElement('div');
        viewport.className = 'pg-viewport';
        const track = document.createElement('div');
        track.className = 'pg-track';
        track.style.transform = 'translateX(' + (-phonePage * 100) + '%)';
        for (let p = 0; p < pageCount; p += 1) {
            const page = document.createElement('div');
            page.className = 'pg-page';
            layout.slice(p * PHONE_PAGE_SIZE, (p + 1) * PHONE_PAGE_SIZE).forEach(function (id) { page.appendChild(getAppNode(id)); });
            track.appendChild(page);
        }
        viewport.appendChild(track);
        phoneAppsGrid.appendChild(viewport);
        const dots = document.createElement('div');
        dots.className = 'pg-dots';
        for (let d = 0; d < pageCount; d += 1) {
            const dot = document.createElement('i');
            if (d === phonePage) dot.className = 'on';
            dots.appendChild(dot);
        }
        phoneAppsGrid.appendChild(dots);
    }

    function setPhonePage(page) {
        const pageCount = Math.max(1, Math.ceil(phoneState.layout.length / PHONE_PAGE_SIZE));
        const next = Math.max(0, Math.min(pageCount - 1, page));
        if (next === phonePage) return;
        phonePage = next;
        const track = phoneAppsGrid.querySelector('.pg-track');
        if (track) track.style.transform = 'translateX(' + (-phonePage * 100) + '%)';
        phoneAppsGrid.querySelectorAll('.pg-dots i').forEach(function (dot, i) { dot.className = i === phonePage ? 'on' : ''; });
    }

    function pgTargetIndex(x, y) {
        const track = phoneAppsGrid.querySelector('.pg-track');
        const pageEl = track && track.children[phonePage];
        if (!pageEl) return -1;
        const rect = pageEl.getBoundingClientRect();
        const col = Math.max(0, Math.min(2, Math.floor((x - rect.left - 16) / ((rect.width - 32) / 3))));
        const row = Math.max(0, Math.min(4, Math.floor((y - rect.top) / (rect.height / 5))));
        return Math.min(phoneState.layout.length - 1, phonePage * PHONE_PAGE_SIZE + row * 3 + col);
    }

    function startPgDrag() {
        if (!pgDown || !pgDown.item || pgDrag) return;
        const item = pgDown.item;
        const rect = item.getBoundingClientRect();
        const ghost = item.cloneNode(true);
        ghost.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:' + rect.width + 'px;transform:scale(1.15);opacity:.92;filter:drop-shadow(0 8px 14px rgba(0,0,0,.4));margin:0;';
        document.body.appendChild(ghost);
        item.style.opacity = '0.25';
        pgDrag = { id: item.dataset.app, item: item, ghost: ghost, w: rect.width, h: rect.height };
        try { phoneAppsGrid.setPointerCapture(pgDown.pointerId); } catch (e) { /* ignore */ }
        if (navigator.vibrate) navigator.vibrate(15);
        movePgGhost(pgDown.lx, pgDown.ly);
    }

    function movePgGhost(x, y) {
        if (!pgDrag) return;
        pgDrag.ghost.style.left = (x - pgDrag.w / 2) + 'px';
        pgDrag.ghost.style.top = (y - pgDrag.h / 2) + 'px';
        const viewport = phoneAppsGrid.querySelector('.pg-viewport');
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const pageCount = Math.max(1, Math.ceil(phoneState.layout.length / PHONE_PAGE_SIZE));
        let dir = 0;
        if (x < rect.left + 28 && phonePage > 0) dir = -1;
        else if (x > rect.right - 28 && phonePage < pageCount - 1) dir = 1;
        if (dir === 0) {
            clearTimeout(pgEdgeTimer);
            pgEdgeTimer = null;
        } else if (!pgEdgeTimer) {
            pgEdgeTimer = setTimeout(function () { pgEdgeTimer = null; setPhonePage(phonePage + dir); }, 650);
        }
    }

    function endPgDrag(x, y) {
        const drag = pgDrag;
        pgDrag = null;
        clearTimeout(pgEdgeTimer);
        pgEdgeTimer = null;
        if (!drag) return;
        drag.ghost.remove();
        drag.item.style.opacity = '';
        const from = phoneState.layout.indexOf(drag.id);
        const to = pgTargetIndex(x, y);
        if (from !== -1 && to !== -1 && from !== to) {
            phoneState.layout.splice(from, 1);
            phoneState.layout.splice(to, 0, drag.id);
            saveGameData();
        }
        renderPhoneHome();
    }

    function bindPhoneGestures() {
        phoneAppsGrid.style.touchAction = 'none';
        phoneAppsGrid.addEventListener('pointerdown', function (event) {
            if (!phoneAppsGrid.querySelector('.pg-viewport')) return;
            pgDown = { x: event.clientX, y: event.clientY, lx: event.clientX, ly: event.clientY, pointerId: event.pointerId, item: event.target.closest('.app-item'), swiped: false, timer: null };
            if (pgDown.item) pgDown.timer = setTimeout(startPgDrag, 450);
        });
        phoneAppsGrid.addEventListener('pointermove', function (event) {
            if (!pgDown) return;
            pgDown.lx = event.clientX;
            pgDown.ly = event.clientY;
            if (pgDrag) {
                movePgGhost(event.clientX, event.clientY);
                return;
            }
            if (Math.abs(event.clientX - pgDown.x) > 10 || Math.abs(event.clientY - pgDown.y) > 10) {
                clearTimeout(pgDown.timer);
                if (Math.abs(event.clientX - pgDown.x) > 10) pgDown.swiped = true;
            }
        });
        function finish(event) {
            if (!pgDown) return;
            clearTimeout(pgDown.timer);
            const down = pgDown;
            pgDown = null;
            if (pgDrag) {
                endPgDrag(event.clientX, event.clientY);
                pgSuppress = true;
            } else if (down.swiped) {
                const dx = event.clientX - down.x;
                if (Math.abs(dx) > 45) setPhonePage(phonePage + (dx < 0 ? 1 : -1));
                pgSuppress = true;
            }
            setTimeout(function () { pgSuppress = false; }, 90);
        }
        phoneAppsGrid.addEventListener('pointerup', finish);
        phoneAppsGrid.addEventListener('pointercancel', finish);
        phoneAppsGrid.addEventListener('click', function (event) {
            if (pgSuppress) {
                event.stopPropagation();
                event.preventDefault();
                pgSuppress = false;
            }
        }, true);
    }

    function installApp(app) {
        if (app.soon) { showToast('Это приложение скоро появится'); return; }
        if (phoneState.installed.indexOf(app.id) !== -1 || pendingInstallOf(app.id)) return;
        if (phoneSlotsUsed() >= phoneSlotsMax()) {
            showToast('Память приложений заполнена. Удалите приложение или купите телефон в Маркетплейсе');
            return;
        }
        const now = getTotalAbsoluteMinutes();
        phoneState.pendingInstalls.push({ id: app.id, start: now, done: now + installMinutes(app) });
        saveGameData();
        renderPlayStore(true);
        showToast('Загрузка «' + app.name + '» началась');
    }

    function removeApp(app) {
        if (pendingRemovalOf(app.id)) return;
        phoneState.pendingRemovals.push({ id: app.id, at: getTotalAbsoluteMinutes() + 2 });
        saveGameData();
        renderPlayStore(true);
        showToast('«' + app.name + '» будет удалено через 2 игровые минуты');
    }

    function renderPlayStore(keepScroll) {
        if (currentPhoneApp !== 'playstore') return;
        const prevScroll = keepScroll ? appScrollableBody.scrollTop : 0;
        lastPlayRender = performance.now();
        const now = getTotalAbsoluteMinutes();
        const wrap = document.createElement('div');
        wrap.className = 'ps-wrap';
        wrap.innerHTML = '<div class="ps-header"><div class="ps-title">▶️ Google Play</div><div class="ps-sub">' + phoneModelInfo().title + ' • приложений: ' + phoneSlotsUsed() + ' / ' + phoneSlotsMax() + '</div></div>';
        PLAY_CATALOG.forEach(function (app) {
            const installed = phoneState.installed.indexOf(app.id) !== -1;
            const pending = pendingInstallOf(app.id);
            const removing = pendingRemovalOf(app.id);
            const card = document.createElement('div');
            card.className = 'ps-card';
            let status = '<div class="ps-meta">' + app.size + ' МБ • загрузка ~' + installMinutes(app) + ' мин</div>';
            let button = '<button type="button" class="ps-btn">Установить</button>';
            if (app.soon) {
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>Скоро</button>';
            } else if (pending) {
                const percent = Math.min(99, Math.max(1, Math.round((now - pending.start) / Math.max(1, pending.done - pending.start) * 100)));
                status = '<div class="ps-meta">Загрузка ' + percent + '% • осталось ~' + Math.max(1, Math.ceil(pending.done - now)) + ' мин</div><div class="ps-progress"><i style="width:' + percent + '%"></i></div>';
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>Загрузка…</button>';
            } else if (installed && removing) {
                status = '<div class="ps-meta">Удаляется…</div>';
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>Удаление</button>';
            } else if (installed) {
                status = '<div class="ps-meta">✓ Установлено • ' + app.size + ' МБ</div>';
                button = '<button type="button" class="ps-btn ps-btn-del">Удалить</button>';
            }
            card.innerHTML = '<div class="ps-icon"><span>' + app.emoji + '</span><img src="logo/' + app.id + '.png" alt="" onerror="this.remove()"></div><div class="ps-info"><div class="ps-name">' + app.name + '</div><div class="ps-desc">' + app.desc + '</div>' + status + '</div>' + button;
            const btn = card.querySelector('.ps-btn');
            if (!btn.disabled) {
                btn.addEventListener('click', function () { if (installed) removeApp(app); else installApp(app); });
            }
            wrap.appendChild(card);
        });
        appScrollableBody.innerHTML = '';
        appScrollableBody.appendChild(wrap);
        appScrollableBody.scrollTop = prevScroll;
    }

    function renderMarketApp(keepScroll) {
        if (currentPhoneApp !== 'market') return;
        const prevScroll = keepScroll ? appScrollableBody.scrollTop : 0;
        const now = getTotalAbsoluteMinutes();
        const wrap = document.createElement('div');
        wrap.className = 'ps-wrap';
        wrap.innerHTML = '<div class="ps-header ps-header-market"><div class="ps-title">🛍️ Маркетплейс</div><div class="ps-sub">Доставка товаров — 24 игровых часа</div></div>';
        MARKET_ITEMS.forEach(function (item) {
            const owned = !!marketState.owned[item.id] || (item.phoneModel && phoneState.model === item.phoneModel);
            const pending = marketState.pending.find(function (p) { return p.id === item.id; });
            const worse = item.phoneModel && PHONE_MODELS[item.phoneModel].cap <= phoneModelInfo().cap;
            const card = document.createElement('div');
            card.className = 'ps-card';
            let status = '<div class="ps-meta">' + item.price.toLocaleString('ru-RU') + ' ₽</div>';
            let button = '<button type="button" class="ps-btn">Купить</button>';
            if (owned) {
                status = '<div class="ps-meta">✓ ' + (item.phoneModel ? 'Это ваш телефон' : 'Куплено') + '</div>';
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>Есть</button>';
            } else if (pending) {
                status = '<div class="ps-meta">📦 Доставка: ещё ~' + Math.max(1, Math.ceil((pending.at - now) / 60)) + ' ч</div>';
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>В пути</button>';
            } else if (worse) {
                status = '<div class="ps-meta">У вас уже лучше или такой же</div>';
                button = '<button type="button" class="ps-btn ps-btn-off" disabled>—</button>';
            }
            card.innerHTML = '<div class="ps-icon"><span>' + item.emoji + '</span></div><div class="ps-info"><div class="ps-name">' + item.name + '</div><div class="ps-desc">' + item.desc + '</div>' + status + '</div>' + button;
            const btn = card.querySelector('.ps-btn');
            if (!btn.disabled) btn.addEventListener('click', function () { buyMarketItem(item); });
            wrap.appendChild(card);
        });
        appScrollableBody.innerHTML = '';
        appScrollableBody.appendChild(wrap);
        appScrollableBody.scrollTop = prevScroll;
    }

    function buyMarketItem(item) {
        if (marketState.owned[item.id] || marketState.pending.some(function (p) { return p.id === item.id; })) return;
        if (playerMoney < item.price) { showToast('Недостаточно денег'); return; }
        playerMoney -= item.price;
        addBankTransaction('Маркетплейс: ' + item.name, item.price, false);
        marketState.pending.push({ id: item.id, at: getTotalAbsoluteMinutes() + 1440 });
        addMessage('Маркетплейс', '🛍️', 'Заказ «' + item.name + '» успешно оформлен. Доставка в течение 24 часов.');
        saveGameData();
        updateClockUI();
        renderMarketApp(true);
        showToast('🛍️ Заказ оформлен. Придёт через 24 часа');
    }

    function processPhoneQueues() {
        const now = getTotalAbsoluteMinutes();
        let homeChanged = false;
        let storeChanged = false;
        for (let i = phoneState.pendingInstalls.length - 1; i >= 0; i -= 1) {
            const job = phoneState.pendingInstalls[i];
            if (job.done <= now) {
                phoneState.pendingInstalls.splice(i, 1);
                if (phoneState.installed.indexOf(job.id) === -1) phoneState.installed.push(job.id);
                phoneState.layout.push(job.id);
                const app = playApp(job.id);
                if (app) showToast('✅ Установлено: ' + app.name);
                homeChanged = storeChanged = true;
            }
        }
        for (let i = phoneState.pendingRemovals.length - 1; i >= 0; i -= 1) {
            const job = phoneState.pendingRemovals[i];
            if (job.at <= now) {
                phoneState.pendingRemovals.splice(i, 1);
                phoneState.installed = phoneState.installed.filter(function (id) { return id !== job.id; });
                phoneState.layout = phoneState.layout.filter(function (id) { return id !== job.id; });
                homeChanged = storeChanged = true;
            }
        }
        for (let i = marketState.pending.length - 1; i >= 0; i -= 1) {
            const order = marketState.pending[i];
            if (order.at <= now) {
                marketState.pending.splice(i, 1);
                const item = MARKET_ITEMS.find(function (m) { return m.id === order.id; });
                if (!item) continue;
                if (item.phoneModel) {
                    phoneState.model = item.phoneModel;
                    homeChanged = true;
                    addMessage('Маркетплейс', '📦', 'Ваш новый телефон «' + item.name + '» доставлен и настроен. Теперь в нём можно хранить больше приложений, а ещё появились новые обои.');
                } else {
                    marketState.owned[item.id] = true;
                    addMessage('Маркетплейс', '📦', 'Заказ «' + item.name + '» доставлен.');
                }
                showToast('📦 Доставлено: ' + item.name);
                storeChanged = true;
            }
        }
        if (homeChanged && !pgDrag) renderPhoneHome();
        if (homeChanged || storeChanged) saveGameData();
        if (phoneView === 'app' && (storeChanged || performance.now() - lastPlayRender > 1000)) {
            if (currentPhoneApp === 'playstore') renderPlayStore(true);
            else if (currentPhoneApp === 'market' && storeChanged) renderMarketApp(true);
        }
    }

    function initPhoneHome() {
        phoneAppsGrid.querySelectorAll('.app-item').forEach(function (node) {
            APP_NODES[node.dataset.app] = node;
            node.remove();
        });
        sanitizePhoneState();
        bindPhoneGestures();
        renderPhoneHome();
    }

    /* =========================================================
       БИЛЕТЫ.БИ, АЭРОПОРТ, ПОЛЁТ И ОТПУСК
       ========================================================= */
    const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    function travelCommonActs(f, allInc) {
        return [
            { id: 'walk', emoji: '🚶', name: 'Прогулка по городу', cost: 0, min: 90, hunger: -4, energy: -3, text: 'Вы бродили по улочкам, фотографировали и узнали много нового.' },
            { id: 'food', emoji: '🍽️', name: 'Местная кухня', cost: allInc ? 0 : Math.round(1200 * f), min: 60, hunger: 45, energy: 8, text: 'Вы попробовали местные блюда. Очень вкусно!' },
            { id: 'relax', emoji: '🧖', name: 'Отдых и расслабление', cost: Math.round(2500 * f), min: 120, hunger: -3, energy: 35, text: 'Вы отлично расслабились и набрались сил.' },
            { id: 'souvenir', emoji: '🎁', name: 'Сувенирная лавка', cost: Math.round(1500 * f), min: 30, hunger: 0, energy: 0, souvenir: true, text: 'Вы купили сувенир на память об этом путешествии.' }
        ];
    }

    const FLIGHT_DESTS = [
        { id: 'armenia', name: 'Армения', emoji: '🇦🇲', days: 7, price: 35000, hours: 3, allInc: false, f: 1, theme: 'linear-gradient(160deg,#f97316,#7c3aed)', info: 'Билеты туда и обратно',
          acts: [{ id: 'ararat', emoji: '🏔️', name: 'Вид на Арарат', cost: 3000, min: 180, hunger: -8, energy: -6, text: 'Вы увидели величественный Арарат на рассвете. Невероятные кадры!' },
                 { id: 'cascade', emoji: '🏛️', name: 'Ереванский Каскад', cost: 1500, min: 120, hunger: -5, energy: -4, text: 'Вы поднялись по ступеням Каскада и полюбовались городом сверху.' }] },
        { id: 'egypt7', name: 'Египет, море (7 дней)', emoji: '🇪🇬', days: 7, price: 95000, hours: 5, allInc: true, f: 1.5, theme: 'linear-gradient(160deg,#f59e0b,#0ea5e9)', info: 'Всё включено',
          acts: [{ id: 'pyramids', emoji: '🔺', name: 'Пирамиды Гизы', cost: 6000, min: 240, hunger: -8, energy: -8, text: 'Вы стояли у древних пирамид и чувствовали дыхание истории.' },
                 { id: 'camel', emoji: '🐪', name: 'Сафари на верблюдах', cost: 4500, min: 150, hunger: -6, energy: -6, text: 'Вы покатались на верблюде по пустыне. Весело и необычно!' },
                 { id: 'diving', emoji: '🤿', name: 'Дайвинг у рифа', cost: 9000, min: 180, hunger: -8, energy: -12, text: 'Вы увидели яркие коралловые рифы и тропических рыб.' }] },
        { id: 'egypt10', name: 'Египет, море (10 дней)', emoji: '🇪🇬', days: 10, price: 125000, hours: 5, allInc: true, f: 1.5, theme: 'linear-gradient(160deg,#f59e0b,#0ea5e9)', info: 'Всё включено',
          acts: [{ id: 'pyramids', emoji: '🔺', name: 'Пирамиды Гизы', cost: 6000, min: 240, hunger: -8, energy: -8, text: 'Вы стояли у древних пирамид и чувствовали дыхание истории.' },
                 { id: 'camel', emoji: '🐪', name: 'Сафари на верблюдах', cost: 4500, min: 150, hunger: -6, energy: -6, text: 'Вы покатались на верблюде по пустыне. Весело и необычно!' },
                 { id: 'diving', emoji: '🤿', name: 'Дайвинг у рифа', cost: 9000, min: 180, hunger: -8, energy: -12, text: 'Вы увидели яркие коралловые рифы и тропических рыб.' }] },
        { id: 'georgia', name: 'Грузия', emoji: '🇬🇪', days: 7, price: 55000, hours: 2.5, allInc: false, f: 1, theme: 'linear-gradient(160deg,#16a34a,#7c2d12)', info: 'Билеты туда и обратно',
          acts: [{ id: 'khinkali', emoji: '🥟', name: 'Мастер-класс по хинкали', cost: 2500, min: 120, hunger: 40, energy: 5, text: 'Вы научились лепить хинкали и с аппетитом их съели.' },
                 { id: 'kazbegi', emoji: '⛰️', name: 'Горы Казбеги', cost: 5000, min: 300, hunger: -10, energy: -10, text: 'Вы поднялись к церкви Цминда-Самеба и увидели горы вблизи.' }] },
        { id: 'anapa', name: 'Анапа', emoji: '🏖️', days: 10, price: 60000, hours: 2, allInc: false, f: 0.8, theme: 'linear-gradient(160deg,#38bdf8,#fde047)', info: 'Без «всё включено»: еду нужно покупать',
          acts: [{ id: 'beach', emoji: '🏖️', name: 'Пляж и море', cost: 0, min: 180, hunger: -8, energy: 10, text: 'Вы плавали в тёплом море и загорали на песочке.' },
                 { id: 'aquapark', emoji: '🎡', name: 'Аквапарк', cost: 3500, min: 180, hunger: -8, energy: -6, text: 'Вы с визгом катались с горок. Адреналин зашкаливает!' }] },
        { id: 'spb', name: 'Санкт-Петербург', emoji: '🏰', days: 7, price: 30000, hours: 1.5, allInc: false, f: 1.2, theme: 'linear-gradient(160deg,#64748b,#1e3a8a)', info: 'Билеты туда и обратно',
          acts: [{ id: 'bridges', emoji: '🌉', name: 'Разводные мосты', cost: 0, min: 150, hunger: -6, energy: -5, text: 'Вы смотрели, как ночью разводят мосты над Невой. Волшебно!' },
                 { id: 'hermitage', emoji: '🖼️', name: 'Эрмитаж', cost: 2500, min: 180, hunger: -6, energy: -6, text: 'Вы прошлись по залам Эрмитажа и увидели шедевры живописи.' }] },
        { id: 'usa', name: 'США', emoji: '🇺🇸', days: 7, price: 55000, hours: 7, allInc: false, f: 2, theme: 'linear-gradient(160deg,#2563eb,#dc2626)', info: 'Билеты туда и обратно',
          acts: [{ id: 'liberty', emoji: '🗽', name: 'Статуя Свободы', cost: 7000, min: 240, hunger: -8, energy: -7, text: 'Вы приплыли на остров и сфотографировались у Статуи Свободы.' },
                 { id: 'broadway', emoji: '🎭', name: 'Бродвейское шоу', cost: 9000, min: 180, hunger: -5, energy: -4, text: 'Вы побывали на настоящем бродвейском мюзикле!' },
                 { id: 'themepark', emoji: '🎢', name: 'Парк аттракционов', cost: 8000, min: 240, hunger: -9, energy: -10, text: 'Вы прокатились на всех американских горках. Вот это драйв!' }] }
    ];

    const VACATION_EVENTS = [
        { text: 'Вы нашли на улице кошелёк, отнесли в полицию, и владелец подарил вам 2 000 ₽ в благодарность.', money: 2000 },
        { text: 'Местные пригласили вас на праздник, там вас угостили и подарили небольшой сувенир.', money: 0, hunger: 20 },
        { text: 'Вы познакомились с другими туристами и отлично провели вечер.', money: 0, energy: 8 },
        { text: 'Вы выиграли в местной лотерее у отеля и получили 3 500 ₽.', money: 3500 },
        { text: 'Вас заметили уличные музыканты и позвали подпевать. Это был лучший вечер поездки!', money: 0, energy: 6 },
        { text: 'Вы сделали удачное фото, и туристическое агентство заплатило вам 4 000 ₽ за снимок.', money: 4000 },
        { text: 'Гид показал вам секретное место, которого нет в путеводителях.', money: 0, energy: 5 },
        { text: 'Вы заблудились, но помогли такому же потерявшемуся туристу, и вас угостили обедом.', money: 0, hunger: 25 }
    ];

    let travelBusy = false;
    let travelLastTick = 0;
    let lastAbsSeen = 0;
    let airportEl = null;
    let flightEl = null;
    let vacationEl = null;
    let waitEl = null;

    function monoNow() {
        const abs = getTotalAbsoluteMinutes();
        if (lastAbsSeen && abs < lastAbsSeen - 100000) travelState.years = (travelState.years || 0) + 1;
        lastAbsSeen = abs;
        return abs + (travelState.years || 0) * 365 * 1440;
    }

    function fmtHM(minutes) {
        const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
        return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    }

    function fmtLeft(minutes) {
        const m = Math.max(0, Math.ceil(minutes));
        const d = Math.floor(m / 1440);
        const h = Math.floor((m % 1440) / 60);
        return (d > 0 ? d + ' д ' : '') + h + ' ч ' + (m % 60) + ' мин';
    }

    function destById(id) { return FLIGHT_DESTS.find(function (d) { return d.id === id; }); }
    function destActs(dest) { return travelCommonActs(dest.f, dest.allInc).concat(dest.acts); }
    function isFlying() { return !!(travelState.trip && (travelState.trip.phase === 'out' || travelState.trip.phase === 'back')); }
    function isOnVacation() { return !!(travelState.trip && travelState.trip.phase === 'stay'); }

    function travelBlockMessage() {
        if (isFlying()) return '✈️ Вы в самолёте';
        if (isOnVacation()) return '🏝️ Вы в отпуске: работать и ездить нельзя';
        return ytBusyMessage();
    }

    function hideAirportScreen() {
        if (airportEl) airportEl.style.display = 'none';
    }

    function showAirportScreen() {
        renderAirport();
        airportEl.style.display = 'flex';
        currentScreen = 'airport';
    }

    function renderAirport() {
        if (!airportEl) return;
        const t = travelState.ticket;
        let info = '<div class="trv-muted">У вас нет билета. Купите его в приложении «Билеты.би».</div>';
        if (t) {
            const dest = destById(t.dest);
            const left = t.depart - monoNow();
            info = '<div class="trv-big">' + dest.emoji + ' ' + dest.name + '</div><div>Вылет: ' + t.day + ' ' + MONTHS_GEN[t.month] + ' в ' + fmtHM(t.time) + '</div><div class="trv-muted">До вылета: ' + fmtLeft(left) + '. Регистрация открывается за 3 часа.</div>';
        }
        airportEl.innerHTML = '<div class="trv-card"><div class="trv-title">✈️ Аэропорт</div>' + info +
            '<button type="button" class="trv-btn" id="btn-board">🎫 Пройти регистрацию и вылететь</button><button type="button" class="trv-btn trv-btn-ghost" id="btn-exit-airport">🚪 На улицу</button></div>';
        airportEl.querySelector('#btn-board').addEventListener('click', boardFlight);
        airportEl.querySelector('#btn-exit-airport').addEventListener('click', function () {
            hideAirportScreen();
            currentScreen = 'city';
            lastExitedLocation = 'airport';
        });
    }

    function boardFlight() {
        if (ytBusyMessage()) { showToast(ytBusyMessage()); return; }
        const t = travelState.ticket;
        if (!t) { showToast('У вас нет билета. Купите его в «Билеты.би»'); return; }
        const left = t.depart - monoNow();
        if (left > 180) { showToast('Регистрация откроется за 3 часа до вылета (ещё ' + fmtLeft(left - 180) + ')'); return; }
        const dest = destById(t.dest);
        const now = monoNow();
        travelState.trip = { dest: dest.id, phase: 'out', start: now, end: now + dest.hours * 60, stayStart: 0, stayEnd: 0, eventDay: -1, done: {}, ever: {}, bonus: false };
        travelState.ticket = null;
        hideAirportScreen();
        saveGameData();
        syncTravelScreens();
        showToast('✈️ Посадка завершена. Приятного полёта!');
    }

    function buyTicket(dest, offset) {
        if (travelState.ticket || travelState.trip) { showToast('У вас уже есть билет или вы в поездке'); return; }
        if (playerMoney < dest.price) { showToast('Недостаточно денег на билет'); return; }
        const time = 360 + 5 * Math.floor(Math.random() * 205);
        const date = dateAfterDays(offset);
        playerMoney -= dest.price;
        addBankTransaction('Билеты.би: ' + dest.name, dest.price, false);
        travelState.ticket = { dest: dest.id, day: date.day, month: date.monthIndex, time: time, depart: monoNow() + offset * 1440 + time - gameMinutes, remind: false };
        addMessage('Билеты.би', '✈️', 'Куплен билет на самолёт: ' + dest.name + ', ' + date.day + ' ' + MONTHS_GEN[date.monthIndex] + ' в ' + fmtHM(time) + '. Просьба прибыть в аэропорт за 3 часа до вылета.');
        saveGameData();
        updateClockUI();
        renderTicketsApp();
        showToast('✈️ Билет куплен');
    }

    function renderTicketsApp() {
        if (currentPhoneApp !== 'tickets') return;
        const wrap = document.createElement('div');
        wrap.className = 'ps-wrap';
        wrap.innerHTML = '<div class="ps-header" style="background:linear-gradient(135deg,#0ea5e9,#6366f1)"><div class="ps-title">✈️ Билеты.би</div><div class="ps-sub">Билеты можно купить минимум за 2 дня и максимум за 30 дней до вылета. Время вылета выдаётся случайно. Аэропорт отмечен на карте.</div></div>';
        const t = travelState.ticket;
        if (t) {
            const dest = destById(t.dest);
            const card = document.createElement('div');
            card.className = 'ps-card';
            card.innerHTML = '<div class="ps-icon"><span>🎫</span></div><div class="ps-info"><div class="ps-name">Ваш билет: ' + dest.name + '</div><div class="ps-meta">' + t.day + ' ' + MONTHS_GEN[t.month] + ', вылет в ' + fmtHM(t.time) + '</div><div class="ps-desc">Прибыть в аэропорт за 3 часа до вылета.</div></div>';
            wrap.appendChild(card);
        } else if (travelState.trip) {
            const card = document.createElement('div');
            card.className = 'ps-card';
            card.innerHTML = '<div class="ps-info"><div class="ps-name">Вы сейчас в поездке</div><div class="ps-desc">Новые билеты можно купить после возвращения.</div></div>';
            wrap.appendChild(card);
        }
        FLIGHT_DESTS.forEach(function (dest) {
            const card = document.createElement('div');
            card.className = 'ps-card';
            card.style.flexWrap = 'wrap';
            let options = '';
            for (let offset = 2; offset <= 30; offset += 1) {
                const d = dateAfterDays(offset);
                options += '<option value="' + offset + '">' + d.day + ' ' + MONTHS_GEN[d.monthIndex] + '</option>';
            }
            card.innerHTML = '<div class="ps-icon" style="background:' + dest.theme + '"><span>' + dest.emoji + '</span></div><div class="ps-info"><div class="ps-name">' + dest.name + '</div><div class="ps-desc">' + dest.days + ' дней • перелёт ' + dest.hours + ' ч в одну сторону • ' + dest.info + '</div><div class="ps-meta">' + dest.price.toLocaleString('ru-RU') + ' ₽</div></div>' +
                '<div style="display:flex;gap:8px;width:100%;margin-top:6px;"><select class="trv-date" style="flex:1;padding:8px;border-radius:10px;border:1px solid #cbd5e1;">' + options + '</select><button type="button" class="ps-btn">Купить</button></div>';
            card.querySelector('.ps-btn').addEventListener('click', function () { buyTicket(dest, Number(card.querySelector('.trv-date').value)); });
            wrap.appendChild(card);
        });
        appScrollableBody.innerHTML = '';
        appScrollableBody.appendChild(wrap);
    }

    /* ---------- ПОЛЁТ И ОТПУСК: экраны ---------- */
    function syncTravelScreens() {
        if (!flightEl) return;
        flightEl.style.display = isFlying() ? 'flex' : 'none';
        vacationEl.style.display = isOnVacation() ? 'flex' : 'none';
        if (isFlying() || isOnVacation()) hideAirportScreen();
        renderTravelScreens();
    }

    function renderTravelScreens() {
        const trip = travelState.trip;
        if (!trip) return;
        const dest = destById(trip.dest);
        const now = monoNow();
        if (isFlying()) {
            const total = Math.max(1, trip.end - trip.start);
            const percent = Math.min(100, Math.round((now - trip.start) / total * 100));
            flightEl.style.background = 'linear-gradient(180deg,#0c4a6e,#38bdf8)';
            flightEl.innerHTML = '<div class="trv-card"><div class="trv-plane">✈️</div><div class="trv-title">' + (trip.phase === 'out' ? 'Рейс: ' + dest.name : 'Рейс домой') + '</div><div class="trv-muted">В полёте время идёт как обычно. Можно заглянуть в рюкзак или телефон.</div><div class="ps-progress" style="height:10px;margin:12px 0;"><i style="width:' + percent + '%"></i></div><div>Осталось: ' + fmtLeft(trip.end - now) + '</div></div>';
        } else if (isOnVacation() && !travelBusy) {
            const acts = destActs(dest);
            const dayIdx = Math.floor((now - trip.stayStart) / 1440);
            const doneCount = acts.filter(function (a) { return trip.ever[a.id]; }).length;
            vacationEl.style.background = dest.theme;
            vacationEl.innerHTML = '<div class="trv-card trv-scroll"><div class="trv-title">' + dest.emoji + ' ' + dest.name + '</div><div>День ' + (Math.min(dest.days, dayIdx + 1)) + ' из ' + dest.days + ' • до вылета домой: ' + fmtLeft(trip.stayEnd - now) + '</div><div class="trv-muted">Впечатления: ' + doneCount + ' / ' + acts.length + (trip.bonus ? ' ✅ бонус получен' : ' (за все впечатления будет бонус)') + (dest.allInc ? '<br>🍹 Всё включено: еда и энергия пополняются сами' : '') + '</div><div class="trv-acts"></div></div>';
            const list = vacationEl.querySelector('.trv-acts');
            acts.forEach(function (act) {
                const doneToday = trip.done[act.id] === dayIdx;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'trv-act' + (doneToday ? ' done' : '');
                btn.innerHTML = '<span>' + act.emoji + ' ' + act.name + '</span><small>' + (act.cost ? act.cost.toLocaleString('ru-RU') + ' ₽' : 'бесплатно') + ' • ' + Math.round(act.min / 60 * 10) / 10 + ' ч' + (doneToday ? ' • сегодня уже было' : '') + '</small>';
                btn.addEventListener('click', function () { doVacationActivity(dest, act, dayIdx); });
                list.appendChild(btn);
            });
            const rest = document.createElement('button');
            rest.type = 'button';
            rest.className = 'trv-act';
            rest.innerHTML = '<span>🛏️ Отдохнуть в отеле до утра</span><small>бесплатно • сон и энергия восстанавливаются</small>';
            rest.addEventListener('click', function () { vacationRest(); });
            list.appendChild(rest);
        }
    }

    function travelWait(text, then) {
        travelBusy = true;
        isClockRunning = false;
        waitEl.textContent = text;
        waitEl.style.display = 'flex';
        setTimeout(function () {
            then();
            waitEl.style.display = 'none';
            travelBusy = false;
            isClockRunning = true;
            saveGameData();
            updateClockUI();
            updateStatsHUD();
            renderTravelScreens();
        }, 2200);
    }

    function doVacationActivity(dest, act, dayIdx) {
        const trip = travelState.trip;
        if (!trip || travelBusy) return;
        if (trip.done[act.id] === dayIdx) { showToast('Сегодня вы уже это делали. Попробуйте завтра'); return; }
        if (playerMoney < act.cost) { showToast('Недостаточно денег'); return; }
        playerMoney -= act.cost;
        if (act.cost > 0) addBankTransaction('Отпуск: ' + act.name, act.cost, false);
        travelWait(act.emoji + ' ' + act.name + '...', function () {
            gameMinutes += act.min;
            advanceCalendar();
            playerHunger = clamp(playerHunger + act.hunger, 0, 100);
            playerEnergy = clamp(playerEnergy + act.energy, 0, 100);
            trip.done[act.id] = dayIdx;
            trip.ever[act.id] = true;
            if (act.souvenir && travelState.souvenirs.length < 50) travelState.souvenirs.push(dest.id);
            showToast(act.emoji + ' ' + act.text);
            const acts = destActs(dest);
            if (!trip.bonus && acts.every(function (a) { return trip.ever[a.id]; })) {
                trip.bonus = true;
                const bonus = Math.round(dest.price * 0.25 / 500) * 500;
                playerMoney += bonus;
                addBankTransaction('Отпуск: бонус за все впечатления', bonus, true);
                addMessage('Билеты.би', '🏆', 'Вы попробовали все впечатления в поездке: ' + dest.name + '. Бонус от туроператора: ' + bonus.toLocaleString('ru-RU') + ' ₽!');
            }
        });
    }

    function vacationRest() {
        if (travelBusy) return;
        travelWait('🛏️ Вы отдыхаете в отеле...', function () {
            const wake = (gameMinutes < 420) ? (420 - gameMinutes) : (1440 - gameMinutes + 420);
            gameMinutes += wake;
            advanceCalendar();
            playerSleep = 100;
            playerEnergy = clamp(playerEnergy + 60, 0, 100);
            playerHunger = clamp(playerHunger - 10, 0, 100);
            showToast('🌅 Доброе утро! Вы хорошо выспались');
        });
    }

    function processTravel() {
        const now = monoNow();
        if (performance.now() - travelLastTick < 1000) return;
        travelLastTick = performance.now();
        const ticket = travelState.ticket;
        if (ticket) {
            const left = ticket.depart - now;
            if (left <= 720 && left > 0 && !ticket.remind) {
                ticket.remind = true;
                addMessage('Билеты.би', '⏰', 'Скоро вылет! До рейса меньше 12 часов. Не забудьте приехать в аэропорт за 3 часа до вылета.');
                showToast('⏰ Скоро вылет самолёта');
            }
            if (left <= 0) {
                travelState.ticket = null;
                addMessage('Билеты.би', '😔', 'Вы опоздали на рейс. Билет аннулирован, деньги не возвращаются.');
            }
        }
        const trip = travelState.trip;
        if (!trip) return;
        const dest = destById(trip.dest);
        if (!dest) { travelState.trip = null; syncTravelScreens(); return; }
        if (trip.phase === 'out' && now >= trip.end) {
            trip.phase = 'stay';
            trip.stayStart = now;
            trip.stayEnd = now + dest.days * 1440;
            addMessage('Отпуск', dest.emoji, 'Вы прилетели: ' + dest.name + '. Отдыхайте, смотрите достопримечательности и собирайте впечатления!');
            saveGameData();
            syncTravelScreens();
        } else if (trip.phase === 'stay') {
            const dayIdx = Math.floor((now - trip.stayStart) / 1440);
            if (dayIdx > trip.eventDay) {
                trip.eventDay = dayIdx;
                if (dayIdx > 0) {
                    const ev = VACATION_EVENTS[Math.floor(Math.random() * VACATION_EVENTS.length)];
                    if (ev.money) {
                        playerMoney += ev.money;
                        addBankTransaction('Отпуск: приятная неожиданность', ev.money, true);
                    }
                    if (ev.hunger) playerHunger = clamp(playerHunger + ev.hunger, 0, 100);
                    if (ev.energy) playerEnergy = clamp(playerEnergy + ev.energy, 0, 100);
                    addMessage('Отпуск', dest.emoji, ev.text);
                    saveGameData();
                }
            }
            if (dest.allInc) {
                if (playerHunger < 20) { playerHunger = 100; showToast('🍹 Всё включено: вас накормили'); }
                if (playerEnergy < 20) { playerEnergy = 100; showToast('🍹 Всё включено: вы отдохнули и набрались сил'); }
            }
            if (now >= trip.stayEnd) {
                trip.phase = 'back';
                trip.start = now;
                trip.end = now + dest.hours * 60;
                addMessage('Отпуск', '🧳', 'Отпуск закончился. Вы вылетаете домой.');
                saveGameData();
                syncTravelScreens();
            } else if (!travelBusy) {
                renderTravelScreens();
            }
        } else if (trip.phase === 'back') {
            if (now >= trip.end) {
                travelState.trip = null;
                travelState.restUntil = now + 7 * 1440;
                lastExitedLocation = 'airport';
                currentScreen = 'city';
                addMessage('Отпуск', '🏠', 'С возвращением! Вы отдохнули: следующие 7 дней энергия будет тратиться чуть медленнее.');
                showToast('🏠 Вы вернулись домой');
                saveGameData();
                syncTravelScreens();
            } else {
                renderTravelScreens();
            }
        }
    }

    function createTravelScreens() {
        function make(id, extra) {
            const el = document.createElement('div');
            el.id = id;
            el.className = 'trv-screen';
            el.style.display = 'none';
            if (extra) el.style.background = extra;
            document.body.appendChild(el);
            return el;
        }
        airportEl = make('airport-screen', 'linear-gradient(180deg,#1e293b,#0ea5e9)');
        flightEl = make('flight-screen');
        vacationEl = make('vacation-screen');
        waitEl = make('travel-wait', 'rgba(15,23,42,.92)');
        waitEl.className = 'trv-screen trv-wait';
        waitEl.style.zIndex = '60';
        syncTravelScreens();
    }

    /* =========================================================
       ЮТУБ: канал, ролики, стримы, доход
       ========================================================= */
    const YT_TOPICS = [
        { id: 'vlog', name: 'Влог', emoji: '📹', mult: 1.0 },
        { id: 'review', name: 'Обзор', emoji: '🔍', mult: 1.1 },
        { id: 'challenge', name: 'Челлендж', emoji: '🔥', mult: 1.3 },
        { id: 'humor', name: 'Юмор', emoji: '😂', mult: 1.2 },
        { id: 'tutorial', name: 'Обучение', emoji: '🎓', mult: 0.9 },
        { id: 'travel', name: 'Путешествия', emoji: '🌍', mult: 1.4 },
        { id: 'gaming', name: 'Игровой', emoji: '🎮', mult: 1.2 },
        { id: 'experiment', name: 'Эксперимент', emoji: '🧪', mult: 1.5 }
    ];
    const YT_MILESTONES = [
        [100, 5000], [1000, 15000], [10000, 30000], [100000, 120000],
        [1000000, 1200000], [10000000, 15000000], [100000000, 150000000], [10000000000, 100000000000]
    ];
    const YT_MIN_INVEST = 1000;
    const YT_MAX_INVEST = 10000000;
    const YT_MAX_UPLOADS_PER_DAY = 10;
    const YT_MAX_ARCHIVE = 100;
    const YT_STREAM_MAX_MINUTES = 300;
    let ytLastTick = 0;

    function ytQuality(invest) { return clamp(Math.log10(Math.max(invest, YT_MIN_INVEST) / YT_MIN_INVEST) / 4, 0, 1); }
    function ytShootMinutes(invest) { return Math.round(60 + ytQuality(invest) * (4320 - 60)); }
    function ytEditMinutes(invest) { return Math.round(30 + ytQuality(invest) * (2880 - 30)); }
    function ytRate(views) { return views > 1e9 ? 400 : (views > 1e8 ? 325 : (views > 1e6 ? 250 : 200)); }
    function ytDay() { return Math.floor(monoNow() / 1440); }
    function fmtNum(n) { return Math.round(n).toLocaleString('ru-RU'); }
    function fmtDur(minutes) {
        if (minutes >= 1440) return (Math.round(minutes / 144) / 10) + ' дн.';
        if (minutes >= 60) return (Math.round(minutes / 6) / 10) + ' ч';
        return Math.round(minutes) + ' мин';
    }

    function ytBusyMessage() {
        if (ytState.shooting) return '🎬 Вы снимаете ролик: уйти нельзя';
        if (ytState.stream) return '📡 Вы ведёте стрим: уйти нельзя';
        return '';
    }

    function ytTopic(id) { return YT_TOPICS.find(function (t) { return t.id === id; }) || YT_TOPICS[0]; }

    function ytCalcVideo(topic, invest) {
        const q = ytQuality(invest);
        const subs = ytState.subs;
        const ratio = 2.2 / (1 + Math.log10(Math.max(1, subs / 10000)) * 0.5);
        let views = (35 + subs * ratio) * (0.3 + 1.7 * Math.pow(q, 1.2)) * topic.mult * (0.4 + Math.random() * 1.2);
        if (q > 0.5 && subs >= 500 && Math.random() < 0.03) views *= 5;
        if (subs < 20) views = Math.min(views, 100);
        if (q < 0.05 && Math.random() < 0.25) views = 0;
        views = Math.round(views);
        return {
            views: views,
            likes: Math.round(views * (0.04 + 0.06 * q)),
            subs: Math.round(views * (0.12 + 0.18 * q))
        };
    }

    function ytAddSubs(count) {
        ytState.subs = clamp(ytState.subs + count, 0, 1e10);
        YT_MILESTONES.forEach(function (ms) {
            if (ytState.subs >= ms[0] && !ytState.milestones[ms[0]]) {
                ytState.milestones[ms[0]] = true;
                playerMoney += ms[1];
                addBankTransaction('Ютуб: бонус за ' + fmtNum(ms[0]) + ' подписчиков', ms[1], true);
                addMessage('Ютуб', '🏆', 'Вы молодец! Набрали ' + fmtNum(ms[0]) + ' подписчиков. Это вам бонус от Ютуба: ' + fmtNum(ms[1]) + ' ₽.');
            }
        });
    }

    function ytMissingForVideo() {
        const miss = [];
        if (!marketState.owned.cam_youtube) miss.push('камера для ютубера');
        if (!marketState.owned.mic) miss.push('микрофон');
        if (!marketState.owned.computer) miss.push('компьютер');
        return miss;
    }

    function ytMissingForStream() {
        const miss = [];
        if (!marketState.owned.cam_stream) miss.push('камера для стримера');
        if (!marketState.owned.mic) miss.push('микрофон');
        if (!marketState.owned.computer) miss.push('компьютер');
        return miss;
    }

    function ytCreateChannel(name) {
        const clean = String(name || '').trim().slice(0, 24);
        if (clean.length < 2) { showToast('Введите название канала (минимум 2 символа)'); return; }
        ytState.channel = { name: clean };
        saveGameData();
        showToast('▶️ Канал «' + clean + '» создан');
        renderYoutubeApp();
    }

    function ytStartShooting(topic, invest) {
        if (ytState.shooting || ytState.stream) { showToast(ytBusyMessage()); return; }
        if (travelBlockMessage()) { showToast(travelBlockMessage()); return; }
        const miss = ytMissingForVideo();
        if (miss.length) { showToast('Нужно купить в Маркетплейсе: ' + miss.join(', ')); return; }
        if (!(invest >= YT_MIN_INVEST && invest <= YT_MAX_INVEST)) { showToast('Вложения: от 1 000 до 10 000 000 ₽'); return; }
        if (ytState.archive.length + ytState.editing.length >= YT_MAX_ARCHIVE) { showToast('Архив полон (100 роликов). Сначала выложите ролики'); return; }
        if (playerMoney < invest) { showToast('Недостаточно денег на съёмку'); return; }
        playerMoney -= invest;
        addBankTransaction('Ютуб: съёмка ролика', invest, false);
        ytState.counter += 1;
        const now = monoNow();
        ytState.shooting = { id: ytState.counter, topic: topic.id, title: topic.name + ' #' + ytState.counter, invest: invest, start: now, end: now + ytShootMinutes(invest), editMin: ytEditMinutes(invest) };
        saveGameData();
        updateClockUI();
        showToast('🎬 Съёмка началась. Пока она идёт, уйти никуда нельзя');
        renderYoutubeApp();
    }

    function ytCancelShooting() {
        if (!ytState.shooting) return;
        ytState.shooting = null;
        saveGameData();
        showToast('Съёмка прервана, вложенные деньги не возвращаются');
        renderYoutubeApp();
    }

    function ytPublish(index) {
        const today = ytDay();
        if (ytState.uploads.day !== today) ytState.uploads = { day: today, count: 0 };
        if (ytState.uploads.count >= YT_MAX_UPLOADS_PER_DAY) { showToast('За день можно выложить не больше 10 роликов'); return false; }
        const video = ytState.archive[index];
        if (!video) return false;
        ytState.archive.splice(index, 1);
        const calc = ytCalcVideo(ytTopic(video.topic), video.invest);
        ytState.live.push({ id: video.id, title: video.title, published: monoNow(), total: calc.views, likesTotal: calc.likes, subsTotal: calc.subs, views: 0, likes: 0, subsApplied: 0, paid: 0 });
        ytState.uploads.count += 1;
        return true;
    }

    function ytPublishAt(index) {
        if (ytPublish(index)) showToast('▶️ Ролик опубликован');
        saveGameData();
        renderYoutubeApp();
    }

    function ytPublishMany(count) {
        let done = 0;
        for (let i = 0; i < count; i += 1) {
            if (!ytPublish(0)) break;
            done += 1;
        }
        if (done > 0) showToast('▶️ Опубликовано роликов: ' + done);
        saveGameData();
        renderYoutubeApp();
    }

    function ytWithdraw() {
        const amount = Math.floor(ytState.balance);
        if (amount < 1) { showToast('Пока нечего выводить'); return; }
        ytState.balance -= amount;
        playerMoney += amount;
        addBankTransaction('Ютуб: вывод дохода', amount, true);
        saveGameData();
        updateClockUI();
        showToast('💰 На счёт переведено ' + fmtNum(amount) + ' ₽');
        renderYoutubeApp();
    }

    function ytStartStream() {
        if (ytState.stream || ytState.shooting) { showToast(ytBusyMessage()); return; }
        if (travelBlockMessage()) { showToast(travelBlockMessage()); return; }
        const miss = ytMissingForStream();
        if (miss.length) { showToast('Нужно купить в Маркетплейсе: ' + miss.join(', ')); return; }
        if (ytState.lastStreamDay === ytDay()) { showToast('Сегодня вы уже проводили стрим. Следующий завтра'); return; }
        const now = monoNow();
        ytState.stream = { start: now, end: now + YT_STREAM_MAX_MINUTES, viewers: Math.round(ytState.subs * 0.06 + 3 + Math.random() * 6) };
        saveGameData();
        showToast('📡 Стрим начался (максимум 5 часов)');
        renderYoutubeApp();
    }

    function ytFinishStream(auto) {
        const s = ytState.stream;
        if (!s) return;
        const hours = clamp((monoNow() - s.start) / 60, 0, 5);
        const income = Math.round(s.viewers * hours * 4);
        const gain = Math.round(s.viewers * hours * 0.05);
        ytState.stream = null;
        ytState.lastStreamDay = ytDay();
        ytState.balance += income;
        ytAddSubs(gain);
        let text = 'Стрим завершён. Зрителей: ' + fmtNum(s.viewers) + ', донаты: ' + fmtNum(income) + ' ₽ (в приложении Ютуб), новых подписчиков: ' + fmtNum(gain) + '.';
        if (auto) {
            const loss = Math.min(ytState.subs, Math.max(1, Math.round(ytState.subs * 0.01)));
            ytState.subs -= loss;
            text += ' Стрим выключился сам спустя 5 часов, это вызвало недовольство зрителей: отписались ' + fmtNum(loss) + '.';
        }
        addMessage('Ютуб', '📡', text);
        saveGameData();
        showToast('📡 Стрим завершён');
        renderYoutubeApp();
    }

    function processYoutube() {
        if (performance.now() - ytLastTick < 1000) return;
        ytLastTick = performance.now();
        const now = monoNow();
        let changed = false;
        const s = ytState.shooting;
        if (s && now >= s.end) {
            ytState.editing.push({ id: s.id, title: s.title, topic: s.topic, invest: s.invest, end: now + s.editMin });
            ytState.shooting = null;
            addMessage('Ютуб', '🎬', 'Съёмка «' + s.title + '» завершена. Начался монтаж, он идёт сам, вы можете заниматься своими делами.');
            showToast('🎬 Съёмка завершена, идёт монтаж');
            changed = true;
        }
        for (let i = ytState.editing.length - 1; i >= 0; i -= 1) {
            const e = ytState.editing[i];
            if (now >= e.end) {
                ytState.editing.splice(i, 1);
                ytState.archive.push({ id: e.id, title: e.title, topic: e.topic, invest: e.invest });
                addMessage('Ютуб', '✂️', 'Монтаж «' + e.title + '» готов. Ролик ждёт в архиве, нажмите «Выложить».');
                showToast('✂️ Ролик смонтирован и лежит в архиве');
                changed = true;
            }
        }
        for (let i = ytState.live.length - 1; i >= 0; i -= 1) {
            const v = ytState.live[i];
            const p = clamp((now - v.published) / (3 * 1440), 0, 1);
            const ease = 1 - Math.pow(1 - p, 2);
            const viewsNow = Math.floor(v.total * ease);
            const likesNow = Math.floor(v.likesTotal * ease);
            const subsNow = Math.floor(v.subsTotal * ease);
            if (viewsNow !== v.views || subsNow !== v.subsApplied) {
                ytState.views += viewsNow - v.views;
                ytState.likes += likesNow - v.likes;
                v.views = viewsNow;
                v.likes = likesNow;
                const pay = Math.floor(viewsNow / 1000 * ytRate(viewsNow) * 100) / 100;
                ytState.balance += pay - v.paid;
                v.paid = pay;
                const subDelta = subsNow - v.subsApplied;
                v.subsApplied = subsNow;
                if (subDelta > 0) ytAddSubs(subDelta);
                changed = true;
            }
            if (p >= 1) {
                ytState.live.splice(i, 1);
                ytState.history.unshift(v);
                if (ytState.history.length > 30) ytState.history.length = 30;
                changed = true;
            }
        }
        if (ytState.stream && now >= ytState.stream.end) ytFinishStream(true);
        if (changed) saveGameData();
        if (currentPhoneApp === 'youtube' && phoneView === 'app') {
            const active = document.activeElement;
            if (!(active && (active.tagName === 'INPUT' || active.tagName === 'SELECT'))) renderYoutubeApp(true);
        }
    }

    function renderYoutubeApp(keepScroll) {
        if (currentPhoneApp !== 'youtube') return;
        const prevScroll = keepScroll ? appScrollableBody.scrollTop : 0;
        const y = ytState;
        const now = monoNow();
        const wrap = document.createElement('div');
        wrap.className = 'ps-wrap';
        if (!y.channel) {
            wrap.innerHTML = '<div class="ps-header" style="background:linear-gradient(135deg,#ef4444,#f97316)"><div class="ps-title">▶️ Ютуб</div><div class="ps-sub">Создайте свой канал, снимайте ролики, проводите стримы и зарабатывайте.</div></div>' +
                '<div class="ps-card" style="flex-direction:column;align-items:stretch;gap:8px;"><div class="ps-name">Создать канал</div><input id="yt-channel-name" type="text" maxlength="24" placeholder="Название канала" style="padding:10px;border-radius:10px;border:1px solid #cbd5e1;font-size:1rem;"><button type="button" class="ps-btn" id="yt-create" style="align-self:flex-end;">Создать</button></div>' +
                '<div class="ps-desc">Старт: 0 подписчиков, 0 просмотров, 0 лайков, 0 ₽. Для роликов нужны камера для ютубера, микрофон и компьютер, для стримов: камера для стримера, микрофон и компьютер (Маркетплейс).</div>';
            appScrollableBody.innerHTML = '';
            appScrollableBody.appendChild(wrap);
            wrap.querySelector('#yt-create').addEventListener('click', function () { ytCreateChannel(wrap.querySelector('#yt-channel-name').value); });
            return;
        }
        const stat = function (label, value) { return '<div style="flex:1;min-width:70px;"><div style="font-weight:900;font-size:1rem;">' + value + '</div><div style="font-size:.62rem;opacity:.85;">' + label + '</div></div>'; };
        wrap.innerHTML = '<div class="ps-header" style="background:linear-gradient(135deg,#ef4444,#f97316)"><div class="ps-title">▶️ ' + y.channel.name.replace(/</g, '&lt;') + '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">' + stat('подписчиков', fmtNum(y.subs)) + stat('просмотров', fmtNum(y.views)) + stat('лайков', fmtNum(y.likes)) + stat('на балансе, ₽', fmtNum(y.balance)) + '</div>' +
            '<button type="button" id="yt-withdraw" class="ps-btn" style="margin-top:10px;background:#fff;color:#b91c1c;">💰 Вывести на счёт</button></div>' +
            '<div class="ps-desc">Ролики: ' + (marketState.owned.cam_youtube ? '✅' : '❌') + ' камера ютубера • ' + (marketState.owned.mic ? '✅' : '❌') + ' микрофон • ' + (marketState.owned.computer ? '✅' : '❌') + ' компьютер<br>Стримы: ' + (marketState.owned.cam_stream ? '✅' : '❌') + ' камера стримера</div>';
        wrap.querySelector('#yt-withdraw').addEventListener('click', ytWithdraw);

        const tabs = document.createElement('div');
        tabs.style.cssText = 'display:flex;gap:6px;';
        [['video', '🎬 Ролики'], ['archive', '📁 Архив (' + y.archive.length + ')'], ['stream', '📡 Стрим'], ['stats', '📊 Статистика']].forEach(function (tab) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ps-btn' + (y.tab === tab[0] ? '' : ' ps-btn-off');
            b.style.cssText = 'flex:1;padding:8px 4px;font-size:.66rem;';
            b.textContent = tab[1];
            b.addEventListener('click', function () { y.tab = tab[0]; renderYoutubeApp(); });
            tabs.appendChild(b);
        });
        wrap.appendChild(tabs);

        const box = document.createElement('div');
        box.className = 'ps-card';
        box.style.cssText = 'flex-direction:column;align-items:stretch;gap:8px;';
        if (y.tab === 'video') {
            if (y.shooting) {
                const p = clamp((now - y.shooting.start) / (y.shooting.end - y.shooting.start) * 100, 0, 100);
                box.innerHTML = '<div class="ps-name">🎬 Идёт съёмка: ' + y.shooting.title + '</div><div class="ps-progress"><i style="width:' + p.toFixed(0) + '%"></i></div><div class="ps-meta">Осталось ' + fmtDur(y.shooting.end - now) + '. Уйти никуда нельзя.</div><button type="button" class="ps-btn ps-btn-del" id="yt-cancel" style="align-self:flex-end;">Прервать</button>';
                box.querySelector('#yt-cancel').addEventListener('click', ytCancelShooting);
            } else {
                let options = '';
                YT_TOPICS.forEach(function (t) { options += '<option value="' + t.id + '">' + t.emoji + ' ' + t.name + '</option>'; });
                box.innerHTML = '<div class="ps-name">Новый ролик</div><select id="yt-topic" style="padding:10px;border-radius:10px;border:1px solid #cbd5e1;">' + options + '</select>' +
                    '<input id="yt-invest" type="number" inputmode="numeric" min="1000" max="10000000" placeholder="Вложения, ₽ (1 000 – 10 000 000)" style="padding:10px;border-radius:10px;border:1px solid #cbd5e1;font-size:1rem;">' +
                    '<div class="ps-meta" id="yt-estimate">Чем больше вложите, тем лучше ролик, но съёмка и монтаж дольше.</div><button type="button" class="ps-btn" id="yt-shoot" style="align-self:flex-end;">Начать съёмку</button>';
                const invest = box.querySelector('#yt-invest');
                invest.addEventListener('input', function () {
                    const v = Number(invest.value);
                    box.querySelector('#yt-estimate').textContent = v >= YT_MIN_INVEST ? 'Съёмка ~' + fmtDur(ytShootMinutes(v)) + ', монтаж ~' + fmtDur(ytEditMinutes(v)) : 'Минимум 1 000 ₽';
                });
                box.querySelector('#yt-shoot').addEventListener('click', function () { ytStartShooting(ytTopic(box.querySelector('#yt-topic').value), Math.floor(Number(invest.value))); });
            }
            if (y.editing.length) {
                const ed = document.createElement('div');
                ed.className = 'ps-desc';
                ed.innerHTML = '<b>✂️ Монтаж (идёт сам):</b><br>' + y.editing.map(function (e) { return e.title + ': ещё ' + fmtDur(e.end - now); }).join('<br>');
                box.appendChild(ed);
            }
        } else if (y.tab === 'archive') {
            const today = ytDay();
            const used = y.uploads.day === today ? y.uploads.count : 0;
            box.innerHTML = '<div class="ps-name">Архив роликов</div><div class="ps-meta">Выложено сегодня: ' + used + ' / ' + YT_MAX_UPLOADS_PER_DAY + '. В архиве можно хранить до 100 роликов.</div>';
            if (y.archive.length) {
                const all = document.createElement('button');
                all.type = 'button';
                all.className = 'ps-btn';
                all.textContent = 'Выложить сколько можно';
                all.addEventListener('click', function () { ytPublishMany(YT_MAX_UPLOADS_PER_DAY); });
                box.appendChild(all);
                y.archive.slice(0, 40).forEach(function (v, idx) {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
                    row.innerHTML = '<span class="ps-desc" style="margin:0;">' + ytTopic(v.topic).emoji + ' ' + v.title + '</span><button type="button" class="ps-btn" style="padding:6px 10px;">Выложить</button>';
                    row.querySelector('button').addEventListener('click', function () { ytPublishAt(idx); });
                    box.appendChild(row);
                });
            } else {
                box.innerHTML += '<div class="ps-desc">Архив пуст. Снимите и смонтируйте ролик.</div>';
            }
        } else if (y.tab === 'stream') {
            if (y.stream) {
                const p = clamp((now - y.stream.start) / YT_STREAM_MAX_MINUTES * 100, 0, 100);
                box.innerHTML = '<div class="ps-name">📡 Идёт стрим</div><div class="ps-meta">Зрителей: ' + fmtNum(y.stream.viewers) + '. Осталось до автовыключения: ' + fmtDur(y.stream.end - now) + '</div><div class="ps-progress"><i style="width:' + p.toFixed(0) + '%"></i></div><button type="button" class="ps-btn ps-btn-del" id="yt-endstream" style="align-self:flex-end;">Закончить стрим</button>';
                box.querySelector('#yt-endstream').addEventListener('click', function () { ytFinishStream(false); });
            } else {
                box.innerHTML = '<div class="ps-name">Стрим</div><div class="ps-desc">Один стрим в день, не больше 5 часов. Если не выключить, он выключится сам, и часть зрителей отпишется. Пока идёт стрим, уйти нельзя. Доход зависит от числа подписчиков и длительности.</div><button type="button" class="ps-btn" id="yt-stream" style="align-self:flex-end;">Начать стрим</button>';
                box.querySelector('#yt-stream').addEventListener('click', ytStartStream);
            }
        } else {
            const lines = y.live.map(function (v) { return '🔥 ' + v.title + ': ' + fmtNum(v.views) + ' просм., ' + fmtNum(v.likes) + ' лайков (набирает)'; })
                .concat(y.history.slice(0, 12).map(function (v) { return '✅ ' + v.title + ': ' + fmtNum(v.views) + ' просм., ' + fmtNum(v.likes) + ' лайков, ' + fmtNum(v.paid) + ' ₽'; }));
            box.innerHTML = '<div class="ps-name">Ваши ролики</div><div class="ps-desc">' + (lines.length ? lines.join('<br>') : 'Пока нет опубликованных роликов.') + '</div><div class="ps-meta">За каждые 1000 просмотров: 200 ₽ (от 1 млн просмотров на ролике 250 ₽, от 100 млн 325 ₽, от 1 млрд 400 ₽).</div>';
        }
        wrap.appendChild(box);
        appScrollableBody.innerHTML = '';
        appScrollableBody.appendChild(wrap);
        appScrollableBody.scrollTop = prevScroll;
    }

    /* =========================================================
       БАНК: номер счёта, переводы игрокам (Firebase), кредиты
       ========================================================= */
    const TRANSFER_FEE_RATE = 0.03;
    const TRANSFER_MIN = 1;
    const TRANSFER_MAX = 10000000;
    const LOAN_MIN = 50000;
    const LOAN_MAX = 100000000;
    const LOAN_NO_COLLATERAL_MAX = 1000000;
    const LOAN_COLLATERAL_MIN_ITEM = 5000000;
    const LOAN_MAX_COUNT = 2;
    const LOAN_TERM_DAYS = 10;
    const LOAN_SEIZE_DAYS = 21;
    const LOAN_MARKUP = 1.25;
    const LOAN_OVERDUE_DAILY = 1.05;

    let fbDb = null;
    let transferBusy = false;
    let bankLastTick = 0;

    function fbInit() {
        try {
            if (!window.firebase || !window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.databaseURL) return;
            firebase.initializeApp(window.FIREBASE_CONFIG);
            fbDb = firebase.database();
        } catch (error) {
            fbDb = null;
        }
    }

    function randomAccount() { return 10000 + Math.floor(Math.random() * 90000); }

    function ensureBankAccount() {
        if (!bankState.account) {
            bankState.account = randomAccount();
            bankState.registered = false;
            saveGameData();
        }
        if (!fbDb) return;
        if (!bankState.registered) fbRegisterAccount(0);
        else fbListenInbox();
    }

    function fbRegisterAccount(attempt) {
        if (!fbDb || attempt > 25) return;
        const number = bankState.account;
        fbDb.ref('accounts/' + number).transaction(function (current) {
            return current === null ? { ts: Date.now() } : undefined;
        }, function (error, committed) {
            if (error) return;
            if (committed) {
                bankState.registered = true;
                saveGameData();
                fbListenInbox();
            } else {
                bankState.account = randomAccount();
                fbRegisterAccount(attempt + 1);
            }
        });
    }

    let fbInboxListening = false;
    function fbListenInbox() {
        if (!fbDb || fbInboxListening || !bankState.account) return;
        fbInboxListening = true;
        fbDb.ref('inbox/' + bankState.account).on('child_added', function (snap) {
            const value = snap.val();
            const key = snap.key;
            snap.ref.remove();
            if (!value || typeof value.amount !== 'number' || bankState.seen.indexOf(key) !== -1) return;
            const amount = Math.floor(value.amount);
            if (amount < TRANSFER_MIN || amount > TRANSFER_MAX) return;
            bankState.seen.push(key);
            if (bankState.seen.length > 60) bankState.seen.shift();
            playerMoney += amount;
            addBankTransaction('Перевод от игрока ' + String(value.from || '—'), amount, true);
            addMessage('BestBank', '💸', 'Вам поступил перевод ' + fmtNum(amount) + ' ₽ от игрока со счёта ' + String(value.from || '—') + '.');
            showToast('💸 Вам перевели ' + fmtNum(amount) + ' ₽');
            saveGameData();
            updateClockUI();
            refreshBank();
        });
    }

    function refreshBank() {
        if (currentPhoneApp !== 'karta' || phoneView !== 'app') return;
        const active = document.activeElement;
        if (active && active.tagName === 'INPUT') return;
        renderBankApp();
    }

    function sendTransfer(accountText, amountValue) {
        if (transferBusy) return;
        if (!fbDb) { showToast('Онлайн-переводы не подключены (Firebase)'); return; }
        const account = Math.floor(Number(accountText));
        const amount = Math.floor(Number(amountValue));
        if (!(account >= 10000 && account <= 99999)) { showToast('Номер счёта: 5 цифр'); return; }
        if (account === bankState.account) { showToast('Нельзя перевести самому себе'); return; }
        if (!(amount >= TRANSFER_MIN && amount <= TRANSFER_MAX)) { showToast('Сумма перевода: от 1 до 10 000 000 ₽'); return; }
        const fee = Math.round(amount * TRANSFER_FEE_RATE);
        const total = amount + fee;
        if (playerMoney < total) { showToast('Недостаточно денег (нужно ' + fmtNum(total) + ' ₽ с комиссией 3%)'); return; }
        transferBusy = true;
        fbDb.ref('accounts/' + account).once('value').then(function (snap) {
            if (!snap.exists()) {
                showToast('Счёт ' + account + ' не найден');
                transferBusy = false;
                return null;
            }
            return fbDb.ref('inbox/' + account).push({ from: bankState.account, amount: amount, ts: Date.now() }).then(function () {
                playerMoney -= total;
                addBankTransaction('Перевод игроку ' + account + ' (комиссия 3%: ' + fmtNum(fee) + ' ₽)', total, false);
                bankState.transfers.unshift({ acc: account, amount: amount, fee: fee, date: currentDay + ' ' + MONTH_NAMES[currentMonthIdx] });
                if (bankState.transfers.length > 30) bankState.transfers.length = 30;
                bankState.recents = [account].concat(bankState.recents.filter(function (a) { return a !== account; })).slice(0, 8);
                showToast('✅ Переведено ' + fmtNum(amount) + ' ₽ на счёт ' + account);
                saveGameData();
                updateClockUI();
                transferBusy = false;
                renderBankApp();
            });
        }).catch(function () {
            showToast('Не удалось выполнить перевод. Проверьте интернет');
            transferBusy = false;
        });
    }

    function ownedPropertyList() {
        const list = [];
        ownedCars.forEach(function (car) { if (car.id !== 'bike') list.push({ kind: 'car', id: car.id, name: car.title, price: Number(car.price) || 0 }); });
        BUSINESSES.forEach(function (b) { if (bizState.owned[b.id]) list.push({ kind: 'biz', id: b.id, name: b.name, price: b.price }); });
        COMPANIES.forEach(function (c) { if (coState.owned[c.id]) list.push({ kind: 'co', id: c.id, name: c.name, price: c.price }); });
        return list;
    }

    function takeLoan(amountValue) {
        const amount = Math.floor(Number(amountValue));
        if (!(amount >= LOAN_MIN && amount <= LOAN_MAX)) { showToast('Сумма кредита: от 50 000 до 100 000 000 ₽'); return; }
        if (bankState.loans.length >= LOAN_MAX_COUNT) { showToast('Нельзя иметь больше 2 кредитов одновременно'); return; }
        if (amount > LOAN_NO_COLLATERAL_MAX && !ownedPropertyList().some(function (p) { return p.price > LOAN_COLLATERAL_MIN_ITEM; })) {
            showToast('Для кредита больше 1 000 000 ₽ нужно имущество дороже 5 000 000 ₽ (машина, бизнес или компания)');
            return;
        }
        const now = monoNow();
        bankState.loanSeq += 1;
        bankState.loans.push({ id: bankState.loanSeq, principal: amount, balance: Math.round(amount * LOAN_MARKUP), issued: now, due: now + LOAN_TERM_DAYS * 1440, accrued: 0, remind: false, overdueSms: false });
        playerMoney += amount;
        addBankTransaction('Кредит BestBank', amount, true);
        addMessage('BestBank', '🏦', 'Кредит ' + fmtNum(amount) + ' ₽ одобрен. Вернуть нужно ' + fmtNum(amount * LOAN_MARKUP) + ' ₽ в течение ' + LOAN_TERM_DAYS + ' дней. За каждый день просрочки добавляется 5%. Через 3 недели без погашения банк заберёт имущество.');
        saveGameData();
        updateClockUI();
        showToast('🏦 Кредит одобрен');
        renderBankApp();
    }

    function payLoan(loan, amountValue) {
        let amount = Math.floor(Number(amountValue));
        if (!(amount > 0)) { showToast('Введите сумму платежа'); return; }
        amount = Math.min(amount, Math.ceil(loan.balance));
        if (playerMoney < amount) { showToast('Недостаточно денег'); return; }
        playerMoney -= amount;
        addBankTransaction('Платёж по кредиту', amount, false);
        loan.balance -= amount;
        if (loan.balance <= 0.5) {
            bankState.loans = bankState.loans.filter(function (l) { return l.id !== loan.id; });
            addMessage('BestBank', '🎉', 'Кредит полностью погашен. Спасибо!');
            showToast('🎉 Кредит погашен');
        } else {
            showToast('Внесено ' + fmtNum(amount) + ' ₽. Остаток ' + fmtNum(loan.balance) + ' ₽');
        }
        saveGameData();
        updateClockUI();
        renderBankApp();
    }

    function seizeForLoan(loan) {
        const debt = Math.ceil(loan.balance);
        const items = ownedPropertyList().sort(function (a, b) { return a.price - b.price; });
        const taken = [];
        let sum = 0;
        if (items.length) {
            items.filter(function (p) { return p.price <= debt * 1.5; }).forEach(function (p) {
                if (sum < debt * 0.8) { taken.push(p); sum += p.price; }
            });
            if (!taken.length) taken.push(items[0]);
        }
        let text;
        if (taken.length) {
            taken.forEach(function (p) {
                if (p.kind === 'car') {
                    ownedCars = ownedCars.filter(function (c) { return c.id !== p.id; });
                    delete carFuel[p.id];
                } else if (p.kind === 'biz') {
                    delete bizState.owned[p.id];
                    bizSave();
                } else if (p.kind === 'co') {
                    delete coState.owned[p.id];
                    coSave();
                }
            });
            text = 'Кредит не погашен за 3 недели. Банк забрал имущество: ' + taken.map(function (p) { return p.name; }).join(', ') + '.';
        } else {
            const charge = Math.round(debt * 1.3);
            playerMoney = Math.max(0, playerMoney - charge);
            addBankTransaction('Принудительное списание по кредиту', charge, false);
            text = 'Кредит не погашен за 3 недели. Имущества нет, поэтому со счёта списано ' + fmtNum(charge) + ' ₽ (в 1,3 раза больше долга).';
        }
        bankState.loans = bankState.loans.filter(function (l) { return l.id !== loan.id; });
        addMessage('BestBank', '⚠️', text);
        showToast('⚠️ Банк взыскал долг по кредиту');
    }

    function processBank() {
        if (performance.now() - bankLastTick < 1000) return;
        bankLastTick = performance.now();
        if (!bankState.loans.length) return;
        const now = monoNow();
        let changed = false;
        bankState.loans.slice().forEach(function (loan) {
            if (now >= loan.issued + LOAN_SEIZE_DAYS * 1440) {
                seizeForLoan(loan);
                changed = true;
                return;
            }
            if (!loan.remind && loan.due - now <= 1440 && now < loan.due) {
                loan.remind = true;
                addMessage('BestBank', '⏰', 'Завтра последний день погашения кредита (остаток ' + fmtNum(loan.balance) + ' ₽). С завтрашнего дня начнётся просрочка: +5% в день.');
                changed = true;
            }
            if (now >= loan.due) {
                const days = Math.floor((now - loan.due) / 1440);
                while (loan.accrued < days) {
                    loan.balance *= LOAN_OVERDUE_DAILY;
                    loan.accrued += 1;
                    changed = true;
                }
                if (!loan.overdueSms) {
                    loan.overdueSms = true;
                    addMessage('BestBank', '❗', 'Срок кредита истёк. За каждый день просрочки к остатку добавляется 5%. Погасите долг как можно скорее.');
                    changed = true;
                }
            }
        });
        if (changed) {
            saveGameData();
            refreshBank();
        }
    }

    function renderBankExtras(wrapper) {
        const extra = document.createElement('div');
        extra.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin:12px 0;';
        const inputCss = 'padding:10px;border-radius:10px;border:1px solid #cbd5e1;font-size:1rem;width:100%;box-sizing:border-box;';

        const acc = document.createElement('div');
        acc.className = 'ps-card';
        acc.style.cssText = 'flex-direction:column;align-items:stretch;gap:6px;';
        acc.innerHTML = '<div class="ps-name">💳 Ваш номер счёта: ' + bankState.account + '</div><div class="ps-desc">Дайте номер друзьям, чтобы они могли вам перевести деньги. Номер привязан к вам, а не к приложению.</div><div class="ps-meta">' + (fbDb ? (bankState.registered ? '🟢 Онлайн-переводы работают' : '🟡 Подключение к серверу...') : '🔴 Firebase не подключён: переводы недоступны') + '</div>';
        extra.appendChild(acc);

        const tr = document.createElement('div');
        tr.className = 'ps-card';
        tr.style.cssText = 'flex-direction:column;align-items:stretch;gap:8px;';
        tr.innerHTML = '<div class="ps-name">💸 Перевод игроку</div><input id="bk-acc" type="number" inputmode="numeric" placeholder="Номер счёта (5 цифр)" style="' + inputCss + '"><input id="bk-sum" type="number" inputmode="numeric" placeholder="Сумма от 1 до 10 000 000 ₽" style="' + inputCss + '"><div class="ps-meta">Комиссия 3% сверх суммы перевода.</div><div id="bk-recents" style="display:flex;flex-wrap:wrap;gap:6px;"></div><button type="button" class="ps-btn" id="bk-send" style="align-self:flex-end;">Перевести</button>';
        const recents = tr.querySelector('#bk-recents');
        bankState.recents.forEach(function (a) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'ps-btn ps-btn-off';
            chip.style.cssText = 'padding:4px 10px;background:#e0e7ff;color:#3730a3;';
            chip.textContent = String(a);
            chip.addEventListener('click', function () { tr.querySelector('#bk-acc').value = a; });
            recents.appendChild(chip);
        });
        tr.querySelector('#bk-send').addEventListener('click', function () { sendTransfer(tr.querySelector('#bk-acc').value, tr.querySelector('#bk-sum').value); });
        if (bankState.transfers.length) {
            const hist = document.createElement('div');
            hist.className = 'ps-desc';
            hist.innerHTML = '<b>История переводов:</b><br>' + bankState.transfers.slice(0, 8).map(function (t) { return t.date + ' • счёт ' + t.acc + ' • ' + fmtNum(t.amount) + ' ₽ (комиссия ' + fmtNum(t.fee) + ' ₽)'; }).join('<br>');
            tr.appendChild(hist);
        }
        extra.appendChild(tr);

        const loans = document.createElement('div');
        loans.className = 'ps-card';
        loans.style.cssText = 'flex-direction:column;align-items:stretch;gap:8px;';
        loans.innerHTML = '<div class="ps-name">🏦 Кредиты</div><div class="ps-desc">От 50 000 до 100 000 000 ₽, до 2 кредитов сразу. До 1 000 000 ₽ без залога, больше нужно имущество дороже 5 000 000 ₽. Вернуть за 10 дней +25%. Дальше +5% в день, через 3 недели банк заберёт имущество (или спишет 130% долга).</div>';
        const now = monoNow();
        bankState.loans.forEach(function (loan) {
            const box = document.createElement('div');
            box.style.cssText = 'padding:10px;border-radius:12px;background:#f1f5f9;display:flex;flex-direction:column;gap:6px;';
            const left = loan.due - now;
            box.innerHTML = '<div class="ps-name">Кредит #' + loan.id + ': остаток ' + fmtNum(loan.balance) + ' ₽</div><div class="ps-meta">' + (left > 0 ? 'Срок: ещё ' + fmtLeft(left) : '❗ Просрочка ' + fmtLeft(-left)) + '</div><input type="number" inputmode="numeric" placeholder="Сумма платежа" class="bk-pay" style="' + inputCss + '"><div style="display:flex;gap:8px;"><button type="button" class="ps-btn bk-pay-btn" style="flex:1;">Внести</button><button type="button" class="ps-btn bk-full-btn" style="flex:1;background:#0ea5e9;">Погасить всё</button></div>';
            box.querySelector('.bk-pay-btn').addEventListener('click', function () { payLoan(loan, box.querySelector('.bk-pay').value); });
            box.querySelector('.bk-full-btn').addEventListener('click', function () { payLoan(loan, Math.ceil(loan.balance)); });
            loans.appendChild(box);
        });
        const form = document.createElement('div');
        form.style.cssText = 'display:flex;gap:8px;';
        form.innerHTML = '<input id="bk-loan" type="number" inputmode="numeric" placeholder="Сумма кредита" style="' + inputCss + 'flex:1;"><button type="button" class="ps-btn" id="bk-loan-btn">Взять</button>';
        form.querySelector('#bk-loan-btn').addEventListener('click', function () { takeLoan(form.querySelector('#bk-loan').value); });
        loans.appendChild(form);
        extra.appendChild(loans);

        wrapper.insertBefore(extra, wrapper.children[1] || null);
    }

    /* =========================================================
       ИГРЫ ОФФЛАЙН: одно приложение, 5 игр
       ========================================================= */
    const OFFLINE_GAMES = [
        { id: 'dino', emoji: '🦖', name: 'Динозаврик', desc: 'Прыгай через кактусы' },
        { id: 'flappy', emoji: '🐤', name: 'Флаппи-птичка', desc: 'Лети между трубами' },
        { id: 'snake', emoji: '🐍', name: 'Змейка', desc: 'Ешь яблоки и расти' },
        { id: 'tetris', emoji: '🧱', name: 'Тетрис', desc: 'Собирай линии' },
        { id: 'g2048', emoji: '🔢', name: '2048', desc: 'Соединяй одинаковые числа' }
    ];
    const OG = { id: null, token: 0, raf: 0, timers: [], keys: [] };

    function ogAlive(token) {
        return OG.id && OG.token === token && currentPhoneApp === 'games' && !phoneModal.classList.contains('hidden');
    }

    function stopOfflineGame() {
        OG.token += 1;
        OG.id = null;
        cancelAnimationFrame(OG.raf);
        OG.timers.forEach(function (t) { clearInterval(t); });
        OG.timers = [];
        OG.keys.forEach(function (h) { window.removeEventListener('keydown', h); });
        OG.keys = [];
    }

    function renderGamesApp() {
        stopOfflineGame();
        appScrollableBody.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'ps-wrap';
        wrap.innerHTML = '<div class="ps-header" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)"><div class="ps-title">🎮 Игры оффлайн</div><div class="ps-sub">Выберите игру. Работают без интернета.</div></div>';
        OFFLINE_GAMES.forEach(function (game) {
            const card = document.createElement('div');
            card.className = 'ps-card';
            card.innerHTML = '<div class="ps-icon"><span>' + game.emoji + '</span></div><div class="ps-info"><div class="ps-name">' + game.name + '</div><div class="ps-desc">' + game.desc + '</div><div class="ps-meta">Рекорд: ' + fmtNum(gamesState.best[game.id] || 0) + '</div></div><button type="button" class="ps-btn">Играть</button>';
            card.querySelector('.ps-btn').addEventListener('click', function () { startOfflineGame(game.id); });
            wrap.appendChild(card);
        });
        appScrollableBody.appendChild(wrap);
    }

    function startOfflineGame(id) {
        stopOfflineGame();
        const token = OG.token;
        OG.id = id;
        const info = OFFLINE_GAMES.find(function (g) { return g.id === id; });
        appScrollableBody.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'og-wrap';
        wrap.innerHTML = '<div class="og-head"><button type="button" class="og-btn og-back">← Игры</button><div class="og-title">' + info.emoji + ' ' + info.name + '</div><div class="og-score">Очки: <b id="og-score">0</b> • Рекорд: <b id="og-best">' + fmtNum(gamesState.best[id] || 0) + '</b></div></div>';
        const canvas = document.createElement('canvas');
        canvas.className = 'og-canvas';
        const controls = document.createElement('div');
        controls.className = 'og-controls';
        wrap.appendChild(canvas);
        wrap.appendChild(controls);
        appScrollableBody.appendChild(wrap);
        wrap.querySelector('.og-back').addEventListener('click', renderGamesApp);
        const ctx = canvas.getContext('2d');
        let inputTap = null;
        let inputSwipe = null;
        let down = null;
        canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
        canvas.addEventListener('pointerup', function (e) {
            if (!down) return;
            const dx = e.clientX - down.x;
            const dy = e.clientY - down.y;
            down = null;
            if (Math.hypot(dx, dy) < 22) { if (inputTap) inputTap(); return; }
            if (inputSwipe) inputSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        });
        const api = {
            canvas: canvas,
            ctx: ctx,
            setSize: function (w, h, cssW) { canvas.width = w; canvas.height = h; canvas.style.width = Math.min(cssW || w, 340) + 'px'; },
            setScore: function (n) {
                document.getElementById('og-score').textContent = fmtNum(n);
                if (n > (gamesState.best[id] || 0)) {
                    gamesState.best[id] = n;
                    document.getElementById('og-best').textContent = fmtNum(n);
                }
            },
            over: function () { saveGameData(); },
            button: function (label, fn) {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'og-btn';
                b.textContent = label;
                b.addEventListener('click', fn);
                controls.appendChild(b);
            },
            key: function (handler) {
                const h = function (e) { if (ogAlive(token)) handler(e); };
                window.addEventListener('keydown', h);
                OG.keys.push(h);
            },
            input: function (tap, swipe) { inputTap = tap; inputSwipe = swipe; },
            loop: function (step) {
                let last = performance.now();
                function frame(t) {
                    if (!ogAlive(token)) return;
                    const dt = Math.min(0.05, (t - last) / 1000);
                    last = t;
                    step(dt);
                    OG.raf = requestAnimationFrame(frame);
                }
                OG.raf = requestAnimationFrame(frame);
            }
        };
        ({ dino: ogDino, flappy: ogFlappy, snake: ogSnake, tetris: ogTetris, g2048: og2048 })[id](api);
    }

    function ogMessage(ctx, w, h, text) {
        ctx.fillStyle = 'rgba(15,23,42,.62)';
        ctx.fillRect(0, h / 2 - 34, w, 68);
        ctx.fillStyle = '#fff';
        ctx.font = '800 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, w / 2, h / 2 + 6);
        ctx.textAlign = 'left';
    }

    /* ---------- 1. Динозаврик ---------- */
    function ogDino(api) {
        const ctx = api.ctx;
        api.setSize(320, 200, 320);
        const GROUND = 165;
        let y = 0, vy = 0, obs = [], speed = 190, dist = 0, spawn = 1, over = false, started = false;
        function reset() { y = 0; vy = 0; obs = []; speed = 190; dist = 0; spawn = 1; over = false; started = false; api.setScore(0); }
        function jump() {
            if (over) { reset(); return; }
            started = true;
            if (y === 0) vy = 430;
        }
        api.input(jump, function (dir) { if (dir === 'up') jump(); });
        api.key(function (e) { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } });
        api.button('⬆ Прыжок', jump);
        api.loop(function (dt) {
            if (started && !over) {
                vy -= 1300 * dt;
                y = Math.max(0, y + vy * dt);
                if (y === 0) vy = 0;
                dist += speed * dt;
                speed = Math.min(430, speed + dt * 6);
                spawn -= dt;
                if (spawn <= 0) {
                    obs.push({ x: 330, w: 16 + Math.random() * 14, h: 26 + Math.random() * 20 });
                    spawn = 0.75 + Math.random() * 0.9 + 60 / speed;
                }
                obs.forEach(function (o) { o.x -= speed * dt; });
                obs = obs.filter(function (o) { return o.x > -40; });
                obs.forEach(function (o) {
                    if (o.x < 58 && o.x + o.w > 36 && y < o.h - 6) { over = true; api.over(); }
                });
                api.setScore(Math.floor(dist / 10));
            }
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, 320, 200);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, GROUND, 320, 3);
            ctx.font = '36px serif';
            ctx.fillText('🦖', 26, GROUND - y + 4);
            obs.forEach(function (o) {
                ctx.font = Math.round(o.h * 1.35) + 'px serif';
                ctx.fillText('🌵', o.x - 4, GROUND + 3);
            });
            if (!started) ogMessage(ctx, 320, 200, 'Нажми, чтобы начать');
            else if (over) ogMessage(ctx, 320, 200, 'Конец! Нажми, чтобы заново');
        });
    }

    /* ---------- 2. Флаппи-птичка ---------- */
    function ogFlappy(api) {
        const ctx = api.ctx;
        api.setSize(320, 420, 300);
        const GAP = 125, PIPE_W = 52, BX = 80;
        let by = 200, vy = 0, pipes = [], spawn = 0.4, score = 0, over = false, started = false;
        function reset() { by = 200; vy = 0; pipes = []; spawn = 0.4; score = 0; over = false; started = false; api.setScore(0); }
        function flap() {
            if (over) { reset(); return; }
            started = true;
            vy = -300;
        }
        api.input(flap, function (dir) { if (dir === 'up') flap(); });
        api.key(function (e) { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } });
        api.button('⬆ Взмах', flap);
        api.loop(function (dt) {
            if (started && !over) {
                vy += 900 * dt;
                by += vy * dt;
                spawn -= dt;
                if (spawn <= 0) {
                    pipes.push({ x: 330, gapY: 70 + Math.random() * 190, passed: false });
                    spawn = 1.55;
                }
                pipes.forEach(function (p) {
                    p.x -= 115 * dt;
                    if (!p.passed && p.x + PIPE_W < BX) { p.passed = true; score += 1; api.setScore(score); }
                    if (p.x < BX + 12 && p.x + PIPE_W > BX - 12 && (by - 12 < p.gapY || by + 12 > p.gapY + GAP)) { over = true; api.over(); }
                });
                pipes = pipes.filter(function (p) { return p.x > -70; });
                if (by < 0 || by > 408) { over = true; api.over(); }
            }
            ctx.fillStyle = '#7dd3fc';
            ctx.fillRect(0, 0, 320, 420);
            ctx.fillStyle = '#22c55e';
            pipes.forEach(function (p) {
                ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
                ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, 420 - p.gapY - GAP);
            });
            ctx.font = '30px serif';
            ctx.fillText('🐤', BX - 16, by + 11);
            if (!started) ogMessage(ctx, 320, 420, 'Нажми, чтобы лететь');
            else if (over) ogMessage(ctx, 320, 420, 'Конец! Нажми, чтобы заново');
        });
    }
    /* ---------- 3. Змейка ---------- */
    function ogSnake(api) {
        const ctx = api.ctx;
        const N = 16, S = 20;
        api.setSize(N * S, N * S, 320);
        let snake, dir, nextDir, apple, over, started, acc, delay;
        function placeApple() {
            do { apple = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
            while (snake.some(function (s) { return s.x === apple.x && s.y === apple.y; }));
        }
        function reset() {
            snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
            dir = { x: 1, y: 0 }; nextDir = dir; over = false; started = false; acc = 0; delay = 0.14;
            placeApple();
            api.setScore(0);
        }
        function turn(name) {
            const map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
            const d = map[name];
            if (over) { reset(); return; }
            started = true;
            if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
        }
        reset();
        api.input(function () { if (over) reset(); }, turn);
        api.key(function (e) {
            const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
            if (m[e.code]) { e.preventDefault(); turn(m[e.code]); }
        });
        api.button('◀', function () { turn('left'); });
        api.button('▲', function () { turn('up'); });
        api.button('▼', function () { turn('down'); });
        api.button('▶', function () { turn('right'); });
        api.loop(function (dt) {
            if (started && !over) {
                acc += dt;
                while (acc >= delay && !over) {
                    acc -= delay;
                    dir = nextDir;
                    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
                    if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
                        over = true;
                        api.over();
                        break;
                    }
                    snake.unshift(head);
                    if (head.x === apple.x && head.y === apple.y) {
                        api.setScore(snake.length - 3);
                        delay = Math.max(0.07, delay - 0.003);
                        placeApple();
                    } else {
                        snake.pop();
                    }
                }
            }
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, N * S, N * S);
            ctx.font = '17px serif';
            ctx.fillText('🍎', apple.x * S + 1, apple.y * S + 16);
            snake.forEach(function (s, i) {
                ctx.fillStyle = i === 0 ? '#4ade80' : '#22c55e';
                ctx.fillRect(s.x * S + 1, s.y * S + 1, S - 2, S - 2);
            });
            if (!started) ogMessage(ctx, N * S, N * S, 'Проведи пальцем, чтобы начать');
            else if (over) ogMessage(ctx, N * S, N * S, 'Конец! Нажми, чтобы заново');
        });
    }

    /* ---------- 4. Тетрис ---------- */
    function ogTetris(api) {
        const ctx = api.ctx;
        const W = 10, H = 20, S = 18;
        api.setSize(W * S, H * S, 216);
        const SHAPES = [
            { m: [[1, 1, 1, 1]], c: '#22d3ee' }, { m: [[1, 1], [1, 1]], c: '#facc15' }, { m: [[0, 1, 0], [1, 1, 1]], c: '#c084fc' },
            { m: [[0, 1, 1], [1, 1, 0]], c: '#4ade80' }, { m: [[1, 1, 0], [0, 1, 1]], c: '#f87171' }, { m: [[1, 0, 0], [1, 1, 1]], c: '#60a5fa' }, { m: [[0, 0, 1], [1, 1, 1]], c: '#fb923c' }
        ];
        let grid, cur, score, lines, over, started, acc;
        function empty() { return Array.from({ length: H }, function () { return new Array(W).fill(null); }); }
        function collide(m, x, y) {
            for (let r = 0; r < m.length; r += 1) {
                for (let c = 0; c < m[r].length; c += 1) {
                    if (!m[r][c]) continue;
                    const nx = x + c, ny = y + r;
                    if (nx < 0 || nx >= W || ny >= H || (ny >= 0 && grid[ny][nx])) return true;
                }
            }
            return false;
        }
        function spawn() {
            const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            cur = { m: s.m, c: s.c, x: Math.floor((W - s.m[0].length) / 2), y: 0 };
            if (collide(cur.m, cur.x, cur.y)) { over = true; api.over(); }
        }
        function reset() { grid = empty(); score = 0; lines = 0; over = false; started = false; acc = 0; api.setScore(0); spawn(); }
        function rotate(m) { return m[0].map(function (_, i) { return m.map(function (row) { return row[i]; }).reverse(); }); }
        function lock() {
            cur.m.forEach(function (row, r) { row.forEach(function (v, c) { if (v && cur.y + r >= 0) grid[cur.y + r][cur.x + c] = cur.c; }); });
            let cleared = 0;
            for (let r = H - 1; r >= 0; r -= 1) {
                if (grid[r].every(function (v) { return v; })) { grid.splice(r, 1); grid.unshift(new Array(W).fill(null)); cleared += 1; r += 1; }
            }
            if (cleared) {
                lines += cleared;
                score += [0, 100, 300, 500, 800][cleared];
                api.setScore(score);
            }
            spawn();
        }
        function move(dx) { if (!over && !collide(cur.m, cur.x + dx, cur.y)) cur.x += dx; started = true; }
        function turnPiece() {
            if (over) { reset(); return; }
            started = true;
            const r = rotate(cur.m);
            if (!collide(r, cur.x, cur.y)) cur.m = r;
            else if (!collide(r, cur.x - 1, cur.y)) { cur.m = r; cur.x -= 1; }
            else if (!collide(r, cur.x + 1, cur.y)) { cur.m = r; cur.x += 1; }
        }
        function down() { if (over) return; started = true; if (!collide(cur.m, cur.x, cur.y + 1)) cur.y += 1; else lock(); }
        function drop() { if (over) return; started = true; while (!collide(cur.m, cur.x, cur.y + 1)) cur.y += 1; lock(); }
        reset();
        api.input(turnPiece, function (dir) { if (dir === 'left') move(-1); else if (dir === 'right') move(1); else if (dir === 'down') drop(); else turnPiece(); });
        api.key(function (e) {
            const k = e.code;
            if (k === 'ArrowLeft') { e.preventDefault(); move(-1); }
            else if (k === 'ArrowRight') { e.preventDefault(); move(1); }
            else if (k === 'ArrowUp') { e.preventDefault(); turnPiece(); }
            else if (k === 'ArrowDown') { e.preventDefault(); down(); }
            else if (k === 'Space') { e.preventDefault(); drop(); }
        });
        api.button('◀', function () { move(-1); });
        api.button('⟳', turnPiece);
        api.button('▶', function () { move(1); });
        api.button('▼', down);
        api.button('⏬', drop);
        api.loop(function (dt) {
            if (started && !over) {
                acc += dt;
                const delay = Math.max(0.1, 0.62 - lines * 0.018);
                if (acc >= delay) { acc = 0; down(); }
            }
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, W * S, H * S);
            for (let r = 0; r < H; r += 1) {
                for (let c = 0; c < W; c += 1) {
                    if (grid[r][c]) { ctx.fillStyle = grid[r][c]; ctx.fillRect(c * S + 1, r * S + 1, S - 2, S - 2); }
                }
            }
            if (!over) {
                ctx.fillStyle = cur.c;
                cur.m.forEach(function (row, r) { row.forEach(function (v, c) { if (v) ctx.fillRect((cur.x + c) * S + 1, (cur.y + r) * S + 1, S - 2, S - 2); }); });
            }
            if (!started) ogMessage(ctx, W * S, H * S, 'Нажми кнопку, чтобы начать');
            else if (over) ogMessage(ctx, W * S, H * S, 'Конец! Нажми, чтобы заново');
        });
    }

    /* ---------- 5. 2048 ---------- */
    function og2048(api) {
        const ctx = api.ctx;
        api.setSize(320, 320, 320);
        const COLORS = { 0: '#cbd5e1', 2: '#fef3c7', 4: '#fde68a', 8: '#fdba74', 16: '#fb923c', 32: '#f87171', 64: '#ef4444', 128: '#facc15', 256: '#eab308', 512: '#84cc16', 1024: '#22c55e', 2048: '#06b6d4' };
        let board, score, over, dirty = true;
        function addTile() {
            const free = [];
            board.forEach(function (row, r) { row.forEach(function (v, c) { if (!v) free.push([r, c]); }); });
            if (!free.length) return;
            const pick = free[Math.floor(Math.random() * free.length)];
            board[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
        }
        function reset() { board = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; score = 0; over = false; addTile(); addTile(); api.setScore(0); dirty = true; }
        function lineCells(i, dir) {
            const idx = [0, 1, 2, 3];
            const order = (dir === 'right' || dir === 'down') ? idx.slice().reverse() : idx;
            return order.map(function (j) { return (dir === 'left' || dir === 'right') ? [i, j] : [j, i]; });
        }
        function canMove() {
            for (let r = 0; r < 4; r += 1) for (let c = 0; c < 4; c += 1) {
                if (!board[r][c]) return true;
                if (c < 3 && board[r][c] === board[r][c + 1]) return true;
                if (r < 3 && board[r][c] === board[r + 1][c]) return true;
            }
            return false;
        }
        function move(dir) {
            if (over) { reset(); return; }
            let moved = false;
            for (let i = 0; i < 4; i += 1) {
                const cells = lineCells(i, dir);
                const vals = cells.map(function (p) { return board[p[0]][p[1]]; });
                const arr = vals.filter(function (v) { return v; });
                for (let k = 0; k < arr.length - 1; k += 1) {
                    if (arr[k] === arr[k + 1]) { arr[k] *= 2; score += arr[k]; arr.splice(k + 1, 1); }
                }
                while (arr.length < 4) arr.push(0);
                cells.forEach(function (p, k) { if (board[p[0]][p[1]] !== arr[k]) moved = true; board[p[0]][p[1]] = arr[k]; });
            }
            if (moved) { addTile(); api.setScore(score); if (!canMove()) { over = true; api.over(); } }
            dirty = true;
        }
        reset();
        api.input(function () { if (over) reset(); }, move);
        api.key(function (e) {
            const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
            if (m[e.code]) { e.preventDefault(); move(m[e.code]); }
        });
        api.button('◀', function () { move('left'); });
        api.button('▲', function () { move('up'); });
        api.button('▼', function () { move('down'); });
        api.button('▶', function () { move('right'); });
        api.loop(function () {
            if (!dirty) return;
            dirty = false;
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, 0, 320, 320);
            board.forEach(function (row, r) {
                row.forEach(function (v, c) {
                    ctx.fillStyle = COLORS[v] || '#0ea5e9';
                    ctx.fillRect(10 + c * 76, 10 + r * 76, 70, 70);
                    if (v) {
                        ctx.fillStyle = v <= 4 ? '#475569' : '#fff';
                        ctx.font = '800 ' + (v >= 1000 ? 22 : 28) + 'px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(String(v), 45 + c * 76, 54 + r * 76);
                        ctx.textAlign = 'left';
                    }
                });
            });
            if (over) ogMessage(ctx, 320, 320, 'Ходов нет! Нажми, чтобы заново');
        });
    }

    /* =========================================================
       ЗАПУСК ИГРЫ И ИГРОВОЙ ЦИКЛ
       ========================================================= */

    function launchGame() {
        if (typeof coAnnounceOffline === 'function') coAnnounceOffline();
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

    /* Игровой цикл: потребности считаются 5 раз в секунду, карта рисуется до 30 кадров в секунду и не рисуется,
       пока её закрывает телефон, окно или другой экран */
    const MAP_FRAME_MS = 1000 / 30;
    const OBSCURE_SELECTOR = '.modal-overlay:not(.hidden), .phone-modal-overlay:not(.hidden), .tax-history-overlay:not(.hidden), .dialogue-overlay:not(.hidden), .screen:not(.hidden):not(#game-screen), .full-screen:not(.hidden):not(#game-screen)';
    let needsAccum = 0;
    let lastMapFrameAt = 0;
    let obscureCheckAt = 0;
    let mapObscured = false;

    function renderLoop(frameNow) {
        const now = performance.now();
        const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.25);
        lastFrameTime = now;
        animTimer += deltaSeconds * 2.4;

        needsAccum += deltaSeconds;
        if (needsAccum >= 0.2) {
            updateNeeds(needsAccum);
            needsAccum = 0;
        }

        if (currentScreen === 'city') {
            if (now - obscureCheckAt > 250) {
                obscureCheckAt = now;
                mapObscured = isFlying() || isOnVacation() || Boolean(document.querySelector(OBSCURE_SELECTOR));
            }
            if (forceRender || (!mapObscured && now - lastMapFrameAt >= MAP_FRAME_MS)) {
                forceRender = false;
                lastMapFrameAt = now;
                render();
            }
        }
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
    if (exitMarket) exitMarket.addEventListener('click', function () { marketScreen.classList.add('hidden');
        xjHideScreens(); hideAirportScreen(); currentScreen = 'city'; lastExitedLocation = 'market'; saveGameData(); btnOpenSettingsGame.classList.remove('hidden'); });

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

    if (btnTravelBack) btnTravelBack.addEventListener('click', travelChoiceBack);
    if (btnTravelPersonal) btnTravelPersonal.addEventListener('click', showPersonalTravelStep);
    if (btnTravelTaxi) btnTravelTaxi.addEventListener('click', startTaxiFromMap);
    if (btnTravelWalk) btnTravelWalk.addEventListener('click', startWalkTravel);
    if (btnTravelCar) btnTravelCar.addEventListener('click', startCarTravel);
    if (btnTravelBike) btnTravelBike.addEventListener('click', startBikeTravel);
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


    window.addEventListener('resize', function () {
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
            resizeCanvas();
            clampCamera();
            render();
        }
    });

        /* =========================================================
       ДОПОЛНИТЕЛЬНЫЕ ПРОФЕССИИ
       Полицейский, Доктор, Таксист, Продавец
       (отдельный блок, не затрагивает пожарного, дальнобойщика и кассира)
       ========================================================= */
    const XJ_STORAGE_KEY = 'bestlife_extra_jobs_v1';

    const XJ_LOCATIONS = {
        police: {
            key: 'police',
            jobId: 'police',
            title: '🚓 Полицейский участок',
            label: 'Полиция',
            icon: '🚓',
            color: '#1d4ed8',
            glow: '#60a5fa',
            screenId: 'police-screen',
            exitId: 'btn-exit-police',
            npcId: 'police-npc-inroom',
            travelTitle: 'Едем в Полицейский участок',
            walkTitle: 'Полицейский участок'
        },
        hospital: {
            key: 'hospital',
            jobId: 'doctor',
            title: '🏥 Больница',
            label: 'Больница',
            icon: '🏥',
            color: '#0d9488',
            glow: '#5eead4',
            screenId: 'hospital-screen',
            exitId: 'btn-exit-hospital',
            npcId: 'hospital-npc-inroom',
            travelTitle: 'Едем в Больницу',
            walkTitle: 'Больницу'
        },
        taxipark: {
            key: 'taxipark',
            jobId: 'taxi',
            title: '🚕 Таксопарк',
            label: 'Таксопарк',
            icon: '🚕',
            color: '#ca8a04',
            glow: '#fde047',
            screenId: 'taxipark-screen',
            exitId: 'btn-exit-taxipark',
            npcId: 'taxipark-npc-inroom',
            travelTitle: 'Едем в Таксопарк',
            walkTitle: 'Таксопарк'
        }
    };

    const XJ_JOBS = {
        police: {
            id: 'police',
            title: 'Полицейский',
            icon: '🚓',
            locKey: 'police',
            placeText: 'в Полицейском участке',
            npcName: 'Начальник полиции',
            npcIcon: '👮',
            greeting: 'Здравствуйте! Я начальник полиции. Хотите служить закону?',
            about: 'Рабочее время полицейского: 08:00–17:00. Выполняйте вызовы, патрулируйте город и получайте зарплату за каждое выполненное задание.',
            ordersLabel: 'Вызовы',
            ordersTitle: '🚓 Доступные вызовы',
            startH: 8,
            endH: 17,
            interviewMin: 720,
            questions: [
                {
                    title: 'Какой номер экстренного вызова полиции в России?',
                    options: ['102', '101', '103', '104'],
                    correct: 0
                },
                {
                    title: 'Что должен сделать полицейский, заметив нарушение ПДД?',
                    options: [
                        'Остановить нарушителя и составить протокол',
                        'Сделать вид, что ничего не заметил',
                        'Забрать у водителя машину',
                        'Уехать с места нарушения'
                    ],
                    correct: 0
                }
            ],
            tasks: [
                {
                    id: 'patrol',
                    title: '🟢 Патрулирование улиц',
                    desc: 'Обход района и проверка порядка',
                    reward: 700,
                    clicks: 60,
                    steps: [
                        {
                            title: 'Во время патруля вы видите, как прохожий бросил мусор мимо урны. Ваши действия?',
                            options: [
                                'Вежливо сделать замечание и объяснить правила',
                                'Не обращать внимания',
                                'Накричать на него',
                                'Забрать у него телефон'
                            ],
                            correct: 0
                        }
                    ]
                },
                {
                    id: 'accident',
                    title: '🟡 Дорожное происшествие',
                    desc: 'Выезд на место ДТП',
                    reward: 800,
                    clicks: 80,
                    steps: [
                        {
                            title: 'Вы прибыли на место ДТП. Что нужно сделать в первую очередь?',
                            options: [
                                'Обеспечить безопасность и вызвать скорую при пострадавших',
                                'Выяснять, кто виноват',
                                'Убрать машины и уехать',
                                'Сфотографироваться на фоне аварии'
                            ],
                            correct: 0
                        }
                    ]
                },
                {
                    id: 'arrest',
                    title: '🔴 Задержание нарушителя',
                    desc: 'Погоня и задержание',
                    reward: 950,
                    clicks: 100,
                    steps: [
                        {
                            title: 'Перед задержанием подозреваемого вы должны…',
                            options: [
                                'Представиться и объяснить причину задержания',
                                'Сразу применить силу',
                                'Скрыть своё звание',
                                'Отпустить подозреваемого'
                            ],
                            correct: 0
                        },
                        {
                            title: 'Что нужно сделать после задержания?',
                            options: [
                                'Разъяснить права и составить протокол',
                                'Отпустить без документов',
                                'Ничего не оформлять',
                                'Отправить домой на такси'
                            ],
                            correct: 0
                        }
                    ]
                }
            ]
        },
        doctor: {
            id: 'doctor',
            title: 'Доктор',
            icon: '🩺',
            locKey: 'hospital',
            placeText: 'в Больнице',
            npcName: 'Главврач',
            npcIcon: '👨‍⚕️',
            greeting: 'Добрый день! Я главврач. Готовы спасать жизни?',
            about: 'Рабочее время доктора: 08:00–20:00. Принимайте пациентов, выезжайте на вызовы и проводите операции. За каждое задание вы получаете зарплату.',
            ordersLabel: 'Пациенты',
            ordersTitle: '🩺 Доступные пациенты',
            startH: 8,
            endH: 20,
            interviewMin: 660,
            questions: [
                {
                    title: 'Какая температура тела у здорового взрослого человека?',
                    options: ['36,6 °C', '38,5 °C', '34,0 °C', '40,0 °C'],
                    correct: 0
                },
                {
                    title: 'Что нужно сделать при сильном кровотечении из раны?',
                    options: [
                        'Наложить давящую повязку и вызвать скорую',
                        'Промыть рану соком',
                        'Подождать, пока остановится само',
                        'Дать пациенту поспать'
                    ],
                    correct: 0
                }
            ],
            tasks: [
                {
                    id: 'checkup',
                    title: '🟢 Приём в поликлинике',
                    desc: 'Осмотр и назначение лечения',
                    reward: 750,
                    clicks: 30,
                    steps: [
                        {
                            title: 'У пациента температура 39 °C и сильный кашель. Что вы сделаете в первую очередь?',
                            options: [
                                'Проведу осмотр, измерю давление и назначу анализы',
                                'Выпишу конфеты',
                                'Отправлю домой без осмотра',
                                'Посоветую не лечиться'
                            ],
                            correct: 0
                        }
                    ]
                },
                {
                    id: 'housecall',
                    title: '🟡 Вызов на дом',
                    desc: 'Срочный выезд к пациенту',
                    reward: 900,
                    clicks: 70,
                    steps: [
                        {
                            title: 'У пожилого пациента резкая боль в груди. Что делать?',
                            options: [
                                'Обеспечить покой и вызвать скорую помощь',
                                'Отправить на прогулку',
                                'Предложить сделать зарядку',
                                'Сказать, что само пройдёт'
                            ],
                            correct: 0
                        }
                    ]
                },
                {
                    id: 'surgery',
                    title: '🔴 Операция',
                    desc: 'Сложная плановая операция',
                    reward: 1150,
                    clicks: 90,
                    steps: [
                        {
                            title: 'Что нужно сделать перед операцией?',
                            options: [
                                'Обработать руки и надеть стерильную одежду',
                                'Выпить кофе и сразу начать',
                                'Пропустить подготовку',
                                'Начать без анестезии'
                            ],
                            correct: 0
                        },
                        {
                            title: 'У пациента аллергия на препарат. Что делать?',
                            options: [
                                'Заменить препарат на безопасный',
                                'Всё равно ввести его',
                                'Увеличить дозу',
                                'Не говорить пациенту'
                            ],
                            correct: 0
                        }
                    ]
                }
            ]
        },
        taxi: {
            id: 'taxi',
            title: 'Таксист',
            icon: '🚕',
            locKey: 'taxipark',
            placeText: 'в Таксопарке',
            npcName: 'Диспетчер таксопарка',
            npcIcon: '🚕',
            greeting: 'Привет! Я диспетчер. Хочешь возить пассажиров?',
            about: 'Таксист работает круглосуточно. Принимайте заказы пассажиров, нажимайте на экран, чтобы ехать, и получайте оплату за каждую поездку.',
            ordersLabel: 'Заказы',
            ordersTitle: '🚕 Доступные заказы',
            startH: 0,
            endH: 24,
            interviewMin: 600,
            questions: [
                {
                    title: 'Какой документ обязательно должен быть у водителя такси?',
                    options: [
                        'Водительское удостоверение',
                        'Читательский билет',
                        'Абонемент в спортзал',
                        'Диплом об окончании школы'
                    ],
                    correct: 0
                },
                {
                    title: 'Пассажир просит нарушить ПДД, чтобы приехать быстрее. Что делать?',
                    options: [
                        'Вежливо отказать и ехать по правилам',
                        'Согласиться и проехать на красный',
                        'Разогнаться до 200 км/ч',
                        'Высадить пассажира посреди дороги'
                    ],
                    correct: 0
                }
            ],
            tasks: [
                {
                    id: 'short',
                    title: '🟢 Короткая поездка',
                    desc: 'Пассажир едет в соседний район',
                    reward: 400,
                    clicks: 50,
                    steps: []
                },
                {
                    id: 'city',
                    title: '🟡 Поездка по городу',
                    desc: 'Пассажир едет через весь город',
                    reward: 550,
                    clicks: 90,
                    steps: [
                        {
                            title: 'Пассажир торопится и просит ехать на красный свет. Что делать?',
                            options: [
                                'Вежливо отказаться и ехать по правилам',
                                'Проехать на красный',
                                'Ехать со скоростью 150 км/ч',
                                'Высадить его на дороге'
                            ],
                            correct: 0
                        }
                    ]
                },
                {
                    id: 'airport',
                    title: '🔴 Поездка в аэропорт',
                    desc: 'Дальний рейс с багажом',
                    reward: 800,
                    clicks: 140,
                    steps: [
                        {
                            title: 'Пассажир забыл вещи в машине. Что делать?',
                            options: [
                                'Связаться с пассажиром и вернуть вещи',
                                'Оставить вещи себе',
                                'Выбросить вещи',
                                'Продать вещи'
                            ],
                            correct: 0
                        }
                    ]
                }
            ]
        }
    };

    function xjDefaultJobState() {
        return { active: false, pending: false, interviewDay: null, today: 0, todayKey: null, total: 0 };
    }

    const xjState = {
        police: xjDefaultJobState(),
        doctor: xjDefaultJobState(),
        taxi: xjDefaultJobState()
    };

    let xjTask = null;
    let xjQuiz = null;
    let xjDialogueJobId = null;

    const xjDialogueOverlay = document.getElementById('xj-dialogue-overlay');
    const xjDialogueText = document.getElementById('xj-dialogue-text');
    const xjSpeakerAvatar = document.getElementById('xj-speaker-avatar');
    const xjSpeakerName = document.getElementById('xj-speaker-name');
    const btnXjHiring = document.getElementById('btn-xj-hiring');
    const btnXjAbout = document.getElementById('btn-xj-about');
    const btnXjOrders = document.getElementById('btn-xj-orders');
    const btnXjClose = document.getElementById('btn-xj-close');
    const xjQuizModal = document.getElementById('xj-quiz-modal');
    const xjQuizBadge = document.getElementById('xj-quiz-badge');
    const xjQuizHeading = document.getElementById('xj-quiz-heading');
    const xjQuizTitle = document.getElementById('xj-quiz-title');
    const xjQuizAnswers = document.getElementById('xj-quiz-answers');
    const btnXjQuizClose = document.getElementById('btn-xj-quiz-close');
    const xjOrdersModal = document.getElementById('xj-orders-modal');
    const xjOrdersHeading = document.getElementById('xj-orders-heading');
    const xjOrdersList = document.getElementById('xj-orders-list');
    const btnXjOrdersClose = document.getElementById('btn-xj-orders-close');
    const xjTaskScreen = document.getElementById('xj-task-screen');
    const xjTaskBox = document.getElementById('xj-task-box');
    const btnXjTaskBack = document.getElementById('btn-xj-task-back');
    const xjTaskTitle = document.getElementById('xj-task-title');
    const xjTaskSub = document.getElementById('xj-task-sub');
    const xjTaskProgressBox = document.getElementById('xj-task-progress-box');
    const xjTaskProgressInner = document.getElementById('xj-task-progress-inner');
    const xjTaskPercent = document.getElementById('xj-task-percent');
    const xjTaskQuiz = document.getElementById('xj-task-quiz');
    const xjTaskQuestion = document.getElementById('xj-task-question');
    const xjTaskAnswers = document.getElementById('xj-task-answers');

    function xjLoad() {
        try {
            const raw = localStorage.getItem(XJ_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            Object.keys(xjState).forEach(function (id) {
                if (data && data[id] && typeof data[id] === 'object') {
                    xjState[id] = Object.assign(xjDefaultJobState(), data[id]);
                }
            });
        } catch (error) {
            console.warn('Не удалось загрузить данные дополнительных профессий:', error);
        }
    }

    function xjSave() {
        try {
            localStorage.setItem(XJ_STORAGE_KEY, JSON.stringify(xjState));
        } catch (error) {
            console.warn('Не удалось сохранить данные дополнительных профессий:', error);
        }
    }

    xjLoad();

    function xjIsJob(jobId) {
        return Object.prototype.hasOwnProperty.call(XJ_JOBS, jobId);
    }

    function xjHas(jobId) {
        const state = xjState[jobId];
        return Boolean(state && (state.active || state.pending));
    }

    function xjIsAppliedOrActive(jobId) {
        return xjHas(jobId);
    }

    function xjActiveCount() {
        return Object.keys(xjState).filter(function (id) { return xjState[id].active; }).length;
    }

    function xjAnyJobActiveOrPending() {
        return Object.keys(xjState).some(function (id) { return xjHas(id); });
    }

    function xjIsWorkTime(config) {
        const hour = getCurrentHour();
        return hour >= config.startH && hour < config.endH;
    }

    function xjHourLabel(hour) {
        return String(hour).padStart(2, '0') + ':00';
    }

    function xjCheckDayReset(state) {
        const dayKey = currentDay + '_' + currentMonthIdx;
        if (state.todayKey !== dayKey) {
            state.todayKey = dayKey;
            state.today = 0;
        }
    }

    function xjShuffleQuestion(question) {
        const order = question.options.map(function (_, index) { return index; });
        for (let index = order.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const temporary = order[index];
            order[index] = order[randomIndex];
            order[randomIndex] = temporary;
        }
        return {
            title: question.title,
            options: order.map(function (optionIndex) { return question.options[optionIndex]; }),
            correct: order.indexOf(question.correct)
        };
    }

    function xjTaxiPrice(fromKey, toKey) {
        const from = MAP_POINTS[fromKey];
        const to = MAP_POINTS[toKey];
        if (!from || !to) return 650;
        const distance = Math.hypot(from.x - to.x, from.y - to.y);
        const price = Math.round((300 + distance * 1600) / 25) * 25;
        return clamp(price, 350, 900);
    }

    function xjTravelTitle(key, mode) {
        if (key === 'airport') return mode === 'choice' ? 'Едем в Аэропорт' : 'Аэропорт';
        const location = XJ_LOCATIONS[key];
        if (!location) return '';
        return mode === 'choice' ? location.travelTitle : location.walkTitle;
    }

    function xjHideScreens() {
        Object.keys(XJ_LOCATIONS).forEach(function (key) {
            const element = document.getElementById(XJ_LOCATIONS[key].screenId);
            if (element) element.classList.add('hidden');
        });
    }

    function xjShowScreen(key) {
        xjHideScreens(); hideAirportScreen();
        const location = XJ_LOCATIONS[key];
        if (!location) return;
        const element = document.getElementById(location.screenId);
        if (element) element.classList.remove('hidden');
    }

    function xjDrawMarkers(left, top, map) {
        Object.keys(XJ_LOCATIONS).forEach(function (key) {
            const location = XJ_LOCATIONS[key];
            const point = MAP_POINTS[key];
            if (!point || !xjHas(location.jobId)) return;
            drawMarker(left + map.w * point.x, top + map.h * point.y, location.color, location.icon, location.label, location.glow);
        });
    }

    function xjPlayerPoint(left, top, map) {
        const point = MAP_POINTS[lastExitedLocation];
        if (!XJ_LOCATIONS[lastExitedLocation] || !point) return null;
        return { x: left + map.w * point.x + 34 * camera.zoom, y: top + map.h * point.y };
    }

    function xjAddMapPoints(points, left, top, map) {
        Object.keys(XJ_LOCATIONS).forEach(function (key) {
            const location = XJ_LOCATIONS[key];
            const point = MAP_POINTS[key];
            if (!point) return;
            points.push({
                key: key,
                x: left + map.w * point.x,
                y: top + map.h * point.y,
                active: xjHas(location.jobId)
            });
        });
    }

    /* ---------- Отклик, собеседование, увольнение ---------- */

    function xjApply(job) {
        const config = XJ_JOBS[job.id];
        const state = xjState[job.id];
        if (!config || !state) return;
        if (hasTwoActiveJobs()) {
            showToast('Можно одновременно работать максимум на двух работах');
            return;
        }
        if (state.active || state.pending) {
            showToast('У вас уже есть работа или заявка: ' + config.title);
            return;
        }
        state.pending = true;
        state.interviewDay = absoluteDay() + 1;
        const nextDate = dateAfterDays(1);
        addMessage(
            'Работа.ру',
            config.icon,
            'Вы откликнулись на вакансию «' + config.title + '». Собеседование завтра, ' + nextDate.day + ' ' + MONTH_NAMES[nextDate.monthIndex] +
            ' в ' + getTimeString(config.interviewMin) + ' ' + config.placeText + '.'
        );
        xjSave();
        saveGameData();
        renderJobsApp();
    }

    function xjProcessDeadlines() {
        const now = absoluteDay() * 1440 + gameMinutes;
        Object.keys(XJ_JOBS).forEach(function (jobId) {
            const state = xjState[jobId];
            const config = XJ_JOBS[jobId];
            if (state.pending && now > Number(state.interviewDay) * 1440 + config.interviewMin + 60) {
                state.pending = false;
                state.interviewDay = null;
                addMessage('Работа.ру', '❌', 'Вы пропустили собеседование на должность «' + config.title + '». Заявка аннулирована.');
                xjSave();
            }
        });
    }

    function xjInterviewAvailableNow(jobId) {
        const state = xjState[jobId];
        const config = XJ_JOBS[jobId];
        return Boolean(state.pending) &&
            absoluteDay() === Number(state.interviewDay) &&
            gameMinutes >= config.interviewMin &&
            gameMinutes <= config.interviewMin + 60;
    }

    function xjInterviewWhenText(jobId) {
        const state = xjState[jobId];
        const config = XJ_JOBS[jobId];
        const diff = Number(state.interviewDay) - absoluteDay();
        const time = getTimeString(config.interviewMin);
        if (diff <= 0) return 'сегодня в ' + time;
        if (diff === 1) return 'завтра в ' + time;
        return 'через ' + diff + ' дн. в ' + time;
    }

    /* ---------- Диалог с работодателем ---------- */

    function xjSay(text) {
        if (!xjDialogueOverlay) return;
        xjDialogueOverlay.classList.remove('hidden');
        if (xjDialogueText) xjDialogueText.textContent = text;
    }

    function xjOpenDialogue(jobId) {
        const config = XJ_JOBS[jobId];
        if (!config) return;
        xjDialogueJobId = jobId;
        if (xjSpeakerAvatar) xjSpeakerAvatar.textContent = config.npcIcon;
        if (xjSpeakerName) xjSpeakerName.textContent = config.npcName;
        if (btnXjOrders) btnXjOrders.textContent = config.ordersLabel;
        xjSay(config.greeting);
    }

    function xjHandleHiring() {
        const jobId = xjDialogueJobId;
        if (!jobId) return;
        const config = XJ_JOBS[jobId];
        const state = xjState[jobId];
        if (state.active) {
            xjSay('Вы уже работаете: ' + config.title + '.');
            return;
        }
        if (!state.pending) {
            xjSay('Сначала откликнитесь на вакансию в приложении «Работа.ру».');
            return;
        }
        if (!xjInterviewAvailableNow(jobId)) {
            xjSay('Ваше собеседование — ' + xjInterviewWhenText(jobId) + '. Пройти его можно в течение часа.');
            return;
        }
        if (hasTwoActiveJobs()) {
            xjSay('У вас уже две активные работы. Сначала увольтесь с одной из них.');
            return;
        }
        xjStartInterview(jobId);
    }

    function xjHandleAbout() {
        const config = XJ_JOBS[xjDialogueJobId];
        if (!config) return;
        xjSay(config.about);
    }

    function xjHandleOrders() {
        const jobId = xjDialogueJobId;
        if (!jobId) return;
        const config = XJ_JOBS[jobId];
        const state = xjState[jobId];
        if (!state.active) {
            xjSay('Сначала получите должность: ' + config.title + '.');
            return;
        }
        if (!xjIsWorkTime(config)) {
            xjSay('Задания доступны с ' + xjHourLabel(config.startH) + ' до ' + xjHourLabel(config.endH) + '.');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            xjSay('Для работы нужны и энергия, и сон. Отдохните и поспите.');
            return;
        }
        if (xjTask && xjTask.active) {
            xjSay('У вас уже есть активное задание.');
            return;
        }
        if (xjDialogueOverlay) xjDialogueOverlay.classList.add('hidden');
        xjRenderOrders(jobId);
    }

    /* ---------- Собеседование ---------- */

    function xjStartInterview(jobId) {
        const config = XJ_JOBS[jobId];
        xjQuiz = {
            jobId: jobId,
            index: 0,
            answers: [],
            questions: config.questions.map(xjShuffleQuestion)
        };
        if (xjDialogueOverlay) xjDialogueOverlay.classList.add('hidden');
        if (xjQuizHeading) xjQuizHeading.textContent = 'Собеседование: ' + config.title;
        if (xjQuizModal) xjQuizModal.classList.remove('hidden');
        xjRenderQuizQuestion();
    }

    function xjRenderQuizQuestion() {
        if (!xjQuiz) return;
        const question = xjQuiz.questions[xjQuiz.index];
        if (xjQuizBadge) xjQuizBadge.textContent = 'Вопрос ' + (xjQuiz.index + 1) + ' из ' + xjQuiz.questions.length;
        if (xjQuizTitle) xjQuizTitle.textContent = question.title;
        if (!xjQuizAnswers) return;
        xjQuizAnswers.innerHTML = '';
        question.options.forEach(function (option, optionIndex) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pdd-answer-btn';
            button.textContent = option;
            button.addEventListener('click', function () { xjAnswerQuizQuestion(optionIndex); });
            xjQuizAnswers.appendChild(button);
        });
    }

    function xjAnswerQuizQuestion(selectedIndex) {
        if (!xjQuiz) return;
        const question = xjQuiz.questions[xjQuiz.index];
        xjQuiz.answers.push(selectedIndex === question.correct);
        playClick();
        if (xjQuiz.index < xjQuiz.questions.length - 1) {
            xjQuiz.index += 1;
            xjRenderQuizQuestion();
            return;
        }
        const jobId = xjQuiz.jobId;
        const config = XJ_JOBS[jobId];
        const state = xjState[jobId];
        const allCorrect = xjQuiz.answers.every(Boolean);
        xjQuiz = null;
        if (xjQuizModal) xjQuizModal.classList.add('hidden');
        xjDialogueJobId = jobId;
        if (allCorrect) {
            state.active = true;
            state.pending = false;
            state.interviewDay = null;
            addMessage('Коллектив', config.icon, 'Поздравляем! Вы приняты на работу: ' + config.title + '.');
            xjSave();
            saveGameData();
            xjSay('Отлично! Вы прошли собеседование. Добро пожаловать в команду: ' + config.title + '!');
        } else {
            state.pending = false;
            state.interviewDay = null;
            xjSave();
            saveGameData();
            xjSay('К сожалению, вы допустили ошибки на собеседовании. Откликнитесь повторно через приложение «Работа.ру».');
        }
    }

    /* ---------- Задания ---------- */

    function xjRenderOrders(jobId) {
        if (XJ_SPECIAL_MODES[jobId]) {
            xjRenderSpecialOrders(jobId);
            return;
        }
        const config = XJ_JOBS[jobId];
        if (!xjOrdersModal || !xjOrdersList) return;
        if (xjOrdersHeading) xjOrdersHeading.textContent = config.ordersTitle;
        xjOrdersList.innerHTML = '';
        config.tasks.forEach(function (task) {
            const card = document.createElement('div');
            card.className = 'order-item-card';
            card.innerHTML = '<div class="order-item-header">' + task.title + '</div>' +
                '<div class="order-item-reward">+' + task.reward.toLocaleString('ru-RU') + ' ₽</div>' +
                '<div class="order-item-desc">' + task.desc + '</div>' +
                '<button type="button" class="btn btn-primary btn-select-order">Взять задание</button>';
            card.querySelector('button').addEventListener('click', function () { xjAcceptTask(jobId, task); });
            xjOrdersList.appendChild(card);
        });
        xjOrdersModal.classList.remove('hidden');
    }

    function xjAcceptTask(jobId, task) {
        if (travelBlockMessage()) {
            showToast(travelBlockMessage());
            return;
        }
        if (isDizzy()) {
            showToast('🥴 Кружится голова: нельзя работать');
            return;
        }
        const config = XJ_JOBS[jobId];
        if (!xjIsWorkTime(config)) {
            showToast('Рабочее время закончилось');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showToast('Для работы нужны и энергия, и сон');
            return;
        }
        xjTask = {
            active: true,
            jobId: jobId,
            task: task,
            clicksDone: 0,
            phase: task.clicks > 0 ? 'clicks' : 'quiz',
            stepIndex: 0,
            mistakes: 0,
            steps: (task.steps || []).map(xjShuffleQuestion)
        };
        if (xjOrdersModal) xjOrdersModal.classList.add('hidden');
        if (xjTaskScreen) xjTaskScreen.classList.remove('hidden');
        if (xjTaskTitle) xjTaskTitle.textContent = config.icon + ' ' + task.title.replace(/^[^\s]+\s/, '');
        if (xjTaskSub) xjTaskSub.textContent = task.desc + '. Нажимайте на экран, чтобы продвигаться';
        xjUpdateTaskProgress();
        if (xjTask.phase === 'quiz') {
            xjShowTaskQuestion();
        } else {
            if (xjTaskQuiz) xjTaskQuiz.classList.add('hidden');
            if (xjTaskProgressBox) xjTaskProgressBox.classList.remove('hidden');
        }
        showToast('Задание принято');
    }

    function xjUpdateTaskProgress() {
        if (!xjTask) return;
        const needed = xjTask.task.clicks;
        const percent = needed > 0 ? Math.min(100, Math.round((xjTask.clicksDone / needed) * 100)) : 100;
        if (xjTaskProgressInner) xjTaskProgressInner.style.width = percent + '%';
        if (xjTaskPercent) xjTaskPercent.textContent = percent + '%';
    }

    function xjHandleTaskTap(event) {
        if (!xjTask || !xjTask.active || xjTask.phase !== 'clicks') return;
        if (event.target && event.target.closest && event.target.closest('button')) return;
        event.preventDefault();
        xjTask.clicksDone += 1;
        xjUpdateTaskProgress();
        playClick();
        if (xjTask.clicksDone >= xjTask.task.clicks) {
            if (xjTask.steps.length > 0) {
                xjTask.phase = 'quiz';
                xjShowTaskQuestion();
            } else {
                xjCompleteTask();
            }
        }
    }

    function xjShowTaskQuestion() {
        if (!xjTask) return;
        const question = xjTask.steps[xjTask.stepIndex];
        if (!question) {
            xjCompleteTask();
            return;
        }
        if (xjTaskProgressBox) xjTaskProgressBox.classList.add('hidden');
        if (xjTaskSub) xjTaskSub.textContent = 'Вопрос ' + (xjTask.stepIndex + 1) + ' из ' + xjTask.steps.length;
        if (xjTaskQuiz) xjTaskQuiz.classList.remove('hidden');
        if (xjTaskQuestion) xjTaskQuestion.textContent = question.title;
        if (!xjTaskAnswers) return;
        xjTaskAnswers.innerHTML = '';
        question.options.forEach(function (option, optionIndex) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pdd-answer-btn';
            button.textContent = option;
            button.addEventListener('click', function () { xjAnswerTaskQuestion(optionIndex); });
            xjTaskAnswers.appendChild(button);
        });
    }

    function xjAnswerTaskQuestion(selectedIndex) {
        if (!xjTask) return;
        const question = xjTask.steps[xjTask.stepIndex];
        if (!question) return;
        playClick();
        if (selectedIndex === question.correct) {
            showToast('✅ Верно!');
        } else {
            xjTask.mistakes += 1;
            showToast('❌ Неверно! Премия уменьшена');
        }
        xjTask.stepIndex += 1;
        if (xjTask.stepIndex >= xjTask.steps.length) xjCompleteTask();
        else xjShowTaskQuestion();
    }

    function xjReturnToLocation(jobId) {
        const config = XJ_JOBS[jobId];
        if (xjTaskScreen) xjTaskScreen.classList.add('hidden');
        if (config.locKey === 'market') {
            currentScreen = 'market';
            marketScreen.classList.remove('hidden');
        } else {
            currentScreen = config.locKey;
            xjShowScreen(config.locKey);
        }
        lastExitedLocation = config.locKey;
    }

    function xjCompleteTask() {
        if (!xjTask) return;
        const jobId = xjTask.jobId;
        const config = XJ_JOBS[jobId];
        const state = xjState[jobId];
        const baseReward = xjTask.task.reward;
        const factor = Math.max(0.4, 1 - xjTask.mistakes * 0.25);
        const reward = applySalaryHygiene(Math.round(baseReward * factor));
        playerMoney += reward;
        addBankTransaction('Зарплата: ' + config.title, reward, true);
        createTax('salary', reward * SALARY_TAX_RATE, 'Налог: ' + config.title + ' 3%');
        xjCheckDayReset(state);
        state.today += 1;
        const prevXjTotal = state.total;
        state.total += 1;
        if (jobId === 'police' || jobId === 'doctor') checkGovMilestones(config.title, prevXjTotal, state.total);
        playerEnergy = clamp(playerEnergy - 6, 0, 100);
        playerHunger = clamp(playerHunger - 3, 0, 100);
        xjTask = null;
        xjSave();
        saveGameData();
        xjReturnToLocation(jobId);
        updateClockUI();
        updateStatsHUD();
        showToast('Задание выполнено! Зарплата +' + reward.toLocaleString('ru-RU') + ' ₽');
    }

    function xjCancelTask() {
        if (!xjTask) return;
        const jobId = xjTask.jobId;
        const config = XJ_JOBS[jobId];
        xjTask = null;
        createFine(300, 'Отмена задания: ' + config.title);
        saveGameData();
        xjReturnToLocation(jobId);
        updateClockUI();
    }

    /* ---------- Карточки в приложении «Коллектив» ---------- */

    function xjAppendCollectiveCards(wrapper) {
        Object.keys(XJ_JOBS).forEach(function (jobId) {
            const config = XJ_JOBS[jobId];
            const state = xjState[jobId];
            if (!state.active && !state.pending) return;
            xjCheckDayReset(state);
            const card = document.createElement('div');
            card.className = 'collective-card';
            if (state.active) {
                card.innerHTML = '<div class="collective-header"><div class="collective-avatar">' + config.icon + '</div><div><div class="collective-title">' + config.title +
                    '</div><div class="collective-sub" style="color:#16a34a;">Служба активна</div></div></div>' +
                    '<p style="font-size:.75rem;color:#475569;line-height:1.4;">Рабочее время: ' + xjHoursText(config) + '.<br>Берите задания у работодателя ' + config.placeText + '.</p>' +
                    '<div class="collective-stats-box"><div class="collective-stat-item"><span class="collective-stat-title">Заданий сегодня</span><span class="collective-stat-value">' + state.today +
                    '</span></div><div class="collective-stat-item"><span class="collective-stat-title">Всего заданий</span><span class="collective-stat-value">' + state.total + '</span></div></div>' +
                    '<button type="button" class="job-decline-btn">Уволиться</button>';
                card.querySelector('.job-decline-btn').addEventListener('click', function () {
                    if ((xjTask && xjTask.active && xjTask.jobId === jobId) || xjGameActive) {
                        showToast('Сначала завершите задание!');
                        return;
                    }
                    state.active = false;
                    xjSave();
                    renderCollectiveApp();
                    showToast('Вы уволились с работы: ' + config.title);
                });
            } else {
                card.innerHTML = '<div class="collective-header"><div class="collective-avatar">' + config.icon + '</div><div><div class="collective-title">' + config.title +
                    '</div><div class="collective-sub" style="color:#d97706;">Ожидает собеседования</div></div></div>' +
                    '<p style="font-size:.75rem;color:#475569;">Собеседование — ' + xjInterviewWhenText(jobId) + ' ' + config.placeText + '.</p>';
            }
            wrapper.appendChild(card);
        });
    }

    /* ---------- Обработчики ---------- */

    if (btnXjHiring) btnXjHiring.addEventListener('click', xjHandleHiring);
    if (btnXjAbout) btnXjAbout.addEventListener('click', xjHandleAbout);
    if (btnXjOrders) btnXjOrders.addEventListener('click', xjHandleOrders);
    if (btnXjClose) btnXjClose.addEventListener('click', function () { xjDialogueOverlay.classList.add('hidden'); });
    if (btnXjQuizClose) btnXjQuizClose.addEventListener('click', function () { xjQuiz = null; xjQuizModal.classList.add('hidden'); });
    if (btnXjOrdersClose) btnXjOrdersClose.addEventListener('click', function () { xjOrdersModal.classList.add('hidden'); });
    if (btnXjTaskBack) btnXjTaskBack.addEventListener('click', xjCancelTask);
    if (xjTaskBox) xjTaskBox.addEventListener('pointerdown', xjHandleTaskTap, { passive: false });

    Object.keys(XJ_LOCATIONS).forEach(function (key) {
        const location = XJ_LOCATIONS[key];
        const screen = document.getElementById(location.screenId);
        const exitButton = document.getElementById(location.exitId);
        const npc = document.getElementById(location.npcId);
        if (exitButton) {
            exitButton.addEventListener('click', function () {
                if (screen) screen.classList.add('hidden');
                if (xjDialogueOverlay) xjDialogueOverlay.classList.add('hidden');
                currentScreen = 'city';
                lastExitedLocation = key;
                saveGameData();
                if (btnOpenSettingsGame) btnOpenSettingsGame.classList.remove('hidden');
            });
        }
        if (npc) {
            npc.addEventListener('click', function () { xjOpenDialogue(location.jobId); });
        }
    });

    if (exitMarket) exitMarket.addEventListener('click', function () { if (xjDialogueOverlay) xjDialogueOverlay.classList.add('hidden'); });

        /* =========================================================
       ПОЛИЦЕЙСКИЙ И ДОКТОР: УНИКАЛЬНЫЕ МЕХАНИКИ РАБОТЫ
       Полицейский: поиск преступника, погоня, дорожный патруль
       Доктор: диагностика, реанимация, операция
       ========================================================= */

    const XJ_SPECIAL_MODES = {
        police: [
            { id: 'suspects', title: '🔎 Найти преступника', desc: 'Среди 5 подозреваемых только один нарушил закон. Найдите его по описанию.', reward: '1 100 – 1 800 ₽' },
            { id: 'chase_hard', title: '🚓 Погоня за грабителем', desc: 'Кликайте как можно быстрее, чтобы догнать грабителя. Если он скроется, штраф 3 000 ₽.', reward: '1 850 ₽' },
            { id: 'radar', title: '📡 Дорожный патруль', desc: 'Проверяйте скорость машин и штрафуйте только тех, кто превысил.', reward: 'до 1 000 ₽' }
        ],
        doctor: [
            { id: 'xray', title: '🔬 Рентген', desc: 'Найдите клетку, которая чуть отличается по цвету. Снимков три, чем дальше, тем сложнее.', reward: 'до 1 200 ₽' },
            { id: 'cpr', title: '❤️ Реанимация', desc: 'Нажимайте в зелёной зоне, чтобы запустить сердце пациента.', reward: '1 500 ₽' },
            { id: 'surgery', title: '🔪 Операция', desc: 'Запомните порядок инструментов и повторите его без ошибок.', reward: 'до 1 800 ₽' }
        ]
    };

    const XJ_SUSPECT_COUNT = 30;
    const XJ_SUSPECT_EMOJI = ['👨', '👩', '👴', '👵', '👦', '👧', '👱', '👲', '👳', '👷', '💂', '👸', '🎅', '👼', '🙍', '🙎', '💁', '🙋', '🙇', '👰', '🤵', '👮', '🕵', '👶', '🙅', '🙆', '💆', '💇', '🚶', '🏃'];

    const XJ_CRIMES = [
        { t: 'Украл пачку чипсов в магазине', sev: 'fine' },
        { t: 'Перебежал дорогу на красный свет прямо перед полицейской машиной', sev: 'fine' },
        { t: 'Выбросил мусор мимо урны и отказался его убрать', sev: 'fine' },
        { t: 'Припарковал машину на тротуаре у школы', sev: 'fine' },
        { t: 'Включил музыку на полную громкость в три часа ночи', sev: 'fine' },
        { t: 'Проехал в автобусе без билета и нагрубил контролёру', sev: 'fine' },
        { t: 'Нарисовал граффити на стене чужого подъезда', sev: 'fine' },
        { t: 'Сорвал цветы с городской клумбы', sev: 'fine' },
        { t: 'Закрыл номер машины тряпкой, чтобы не платить за парковку', sev: 'fine' },
        { t: 'Гулял с большой собакой без поводка и намордника в детской зоне', sev: 'fine' },
        { t: 'Курил в запрещённом месте и бросил окурок в фонтан', sev: 'fine' },
        { t: 'Съел яблоко на рынке и ушёл, не заплатив', sev: 'fine' },
        { t: 'Сломал скамейку в парке, катаясь на ней', sev: 'fine' },
        { t: 'Запустил фейерверк во дворе жилого дома', sev: 'fine' },
        { t: 'Ограбил ювелирный магазин', sev: 'prison' },
        { t: 'Угнал чужую машину со двора', sev: 'prison' },
        { t: 'Вломился в квартиру соседа, пока тот был в отпуске', sev: 'prison' },
        { t: 'Обманул пенсионеров, продавая «чудо-фильтры» для воды', sev: 'prison' },
        { t: 'Украл кошелёк из сумки в метро', sev: 'prison' },
        { t: 'Взломал банкомат и снял чужие деньги', sev: 'prison' },
        { t: 'Поджёг мусорный бак возле школы', sev: 'prison' },
        { t: 'Напал на прохожего и отобрал у него телефон', sev: 'prison' },
        { t: 'Продавал поддельные билеты на концерт', sev: 'prison' },
        { t: 'Перекусил трос замка и украл чужой велосипед', sev: 'prison' },
        { t: 'Подделал документы на чужую квартиру', sev: 'prison' },
        { t: 'Разбил витрину магазина и унёс технику', sev: 'prison' },
        { t: 'Шантажировал знакомого и требовал деньги', sev: 'prison' },
        { t: 'Угрожал продавцу ножом и забрал выручку', sev: 'prison' }
    ];

    const XJ_INNOCENT = [
        'Забрал свою машинку у друга',
        'Не проводил бабушку до дома',
        'Опоздал на работу на десять минут',
        'Громко смеялся в кафе днём',
        'Купил билет и поделился им с другом',
        'Помог соседке донести сумки до квартиры',
        'Забыл поздороваться с соседом',
        'Сыграл на гитаре во дворе днём',
        'Нашёл кошелёк и сразу отнёс его в полицию',
        'Не уступил место в автобусе, потому что у него болит нога',
        'Покормил голубей в парке',
        'Поставил машину на платной парковке и оплатил её',
        'Ел мороженое на улице в жаркий день',
        'Не ответил на звонок, потому что спал',
        'Взял книгу в библиотеке и вернул вовремя',
        'Громко поспорил с другом о футболе',
        'Съел пирожок у ларька и заплатил',
        'Перешёл дорогу на зелёный свет',
        'Снимал видео для блога в парке',
        'Занял у друга деньги и вернул в срок',
        'Дал деньги в долг и потом вежливо напомнил о возврате',
        'Вернул продавцу лишнюю сдачу',
        'Покатался на самокате по велодорожке',
        'Забрал посылку на почте по паспорту',
        'Погулял с собакой на поводке и убрал за ней',
        'Починил соседу кран и не взял денег',
        'Сфотографировал красивое здание',
        'Забыл дома зонтик и промок под дождём'
    ];


    const XJ_TOOLS = [
        { e: '🔪', n: 'Скальпель' },
        { e: '✂️', n: 'Ножницы' },
        { e: '💉', n: 'Шприц' },
        { e: '📌', n: 'Зажим' },
        { e: '➰', n: 'Нить' },
        { e: '💊', n: 'Лекарство' }
    ];

    const xjGameScreen = document.getElementById('xj-game-screen');
    const xjGameBody = document.getElementById('xj-game-body');
    let xjGameActive = false;
    let xjGameCtx = null;

    function xjShuf(list) {
        const copy = list.slice();
        for (let index = copy.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            const temporary = copy[index];
            copy[index] = copy[randomIndex];
            copy[randomIndex] = temporary;
        }
        return copy;
    }

    function xjPick(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function xjMoney(value) {
        return Number(value).toLocaleString('ru-RU') + ' ₽';
    }

    function xjGameClear() {
        if (!xjGameCtx) return;
        xjGameCtx.timers.forEach(clearTimeout);
        xjGameCtx.intervals.forEach(clearInterval);
        if (xjGameCtx.raf) cancelAnimationFrame(xjGameCtx.raf);
        xjGameCtx.timers = [];
        xjGameCtx.intervals = [];
        xjGameCtx.raf = 0;
    }

    function xjGameTimeout(callback, delay) {
        const id = setTimeout(callback, delay);
        xjGameCtx.timers.push(id);
        return id;
    }

    function xjGameInterval(callback, delay) {
        const id = setInterval(callback, delay);
        xjGameCtx.intervals.push(id);
        return id;
    }

    function xjRenderSpecialOrders(jobId) {
        const config = XJ_JOBS[jobId];
        if (!xjOrdersModal || !xjOrdersList) return;
        if (xjOrdersHeading) xjOrdersHeading.textContent = config.ordersTitle;
        xjOrdersList.innerHTML = '';
        XJ_SPECIAL_MODES[jobId].forEach(function (mode) {
            const card = document.createElement('div');
            card.className = 'order-item-card';
            card.innerHTML = '<div class="order-item-header">' + mode.title + '</div>' +
                '<div class="order-item-reward">' + mode.reward + '</div>' +
                '<div class="order-item-desc">' + mode.desc + '</div>' +
                '<button type="button" class="btn btn-primary btn-select-order">Начать</button>';
            card.querySelector('button').addEventListener('click', function () { xjGameOpen(jobId, mode.id); });
            xjOrdersList.appendChild(card);
        });
        xjOrdersModal.classList.remove('hidden');
    }

    function xjGameOpen(jobId, modeId) {
        const config = XJ_JOBS[jobId];
        if (xjGameActive) return;
        if (!xjIsWorkTime(config)) {
            showToast('Рабочее время закончилось');
            return;
        }
        if (!hasEnoughEnergyOrSleep()) {
            showToast('Для работы нужны и энергия, и сон');
            return;
        }
        xjGameActive = true;
        xjGameCtx = { jobId: jobId, modeId: modeId, timers: [], intervals: [], raf: 0, over: false };
        if (xjOrdersModal) xjOrdersModal.classList.add('hidden');
        xjGameBody.innerHTML = '';
        xjGameScreen.classList.remove('hidden');
        const starters = {
            suspects: xjStartSuspects,
            chase: function () { xjStartChase(false); },
            chase_hard: function () { xjStartChase(true); },
            radar: xjStartRadar,
            xray: xjStartXray,
            cpr: xjStartCpr,
            surgery: xjStartSurgery
        };
        starters[modeId]();
    }

    function xjGameFinish(options) {
        if (!xjGameCtx || xjGameCtx.over) return;
        xjGameCtx.over = true;
        xjGameClear();
        const reward = Math.max(0, Math.round(options.reward || 0));
        const fine = Math.max(0, Math.round(options.fine || 0));
        xjPaySpecial(xjGameCtx.jobId, reward, options.label || 'смена');
        if (fine > 0) createFine(fine, options.fineReason || 'Штраф');
        const lines = (options.lines || []).map(function (line) { return '<p>' + line + '</p>'; }).join('');
        xjGameBody.innerHTML = '<div class="xjg-result">' +
            '<div class="xjg-result-icon">' + (options.icon || '✅') + '</div>' +
            '<h2>' + options.title + '</h2>' + lines +
            (reward > 0 ? '<div class="xjg-reward">Зарплата +' + xjMoney(reward) + '</div>' : '') +
            (fine > 0 ? '<div class="xjg-fine">Штраф −' + xjMoney(fine) + '</div>' : '') +
            '<button type="button" id="xjg-done" class="btn btn-primary">Продолжить</button></div>';
        document.getElementById('xjg-done').addEventListener('click', xjGameClose);
    }

    function xjGameClose() {
        if (!xjGameCtx) return;
        const jobId = xjGameCtx.jobId;
        xjGameClear();
        xjGameActive = false;
        xjGameCtx = null;
        xjGameScreen.classList.add('hidden');
        xjGameBody.innerHTML = '';
        xjReturnToLocation(jobId);
        updateClockUI();
        updateStatsHUD();
    }

    function xjPaySpecial(jobId, reward, label) {
        reward = applySalaryHygiene(reward);
        const config = XJ_JOBS[jobId];
        const state = xjState[jobId];
        if (reward > 0) {
            playerMoney += reward;
            addBankTransaction('Зарплата: ' + config.title + ' (' + label + ')', reward, true);
            createTax('salary', reward * SALARY_TAX_RATE, 'Налог: ' + config.title + ' 3%');
            xjCheckDayReset(state);
            state.today += 1;
            const prevSpecialTotal = state.total;
            state.total += 1;
            if (jobId === 'police' || jobId === 'doctor') checkGovMilestones(config.title, prevSpecialTotal, state.total);
        }
        playerEnergy = clamp(playerEnergy - 6, 0, 100);
        playerHunger = clamp(playerHunger - 3, 0, 100);
        xjSave();
        saveGameData();
        updateClockUI();
        updateStatsHUD();
    }

    /* ---------- Полицейский: найти преступника ---------- */

    function xjStartSuspects() {
        const ids = xjShuf(Array.from({ length: XJ_SUSPECT_COUNT }, function (_, index) { return index + 1; })).slice(0, 5);
        const culpritIndex = Math.floor(Math.random() * 5);
        const crime = xjPick(XJ_CRIMES);
        const innocents = xjShuf(XJ_INNOCENT).slice(0, 4);
        const suspects = ids.map(function (id, index) {
            return { id: id, guilty: index === culpritIndex, text: index === culpritIndex ? crime.t : innocents.pop() };
        });
        const total = 30;
        let left = total;
        xjGameBody.innerHTML = '<div class="xjg-wrap">' +
            '<h2 class="xjg-title">🔎 Найдите преступника</h2>' +
            '<p class="xjg-sub">Только один из подозреваемых действительно нарушил закон. Нажмите на него.</p>' +
            '<div class="xjg-timer"><div id="xjg-timer-inner" class="xjg-timer-inner"></div></div>' +
            '<div class="xjg-suspects">' + suspects.map(function (suspect, index) {
                return '<button type="button" class="xjg-suspect" data-index="' + index + '">' +
                    '<span class="xjg-suspect-num">' + (index + 1) + '</span>' +
                    '<div class="xjg-suspect-photo"><img src="suspects/suspect_' + suspect.id + '.png" data-base="suspects/suspect_' + suspect.id + '" data-exts="png,webp,jpg" alt="Подозреваемый ' + (index + 1) + '" onerror="blImgFail(this)">' +
                    '<span class="xjg-suspect-emoji">' + XJ_SUSPECT_EMOJI[(suspect.id - 1) % XJ_SUSPECT_EMOJI.length] + '</span></div>' +
                    '<div class="xjg-suspect-text">' + suspect.text + '</div></button>';
            }).join('') + '</div></div>';

        const timerInner = document.getElementById('xjg-timer-inner');
        xjGameInterval(function () {
            left -= 0.25;
            if (timerInner) timerInner.style.width = Math.max(0, (left / total) * 100) + '%';
            if (left <= 0 && !xjGameCtx.over) {
                xjGameFinish({
                    icon: '🏃',
                    title: 'Преступник скрылся',
                    lines: ['Вы не успели вычислить преступника.', 'Настоящий преступник: подозреваемый №' + (culpritIndex + 1) + ' — ' + crime.t + '.'],
                    fine: 1000,
                    fineReason: 'Преступник скрылся (время вышло)',
                    label: 'поиск преступника'
                });
            }
        }, 250);

        xjGameBody.querySelectorAll('.xjg-suspect').forEach(function (button) {
            button.addEventListener('click', function () {
                if (xjGameCtx.over) return;
                const index = Number(button.dataset.index);
                playClick();
                if (index === culpritIndex) {
                    const prison = crime.sev === 'prison';
                    xjGameFinish({
                        icon: prison ? '🔒' : '📄',
                        title: 'Преступник найден!',
                        lines: ['Подозреваемый №' + (index + 1) + ': ' + crime.t + '.', prison ? 'Тяжкое нарушение: преступник отправлен в тюрьму.' : 'Лёгкое нарушение: преступнику выписан штраф.'],
                        reward: prison ? 1800 : 1100,
                        label: 'поиск преступника'
                    });
                } else {
                    xjGameFinish({
                        icon: '❌',
                        title: 'Задержан невиновный',
                        lines: ['Подозреваемый №' + (index + 1) + ' ничего не нарушил.', 'Настоящий преступник: №' + (culpritIndex + 1) + ' — ' + crime.t + '.'],
                        fine: 1500,
                        fineReason: 'Ошибочное задержание',
                        label: 'поиск преступника'
                    });
                }
            });
        });
    }

    /* ---------- Полицейский: погоня ---------- */

    function xjStartChase(hard) {
        const difficulty = hard ? 1.65 : 1.3;
        const reward = hard ? 1850 : 1500;
        let player = 50;
        let started = false;
        let surge = 0;
        xjGameBody.innerHTML = '<div id="xjg-chase-area" class="xjg-wrap xjg-chase">' +
            '<h2 class="xjg-title">' + (hard ? '🚓 Погоня за грабителем' : '🚓 Погоня за преступником') + '</h2>' +
            '<p id="xjg-chase-hint" class="xjg-sub">Приготовьтесь...</p>' +
            '<div class="xjg-tug"><div id="xjg-tug-blue" class="xjg-tug-blue" style="width:50%"></div><div id="xjg-tug-red" class="xjg-tug-red" style="width:50%"></div><div class="xjg-tug-mid"></div></div>' +
            '<div class="xjg-tug-labels"><span class="xjg-blue-label">👮 Вы: <b id="xjg-blue-pct">50%</b></span><span class="xjg-red-label">🏃 Преступник: <b id="xjg-red-pct">50%</b></span></div>' +
            '<div class="xjg-tap-zone"><div class="xjg-tap-icon">👆</div><div id="xjg-tap-text" class="xjg-tap-text">Кликайте быстрее!</div></div>' +
            '<p class="xjg-note">Если красная шкала заполнится полностью, преступник скроется и вы получите штраф 3 000 ₽.</p></div>';
        const area = document.getElementById('xjg-chase-area');
        const blue = document.getElementById('xjg-tug-blue');
        const red = document.getElementById('xjg-tug-red');
        const bluePct = document.getElementById('xjg-blue-pct');
        const redPct = document.getElementById('xjg-red-pct');
        const hint = document.getElementById('xjg-chase-hint');

        function paint() {
            const value = Math.max(0, Math.min(100, player));
            blue.style.width = value + '%';
            red.style.width = (100 - value) + '%';
            bluePct.textContent = Math.round(value) + '%';
            redPct.textContent = Math.round(100 - value) + '%';
        }

        function check() {
            if (xjGameCtx.over) return;
            if (player >= 100) {
                xjGameFinish({
                    icon: '🚔',
                    title: 'Преступник пойман!',
                    lines: ['Вы догнали преступника и надели на него наручники.'],
                    reward: reward,
                    label: hard ? 'погоня за грабителем' : 'погоня'
                });
            } else if (player <= 0) {
                xjGameFinish({
                    icon: '🏃',
                    title: 'Преступник скрылся',
                    lines: ['Преступник сумел оторваться от погони.'],
                    fine: 3000,
                    fineReason: 'Преступник скрылся',
                    label: hard ? 'погоня за грабителем' : 'погоня'
                });
            }
        }

        area.addEventListener('pointerdown', function (event) {
            event.preventDefault();
            if (!started || xjGameCtx.over) return;
            player += 2.1;
            paint();
            playClick();
            check();
        }, { passive: false });

        let count = 3;
        hint.textContent = 'Старт через ' + count + '...';
        xjGameInterval(function () {
            if (started || xjGameCtx.over) return;
            count -= 1;
            if (count > 0) {
                hint.textContent = 'Старт через ' + count + '...';
            } else {
                started = true;
                hint.textContent = 'Жмите! Не дайте ему уйти!';
            }
        }, 800);

        xjGameInterval(function () {
            if (!started || xjGameCtx.over) return;
            if (Math.random() < 0.03) surge = 3;
            const push = (0.30 + Math.random() * 0.30) * difficulty + (surge > 0 ? 0.7 : 0);
            if (surge > 0) surge -= 1;
            player -= push;
            paint();
            check();
        }, 100);
    }

    /* ---------- Полицейский: дорожный патруль ---------- */

    function xjStartRadar() {
        const totalCars = 8;
        let index = 0;
        let score = 0;
        const carEmoji = ['🚗', '🚕', '🚙', '🏎️', '🚌', '🚓'];
        xjGameBody.innerHTML = '<div class="xjg-wrap"><h2 class="xjg-title">📡 Дорожный патруль</h2>' +
            '<p class="xjg-sub">Штрафуйте только тех, кто едет быстрее разрешённой скорости.</p>' +
            '<div id="xjg-radar-progress" class="xjg-sub"></div><div id="xjg-radar-card"></div></div>';

        function nextCar() {
            if (xjGameCtx.over) return;
            if (index >= totalCars) {
                const reward = score >= 3 ? Math.round((1000 * score / totalCars) / 50) * 50 : 0;
                xjGameFinish({
                    icon: score >= 6 ? '🏅' : '📋',
                    title: 'Смена патруля завершена',
                    lines: ['Правильных решений: ' + score + ' из ' + totalCars + '.', reward > 0 ? 'Начальник доволен вашей работой.' : 'Слишком много ошибок, премии нет.'],
                    reward: reward,
                    label: 'дорожный патруль'
                });
                return;
            }
            index += 1;
            const limit = xjPick([40, 60, 80]);
            const violator = Math.random() < 0.5;
            const speed = violator ? limit + 6 + Math.floor(Math.random() * 35) : Math.max(20, limit - 5 - Math.floor(Math.random() * 20));
            document.getElementById('xjg-radar-progress').textContent = 'Машина ' + index + ' из ' + totalCars + '. Верно: ' + score;
            const card = document.getElementById('xjg-radar-card');
            card.innerHTML = '<div class="xjg-radar">' +
                '<div class="xjg-radar-sign"><small>Ограничение</small><b>' + limit + '</b></div>' +
                '<div class="xjg-radar-car">' + xjPick(carEmoji) + '</div>' +
                '<div class="xjg-radar-speed">' + speed + ' км/ч</div>' +
                '<div class="xjg-timer"><div id="xjg-radar-timer" class="xjg-timer-inner" style="width:100%;transition:width 3.2s linear"></div></div>' +
                '<div class="xjg-radar-buttons"><button type="button" id="xjg-fine-btn" class="btn btn-primary">📸 Оштрафовать</button>' +
                '<button type="button" id="xjg-pass-btn" class="btn btn-secondary">✅ Пропустить</button></div>' +
                '<div id="xjg-radar-feedback" class="xjg-radar-feedback"></div></div>';
            let answered = false;
            const timer = document.getElementById('xjg-radar-timer');
            xjGameTimeout(function () { if (timer) timer.style.width = '0%'; }, 30);

            function answer(wantFine, timedOut) {
                if (answered || xjGameCtx.over) return;
                answered = true;
                const correct = wantFine === violator;
                if (correct) score += 1;
                const feedback = document.getElementById('xjg-radar-feedback');
                if (feedback) {
                    feedback.textContent = timedOut ? '⏱ Время вышло' : (correct ? '✅ Верно' : '❌ Ошибка');
                    feedback.className = 'xjg-radar-feedback ' + (correct ? 'ok' : 'bad');
                }
                xjGameTimeout(nextCar, 650);
            }

            document.getElementById('xjg-fine-btn').addEventListener('click', function () { playClick(); answer(true, false); });
            document.getElementById('xjg-pass-btn').addEventListener('click', function () { playClick(); answer(false, false); });
            xjGameTimeout(function () { answer(false, true); }, 3300);
        }

        nextCar();
    }

    /* ---------- Доктор: рентген ---------- */

    function xjStartXray() {
        const stages = [
            { cells: 16, cols: 4, time: 14, diff: 16 },
            { cells: 25, cols: 5, time: 16, diff: 12 },
            { cells: 36, cols: 6, time: 18, diff: 9 }
        ];
        let stage = 0;
        let found = 0;

        function nextStage() {
            if (xjGameCtx.over) return;
            if (stage >= stages.length) {
                xjGameFinish({
                    icon: found === stages.length ? '🏆' : '📋',
                    title: 'Снимки изучены',
                    lines: ['Найдено повреждений: ' + found + ' из ' + stages.length + '.'],
                    reward: found * 400,
                    label: 'рентген'
                });
                return;
            }
            const config = stages[stage];
            const hue = Math.floor(Math.random() * 360);
            const baseLight = 42;
            const oddLight = baseLight + (Math.random() < 0.5 ? config.diff : -config.diff);
            const oddIndex = Math.floor(Math.random() * config.cells);
            let timeLeft = config.time;
            xjGameBody.innerHTML = '<div class="xjg-wrap"><h2 class="xjg-title">🔬 Снимок ' + (stage + 1) + ' из ' + stages.length + '</h2>' +
                '<p class="xjg-sub">Одна клетка немного отличается по цвету. Найдите её. Ошибка отнимает 2 секунды.</p>' +
                '<div class="xjg-timer"><div id="xjg-xray-timer" class="xjg-timer-inner" style="width:100%"></div></div>' +
                '<div class="xjg-xray-grid" style="grid-template-columns:repeat(' + config.cols + ',1fr)">' +
                Array.from({ length: config.cells }, function (_, index) {
                    return '<button type="button" class="xjg-xray-cell" data-index="' + index + '" style="background:hsl(' + hue + ',62%,' + (index === oddIndex ? oddLight : baseLight) + '%)"></button>';
                }).join('') + '</div><div id="xjg-xray-feedback" class="xjg-radar-feedback"></div></div>';
            const timerBar = document.getElementById('xjg-xray-timer');
            const feedback = document.getElementById('xjg-xray-feedback');
            let finished = false;

            function endStage(success) {
                if (finished || xjGameCtx.over) return;
                finished = true;
                if (success) found += 1;
                feedback.textContent = success ? '✅ Повреждение найдено' : '⏱ Время вышло';
                feedback.className = 'xjg-radar-feedback ' + (success ? 'ok' : 'bad');
                stage += 1;
                xjGameTimeout(nextStage, 900);
            }

            xjGameInterval(function () {
                if (finished) return;
                timeLeft -= 0.1;
                timerBar.style.width = Math.max(0, (timeLeft / config.time) * 100) + '%';
                if (timeLeft <= 0) endStage(false);
            }, 100);

            xjGameBody.querySelectorAll('.xjg-xray-cell').forEach(function (cell) {
                cell.addEventListener('click', function () {
                    if (finished || xjGameCtx.over) return;
                    playClick();
                    if (Number(cell.dataset.index) === oddIndex) {
                        cell.classList.add('right');
                        endStage(true);
                    } else {
                        cell.classList.add('wrong');
                        timeLeft -= 2;
                    }
                });
            });
        }

        nextStage();
    }

    /* ---------- Доктор: реанимация ---------- */

    function xjStartCpr() {
        const needHits = 10;
        const maxMisses = 3;
        let hits = 0;
        let misses = 0;
        let position = 0;
        let direction = 1;
        let speed = 70;
        let zoneWidth = 24;
        let zoneCenter = 50;
        let lastTime = 0;
        xjGameBody.innerHTML = '<div id="xjg-cpr-area" class="xjg-wrap"><h2 class="xjg-title">❤️ Реанимация</h2>' +
            '<p class="xjg-sub">Нажимайте, когда маркер находится в зелёной зоне. Нужно ' + needHits + ' попаданий, ошибаться можно не больше ' + (maxMisses - 1) + ' раз.</p>' +
            '<div class="xjg-heart" id="xjg-heart">💓</div>' +
            '<div class="xjg-cpr-track"><div id="xjg-cpr-zone" class="xjg-cpr-zone"></div><div id="xjg-cpr-marker" class="xjg-cpr-marker"></div></div>' +
            '<div class="xjg-tug-labels"><span>Стабильность: <b id="xjg-cpr-hits">0</b>/' + needHits + '</span><span>Ошибки: <b id="xjg-cpr-miss">0</b>/' + maxMisses + '</span></div>' +
            '<button type="button" id="xjg-cpr-btn" class="btn btn-primary xjg-big-btn">💓 Массаж сердца!</button></div>';
        const zone = document.getElementById('xjg-cpr-zone');
        const marker = document.getElementById('xjg-cpr-marker');
        const heart = document.getElementById('xjg-heart');
        const hitsLabel = document.getElementById('xjg-cpr-hits');
        const missLabel = document.getElementById('xjg-cpr-miss');

        function paintZone() {
            zone.style.left = (zoneCenter - zoneWidth / 2) + '%';
            zone.style.width = zoneWidth + '%';
        }

        function frame(time) {
            if (xjGameCtx.over) return;
            if (!lastTime) lastTime = time;
            const delta = Math.min(50, time - lastTime) / 1000;
            lastTime = time;
            position += direction * speed * delta;
            if (position >= 100) { position = 100; direction = -1; }
            if (position <= 0) { position = 0; direction = 1; }
            marker.style.left = position + '%';
            xjGameCtx.raf = requestAnimationFrame(frame);
        }

        function press(event) {
            if (event) event.preventDefault();
            if (xjGameCtx.over) return;
            playClick();
            const inside = Math.abs(position - zoneCenter) <= zoneWidth / 2;
            heart.classList.remove('beat');
            void heart.offsetWidth;
            heart.classList.add('beat');
            if (inside) {
                hits += 1;
                speed *= 1.07;
                zoneWidth = Math.max(11, zoneWidth - 1.2);
                zoneCenter = 25 + Math.random() * 50;
                paintZone();
            } else {
                misses += 1;
            }
            hitsLabel.textContent = hits;
            missLabel.textContent = misses;
            if (hits >= needHits) {
                xjGameFinish({ icon: '💖', title: 'Сердце запущено!', lines: ['Пациент стабилен. Вы спасли ему жизнь.'], reward: 1500, label: 'реанимация' });
            } else if (misses >= maxMisses) {
                xjGameFinish({ icon: '💔', title: 'Не удалось спасти пациента', lines: ['Слишком много ошибок. Врачи продолжат реанимацию без вас.'], label: 'реанимация' });
            }
        }

        document.getElementById('xjg-cpr-btn').addEventListener('pointerdown', press, { passive: false });
        document.getElementById('xjg-cpr-area').addEventListener('keydown', function () {});
        paintZone();
        xjGameCtx.raf = requestAnimationFrame(frame);
    }

    /* ---------- Доктор: операция ---------- */

    function xjStartSurgery() {
        const stageLengths = [3, 4, 5];
        const stageRewards = [500, 600, 700];
        const maxMistakes = 2;
        let stage = 0;
        let mistakes = 0;
        let earned = 0;

        function makeSequence(length) {
            const sequence = [];
            while (sequence.length < length) {
                const tool = Math.floor(Math.random() * XJ_TOOLS.length);
                if (sequence.length === 0 || sequence[sequence.length - 1] !== tool) sequence.push(tool);
            }
            return sequence;
        }

        function finishAll(success) {
            xjGameFinish({
                icon: success ? '🏥' : '😰',
                title: success ? 'Операция прошла успешно!' : 'Операция прервана',
                lines: success ? ['Пациент в порядке. Отличная работа, доктор.'] : ['Вы допустили слишком много ошибок.', earned > 0 ? 'Оплачены завершённые этапы операции.' : 'Ни один этап не был завершён.'],
                reward: earned,
                label: 'операция'
            });
        }

        function startStage() {
            if (xjGameCtx.over) return;
            if (stage >= stageLengths.length) {
                finishAll(true);
                return;
            }
            const sequence = makeSequence(stageLengths[stage]);
            xjGameBody.innerHTML = '<div class="xjg-wrap"><h2 class="xjg-title">🔪 Операция: этап ' + (stage + 1) + ' из ' + stageLengths.length + '</h2>' +
                '<p id="xjg-surg-sub" class="xjg-sub">Запомните порядок инструментов...</p>' +
                '<div id="xjg-surg-seq" class="xjg-surg-seq">' + sequence.map(function () { return '<span class="xjg-surg-dot"></span>'; }).join('') + '</div>' +
                '<div class="xjg-tools">' + XJ_TOOLS.map(function (tool, index) {
                    return '<button type="button" class="xjg-tool" data-tool="' + index + '" disabled><span>' + tool.e + '</span><small>' + tool.n + '</small></button>';
                }).join('') + '</div>' +
                '<div class="xjg-tug-labels"><span>Ошибки: <b id="xjg-surg-miss">' + mistakes + '</b>/' + maxMistakes + '</span><span>Заработано: <b>' + xjMoney(earned) + '</b></span></div></div>';
            const toolButtons = xjGameBody.querySelectorAll('.xjg-tool');
            const dots = xjGameBody.querySelectorAll('.xjg-surg-dot');
            const sub = document.getElementById('xjg-surg-sub');
            let showIndex = 0;

            function showNext() {
                if (xjGameCtx.over) return;
                toolButtons.forEach(function (button) { button.classList.remove('lit'); });
                if (showIndex > 0 && showIndex <= sequence.length) { /* пауза между подсветками */ }
                if (showIndex >= sequence.length) {
                    sub.textContent = 'Повторите порядок!';
                    toolButtons.forEach(function (button) { button.disabled = false; });
                    listen();
                    return;
                }
                const button = toolButtons[sequence[showIndex]];
                button.classList.add('lit');
                showIndex += 1;
                xjGameTimeout(function () {
                    button.classList.remove('lit');
                    xjGameTimeout(showNext, 220);
                }, 650);
            }

            function listen() {
                let step = 0;
                toolButtons.forEach(function (button) {
                    button.onclick = function () {
                        if (xjGameCtx.over) return;
                        playClick();
                        const index = Number(button.dataset.tool);
                        if (index === sequence[step]) {
                            dots[step].classList.add('done');
                            step += 1;
                            if (step >= sequence.length) {
                                earned += stageRewards[stage];
                                stage += 1;
                                showToast('✅ Этап завершён');
                                xjGameTimeout(startStage, 600);
                            }
                        } else {
                            mistakes += 1;
                            document.getElementById('xjg-surg-miss').textContent = mistakes;
                            if (mistakes >= maxMistakes) {
                                finishAll(false);
                            } else {
                                showToast('❌ Ошибка! Смотрите ещё раз');
                                xjGameTimeout(startStage, 700);
                            }
                        }
                    };
                });
            }

            xjGameTimeout(showNext, 700);
        }

        startStage();
    }

    /* =========================================================
       ПРИЛОЖЕНИЕ «КОМПАНИЯ»: покупка мировых компаний и прибыль
       Прибыль копится отдельно и не попадает на баланс,
       пока вы не выведете её во вкладке «Прибыль».
       ========================================================= */
    const CO_STORAGE_KEY = 'bestlife_companies_v1';

    const COMPANIES = [
        { id: 'apple', name: 'Apple', icon: '🍎', sector: 'Технологии', price: 120000000000, income: 14000000 },
        { id: 'microsoft', name: 'Microsoft', icon: '💻', sector: 'Технологии', price: 110000000000, income: 12800000 },
        { id: 'google', name: 'Google', icon: '🔍', sector: 'Интернет', price: 85000000000, income: 10000000 },
        { id: 'amazon', name: 'Amazon', icon: '📦', sector: 'Торговля', price: 70000000000, income: 8200000 },
        { id: 'nvidia', name: 'NVIDIA', icon: '🎮', sector: 'Микросхемы', price: 65000000000, income: 7700000 },
        { id: 'meta', name: 'Meta', icon: '👥', sector: 'Соцсети', price: 52000000000, income: 6200000 },
        { id: 'tesla', name: 'Tesla', icon: '⚡', sector: 'Автомобили', price: 40000000000, income: 4800000 },
        { id: 'samsung', name: 'Samsung', icon: '📱', sector: 'Электроника', price: 33000000000, income: 4000000 },
        { id: 'toyota', name: 'Toyota', icon: '🚙', sector: 'Автомобили', price: 28000000000, income: 3400000 },
        { id: 'cocacola', name: 'Coca-Cola', icon: '🥤', sector: 'Напитки', price: 24000000000, income: 2900000 },
        { id: 'visa', name: 'Visa', icon: '💳', sector: 'Финансы', price: 22000000000, income: 2700000 },
        { id: 'nike', name: 'Nike', icon: '👟', sector: 'Одежда', price: 18000000000, income: 2200000 },
        { id: 'mcdonalds', name: 'McDonald’s', icon: '🍔', sector: 'Рестораны', price: 16000000000, income: 2000000 },
        { id: 'disney', name: 'Disney', icon: '🏰', sector: 'Развлечения', price: 14000000000, income: 1750000 },
        { id: 'netflix', name: 'Netflix', icon: '🎬', sector: 'Стриминг', price: 12000000000, income: 1500000 },
        { id: 'sony', name: 'Sony', icon: '🎮', sector: 'Электроника', price: 10000000000, income: 1250000 },
        { id: 'yandex', name: 'Яндекс', icon: '🔎', sector: 'Интернет', price: 9000000000, income: 1150000 },
        { id: 'adidas', name: 'Adidas', icon: '👕', sector: 'Одежда', price: 7500000000, income: 950000 },
        { id: 'starbucks', name: 'Starbucks', icon: '☕', sector: 'Кофейни', price: 6200000000, income: 800000 },
        { id: 'spotify', name: 'Spotify', icon: '🎧', sector: 'Музыка', price: 5000000000, income: 650000 },
        { id: 'uber', name: 'Uber', icon: '🚕', sector: 'Транспорт', price: 4200000000, income: 540000 },
        { id: 'lego', name: 'LEGO', icon: '🧱', sector: 'Игрушки', price: 3400000000, income: 450000 },
        { id: 'ikea', name: 'IKEA', icon: '🛋️', sector: 'Мебель', price: 2800000000, income: 380000 },
        { id: 'kfc', name: 'KFC', icon: '🍗', sector: 'Рестораны', price: 2200000000, income: 300000 },
        { id: 'sber', name: 'Сбер', icon: '🏦', sector: 'Банки', price: 1800000000, income: 250000 },
        { id: 'burgerking', name: 'Burger King', icon: '👑', sector: 'Рестораны', price: 1400000000, income: 200000 },
        { id: 'dominos', name: 'Domino’s Pizza', icon: '🍕', sector: 'Рестораны', price: 900000000, income: 130000 },
        { id: 'redbull', name: 'Red Bull', icon: '🐂', sector: 'Напитки', price: 600000000, income: 90000 },
        { id: 'zara', name: 'Zara', icon: '👗', sector: 'Одежда', price: 350000000, income: 55000 },
        { id: 'vkusnotochka', name: 'Вкусно — и точка', icon: '🍟', sector: 'Рестораны', price: 150000000, income: 25000 }
    ];

    const CO_INCOME_MULTIPLIER = 6;
    COMPANIES.forEach(function (company) { company.income = company.income * CO_INCOME_MULTIPLIER; });
    COMPANIES.sort(function (a, b) { return a.price - b.price; });

    let coState = { owned: {}, profit: 0, lastSeen: 0 };
    let coOfflineGain = 0;
    let coTab = 'market';
    let coLastTick = Date.now();
    let coSaveCounter = 0;

    function coLoad() {
        try {
            const raw = localStorage.getItem(CO_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data && typeof data === 'object') {
                coState.owned = data.owned && typeof data.owned === 'object' ? data.owned : {};
                coState.profit = Number(data.profit) || 0;
                coState.lastSeen = Number(data.lastSeen) || 0;
            }
        } catch (error) {
            console.warn('Не удалось загрузить компании:', error);
        }
    }

    function coSave() {
        try {
            localStorage.setItem(CO_STORAGE_KEY, JSON.stringify(coState));
        } catch (error) {
            console.warn('Не удалось сохранить компании:', error);
        }
    }

    coLoad();

    function coApplyOffline() {
        const now = Date.now();
        if (coState.lastSeen > 0) {
            const maxMs = 30 * 24 * 60 * 60 * 1000;
            const elapsed = Math.min(maxMs, Math.max(0, now - coState.lastSeen));
            const perMinute = coIncomePerMinute();
            const gain = perMinute * (elapsed / 60000);
            if (gain > 0) {
                coState.profit += gain;
                if (elapsed > 120000) coOfflineGain = gain;
            }
        }
        coState.lastSeen = now;
        coSave();
    }

    function coAnnounceOffline() {
        if (coOfflineGain > 0) {
            const gain = coOfflineGain;
            coOfflineGain = 0;
            addMessage('Компании', '🏢', 'Пока вас не было, ваши компании принесли ' + coFormat(Math.floor(gain)) + '. Заберите прибыль в приложении «Компания».');
            showToast('🏢 Компании принесли ' + coFormat(Math.floor(gain)));
        }
    }

    function coIconHtml(company) {
        return '<img class="co-logo" src="companies/' + company.id + '.webp" data-base="companies/' + company.id + '" data-exts="webp,png,jpg" alt="" onerror="blImgFail(this)"><span class="co-emoji" style="display:none">' + company.icon + '</span>';
    }

    function coFormat(value) {
        const abs = Math.abs(value);
        const trim = function (number) { return String(Math.round(number * 100) / 100).replace('.', ','); };
        if (abs >= 1000000000) return trim(value / 1000000000) + ' млрд ₽';
        if (abs >= 1000000) return trim(value / 1000000) + ' млн ₽';
        if (abs >= 1000) return trim(value / 1000) + ' тыс. ₽';
        return Math.round(value).toLocaleString('ru-RU') + ' ₽';
    }

    function coIncomePerMinute() {
        return COMPANIES.reduce(function (sum, company) { return sum + (coState.owned[company.id] ? company.income : 0); }, 0);
    }

    function coOwnedCount() {
        return COMPANIES.filter(function (company) { return coState.owned[company.id]; }).length;
    }

    function coBuy(company) {
        if (coState.owned[company.id]) {
            showToast('Эта компания уже принадлежит вам');
            return;
        }
        if (playerMoney < company.price) {
            showToast('Недостаточно денег на балансе');
            return;
        }
        playerMoney -= company.price;
        coState.owned[company.id] = true;
        addBankTransaction('Покупка компании ' + company.name, company.price, false);
        coSave();
        saveGameData();
        updateClockUI();
        showToast('Вы купили компанию ' + company.name);
        renderCompanyApp();
    }

    function coWithdraw() {
        const amount = Math.floor(coState.profit);
        if (amount <= 0) {
            showToast('Прибыли для вывода пока нет');
            return;
        }
        coState.profit -= amount;
        playerMoney += amount;
        addBankTransaction('Вывод прибыли компаний', amount, true);
        coSave();
        saveGameData();
        updateClockUI();
        showToast('На баланс выведено ' + coFormat(amount));
        renderCompanyApp();
    }

    function renderCompanyApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'co-wrap';
        const tabs = [['market', 'Рынок'], ['mine', 'Мои (' + coOwnedCount() + ')'], ['profit', 'Прибыль']];
        wrapper.innerHTML = '<div class="co-tabs">' + tabs.map(function (tab) {
            return '<button type="button" class="co-tab' + (coTab === tab[0] ? ' active' : '') + '" data-tab="' + tab[0] + '">' + tab[1] + '</button>';
        }).join('') + '</div><div id="co-content" class="co-content"></div>';
        appScrollableBody.appendChild(wrapper);
        wrapper.querySelectorAll('.co-tab').forEach(function (button) {
            button.addEventListener('click', function () {
                coTab = button.dataset.tab;
                renderCompanyApp();
            });
        });
        const content = wrapper.querySelector('#co-content');

        if (coTab === 'profit') {
            content.innerHTML = '<div class="co-profit-card"><div class="co-profit-label">Доступно к выводу</div>' +
                '<div id="co-profit-value" class="co-profit-value">' + coFormat(Math.floor(coState.profit)) + '</div>' +
                '<div class="co-profit-rate">Доход: ' + coFormat(coIncomePerMinute()) + ' в минуту</div>' +
                '<button type="button" id="co-withdraw" class="co-withdraw-btn">Вывести на баланс</button>' +
                '<p class="co-note">Компании приносят деньги всегда, даже когда вы не в игре. Пока вы не выведете прибыль на баланс, потратить её нельзя.</p></div>' +
                '<div class="co-list-title">Источники дохода</div>' +
                (coOwnedCount() === 0 ? '<div class="co-empty">У вас пока нет компаний. Купите первую во вкладке «Рынок».</div>' :
                    COMPANIES.filter(function (company) { return coState.owned[company.id]; }).map(function (company) {
                        return '<div class="co-row"><span class="co-row-icon">' + coIconHtml(company) + '</span><span class="co-row-name">' + company.name + '</span><span class="co-row-income">+' + coFormat(company.income) + '/мин</span></div>';
                    }).join(''));
            content.querySelector('#co-withdraw').addEventListener('click', coWithdraw);
            return;
        }

        const list = coTab === 'mine' ? COMPANIES.filter(function (company) { return coState.owned[company.id]; }) : COMPANIES;
        if (list.length === 0) {
            content.innerHTML = '<div class="co-empty">У вас пока нет компаний.<br>Накопите деньги и купите первую!</div>';
            return;
        }
        list.forEach(function (company) {
            const owned = Boolean(coState.owned[company.id]);
            const card = document.createElement('div');
            card.className = 'co-card' + (owned ? ' owned' : '');
            card.innerHTML = '<div class="co-card-icon">' + coIconHtml(company) + '</div>' +
                '<div class="co-card-info"><div class="co-card-name">' + company.name + '</div>' +
                '<div class="co-card-sector">' + company.sector + '</div>' +
                '<div class="co-card-income">+' + coFormat(company.income) + ' в минуту</div></div>' +
                '<div class="co-card-buy"><div class="co-card-price">' + coFormat(company.price) + '</div>' +
                '<button type="button" class="co-buy-btn"' + (owned ? ' disabled' : '') + '>' + (owned ? 'Куплено' : 'Купить') + '</button></div>';
            card.querySelector('.co-buy-btn').addEventListener('click', function () { coBuy(company); });
            content.appendChild(card);
        });
    }

    coApplyOffline();

    setInterval(function () {
        const now = Date.now();
        const elapsedMinutes = Math.max(0, now - (coState.lastSeen || now)) / 60000;
        coState.lastSeen = now;
        const perMinute = coIncomePerMinute();
        if (perMinute > 0) coState.profit += perMinute * elapsedMinutes;
        coSaveCounter += 1;
        if (coSaveCounter >= 10) {
            coSaveCounter = 0;
            coSave();
        }
        if (currentPhoneApp === 'compania' && coTab === 'profit') {
            const value = document.getElementById('co-profit-value');
            if (value) value.textContent = coFormat(Math.floor(coState.profit));
        }
    }, 1000);

    document.addEventListener('visibilitychange', function () { if (document.hidden) coSave(); });
    window.addEventListener('pagehide', coSave);

        function xjHoursText(config) {
        return config.startH === 0 && config.endH === 24 ? 'круглосуточно' : xjHourLabel(config.startH) + '–' + xjHourLabel(config.endH);
    }

    /* =========================================================
       БИЗНЕС, ЗАКАЗ ТОВАРОВ, ИМУЩЕСТВО (машины и бизнесы)
       ========================================================= */
    const BIZ_STORAGE_KEY = 'bestlife_business_v1';
    const CAR_SELECTED_KEY = 'bestlife_selected_car';
    const BIZ_SELL_RATE = 0.65;
    const CAR_SELL_RATE = 0.7;
    const BIZ_MAX_WORKER_DAYS = 2;
    const BIZ_MAX_RENT_DAYS = 4;

    const BUSINESSES = [
        { id: 'kiosk', name: 'Ларёк', icon: '🏪', price: 650000, check: 800, visitors: 35, rent: 2000, worker: 2000, start: 540, end: 1260, capacity: 50, buy: 190, sell: 260 },
        { id: 'grocery', name: 'Маленький продуктовый магазин', icon: '🛒', price: 1250000, check: 1300, visitors: 50, rent: 3500, worker: 4500, start: 540, end: 1320, capacity: 80, buy: 220, sell: 333 },
        { id: 'minimarket', name: 'Минимаркет', icon: '🏬', price: 2250000, check: 2350, visitors: 67, rent: 6500, worker: 8000, start: 510, end: 1350, capacity: 125, buy: 300, sell: 450 },
        { id: 'supermarket', name: 'Супермаркет', icon: '🏢', price: 7000000, check: 3000, visitors: 100, rent: 11000, worker: 13000, start: 480, end: 1380, capacity: 270, buy: 400, sell: 650 },
        { id: 'restaurant', name: 'Ресторан', icon: '🍽️', price: 15000000, check: 15000, visitors: 43, rent: 25000, worker: 30000, start: 540, end: 1320, capacity: 260, buy: 550, sell: 900 },
        { id: 'transport', name: 'Транспортная компания', icon: '🚚', price: 125000000, check: 15500, visitors: 255, rent: 320000, worker: 350000, start: 420, end: 1350, capacity: 1200, buy: 9000, sell: 15000 },
        { id: 'carshowroom', name: 'Автосалон', icon: '🚗', price: 1450000000, check: 5000000, visitors: 10, rent: 1000000, worker: 750000, start: 480, end: 1320, capacity: 20, buy: 3500000, sell: 5000000 }
    ];

    let bizState = { owned: {}, profit: 0 };
    let bizTab = 'market';
    let bizLastAbs = null;
    let bizSaveCounter = 0;
    let bizSellConfirm = null;
    const bizOrderQty = {};

    function bizLoad() {
        try {
            const raw = localStorage.getItem(BIZ_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data && typeof data === 'object') {
                bizState.owned = data.owned && typeof data.owned === 'object' ? data.owned : {};
                bizState.profit = Number(data.profit) || 0;
            }
        } catch (error) {
            console.warn('Не удалось загрузить бизнесы:', error);
        }
    }

    function bizSave() {
        try {
            localStorage.setItem(BIZ_STORAGE_KEY, JSON.stringify(bizState));
        } catch (error) {
            console.warn('Не удалось сохранить бизнесы:', error);
        }
    }

    bizLoad();

    function bizConfig(id) {
        return BUSINESSES.find(function (item) { return item.id === id; });
    }

    function bizMoney(value) {
        return Math.round(value).toLocaleString('ru-RU') + ' ₽';
    }

    function bizTimeLabel(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
    }

    function bizRandomError() {
        return (1 + Math.random() * 4) / 100 * (Math.random() < 0.5 ? -1 : 1);
    }

    function bizImageHtml(config, extraClass) {
        return '<div class="biz-image ' + (extraClass || '') + '"><img src="business/' + config.id + '.png" data-base="business/' + config.id + '" data-exts="png,webp,jpg" alt="' + config.name + '" onerror="blImgFail(this)"><span class="biz-image-fallback">' + config.icon + '</span></div>';
    }

    /* ---------- Работа бизнесов по игровому времени ---------- */

    function bizProcessSlice(from, to) {
        const day = Math.floor(from / 1440);
        const minuteOfDay = from % 1440;
        const length = to - from;
        BUSINESSES.forEach(function (config) {
            const biz = bizState.owned[config.id];
            if (!biz) return;
            const overlap = Math.max(0, Math.min(minuteOfDay + length, config.end) - Math.max(minuteOfDay, config.start));
            if (overlap <= 0) return;
            if (biz.activeDay !== day) {
                if (biz.workerHired && biz.workerCredit > 0 && biz.rentCredit > 0) {
                    biz.workerCredit -= 1;
                    biz.rentCredit -= 1;
                    biz.activeDay = day;
                    biz.dayVisitors = Math.max(1, Math.round(config.visitors * (1 + bizRandomError())));
                    biz.dayCheck = Math.max(1, Math.round(config.check * (1 + bizRandomError())));
                    biz.visitorsAcc = 0;
                } else {
                    return;
                }
            }
            if (biz.stock <= 0.001) {
                biz.stock = 0;
                return;
            }
            biz.visitorsAcc += (biz.dayVisitors / (config.end - config.start)) * overlap;
            while (biz.visitorsAcc >= 1 && biz.stock > 0.001) {
                biz.visitorsAcc -= 1;
                const wanted = 0.9 + Math.random();
                const taken = Math.min(wanted, biz.stock);
                biz.stock -= taken;
                const revenue = biz.dayCheck * (taken / wanted);
                bizState.profit += revenue;
                biz.earned = (biz.earned || 0) + revenue;
            }
            if (biz.stock <= 0.001) {
                biz.stock = 0;
                if (!biz.emptyNotified) {
                    biz.emptyNotified = true;
                    addMessage('Бизнес', '📦', 'В бизнесе «' + config.name + '» закончились товары. Закажите новые в приложении «Заказ», иначе выручка не будет поступать.');
                }
            }
        });
    }

    function bizTick() {
        if (!isClockRunning) return;
        const nowAbs = absoluteDay() * 1440 + gameMinutes;
        if (bizLastAbs === null) {
            bizLastAbs = nowAbs;
            return;
        }
        if (nowAbs < bizLastAbs) {
            bizLastAbs = nowAbs;
            Object.keys(bizState.owned).forEach(function (id) { bizState.owned[id].activeDay = -1; });
            return;
        }
        let cursor = bizLastAbs;
        let guard = 0;
        while (cursor < nowAbs && guard < 400) {
            const next = Math.min(cursor + 10, nowAbs);
            bizProcessSlice(cursor, next);
            cursor = next;
            guard += 1;
        }
        bizLastAbs = nowAbs;
    }

    function bizStatus(config) {
        const biz = bizState.owned[config.id];
        if (!biz) return { ok: false, text: 'Не куплен' };
        const nowMinute = gameMinutes;
        const inWindow = nowMinute >= config.start && nowMinute < config.end;
        const today = absoluteDay();
        if (!biz.workerHired) return { ok: false, text: 'Нет работника' };
        if (biz.stock <= 0.001 && biz.activeDay === today) return { ok: false, text: 'Нет товара' };
        if (biz.activeDay === today && inWindow) return { ok: true, text: 'Работает' };
        if (biz.activeDay === today && !inWindow) return { ok: false, text: 'Смена закончена' };
        if (biz.workerCredit <= 0) return { ok: false, text: 'Работник не оплачен' };
        if (biz.rentCredit <= 0) return { ok: false, text: 'Аренда не оплачена' };
        if (biz.stock <= 0.001) return { ok: false, text: 'Нет товара' };
        return { ok: false, text: inWindow ? 'Откроется в ближайшие минуты' : 'Откроется ' + bizTimeLabel(config.start) };
    }

    setInterval(function () {
        bizTick();
        bizSaveCounter += 1;
        if (bizSaveCounter >= 5) {
            bizSaveCounter = 0;
            bizSave();
        }
        bizRefreshLive();
    }, 1000);

    /* ---------- Действия ---------- */

    function bizBuy(config) {
        if (bizState.owned[config.id]) {
            showToast('У вас уже есть этот бизнес');
            return;
        }
        if (playerMoney < config.price) {
            showToast('Недостаточно денег на балансе');
            return;
        }
        playerMoney -= config.price;
        bizState.owned[config.id] = { stock: 0, rentCredit: 0, workerHired: false, workerCredit: 0, activeDay: -1, dayVisitors: 0, dayCheck: 0, visitorsAcc: 0, earned: 0, emptyNotified: false };
        addBankTransaction('Покупка бизнеса: ' + config.name, config.price, false);
        bizSave();
        saveGameData();
        updateClockUI();
        showToast('Вы купили бизнес «' + config.name + '»');
        bizTab = 'mine';
        renderBusinessApp();
    }

    function bizSell(config) {
        const biz = bizState.owned[config.id];
        if (!biz) return;
        if (bizSellConfirm !== config.id) {
            bizSellConfirm = config.id;
            showToast('Нажмите «Продать» ещё раз для подтверждения');
            renderBusinessApp();
            setTimeout(function () {
                if (bizSellConfirm === config.id) { bizSellConfirm = null; if (currentPhoneApp === 'business') renderBusinessApp(); }
            }, 4000);
            return;
        }
        bizSellConfirm = null;
        const amount = Math.floor(config.price * BIZ_SELL_RATE);
        playerMoney += amount;
        delete bizState.owned[config.id];
        addBankTransaction('Продажа бизнеса: ' + config.name, amount, true);
        bizSave();
        saveGameData();
        updateClockUI();
        showToast('Бизнес продан за ' + bizMoney(amount));
        renderBusinessApp();
    }

    function bizPayRent(config, toMax) {
        const biz = bizState.owned[config.id];
        if (!biz) return;
        const room = BIZ_MAX_RENT_DAYS - biz.rentCredit;
        if (room <= 0) {
            showToast('Аренда уже оплачена на максимум (' + BIZ_MAX_RENT_DAYS + ' дн.)');
            return;
        }
        let days = toMax ? room : 1;
        if (playerMoney < config.rent * days) {
            days = Math.floor(playerMoney / config.rent);
            if (days <= 0) {
                showToast('Недостаточно денег для оплаты аренды');
                return;
            }
        }
        playerMoney -= config.rent * days;
        biz.rentCredit += days;
        addBankTransaction('Аренда: ' + config.name + ' (' + days + ' дн.)', config.rent * days, false);
        bizSave();
        saveGameData();
        updateClockUI();
        showToast('Аренда оплачена на ' + days + ' дн.');
        renderBusinessApp();
    }

    function bizHire(config) {
        const biz = bizState.owned[config.id];
        if (!biz || biz.workerHired) return;
        biz.workerHired = true;
        bizSave();
        showToast('Работник нанят. Оплатите ему день, чтобы он начал работать');
        renderBusinessApp();
    }

    function bizFire(config) {
        const biz = bizState.owned[config.id];
        if (!biz || !biz.workerHired) return;
        biz.workerHired = false;
        biz.workerCredit = 0;
        bizSave();
        showToast('Работник уволен');
        renderBusinessApp();
    }

    function bizPayWorker(config) {
        const biz = bizState.owned[config.id];
        if (!biz || !biz.workerHired) return;
        if (biz.workerCredit >= BIZ_MAX_WORKER_DAYS) {
            showToast('Работнику уже оплачено максимум (' + BIZ_MAX_WORKER_DAYS + ' дня)');
            return;
        }
        if (playerMoney < config.worker) {
            showToast('Недостаточно денег для оплаты работника');
            return;
        }
        playerMoney -= config.worker;
        biz.workerCredit += 1;
        addBankTransaction('Зарплата работнику: ' + config.name, config.worker, false);
        bizSave();
        saveGameData();
        updateClockUI();
        showToast('Работнику оплачен 1 день');
        renderBusinessApp();
    }

    function bizWithdraw() {
        const amount = Math.floor(bizState.profit);
        if (amount <= 0) {
            showToast('Выручки для вывода пока нет');
            return;
        }
        bizState.profit -= amount;
        playerMoney += amount;
        addBankTransaction('Вывод выручки бизнесов', amount, true);
        bizSave();
        saveGameData();
        updateClockUI();
        showToast('На баланс выведено ' + bizMoney(amount));
        renderBusinessApp();
    }

    /* ---------- Приложение «Бизнес» ---------- */

    function bizStatsHtml(config) {
        return '<div class="biz-stats">' +
            '<div><span>Средний чек</span><b>' + bizMoney(config.check) + '</b></div>' +
            '<div><span>Посетителей в день</span><b>≈ ' + config.visitors + '</b></div>' +
            '<div><span>Аренда в день</span><b>' + bizMoney(config.rent) + '</b></div>' +
            '<div><span>Работник в день</span><b>' + bizMoney(config.worker) + '</b></div>' +
            '<div><span>График работы</span><b>' + bizTimeLabel(config.start) + '–' + bizTimeLabel(config.end) + '</b></div>' +
            '<div><span>Склад</span><b>до ' + config.capacity.toLocaleString('ru-RU') + ' шт.</b></div>' +
            '<div><span>Закупка / продажа</span><b>' + bizMoney(config.buy) + ' / ≈' + bizMoney(config.sell) + '</b></div>' +
            '</div>';
    }

    function renderBusinessApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'co-wrap biz-wrap';
        const tabs = [['market', 'Купить'], ['mine', 'Мои'], ['workers', 'Работники'], ['profit', 'Прибыль']];
        wrapper.innerHTML = '<div class="co-tabs">' + tabs.map(function (tab) {
            return '<button type="button" class="co-tab' + (bizTab === tab[0] ? ' active' : '') + '" data-tab="' + tab[0] + '">' + tab[1] + '</button>';
        }).join('') + '</div><div id="biz-content" class="biz-content"></div>';
        appScrollableBody.appendChild(wrapper);
        wrapper.querySelectorAll('.co-tab').forEach(function (button) {
            button.addEventListener('click', function () {
                bizTab = button.dataset.tab;
                renderBusinessApp();
            });
        });
        const content = wrapper.querySelector('#biz-content');
        const ownedList = BUSINESSES.filter(function (config) { return bizState.owned[config.id]; });

        if (bizTab === 'market') {
            BUSINESSES.forEach(function (config) {
                const owned = Boolean(bizState.owned[config.id]);
                const card = document.createElement('div');
                card.className = 'biz-card' + (owned ? ' owned' : '');
                card.innerHTML = bizImageHtml(config) +
                    '<div class="biz-card-body"><div class="biz-card-title">' + config.name + '</div>' +
                    '<div class="biz-card-price">' + bizMoney(config.price) + '</div>' + bizStatsHtml(config) +
                    '<button type="button" class="biz-btn biz-btn-primary"' + (owned ? ' disabled' : '') + '>' + (owned ? 'Уже есть' : 'Купить за ' + bizMoney(config.price)) + '</button></div>';
                card.querySelector('.biz-btn').addEventListener('click', function () { bizBuy(config); });
                content.appendChild(card);
            });
            return;
        }

        if (ownedList.length === 0 && bizTab !== 'profit') {
            content.innerHTML = '<div class="co-empty">У вас пока нет бизнесов.<br>Купите первый во вкладке «Купить».</div>';
            return;
        }

        if (bizTab === 'mine') {
            ownedList.forEach(function (config) {
                const biz = bizState.owned[config.id];
                const status = bizStatus(config);
                const sellValue = Math.floor(config.price * BIZ_SELL_RATE);
                const card = document.createElement('div');
                card.className = 'biz-card owned';
                card.innerHTML = bizImageHtml(config) +
                    '<div class="biz-card-body"><div class="biz-card-title">' + config.name + '</div>' +
                    '<div id="biz-status-' + config.id + '" class="biz-status ' + (status.ok ? 'ok' : 'bad') + '">' + status.text + '</div>' +
                    '<div class="biz-row"><span>Товар на складе</span><b id="biz-stock-' + config.id + '">' + Math.floor(biz.stock) + ' / ' + config.capacity + '</b></div>' +
                    '<div class="biz-row"><span>Аренда оплачена</span><b>' + biz.rentCredit + ' из ' + BIZ_MAX_RENT_DAYS + ' дн.</b></div>' +
                    '<div class="biz-row"><span>Работник</span><b>' + (biz.workerHired ? 'оплачено ' + biz.workerCredit + ' из ' + BIZ_MAX_WORKER_DAYS + ' дн.' : 'не нанят') + '</b></div>' +
                    '<div class="biz-row"><span>График</span><b>' + bizTimeLabel(config.start) + '–' + bizTimeLabel(config.end) + '</b></div>' +
                    '<div class="biz-row"><span>Всего выручки</span><b>' + bizMoney(biz.earned || 0) + '</b></div>' +
                    '<div class="biz-btn-row"><button type="button" class="biz-btn rent">Аренда +1 день (' + bizMoney(config.rent) + ')</button>' +
                    '<button type="button" class="biz-btn rent-max">Аренда до максимума</button></div>' +
                    '<button type="button" class="biz-btn biz-btn-danger sell">' + (bizSellConfirm === config.id ? 'Подтвердить продажу: ' + bizMoney(sellValue) : 'Продать за ' + bizMoney(sellValue) + ' (65%)') + '</button></div>';
                card.querySelector('.rent').addEventListener('click', function () { bizPayRent(config, false); });
                card.querySelector('.rent-max').addEventListener('click', function () { bizPayRent(config, true); });
                card.querySelector('.sell').addEventListener('click', function () { bizSell(config); });
                content.appendChild(card);
            });
            return;
        }

        if (bizTab === 'workers') {
            ownedList.forEach(function (config) {
                const biz = bizState.owned[config.id];
                const card = document.createElement('div');
                card.className = 'biz-card biz-worker-card';
                card.innerHTML = '<div class="biz-worker-head"><span class="biz-worker-icon">' + config.icon + '</span><div><div class="biz-card-title">' + config.name + '</div>' +
                    '<div class="biz-worker-sub">График: ' + bizTimeLabel(config.start) + '–' + bizTimeLabel(config.end) + ' • ' + bizMoney(config.worker) + ' в день</div></div></div>' +
                    (biz.workerHired
                        ? '<div class="biz-row"><span>Статус</span><b>' + (biz.workerCredit > 0 ? 'оплачено ' + biz.workerCredit + ' из ' + BIZ_MAX_WORKER_DAYS + ' дн.' : 'ждёт оплаты') + '</b></div>' +
                          '<p class="biz-note">Работник начинает работу строго по графику, но только если ему оплачен день вперёд (максимум на 2 дня).</p>' +
                          '<div class="biz-btn-row"><button type="button" class="biz-btn biz-btn-primary pay">Оплатить день (' + bizMoney(config.worker) + ')</button><button type="button" class="biz-btn fire">Уволить</button></div>'
                        : '<p class="biz-note">Работника нет, бизнес стоит. Наймите работника и оплатите ему день.</p><button type="button" class="biz-btn biz-btn-primary hire">Нанять работника</button>');
                const payButton = card.querySelector('.pay');
                if (payButton) payButton.addEventListener('click', function () { bizPayWorker(config); });
                const fireButton = card.querySelector('.fire');
                if (fireButton) fireButton.addEventListener('click', function () { bizFire(config); });
                const hireButton = card.querySelector('.hire');
                if (hireButton) hireButton.addEventListener('click', function () { bizHire(config); });
                content.appendChild(card);
            });
            return;
        }

        content.innerHTML = '<div class="co-profit-card"><div class="co-profit-label">Выручка, доступная к выводу</div>' +
            '<div id="biz-profit-value" class="co-profit-value">' + bizMoney(Math.floor(bizState.profit)) + '</div>' +
            '<button type="button" id="biz-withdraw" class="co-withdraw-btn">Вывести на баланс</button>' +
            '<p class="co-note">Деньги бизнесов не попадают на баланс сами. Пока вы их не выведете, потратить их нельзя.</p></div>' +
            '<div class="co-list-title">Выручка по бизнесам</div>' +
            (ownedList.length === 0 ? '<div class="co-empty">У вас пока нет бизнесов.</div>' : ownedList.map(function (config) {
                return '<div class="co-row"><span class="co-row-icon">' + config.icon + '</span><span class="co-row-name">' + config.name + '</span><span class="co-row-income">' + bizMoney(bizState.owned[config.id].earned || 0) + '</span></div>';
            }).join(''));
        content.querySelector('#biz-withdraw').addEventListener('click', bizWithdraw);
    }

    function bizRefreshLive() {
        if (currentPhoneApp === 'business') {
            const profit = document.getElementById('biz-profit-value');
            if (profit) profit.textContent = bizMoney(Math.floor(bizState.profit));
            BUSINESSES.forEach(function (config) {
                const biz = bizState.owned[config.id];
                if (!biz) return;
                const status = bizStatus(config);
                const statusElement = document.getElementById('biz-status-' + config.id);
                if (statusElement) {
                    statusElement.textContent = status.text;
                    statusElement.className = 'biz-status ' + (status.ok ? 'ok' : 'bad');
                }
                const stockElement = document.getElementById('biz-stock-' + config.id);
                if (stockElement) stockElement.textContent = Math.floor(biz.stock) + ' / ' + config.capacity;
            });
        }
        if (currentPhoneApp === 'zakaz') {
            BUSINESSES.forEach(function (config) {
                const biz = bizState.owned[config.id];
                const element = document.getElementById('order-stock-' + config.id);
                if (biz && element) element.textContent = Math.floor(biz.stock) + ' / ' + config.capacity;
            });
        }
    }

    /* ---------- Приложение «Заказ»: закупка товаров для бизнеса ---------- */

    function renderOrderApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'co-wrap biz-wrap';
        const ownedList = BUSINESSES.filter(function (config) { return bizState.owned[config.id]; });
        if (ownedList.length === 0) {
            wrapper.innerHTML = '<div class="co-empty">Здесь можно заказывать товары для вашего бизнеса.<br><br>Сначала купите бизнес в приложении «Бизнес».</div>';
            appScrollableBody.appendChild(wrapper);
            return;
        }
        const intro = document.createElement('div');
        intro.className = 'biz-note biz-order-intro';
        intro.textContent = 'Пока на складе есть товар, бизнес продаёт и приносит выручку. Когда товар заканчивается, бизнес останавливается.';
        wrapper.appendChild(intro);
        ownedList.forEach(function (config) {
            const biz = bizState.owned[config.id];
            const free = Math.max(0, config.capacity - Math.floor(biz.stock));
            if (bizOrderQty[config.id] === undefined) bizOrderQty[config.id] = Math.min(free, 10);
            bizOrderQty[config.id] = Math.min(bizOrderQty[config.id], free);
            const card = document.createElement('div');
            card.className = 'biz-card biz-order-card';
            card.innerHTML = '<div class="biz-worker-head"><span class="biz-worker-icon">' + config.icon + '</span><div><div class="biz-card-title">' + config.name + '</div>' +
                '<div class="biz-worker-sub">Закупка ' + bizMoney(config.buy) + ' за шт. • продажа ≈' + bizMoney(config.sell) + '</div></div></div>' +
                '<div class="biz-row"><span>На складе</span><b id="order-stock-' + config.id + '">' + Math.floor(biz.stock) + ' / ' + config.capacity + '</b></div>' +
                '<div class="biz-stock-bar"><div style="width:' + Math.min(100, (biz.stock / config.capacity) * 100) + '%"></div></div>' +
                '<div class="biz-qty-row"><button type="button" class="biz-qty-btn" data-d="-10">−10</button><button type="button" class="biz-qty-btn" data-d="-1">−1</button>' +
                '<div class="biz-qty-value"><b class="qty-num">' + bizOrderQty[config.id] + '</b><small>шт.</small></div>' +
                '<button type="button" class="biz-qty-btn" data-d="1">+1</button><button type="button" class="biz-qty-btn" data-d="10">+10</button></div>' +
                '<div class="biz-btn-row"><button type="button" class="biz-btn fill">Заполнить склад (' + free + ' шт.)</button></div>' +
                '<div class="biz-order-total">Итого: <b class="qty-total">' + bizMoney(bizOrderQty[config.id] * config.buy) + '</b></div>' +
                '<button type="button" class="biz-btn biz-btn-primary order-go"' + (free <= 0 ? ' disabled' : '') + '>' + (free <= 0 ? 'Склад заполнен' : 'Заказать товар') + '</button>';
            const numElement = card.querySelector('.qty-num');
            const totalElement = card.querySelector('.qty-total');
            function updateQty() {
                numElement.textContent = bizOrderQty[config.id];
                totalElement.textContent = bizMoney(bizOrderQty[config.id] * config.buy);
            }
            card.querySelectorAll('.biz-qty-btn').forEach(function (button) {
                button.addEventListener('click', function () {
                    const latestFree = Math.max(0, config.capacity - Math.floor(biz.stock));
                    bizOrderQty[config.id] = Math.max(0, Math.min(latestFree, bizOrderQty[config.id] + Number(button.dataset.d)));
                    updateQty();
                });
            });
            card.querySelector('.fill').addEventListener('click', function () {
                bizOrderQty[config.id] = Math.max(0, config.capacity - Math.floor(biz.stock));
                updateQty();
            });
            card.querySelector('.order-go').addEventListener('click', function () {
                const latestFree = Math.max(0, config.capacity - Math.floor(biz.stock));
                const quantity = Math.min(bizOrderQty[config.id], latestFree);
                if (quantity <= 0) {
                    showToast('Выберите количество товара');
                    return;
                }
                const cost = quantity * config.buy;
                if (playerMoney < cost) {
                    showToast('Недостаточно денег на балансе');
                    return;
                }
                playerMoney -= cost;
                biz.stock += quantity;
                biz.emptyNotified = false;
                addBankTransaction('Закупка товара: ' + config.name + ' (' + quantity + ' шт.)', cost, false);
                bizOrderQty[config.id] = Math.min(10, Math.max(0, config.capacity - Math.floor(biz.stock)));
                bizSave();
                saveGameData();
                updateClockUI();
                showToast('Товар доставлен на склад: ' + quantity + ' шт.');
                renderOrderApp();
            });
            wrapper.appendChild(card);
        });
        appScrollableBody.appendChild(wrapper);
    }

    /* ---------- Имущество: машины (выбор и продажа) и бизнесы ---------- */

    function getSelectedCar() {
        const cars = ownedCars.filter(function (item) { return item.id !== 'bike'; });
        if (cars.length === 0) return null;
        let selectedId = null;
        try { selectedId = localStorage.getItem(CAR_SELECTED_KEY); } catch (error) { selectedId = null; }
        const found = cars.find(function (item) { return item.id === selectedId; });
        return found || cars[0];
    }

    function selectCar(car) {
        try { localStorage.setItem(CAR_SELECTED_KEY, car.id); } catch (error) { /* ignore */ }
        showToast('Выбрана машина: ' + car.title);
        renderPropertyApp();
    }

    let carSellConfirm = null;
    function sellOwnedVehicle(car) {
        if (carSellConfirm !== car.id) {
            carSellConfirm = car.id;
            showToast('Нажмите «Продать» ещё раз для подтверждения');
            renderPropertyApp();
            setTimeout(function () {
                if (carSellConfirm === car.id) { carSellConfirm = null; if (currentPhoneApp === 'imushka') renderPropertyApp(); }
            }, 4000);
            return;
        }
        carSellConfirm = null;
        const index = ownedCars.findIndex(function (item) { return item.id === car.id; });
        if (index < 0) return;
        const amount = Math.floor(car.price * CAR_SELL_RATE);
        ownedCars.splice(index, 1);
        playerMoney += amount;
        addBankTransaction('Продажа: ' + car.title, amount, true);
        saveGameData();
        updateClockUI();
        showToast(car.title + ' продан за ' + bizMoney(amount));
        renderPropertyApp();
    }

    function renderPropertyApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'property-list';
        wrapper.innerHTML = '<div class="property-card-item"><div class="property-thumb-box"><img src="house.png" class="property-thumb-img" alt="Квартира"></div><div class="property-details-col"><div class="property-details-title">Уютная квартира</div><div class="property-details-sub">Центральный район • Собственность</div><div class="property-status-badge">Основное жильё</div></div></div>';

        const ownedBusinesses = BUSINESSES.filter(function (config) { return bizState.owned[config.id]; });
        ownedBusinesses.forEach(function (config) {
            const biz = bizState.owned[config.id];
            const status = bizStatus(config);
            const card = document.createElement('div');
            card.className = 'property-card-item property-biz-card';
            card.innerHTML = bizImageHtml(config, 'property-biz-image') +
                '<div class="property-details-col"><div class="property-details-title">' + config.name + '</div>' +
                '<div class="property-details-sub">Бизнес • склад ' + Math.floor(biz.stock) + ' / ' + config.capacity + '</div>' +
                '<div class="property-status-badge" style="' + (status.ok ? 'color:#16a34a;background:#dcfce7;' : 'color:#b45309;background:#fef3c7;') + '">' + status.text + '</div></div>';
            wrapper.appendChild(card);
        });

        const selected = getSelectedCar();
        ownedCars.forEach(function (car) {
            const isBike = car.id === 'bike';
            const isSelected = !isBike && selected && selected.id === car.id;
            const sellValue = Math.floor(car.price * CAR_SELL_RATE);
            const card = document.createElement('div');
            card.className = 'property-card-item property-car-card' + (isSelected ? ' selected' : '');
            card.innerHTML = '<div class="property-car-top"><div class="property-thumb-box"><img src="cars/' + car.imgPrefix + '_1.png" class="property-thumb-img" alt="' + car.title + '"></div><div class="property-details-col"><div class="property-details-title">' + car.title + '</div>' +
                '<div class="property-details-sub">' + car.year + ' г. • ' + (isBike ? 'велосипед' : car.power + ' л.с. • ' + car.accel + ' до 100') + '</div>' +
                '<div class="property-status-badge" style="color:' + (isSelected ? '#16a34a' : '#2563eb') + ';background:' + (isSelected ? '#dcfce7' : '#dbeafe') + ';">' + (isSelected ? 'Выбрана для поездок' : 'В гараже') + '</div></div></div>' +
                '<div class="property-car-actions">' + (isBike ? '' : '<button type="button" class="biz-btn biz-btn-primary pick"' + (isSelected ? ' disabled' : '') + '>' + (isSelected ? 'Выбрана' : 'Выбрать') + '</button>') +
                '<button type="button" class="biz-btn biz-btn-danger sell">' + (carSellConfirm === car.id ? 'Подтвердить: ' + bizMoney(sellValue) : 'Продать за ' + bizMoney(sellValue) + ' (70%)') + '</button></div>';
            if (!isBike) {
                const fuelRow = document.createElement('div');
                fuelRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;font-size:.78rem;font-weight:700;';
                const tank = carTank(car);
                const fuelNow = getFuel(car);
                fuelRow.innerHTML = '<span>⛽ ' + fuelNow.toFixed(1) + ' / ' + tank + ' л</span><div style="flex:1;height:8px;border-radius:6px;background:#e2e8f0;overflow:hidden"><div style="height:100%;width:' + (fuelNow / tank * 100).toFixed(0) + '%;background:' + (fuelNow / tank < 0.2 ? '#ef4444' : '#22c55e') + '"></div></div><button type="button" class="biz-btn biz-btn-primary refuel">Заправить</button>';
                fuelRow.querySelector('.refuel').addEventListener('click', function () { refuelCar(car); });
                card.insertBefore(fuelRow, card.querySelector('.property-car-actions'));
            }
            const pickButton = card.querySelector('.pick');
            if (pickButton) pickButton.addEventListener('click', function () { selectCar(car); });
            card.querySelector('.sell').addEventListener('click', function () { sellOwnedVehicle(car); });
            wrapper.appendChild(card);
        });
        appScrollableBody.appendChild(wrapper);
    }

    /* =========================================================
       ПОЕЗДКА НА МАШИНЕ: газ, тормоз, скорость и камеры
       ========================================================= */
    const DRIVE_SPEED_LIMIT = 80;
    const DRIVE_FINE_PER_KMH = 500;
    const DRIVE_PROGRESS_PER_KMH_SEC = 0.11;

    const driveScreen = document.getElementById('drive-screen');
    const driveCarName = document.getElementById('drive-car-name');
    const driveSpeedValue = document.getElementById('drive-speed-value');
    const driveSpeedBox = document.getElementById('drive-speed-box');
    const driveProgressBar = document.getElementById('drive-progress');
    const driveCamerasBox = document.getElementById('drive-cameras');
    const drivePercentText = document.getElementById('drive-percent-text');
    const driveAlert = document.getElementById('drive-alert');
    const pedalGas = document.getElementById('pedal-gas');
    const pedalBrake = document.getElementById('pedal-brake');
    const btnDriveCancel = document.getElementById('btn-drive-cancel');
    let driveState = null;

    function driveCarStats(car) {
        const accelSeconds = parseFloat(String(car.accel).replace(',', '.')) || 12;
        const maxSpeed = parseInt(String(car.maxSpeed), 10) || 150;
        const horsePower = Number(car.power) || 80;
        return {
            accelRate: 100 / Math.max(2, accelSeconds),
            maxSpeed: maxSpeed,
            brakeRate: Math.min(85, 16 + horsePower * 0.12)
        };
    }

    function driveRandomCameras() {
        const positions = [];
        let guard = 0;
        while (positions.length < 3 && guard < 200) {
            guard += 1;
            const candidate = 8 + Math.floor(Math.random() * 85);
            if (positions.every(function (value) { return Math.abs(value - candidate) >= 9; })) positions.push(candidate);
        }
        positions.sort(function (a, b) { return a - b; });
        return positions.map(function (position) { return { pos: position, maxSpeed: 0, done: false }; });
    }

    function startDriveGame() {
        const car = getSelectedCar();
        if (!car) {
            showToast('У вас нет автомобиля');
            return;
        }
        if (driveState) return;
        if (getFuel(car) <= 0.05) {
            showToast('⛽ В баке нет бензина. Заправьте машину в приложении «Имущество»');
            return;
        }
        travelChoiceModal.classList.add('hidden');
        let fuelBox = document.getElementById('drive-fuel-box');
        if (!fuelBox) {
            fuelBox = document.createElement('div');
            fuelBox.id = 'drive-fuel-box';
            fuelBox.style.cssText = 'position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:20;width:min(86%,360px);color:#fff;font:800 .8rem sans-serif;text-align:center;text-shadow:0 1px 3px #000;pointer-events:none;';
            fuelBox.innerHTML = '<div id="drive-fuel-text">⛽</div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.28);overflow:hidden;margin-top:4px"><div id="drive-fuel-bar" style="height:100%;width:100%;background:#22c55e"></div></div>';
            driveScreen.appendChild(fuelBox);
        }
        const stats = driveCarStats(car);
        driveState = {
            car: car,
            stats: stats,
            target: targetLocationSelected,
            speed: 0,
            progress: 0,
            gas: false,
            brake: false,
            cameras: driveRandomCameras(),
            lastTime: 0,
            raf: 0,
            finished: false
        };
        if (driveCarName) driveCarName.textContent = car.title;
        if (driveCamerasBox) {
            driveCamerasBox.innerHTML = driveState.cameras.map(function (camera) {
                return '<div class="drive-camera" style="left:' + camera.pos + '%"><span>📷</span><i></i></div>';
            }).join('');
        }
        if (driveAlert) { driveAlert.textContent = ''; driveAlert.className = 'drive-alert'; }
        driveRender();
        driveScreen.classList.remove('hidden');
        driveState.raf = requestAnimationFrame(driveFrame);
    }

    function driveRender() {
        if (!driveState) return;
        const speed = Math.round(driveState.speed);
        if (driveSpeedValue) driveSpeedValue.textContent = speed;
        if (driveSpeedBox) driveSpeedBox.classList.toggle('over', speed > DRIVE_SPEED_LIMIT);
        if (driveProgressBar) driveProgressBar.style.width = Math.min(100, driveState.progress) + '%';
        if (drivePercentText) drivePercentText.textContent = Math.min(100, Math.floor(driveState.progress)) + '%';
        if (pedalGas) pedalGas.classList.toggle('pressed', driveState.gas);
        if (pedalBrake) pedalBrake.classList.toggle('pressed', driveState.brake);
    }

    function driveCameraSample(percent) {
        driveState.cameras.forEach(function (camera) {
            if (!camera.done && camera.pos === percent) camera.maxSpeed = Math.max(camera.maxSpeed, driveState.speed);
        });
    }

    function driveCheckCameras(previousProgress) {
        const state = driveState;
        const previousPercent = Math.floor(previousProgress);
        const currentPercent = Math.floor(state.progress);
        for (let percent = previousPercent + 1; percent <= currentPercent; percent += 1) driveCameraSample(percent);
        driveCameraSample(currentPercent);
        state.cameras.forEach(function (camera) {
            if (camera.done || currentPercent <= camera.pos) return;
            camera.done = true;
            const speed = Math.floor(camera.maxSpeed);
            const excess = speed - DRIVE_SPEED_LIMIT;
            const cameraElement = driveCamerasBox ? driveCamerasBox.children[state.cameras.indexOf(camera)] : null;
            if (excess > 0) {
                const fine = excess * DRIVE_FINE_PER_KMH;
                createFine(fine, 'Превышение скорости: камера на ' + camera.pos + '% (' + speed + ' км/ч, лимит ' + DRIVE_SPEED_LIMIT + ')');
                if (driveAlert) {
                    driveAlert.textContent = '📸 Камера на ' + camera.pos + '%: ' + speed + ' км/ч. Штраф ' + fine.toLocaleString('ru-RU') + ' ₽';
                    driveAlert.className = 'drive-alert bad';
                }
                if (cameraElement) cameraElement.classList.add('caught');
                playClick();
            } else {
                if (driveAlert) {
                    driveAlert.textContent = '📷 Камера на ' + camera.pos + '%: скорость в норме';
                    driveAlert.className = 'drive-alert ok';
                }
                if (cameraElement) cameraElement.classList.add('passed');
            }
        });
    }

    function driveFrame(time) {
        const state = driveState;
        if (!state || state.finished) return;
        if (!state.lastTime) state.lastTime = time;
        const dt = Math.min(0.05, (time - state.lastTime) / 1000);
        state.lastTime = time;

        const stats = state.stats;
        if (state.gas && !state.brake) {
            let rate = stats.accelRate;
            if (state.speed > stats.maxSpeed * 0.9) rate *= Math.max(0.15, (stats.maxSpeed - state.speed) / (stats.maxSpeed * 0.1));
            state.speed += rate * dt;
        } else if (state.brake) {
            state.speed -= (stats.brakeRate + 3) * dt;
        } else {
            state.speed -= (3 + state.speed * 0.025) * dt;
        }
        state.speed = Math.max(0, Math.min(stats.maxSpeed, state.speed));

        const previousProgress = state.progress;
        const rawStep = state.speed * DRIVE_PROGRESS_PER_KMH_SEC * dt;
        const progressStep = rawStep / (targetLocationSelected === 'airport' ? 2 : 1);
        const tankSize = carTank(state.car);
        const fuelUsed = rawStep / 100 * tankSize * FUEL_PER_TRIP_SHARE * (0.7 + 0.9 * (state.speed / (stats.maxSpeed || 150)));
        carFuel[state.car.id] = Math.max(0, getFuel(state.car) - fuelUsed);
        updateFuelHud(state.car, tankSize);
        if (getFuel(state.car) <= 0.01) {
            state.speed = 0;
            state.gas = false;
            if (driveAlert) { driveAlert.textContent = '⛽ Бензин закончился! Нажмите «Отмена» и заправьтесь'; driveAlert.className = 'drive-alert'; }
            saveGameData();
            state.raf = requestAnimationFrame(driveFrame);
            return;
        }
        state.progress += progressStep;
        driveCheckCameras(previousProgress);
        driveRender();

        if (state.progress >= 100) {
            driveFinish();
            return;
        }
        state.raf = requestAnimationFrame(driveFrame);
    }

    function driveClose() {
        if (!driveState) return;
        driveState.finished = true;
        if (driveState.raf) cancelAnimationFrame(driveState.raf);
        const target = driveState.target;
        driveState = null;
        driveScreen.classList.add('hidden');
        return target;
    }

    function driveFinish() {
        const target = driveClose();
        apartmentScreen.classList.add('hidden');
        firestationScreen.classList.add('hidden');
        truckstationScreen.classList.add('hidden');
        marketScreen.classList.add('hidden');
        xjHideScreens(); hideAirportScreen();
        lastExitedLocation = target;
        currentScreen = 'city';
        saveGameData();
        updateStatsHUD();
        showToast('Вы приехали на автомобиле. Нажмите на метку, чтобы войти');
    }

    function driveCancel() {
        if (!driveState) return;
        driveClose();
        showToast('Поездка отменена');
    }

    function driveSetPedal(kind, pressed) {
        if (!driveState) return;
        if (kind === 'gas') driveState.gas = pressed;
        if (kind === 'brake') driveState.brake = pressed;
    }

    function bindPedal(element, kind) {
        if (!element) return;
        element.addEventListener('pointerdown', function (event) {
            event.preventDefault();
            if (element.setPointerCapture) { try { element.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ } }
            driveSetPedal(kind, true);
        });
        ['pointerup', 'pointercancel', 'pointerleave', 'lostpointercapture'].forEach(function (name) {
            element.addEventListener(name, function () { driveSetPedal(kind, false); });
        });
        element.addEventListener('contextmenu', function (event) { event.preventDefault(); });
    }

    bindPedal(pedalGas, 'gas');
    bindPedal(pedalBrake, 'brake');
    if (btnDriveCancel) btnDriveCancel.addEventListener('click', driveCancel);

    document.addEventListener('keydown', function (event) {
        if (!driveState) return;
        if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') { driveSetPedal('gas', true); event.preventDefault(); }
        if (event.code === 'ArrowDown' || event.code === 'KeyS' || event.code === 'KeyB') { driveSetPedal('brake', true); event.preventDefault(); }
    });
    document.addEventListener('keyup', function (event) {
        if (!driveState) return;
        if (event.code === 'ArrowUp' || event.code === 'Space' || event.code === 'KeyW') driveSetPedal('gas', false);
        if (event.code === 'ArrowDown' || event.code === 'KeyS' || event.code === 'KeyB') driveSetPedal('brake', false);
    });

    /* ---------- Сонливость: экран мигает чёрным, если сон на нуле ---------- */
    const sleepyOverlay = document.getElementById('sleepy-overlay');
    let sleepyTicks = 0;
    setInterval(function () {
        if (!sleepyOverlay) return;
        if (!isClockRunning || isSleeping || playerSleep > 0) {
            sleepyTicks = 0;
            sleepyOverlay.classList.remove('on');
            return;
        }
        sleepyTicks += 1;
        if (sleepyTicks >= 7) {
            sleepyTicks = 0;
            sleepyOverlay.classList.add('on');
            setTimeout(function () { sleepyOverlay.classList.remove('on'); }, 1000);
        }
    }, 1000);


    /* Защита от случайного двойного нажатия: сразу после открытия теста ответы не нажимаются */
    const quizGuardObserver = new MutationObserver(function (mutations) {
        const now = performance.now();
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('pdd-answer-btn')) node.dataset.born = String(now);
                    if (node.querySelectorAll) node.querySelectorAll('.pdd-answer-btn').forEach(function (button) { button.dataset.born = String(now); });
                });
            } else if (mutation.type === 'attributes') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('modal-overlay') && !target.classList.contains('hidden') && String(mutation.oldValue || '').indexOf('hidden') !== -1) {
                    target.dataset.openedAt = String(now);
                }
            }
        });
    });
    quizGuardObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    document.addEventListener('click', function (event) {
        const button = event.target.closest ? event.target.closest('.pdd-answer-btn') : null;
        if (!button) return;
        const now = performance.now();
        const born = Number(button.dataset.born || 0);
        const modal = button.closest('.modal-overlay');
        const openedAt = modal ? Number(modal.dataset.openedAt || 0) : 0;
        if ((born && now - born < 800) || (openedAt && now - openedAt < 800)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);

    /* ---------- Повторная загрузка картинок, если они не загрузились сразу ---------- */
    document.addEventListener('error', function (event) {
        const target = event.target;
        if (!target || target.tagName !== 'IMG') return;
        const src = target.getAttribute('src') || '';
        if (/suspects\/|business\/|companies\/|pedals\/|customers\/|police_|hospital|taxi_|doctor_|bike_/.test(src)) return;
        const attempt = Number(target.dataset.retryCount || 0);
        if (attempt >= 3) return;
        target.dataset.retryCount = String(attempt + 1);
        setTimeout(function () { target.setAttribute('src', src); }, 600 * (attempt + 1));
    }, true);
    document.addEventListener('load', function (event) {
        const target = event.target;
        if (target && target.tagName === 'IMG' && target.dataset.retryCount) {
            target.style.visibility = '';
            if (target.style.display === 'none' && target.nextElementSibling && target.nextElementSibling.style.display !== 'none') {
                target.style.display = '';
                target.nextElementSibling.style.display = 'none';
            }
        }
    }, true);

    /* =========================================================
       ИНИЦИАЛИЗАЦИЯ
       ========================================================= */

    applyAudioVolumes();
    updateClockUI();
    updateStatsHUD();
    updatePhoneBadge();

    /* =========================================================
       ИНТРО, ВЫБОР ПОЛА, ДАТА РОЖДЕНИЯ И ЗАГРУЗКА ДАННЫХ
       ========================================================= */
    const ASSET_FLAG_KEY = 'bestlife_assets_ready_v5';
    const loadingScreen = document.getElementById('loading-screen');
    const loadingFill = document.getElementById('loading-bar-fill');
    const loadingPercent = document.getElementById('loading-percent');
    const birthdayModal = document.getElementById('birthday-modal');
    const preloadedImages = [];
    const preloadStatus = { done: 0, total: 0 };
    let preloadPromise = null;
    let loadingStarted = false;

    const OPTIONAL_IMAGE_PATTERN = /music\/|suspects\/|business\/|companies\/|pedals\/|customers\/|police_|hospital|taxi_|doctor_|bike_/;
    let backgroundStarted = false;

    /* Загрузка картинок в три этапа:
       1) до входа в игру только самое нужное (карта, значки телефона), оно качается уже во время интро;
       2) сразу после входа то, что нужно в первые минуты (телефон, квартира, список машин, еда);
       3) всё остальное тихо докачивается в фоне, пока игрок осваивается, самые лёгкие и нужные файлы первыми. */
    function buildEssentialList() {
        const list = ['city_map.png', 'men.png', 'phone_btn.png', 'settings_btn.png'];
        ['taxi', 'work', 'shtraf', 'plat', 'business', 'karta', 'avto', 'casino', 'sms', 'eda', 'poisk', 'zakaz', 'kollectiv', 'imushka', 'compania', 'music'].forEach(function (name) { list.push('logo/' + name + '.png'); });
        return list;
    }

    function buildSecondList() {
        const list = ['phone.png', 'house.png', 'bed.png'];
        CARS.forEach(function (car) { list.push('cars/' + car.imgPrefix + '_1.png'); });
        FOOD_ITEMS.forEach(function (item) { list.push(item.image); });
        return list;
    }

    function buildBackgroundList() {
        const list = [];
        COMPANIES.forEach(function (item) { list.push('companies/' + item.id + '.webp'); });
        BUSINESSES.forEach(function (item) { list.push('business/' + item.id + '.png'); });
        MUSIC_TRACKS.forEach(function (track) { if (track.image) list.push(track.image); });
        CARS.forEach(function (car) { for (let n = 2; n <= 3; n += 1) list.push('cars/' + car.imgPrefix + '_' + n + '.png'); });
        list.push('pedals/gas.png', 'pedals/brake.png', 'pdd_brick.png', 'pdd_main_road.png');
        list.push('fire_station.png', 'firefighter_npc.png', 'truck_station.png', 'trucker_npc.png',
            'market_room.png', 'cashier_manager.png', 'burning_house.png');
        CASHIER_DENOMINATIONS.forEach(function (item) { list.push(item.image); });
        for (let n = 1; n <= 10; n += 1) list.push('customers/customer_' + n + '.png');
        list.push('police_station.png', 'police_npc.png', 'hospital.png', 'doctor_npc.png', 'taxi_park.png', 'taxi_npc.png');
        for (let n = 1; n <= XJ_SUSPECT_COUNT; n += 1) list.push('suspects/suspect_' + n + '.png');
        return Array.from(new Set(list));
    }

    function updateLoadingUI() {
        const percent = preloadStatus.total ? Math.round((preloadStatus.done / preloadStatus.total) * 100) : 0;
        if (loadingFill) loadingFill.style.width = percent + '%';
        if (loadingPercent) loadingPercent.textContent = percent + '%';
    }

    function loadImageWithRetry(url, attempt, keep, lowPriority) {
        return new Promise(function (resolve) {
            const image = new Image();
            if (lowPriority && 'fetchPriority' in image) image.fetchPriority = 'low';
            if (keep) preloadedImages.push(image);
            image.onload = function () { image.onload = null; resolve(true); };
            image.onerror = function () {
                if (!OPTIONAL_IMAGE_PATTERN.test(url) && attempt < 2) {
                    setTimeout(function () { loadImageWithRetry(url, attempt + 1, keep, lowPriority).then(resolve); }, 400 * (attempt + 1));
                } else {
                    resolve(false);
                }
            };
            image.src = url;
        });
    }

    function runImageQueue(urls, concurrency, keep, onEach, lowPriority) {
        return new Promise(function (resolve) {
            if (!urls.length) { resolve(); return; }
            let index = 0;
            let active = 0;
            let finished = 0;
            function pump() {
                while (active < concurrency && index < urls.length) {
                    const url = urls[index];
                    index += 1;
                    active += 1;
                    loadImageWithRetry(url, 0, keep, lowPriority).then(function () {
                        active -= 1;
                        finished += 1;
                        if (onEach) onEach();
                        if (finished >= urls.length) resolve();
                        else pump();
                    });
                }
            }
            pump();
        });
    }

    function startPreload() {
        if (preloadPromise) return preloadPromise;
        const urls = buildEssentialList();
        preloadStatus.total = urls.length;
        preloadPromise = runImageQueue(urls, 8, true, function () {
            preloadStatus.done += 1;
            updateLoadingUI();
        }).then(function () {
            try { localStorage.setItem(ASSET_FLAG_KEY, '1'); } catch (error) { /* ignore */ }
        });
        return preloadPromise;
    }

    function startBackgroundPreload() {
        if (backgroundStarted) return;
        backgroundStarted = true;
        /* Этап 2: нужное в первые минуты, сразу и быстро */
        runImageQueue(buildSecondList(), 6, false, null, false).then(function () {
            /* Этап 3: остальное в фоне. В режиме экономии трафика не качаем заранее */
            const connection = navigator.connection || {};
            if (connection.saveData) return;
            const startRest = function () { runImageQueue(buildBackgroundList(), 4, false, null, true); };
            if ('requestIdleCallback' in window) requestIdleCallback(startRest, { timeout: 1500 });
            else setTimeout(startRest, 300);
        });
    }

    function waitForMapImage(maxMs) {
        return new Promise(function (resolve) {
            const startedAt = Date.now();
            (function check() {
                if (isMapLoaded || Date.now() - startedAt > maxMs) resolve();
                else setTimeout(check, 150);
            })();
        });
    }

    function startLoadingThenLaunch() {
        if (loadingStarted) return;
        loadingStarted = true;
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        updateLoadingUI();
        const returning = localStorage.getItem(ASSET_FLAG_KEY) === '1';
        Promise.race([
            startPreload(),
            new Promise(function (resolve) { setTimeout(resolve, returning ? 3000 : 60000); })
        ]).then(function () {
            return waitForMapImage(returning ? 3000 : 45000);
        }).then(function () {
            preloadStatus.done = preloadStatus.total;
            updateLoadingUI();
            setTimeout(function () {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                launchGame();
                setTimeout(startBackgroundPreload, 300);
            }, 200);
        });
    }

    /* Самое важное начинает грузиться уже во время интро */
    startPreload();

    /* Выбор даты рождения */
    const BD_MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const BD_MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    let bdMonth = null;
    let bdDay = null;

    function renderBirthdayPicker() {
        const monthsBox = document.getElementById('bd-months');
        const daysBox = document.getElementById('bd-days');
        const summary = document.getElementById('bd-summary');
        const confirmButton = document.getElementById('btn-bd-confirm');
        if (!monthsBox || !daysBox) return;
        monthsBox.innerHTML = '';
        BD_MONTHS.forEach(function (name, index) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'bd-btn' + (bdMonth === index ? ' selected' : '');
            button.textContent = name;
            button.addEventListener('click', function () {
                bdMonth = index;
                if (bdDay && bdDay > DAYS_IN_MONTHS[index]) bdDay = null;
                renderBirthdayPicker();
            });
            monthsBox.appendChild(button);
        });
        daysBox.innerHTML = '';
        if (bdMonth !== null) {
            for (let day = 1; day <= DAYS_IN_MONTHS[bdMonth]; day += 1) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'bd-btn' + (bdDay === day ? ' selected' : '');
                button.textContent = day;
                button.addEventListener('click', function () {
                    bdDay = day;
                    renderBirthdayPicker();
                });
                daysBox.appendChild(button);
            }
        }
        if (bdMonth !== null && bdDay !== null) {
            summary.textContent = '🎂 Ваш день рождения: ' + bdDay + ' ' + BD_MONTHS_GENITIVE[bdMonth];
            confirmButton.disabled = false;
        } else {
            summary.textContent = bdMonth === null ? 'Сначала выберите месяц' : 'Теперь выберите день';
            confirmButton.disabled = true;
        }
    }

    function openBirthdayModal() {
        bdMonth = null;
        bdDay = null;
        renderBirthdayPicker();
        if (birthdayModal) birthdayModal.classList.remove('hidden');
    }

    function proceedAfterPlay() {
        if (!localStorage.getItem('bestlife_gender')) {
            genderModal.classList.remove('hidden');
            return;
        }
        if (!getPlayerBirthday()) {
            openBirthdayModal();
            return;
        }
        startLoadingThenLaunch();
    }

    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) btnPlay.addEventListener('click', function () {
        startMusic();
        startPreload();
        proceedAfterPlay();
    });
    const genderBoy = document.getElementById('gender-boy');
    if (genderBoy) genderBoy.addEventListener('click', function () { localStorage.setItem('bestlife_gender', 'boy'); genderModal.classList.add('hidden'); proceedAfterPlay(); });
    const genderGirl = document.getElementById('gender-girl');
    if (genderGirl) genderGirl.addEventListener('click', function () { localStorage.setItem('bestlife_gender', 'girl'); genderModal.classList.add('hidden'); proceedAfterPlay(); });
    const btnBdConfirm = document.getElementById('btn-bd-confirm');
    if (btnBdConfirm) btnBdConfirm.addEventListener('click', function () {
        if (bdMonth === null || bdDay === null) return;
        localStorage.setItem(BIRTHDAY_STORAGE_KEY, JSON.stringify({ day: bdDay, month: bdMonth }));
        birthdayModal.classList.add('hidden');
        proceedAfterPlay();
    });

    /* Интро: надпись BestLife пульсирует 3 раза, затем открывается меню */
    setTimeout(function () {
        if (introScreen) introScreen.classList.add('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
    }, 3200);


    /* =========================================================
       ПРИЛОЖЕНИЕ «ПОИСК»: частые вопросы и ответы
       Нажмите на вопрос, и ниже раскроется ответ. Строка поиска фильтрует вопросы, а кнопки сверху выбирают тему.
       ========================================================= */
    const FAQ_ITEMS = [
        /* ---------- Начало игры ---------- */
        ['Начало игры', 'С чего начать игру?', 'В начале вы дома, на счёте 1 000 ₽. Откройте телефон (кнопка справа вверху), зайдите в «Работа.ру» и выберите профессию. Не забывайте про еду и сон: следите за кружками слева вверху.'],
        ['Начало игры', 'Сколько денег у меня в начале?', '1 000 ₽. Дальше деньги приносят работа, бизнес, компании и выплаты от государства по праздникам.'],
        ['Начало игры', 'Когда начинается игра по календарю?', 'Игра стартует 1 мая в 06:00. Дата и время всегда показаны вверху экрана.'],
        ['Начало игры', 'Как двигать карту и приближать её?', 'Перетаскивайте карту пальцем. Чтобы приблизить или отдалить, разведите или сведите два пальца. Метки на карте нажимаются одним касанием.'],
        ['Начало игры', 'Что значит надпись «Вы здесь»?', 'Она показывает, где сейчас находится ваш персонаж: у дома или у последнего места, откуда вы вышли.'],
        ['Начало игры', 'Сохраняется ли прогресс?', 'Да, игра сохраняется автоматически на вашем устройстве. Если очистить данные сайта или приложения, прогресс пропадёт.'],
        ['Начало игры', 'Зачем при входе просят выбрать пол и дату рождения?', 'От пола зависят праздничные выплаты (23 февраля для парней, 8 марта для девушек), а в день рождения государство дарит подарок.'],
        ['Начало игры', 'Почему при первом запуске игра грузится дольше?', 'Сначала скачиваются самые важные картинки (карта и значки телефона), остальные подгружаются в фоне, пока вы осваиваетесь. Потом они запоминаются на устройстве, и игра открывается быстрее.'],
        ['Начало игры', 'Почему некоторые картинки появляются не сразу?', 'Они ещё докачиваются в фоне. Подождите немного или откройте раздел ещё раз: игра сама пробует загрузить картинку повторно.'],

        /* ---------- Потребности ---------- */
        ['Потребности', 'Какие потребности есть у персонажа?', 'Голод, энергия и сон. Они показаны тремя кружками в левом верхнем углу с процентами.'],
        ['Потребности', 'Как быстро падает голод?', 'С 100% до нуля примерно за 5 игровых часов.'],
        ['Потребности', 'Как быстро падает энергия?', 'Примерно за 6 игровых часов. Пока вы работаете, энергия тратится быстрее на 11%.'],
        ['Потребности', 'Как быстро падает сон?', 'Примерно за 15 игровых часов.'],
        ['Потребности', 'Как восстановить голод?', 'Закажите еду в приложении «Еда». Когда доставка придёт, голод восстановится.'],
        ['Потребности', 'Как восстановить сон и энергию?', 'Ложитесь спать: зайдите домой, нажмите на кровать и выберите «Спать». Во время сна растут и сон, и энергия.'],
        ['Потребности', 'Сколько длится сон?', 'Сон восстанавливается примерно за 8,5 игровых часа, энергия за 7,5. Время во сне идёт в 7 раз быстрее, а проснётесь вы автоматически, когда сон дойдёт до 100%.'],
        ['Потребности', 'Можно ли лечь спать, если сон уже 100%?', 'Нет, игра сообщит, что сон уже полностью восстановлен.'],
        ['Потребности', 'Что будет, если сон упадёт до нуля?', 'Экран начнёт периодически на секунду темнеть, а работать станет нельзя, пока вы не поспите.'],
        ['Потребности', 'Можно ли работать с нулевой энергией?', 'Нет. Брать задания и работать можно только когда сон и энергия не равны нулю.'],
        ['Потребности', 'Падает ли голод во время сна?', 'Да, но примерно в 5 раз медленнее, чем днём.'],
        ['Потребности', 'Можно ли пользоваться телефоном во время сна?', 'Нет. Сначала проснитесь, нажав кнопку пробуждения.'],

        /* ---------- Время ---------- */
        ['Время', 'Как идёт время в игре?', 'Одна реальная секунда равна 2,4 игровой минуты. Игровой час длится 25 секунд, а игровые сутки около 10 минут реального времени.'],
        ['Время', 'Что ускоряет время?', 'Сон: пока персонаж спит, время идёт в 7 раз быстрее.'],
        ['Время', 'Идёт ли игровое время, когда игра закрыта?', 'Нет, время и потребности стоят. Зато приносят деньги компании: их доход копится, даже когда вы не в игре.'],
        ['Время', 'Где посмотреть время и дату?', 'В верхней части экрана рядом с вашим балансом и на экране телефона.'],

        /* ---------- Телефон ---------- */
        ['Телефон', 'Как открыть телефон?', 'Нажмите кнопку с телефоном в правом верхнем углу карты. Закрывается он красной кнопкой с крестиком.'],
        ['Телефон', 'Какие приложения есть в телефоне?', 'Такси, Работа.ру, Штрафы, Оплата, Бизнес, Счёт, Авто.ру, Лотерея, СМС, Еда, Поиск, Заказ, Коллектив, Имущество и Компания.'],
        ['Телефон', 'Для чего нужно приложение «Такси»?', 'С его помощью можно вызвать такси в любую точку на карте.'],
        ['Телефон', 'Для чего нужно приложение «Работа.ру»?', 'Там список профессий. Выберите работу и подайте заявку, чтобы устроиться.'],
        ['Телефон', 'Для чего нужно приложение «Счёт»?', 'Это ваш банк: там баланс и история всех поступлений и списаний.'],
        ['Телефон', 'Для чего нужно приложение «СМС»?', 'Сюда приходят сообщения от работодателей, магазина, государства и других. Красный значок показывает непрочитанные.'],
        ['Телефон', 'Для чего нужно приложение «Коллектив»?', 'Там отображается информация о ваших работах и выполненных заказах. Если вы нигде не работаете, приложение подскажет, как устроиться.'],
        ['Телефон', 'Для чего нужно приложение «Имущество»?', 'Показывает вашу недвижимость, машины, велосипед и бизнесы. Там же выбирают машину для поездок и продают транспорт.'],
        ['Телефон', 'Для чего нужно приложение «Заказ»?', 'Для закупки товара в ваши бизнесы. Без товара на складе бизнес не работает.'],
        ['Телефон', 'Что делать, если телефон тормозит?', 'Закройте лишние вкладки и приложения на устройстве и обновите страницу. Игра уже не рисует карту под открытым телефоном, поэтому он должен открываться плавно.'],

        /* ---------- Деньги, налоги и штрафы ---------- */
        ['Деньги и налоги', 'Где посмотреть баланс?', 'Вверху экрана под датой и в приложении «Счёт».'],
        ['Деньги и налоги', 'Где посмотреть историю операций?', 'В приложении «Счёт»: там все поступления и списания.'],
        ['Деньги и налоги', 'Какие налоги есть в игре?', '3% с зарплаты, 5% при покупке автомобиля и 1,5% с выигрыша в лотерею.'],
        ['Деньги и налоги', 'Где платить налоги?', 'В приложении «Оплата».'],
        ['Деньги и налоги', 'Сколько времени есть на оплату налога?', '7 игровых дней. За день до срока придёт напоминание в «СМС».'],
        ['Деньги и налоги', 'Что будет, если не платить налог?', 'Через неделю налог спишется с баланса автоматически, и вдобавок придёт штраф за неуплату в размере двух налогов.'],
        ['Деньги и налоги', 'За что бывают штрафы?', 'За превышение скорости на камерах во время поездки на машине, за нарушения на работе и за неуплату налога.'],
        ['Деньги и налоги', 'Где платить штрафы?', 'В приложении «Штрафы». Там есть вкладки с неоплаченными и оплаченными штрафами.'],
        ['Деньги и налоги', 'Сколько времени есть на оплату штрафа?', '3 игровых дня. Если не успеть, штраф списывается автоматически, и сумма утраивается.'],
        ['Деньги и налоги', 'Может ли баланс уйти в минус?', 'Да. Автосписание налогов и штрафов может увести баланс в минус, тогда сумма станет красной.'],

        /* ---------- Работа ---------- */
        ['Работа', 'Как устроиться на работу?', 'Откройте «Работа.ру», выберите профессию и подайте заявку. На карте появится метка места работы. Приезжайте туда на собеседование в назначенное время, о нём напишут в «СМС».'],
        ['Работа', 'Сколько работ можно совмещать?', 'Максимум две одновременно.'],
        ['Работа', 'В какое время работают профессии?', 'Пожарный 07:00–19:00, дальнобойщик 06:00–22:00, кассир 09:00–21:00, полицейский 08:00–17:00, доктор 08:00–20:00, таксист круглосуточно.'],
        ['Работа', 'Сколько платят на разных работах?', 'В «Работа.ру» указана примерная зарплата: пожарный 65 000 ₽, дальнобойщик 90 000 ₽, кассир 11 500 ₽ за смену, полицейский 70 000 ₽, доктор 75 000 ₽, таксист 52 000 ₽. Точный доход зависит от заказов.'],
        ['Работа', 'Облагается ли зарплата налогом?', 'Да, с каждой зарплаты начисляется налог 3%. Его нужно оплатить в приложении «Оплата».'],
        ['Работа', 'Как начать рабочий день?', 'Поезжайте на метку своей работы и поговорите с сотрудником (начальником). Он даст заказы или откроет смену.'],
        ['Работа', 'Почему мне нельзя брать задания?', 'Скорее всего, сейчас не рабочее время вашей профессии или у вас нулевой сон или энергия. Поспите или дождитесь начала рабочего времени.'],
        ['Работа', 'Зачем при устройстве задают вопросы?', 'Для некоторых профессий нужно пройти короткий тест. Сразу после открытия вопросов ответы 0,8 секунды не нажимаются, чтобы вы случайно не ответили двойным тапом.'],

        /* ---------- Профессии ---------- */
        ['Профессии', 'Как работает пожарный?', 'Вы берёте заказ МЧС (лёгкий, средний или сложный), едете на вызов и тушите очаги огня. Чем сложнее заказ, тем больше очагов и выше награда.'],
        ['Профессии', 'Можно ли отменить заказ пожарного?', 'Да, на экране выезда и тушения есть кнопка отмены.'],
        ['Профессии', 'Как работает дальнобойщик?', 'У начальника автобазы вы выбираете один из двух рейсов. Зарплата равна расстоянию, умноженному на ставку за километр. В пути нажимайте на экран, чтобы ехать вперёд.'],
        ['Профессии', 'Как работает кассир?', 'Вы обслуживаете покупателей: видите сумму чека и сколько заплатил клиент, собираете сдачу купюрами и монетами и нажимаете «Выдать сдачу».'],
        ['Профессии', 'Как убрать лишнюю купюру из сдачи?', 'Нажмите на карточку этой купюры в выданной сдаче, и одна купюра вернётся обратно. Одинаковые купюры собраны в одну карточку со счётчиком, например «10 ₽ ×8».'],
        ['Профессии', 'Когда у кассира перерыв?', 'С 13:00 до 14:30. Смена идёт с 09:00 до 21:00.'],
        ['Профессии', 'Сколько получает кассир за смену?', '11 500 ₽. Зарплата делится на 3 при позднем начале смены, на 3,3 при раннем уходе и на 2, если обслужено меньше 15 клиентов.'],
        ['Профессии', 'Как закончить смену кассира?', 'Нажмите кнопку «Закончить смену» внизу экрана кассы. Все нижние кнопки всегда видны.'],
        ['Профессии', 'Чем занимается полицейский?', 'Выезжает на вызовы: ищет преступника среди подозреваемых, участвует в погоне и проверяет скорость машин на дорожном патруле.'],
        ['Профессии', 'Чем занимается доктор?', 'Проводит рентген, реанимацию и операции. Это короткие мини-игры на внимательность и реакцию.'],
        ['Профессии', 'Чем занимается таксист?', 'Возит пассажиров по городу и получает оплату за каждую поездку. Работать можно круглосуточно.'],

        /* ---------- Транспорт ---------- */
        ['Транспорт', 'Как добраться до места на карте?', 'Нажмите на метку и выберите способ: пешком, личный транспорт или такси. Новое окно несколько мгновений не реагирует на нажатия, чтобы вы случайно не выбрали лишнего.'],
        ['Транспорт', 'Как долго идти пешком?', 'Нужно сделать 222 нажатия по экрану, это примерно 49 игровых минут.'],
        ['Транспорт', 'Сколько стоит такси?', 'От 450 до 700 ₽ в зависимости от маршрута. Поездка занимает 45 игровых минут.'],
        ['Транспорт', 'Как ехать на своей машине?', 'Удерживайте педаль газа, чтобы набирать скорость, и тормоз, чтобы замедляться. Скорость зависит от машины: у быстрых она растёт быстрее.'],
        ['Транспорт', 'Как управлять машиной на компьютере?', 'Стрелка вверх или пробел это газ, стрелка вниз это тормоз.'],
        ['Транспорт', 'Что за камеры на дороге?', 'Три камеры стоят в случайных местах шкалы. Если в момент проезда скорость выше 80 км/ч, штраф 500 ₽ за каждый лишний км/ч.'],
        ['Транспорт', 'Прибавляется ли время, когда я приезжаю на машине?', 'Нет, время идёт как обычно, а лишние минуты к часам не добавляются.'],
        ['Транспорт', 'Сколько нужно ехать на машине?', 'На недорогой машине примерно 30–40 игровых минут. Быстрые машины доезжают быстрее.'],
        ['Транспорт', 'Как выбрать машину для поездок?', 'В приложении «Имущество» выберите нужную из купленных машин.'],
        ['Транспорт', 'Можно ли продать машину или велосипед?', 'Да, в «Имуществе». Вы получите 70% от цены.'],
        ['Транспорт', 'Зачем нужен велосипед?', 'Он стоит 15 000 ₽ и быстрее пешей прогулки: до места нужно 167 нажатий вместо 222.'],

        /* ---------- Авто.ру ---------- */
        ['Авто.ру', 'Как купить машину?', 'В приложении «Авто.ру» нажмите «Купить» на карточке машины. Налог 5% от цены придёт отдельным платежом в «Оплате».'],
        ['Авто.ру', 'Как листать фотографии машины?', 'Открыв машину, листайте фото свайпом пальцем вправо или влево, либо нажимайте стрелки по бокам.'],
        ['Авто.ру', 'Сколько машин в игре?', '20 автомобилей и велосипед. Список идёт от дешёвого к дорогому.'],
        ['Авто.ру', 'Какая машина самая дорогая и самая дешёвая?', 'Самая дорогая Bugatti Chiron за 250 000 000 ₽. Самая дешёвая из автомобилей ВАЗ 2107 за 150 000 ₽, а дешевле всего велосипед за 15 000 ₽.'],
        ['Авто.ру', 'Можно ли купить одну и ту же машину дважды?', 'Нет, каждую машину можно купить только один раз.'],

        /* ---------- Еда ---------- */
        ['Еда', 'Как заказать еду?', 'В приложении «Еда» добавьте блюда в корзину, откройте корзину и оплатите. Заказ будет доставлен через некоторое время.'],
        ['Еда', 'Какая еда самая сытная?', 'Геркулес восстанавливает 67% голода и стоит всего 65 ₽. Это самое выгодное блюдо.'],
        ['Еда', 'Какая еда самая дорогая?', 'Гамбургер за 250 ₽, он восстанавливает 55% голода.'],
        ['Еда', 'Что лучше купить на последние деньги?', 'Геркулес (67% за 65 ₽), гречку (44% за 70 ₽) или хлеб (40% за 45 ₽).'],

        /* ---------- Лотерея ---------- */
        ['Лотерея', 'Как играть в лотерею?', 'Откройте «Лотерею», выберите уровень билета (от 100 ₽ до 100 000 000 ₽), купите билеты и посмотрите результат розыгрыша.'],
        ['Лотерея', 'Какой выигрыш в лотерее?', 'Зависит от числа совпадений: 1 совпадение ×1,15, 2 ×1,3, 3 ×2, 4 ×3,3, 5 ×5 от цены билета.'],
        ['Лотерея', 'Облагается ли выигрыш налогом?', 'Да, налог 1,5% с суммы выигрыша. Его нужно оплатить в «Оплате».'],
        ['Лотерея', 'Можно ли проиграть?', 'Да. Если совпадений нет, деньги за билет не возвращаются. Играйте на ту сумму, которую не жалко потерять.'],

        /* ---------- Бизнес ---------- */
        ['Бизнес', 'Какие бизнесы можно купить?', 'Ларёк (650 000 ₽), Маленький продуктовый магазин (1 250 000 ₽), Минимаркет (2 250 000 ₽), Супермаркет (7 000 000 ₽), Ресторан (15 000 000 ₽), Транспортная компания (125 000 000 ₽) и Автосалон (1 450 000 000 ₽).'],
        ['Бизнес', 'Что нужно, чтобы бизнес работал?', 'Три вещи: работник (его нужно оплатить на 1–2 дня вперёд), аренда на 1–4 дня и товар на складе.'],
        ['Бизнес', 'Куда идёт выручка?', 'Во вкладку «Прибыль» в приложении «Бизнес». На баланс деньги попадают только когда вы нажмёте кнопку вывода.'],
        ['Бизнес', 'Как купить товар для бизнеса?', 'В приложении «Заказ»: кнопки −10, −1, +1 и +10, а также «Заполнить склад». Внизу видны итоговая цена и вместимость склада.'],
        ['Бизнес', 'Что будет, когда товар закончится?', 'Придёт СМС, а бизнес остановится, пока вы не пополните склад.'],
        ['Бизнес', 'Можно ли купить несколько одинаковых бизнесов?', 'Нет, каждого вида можно иметь только один.'],
        ['Бизнес', 'Сколько можно получить при продаже бизнеса?', '65% от цены покупки. Например, ларёк за 650 000 ₽ продаётся за 422 500 ₽.'],
        ['Бизнес', 'Как меняется выручка бизнеса?', 'Число посетителей и средний чек каждый день немного отличаются (на 1–5%), так что доход не бывает одинаковым.'],

        /* ---------- Компании ---------- */
        ['Компании', 'Что такое приложение «Компания»?', 'В нём можно купить мировые компании: от «Вкусно — и точка» за 150 млн ₽ до Apple за 120 млрд ₽. Всего их 30.'],
        ['Компании', 'Когда компании приносят доход?', 'Всегда, в том числе когда вы не в игре. Прибыль копится до 30 дней, и при возвращении придёт СМС о том, сколько накопилось.'],
        ['Компании', 'Как забрать прибыль компаний?', 'Во вкладке «Прибыль» приложения «Компания» нажмите кнопку вывода. Пока вы не выведете деньги, они на баланс не попадают.'],
        ['Компании', 'Какая компания самая прибыльная?', 'Apple: она приносит 84 млн ₽ за минуту реального времени. Чем дороже компания, тем выше её доход.'],

        /* ---------- Музыка и настройки ---------- */
        ['Музыка и настройки', 'Как поменять музыку?', 'Нажмите на шестерёнку справа вверху, затем «Выбор музыки» и нажмите «Выбрать» у нужного трека.'],
        ['Музыка и настройки', 'Какие песни бесплатные?', 'Нейтральный трек и Чимаев доступны сразу. Остальные нужно купить.'],
        ['Музыка и настройки', 'Сколько стоят песни?', 'Гейджи 500 ₽, Царукян 1 000 ₽, Оливейра 1 200 ₽, Оливейра (Эдит) 1 500 ₽, Хабиб 2 000 ₽, Махачев 2 200 ₽, Топурия 3 333 ₽, Мераб 12 000 ₽, Пётр Ян 33 333 ₽.'],
        ['Музыка и настройки', 'Как изменить громкость?', 'В настройках есть два ползунка: «Звуковые эффекты» и «Фоновая музыка».'],

        /* ---------- Праздники ---------- */
        ['Праздники', 'Какие выплаты даёт государство?', '1 января +7 000 ₽ всем, 23 февраля +10 000 ₽ парням, 8 марта +10 000 ₽ девушкам и +12 000 ₽ в ваш день рождения.'],
        ['Праздники', 'Как получить выплату?', 'Ничего делать не нужно: в праздничный день деньги придут на счёт сами, и вы получите сообщение.'],

        /* ---------- Советы ---------- */
        ['Советы', 'Как быстро заработать в начале?', 'Устройтесь на подходящую работу (например, кассиром или пожарным), следите за сном и едой и не пропускайте рабочее время.'],
        ['Советы', 'Во что вложить большие деньги?', 'В бизнесы и компании: они приносят доход постоянно. Компании платят даже тогда, когда вы не играете.'],
        ['Советы', 'Как не получать штрафы?', 'Ездите на машине медленно в зоне камер, платите налоги в первые дни и вовремя приходите на работу.'],
        ['Советы', 'Что делать, если игра зависла?', 'Обновите страницу: прогресс сохраняется автоматически, и вы продолжите с того же места.']
    ];

    const FAQ_CATEGORIES = ['Все'].concat(FAQ_ITEMS.map(function (item) { return item[0]; }).filter(function (name, index, list) { return list.indexOf(name) === index; }));

    function faqNormalize(text) {
        return String(text || '').toLowerCase().replace(/ё/g, 'е');
    }

    function renderSearchApp() {
        appScrollableBody.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'faq-wrapper';
        wrapper.innerHTML =
            '<div class="faq-search-box"><span class="faq-search-icon">🔍</span>' +
            '<input type="search" class="faq-search-input" placeholder="Поиск по вопросам" autocomplete="off" enterkeyhint="search">' +
            '<button type="button" class="faq-search-clear hidden" aria-label="Очистить">✕</button></div>' +
            '<div class="faq-cats"></div>' +
            '<div class="faq-count"></div>' +
            '<div class="faq-list"></div>' +
            '<div class="faq-empty hidden"><div class="faq-empty-icon">🤷</div><b>Ничего не найдено</b><span>Попробуйте другое слово или выберите тему «Все».</span></div>';
        appScrollableBody.appendChild(wrapper);

        const input = wrapper.querySelector('.faq-search-input');
        const clearButton = wrapper.querySelector('.faq-search-clear');
        const catsBox = wrapper.querySelector('.faq-cats');
        const countBox = wrapper.querySelector('.faq-count');
        const listBox = wrapper.querySelector('.faq-list');
        const emptyBox = wrapper.querySelector('.faq-empty');
        let activeCategory = 'Все';
        let openCard = null;

        const cards = FAQ_ITEMS.map(function (item, index) {
            const card = document.createElement('div');
            card.className = 'faq-card';
            card.innerHTML =
                '<button type="button" class="faq-question" aria-expanded="false">' +
                '<span class="faq-q-num">' + (index + 1) + '</span>' +
                '<span class="faq-q-text"></span><span class="faq-chevron">⌄</span></button>' +
                '<div class="faq-answer-wrap"><div class="faq-answer"><div class="faq-answer-inner"></div></div></div>';
            card.querySelector('.faq-q-text').textContent = item[1];
            card.querySelector('.faq-answer-inner').textContent = item[2];
            card.dataset.search = faqNormalize(item[0] + ' ' + item[1] + ' ' + item[2]);
            card.dataset.cat = item[0];
            card.querySelector('.faq-question').addEventListener('click', function () {
                const willOpen = !card.classList.contains('open');
                if (openCard && openCard !== card) {
                    openCard.classList.remove('open');
                    openCard.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
                card.classList.toggle('open', willOpen);
                card.querySelector('.faq-question').setAttribute('aria-expanded', willOpen ? 'true' : 'false');
                openCard = willOpen ? card : null;
                if (willOpen) {
                    setTimeout(function () {
                        if (card.classList.contains('open') && card.scrollIntoView) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }, 120);
                }
            });
            listBox.appendChild(card);
            return card;
        });

        function applyFilter() {
            const words = faqNormalize(input.value).split(/\s+/).filter(Boolean);
            let shown = 0;
            cards.forEach(function (card) {
                const categoryOk = activeCategory === 'Все' || card.dataset.cat === activeCategory;
                const textOk = words.every(function (word) { return card.dataset.search.indexOf(word) !== -1; });
                const visible = categoryOk && textOk;
                card.classList.toggle('hidden', !visible);
                if (visible) shown += 1;
                if (!visible && card.classList.contains('open')) {
                    card.classList.remove('open');
                    if (openCard === card) openCard = null;
                }
            });
            countBox.textContent = words.length || activeCategory !== 'Все' ? 'Найдено вопросов: ' + shown : 'Всего вопросов: ' + FAQ_ITEMS.length;
            emptyBox.classList.toggle('hidden', shown !== 0);
            clearButton.classList.toggle('hidden', !input.value);
        }

        FAQ_CATEGORIES.forEach(function (name) {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'faq-chip' + (name === activeCategory ? ' active' : '');
            chip.textContent = name;
            chip.addEventListener('click', function () {
                activeCategory = name;
                catsBox.querySelectorAll('.faq-chip').forEach(function (other) { other.classList.toggle('active', other === chip); });
                applyFilter();
                appScrollableBody.scrollTop = 0;
            });
            catsBox.appendChild(chip);
        });

        let filterTimer = null;
        input.addEventListener('input', function () {
            clearTimeout(filterTimer);
            filterTimer = setTimeout(applyFilter, 120);
        });
        clearButton.addEventListener('click', function () {
            input.value = '';
            applyFilter();
            input.focus();
        });
        applyFilter();
    }

    /* =========================================================
       ЗАЩИТА ОТ СЛУЧАЙНЫХ ДВОЙНЫХ НАЖАТИЙ
       1) Только что открывшееся окно или экран первые 0,45 с не принимает нажатия.
          Так «призрачный» клик по метке на карте не попадает в кнопки такси, пешком и т. д.
       2) Повторное нажатие на ту же кнопку в течение 0,25 с игнорируется.
          Быстрые игры (касса, пожар, пешая прогулка, количество в «Заказе») этим правилом не затрагиваются.
       ========================================================= */
    (function setupTapGuard() {
        const OPEN_GUARD_MS = 450;
        const DOUBLE_TAP_MS = 250;
        const WATCH_SELECTOR = '.modal-overlay, .phone-modal-overlay, .tax-history-overlay, .dialogue-overlay, .screen, [id$="-modal"], [id$="-overlay"], [id^="travel-step"]';
        const RAPID_SELECTOR = '.biz-qty-btn, [data-rapid], #walk-fullscreen, #cashier-work-screen, #drive-screen, #fire-fullscreen, #road-fullscreen, #trucker-road-fullscreen, #xj-game-screen, #xj-task-screen, .pedal';
        const lastClick = { target: null, time: 0 };

        if (typeof MutationObserver === 'function') {
            new MutationObserver(function (records) {
                const now = performance.now();
                for (let i = 0; i < records.length; i += 1) {
                    const record = records[i];
                    const element = record.target;
                    if (!element.classList || element.classList.contains('hidden')) continue;
                    if (!(record.oldValue || '').split(/\s+/).includes('hidden')) continue;
                    if (element.matches(WATCH_SELECTOR)) element.__shownAt = now;
                }
            }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        }

        document.addEventListener('click', function (event) {
            const target = event.target;
            if (!target || !target.closest) return;
            const now = performance.now();

            for (let element = target; element && element !== document.body; element = element.parentElement) {
                if (element.__shownAt && now - element.__shownAt < OPEN_GUARD_MS) {
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }
            }

            const control = target.closest('button, .app-item, .car-card-new, .music-track-card, [role="button"]');
            if (!control || control.closest(RAPID_SELECTOR) || control.hasAttribute('data-rapid')) return;
            if (lastClick.target === control && now - lastClick.time < DOUBLE_TAP_MS) {
                event.stopPropagation();
                event.preventDefault();
                return;
            }
            lastClick.target = control;
            lastClick.time = now;
        }, true);
    })();

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
        navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    fbInit();
    ensureBankAccount();
    initPhoneHome();
    createTravelScreens();

});
