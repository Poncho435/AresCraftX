const SUPABASE_URL = 'https://vclifktmbyaxwybpakgv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbGlma3RtYnlheHd5YnBha2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NjM0OTgsImV4cCI6MjA4NTMzOTQ5OH0.pOyne6Hs71mUe12_lx0a4go_PmGisVXpDPbDK0nwwro';
// Инициализация Supabase - ТОЛЬКО ЗДЕСЬ!
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Основные данные и состояния
const appState = {
    currentSection: 'home',
    currentUser: null,
    userProfile: null,
    searchResults: [],
    friends: [],
    friendRequests: [],
    conversations: [],
    conversationActive: null,
    settings: {
        username: 'Читатель',
        email: '',
        theme: 'dark',
        fontSize: 'medium',
        notifications: {
            messages: true,
            activity: true,
            newBooks: true
        }
    },
    readingStats: {
        today: 0,
        week: 0,
        total: 0,
        streak: 0,
        booksCompleted: 0
    },
    books: [
        {
            id: "des-death",
            title: "DES / DEATH: Пророчество в Пустоте",
            author: "Myxomor",
            genre: "Киберпанк • Психологический триллер",
            description: "История Дэниса Садрикова, ученого, попавшего в ловушку между мирами. Его сознание застряло в цифровом чистилище, где сны становятся реальностью, а реальность — кошмаром.",
            chapters: 10,
            readingTime: 76,
            coverColor: '#4f46e5'
        }
    ]
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    console.log('MyxomorBook интегрирован с AresCraftX...');
    
    try {
        // 1. Проверяем аутентификацию через AresCraftX
        await checkAuth();
        
        // 2. Загружаем данные пользователя (если функция существует)
        if (typeof loadUserData !== 'undefined') {
            await loadUserData();
        } else {
            // Альтернатива: загружаем данные напрямую
            await loadUserProfile();
            await loadFriends();
            await loadReadingStats();
            await loadFriendRequests();
            await loadConversations();
        }
        
        // 3. Инициализация компонентов
        initializeNavigation();
        initializeSearch();
        initializeMessages();
        initializeFriendSystem();
        initializeSettings();
        initializeModals();
        initializeMobileMenu();
        initializeProfile();
        initializeSlideMenu();
        
        // 4. Обновление UI с загруженными данными
        updateUserUI();
        updateReadingStats();
        updateOnlineFriends();
        updateMessagesList();
        updateFriendRequests();
        
        // 5. Загружаем текущую секцию
        const savedSection = localStorage.getItem('currentSection') || 'home';
        showSection(savedSection);
        
        console.log('MyxomorBook готов! Пользователь:', appState.currentUser?.email);
        
        // 6. Запускаем периодические обновления
        startPeriodicUpdates();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        
        // Если не авторизован, редиректим на страницу входа AresCraftX
        if (!appState.currentUser) {
            window.location.href = '../auth.html';
        }
    }
});document.addEventListener('DOMContentLoaded', async function() {
    console.log('MyxomorBook интегрирован с AresCraftX...');
    
    try {
        // 1. Проверяем аутентификацию через AresCraftX
        await checkAuth();
        
        // 2. Загружаем данные пользователя (если функция существует)
        if (typeof loadUserData !== 'undefined') {
            await loadUserData();
        } else {
            // Альтернатива: загружаем данные напрямую
            await loadUserProfile();
            await loadFriends();
            await loadReadingStats();
            await loadFriendRequests();
            await loadConversations();
        }
        
        // 3. Инициализация компонентов
        initializeNavigation();
        initializeSearch();
        initializeMessages();
        initializeFriendSystem();
        initializeSettings();
        initializeModals();
        initializeMobileMenu();
        initializeProfile();
        initializeSlideMenu();
        
        // 4. Обновление UI с загруженными данными
        updateUserUI();
        updateReadingStats();
        updateOnlineFriends();
        updateMessagesList();
        updateFriendRequests();
        
        // 5. Загружаем текущую секцию
        const savedSection = localStorage.getItem('currentSection') || 'home';
        showSection(savedSection);
        
        console.log('MyxomorBook готов! Пользователь:', appState.currentUser?.email);
        
        // 6. Запускаем периодические обновления
        startPeriodicUpdates();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        
        // Если не авторизован, редиректим на страницу входа AresCraftX
        if (!appState.currentUser) {
            window.location.href = '../auth.html';
        }
    }
});


async function checkAuth() {
    try {
        console.log('Проверка авторизации MyxomorBook...');
        
        // 1. Проверяем, есть ли токен AresCraftX в localStorage
        const savedUser = localStorage.getItem('arescraftx_user');
        const savedToken = localStorage.getItem('arescraftx_token');
        
        console.log('Сохраненный пользователь:', savedUser ? 'есть' : 'нет');
        console.log('Сохраненный токен:', savedToken ? 'есть' : 'нет');
        
        // 2. Если нет данных AresCraftX, редирект на единую авторизацию
        if (!savedUser || !savedToken) {
            console.log('Нет данных AresCraftX, редирект на ../auth.html');
            window.location.href = '../auth.html';
            return;
        }
        
        // 3. Пробуем получить пользователя из AresCraftX Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.error('Ошибка получения пользователя:', error);
            
            // Проверяем, может это старый токен MyxomorBook?
            const oldMyxomorToken = localStorage.getItem('supabase.auth.token');
            if (oldMyxomorToken) {
                console.log('Обнаружен старый токен MyxomorBook, очищаем...');
                localStorage.removeItem('supabase.auth.token');
                localStorage.removeItem('user');
                localStorage.removeItem('session');
            }
            
            // Перенаправляем на авторизацию AresCraftX
            window.location.href = '../auth.html';
            return;
        }
        
        if (!user) {
            console.log('Пользователь не найден в AresCraftX Supabase');
            window.location.href = '../auth.html';
            return;
        }
        
        console.log('Пользователь найден в AresCraftX:', user.email);
        
        // 4. Проверяем подтверждение email
        if (!user.email_confirmed_at) {
            console.log('Email не подтвержден, редирект на подтверждение');
            window.location.href = '../verify-email.html';
            return;
        }
        
        // 5. Сохраняем пользователя в appState
        appState.currentUser = user;
        console.log('Пользователь авторизован:', appState.currentUser.email);
        
        // 6. Проверяем доступ к проекту MyxomorBook
        await checkProjectAccess(user.id);
        
        // 7. Загружаем профиль пользователя
        await loadUserProfile();
        
    } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        
        // В любом случае ошибки - на авторизацию
        window.location.href = '../auth.html';
    }
}

async function checkProjectAccess(userId) {
    try {
        // Проверяем, есть ли запись о доступе к MyxomorBook
        const { data: access, error } = await supabase
            .from('user_project_access')
            .select('*')
            .eq('user_id', userId)
            .eq('project_slug', 'myxomorbook')
            .single();
        
        if (error && error.code === 'PGRST116') {
            // Нет записи о доступе - создаем
            console.log('Создаем запись доступа к MyxomorBook...');
            
            const { error: insertError } = await supabase
                .from('user_project_access')
                .insert({
                    user_id: userId,
                    project_slug: 'myxomorbook',
                    has_access: true,
                    joined_at: new Date().toISOString()
                });
            
            if (insertError) {
                console.error('Ошибка создания доступа:', insertError);
                // Показываем сообщение, но разрешаем доступ
                showNotification('Предупреждение: Проблема с доступом к библиотеке', 'warning');
            }
        } else if (access && !access.has_access) {
            // Доступ запрещен
            console.log('Доступ к MyxomorBook запрещен');
            showNotification('Доступ к MyxomorBook временно недоступен', 'error');
            
            // Возвращаем на главную AresCraftX
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 3000);
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.error('Ошибка проверки доступа к проекту:', error);
        return true; // Разрешаем доступ даже при ошибке
    }
}
async function loadUserData() {
    console.log('Загрузка данных пользователя из AresCraftX Supabase...');
    
    if (!appState.currentUser) return;
    
    try {
        // Загружаем настройки из localStorage ПЕРВЫМИ
        loadSettings();
        
        // Применяем тему СРАЗУ после загрузки настроек
        applySettings();
        
        // Затем загружаем остальные данные
        await loadUserProfile();
        await loadFriends();
        await loadReadingStats();
        await loadFriendRequests();
        await loadConversations();
        
        console.log('Данные пользователя загружены');
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
}
async function loadUserProfile() {
    try {
        console.log('Загрузка профиля из AresCraftX...');
        
        // Ищем профиль в ОБЩЕЙ таблице profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', appState.currentUser.id)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            
            // Если профиля нет - создаем
            if (error.code === 'PGRST116') {
                await createUserProfile();
                return;
            }
        }
        
        if (data) {
            appState.userProfile = data;
            appState.settings.username = data.username || appState.currentUser.email?.split('@')[0] || 'Читатель';
            appState.settings.email = data.email || appState.currentUser.email || '';
            console.log('Профиль загружен:', data.username);
        }
        
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}
async function loadUserProfile() {
    try {
        console.log('Загрузка профиля из AresCraftX...');
        
        // Ищем профиль в ОБЩЕЙ таблице profiles
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', appState.currentUser.id)
            .single();
        
        if (error) {
            console.error('Error fetching profile:', error);
            
            // Если профиля нет - создаем
            if (error.code === 'PGRST116') {
                await createUserProfile();
                return;
            }
        }
        
        if (data) {
            appState.userProfile = data;
            appState.settings.username = data.username || appState.currentUser.email?.split('@')[0] || 'Читатель';
            appState.settings.email = data.email || appState.currentUser.email || '';
            console.log('Профиль загружен:', data.username);
        }
        
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}

async function createUserProfile() {
    try {
        console.log('Создание профиля в общей базе AresCraftX...');
        
        const username = appState.currentUser.user_metadata?.username || 
                        appState.currentUser.email?.split('@')[0] || 
                        'Пользователь';
        
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: appState.currentUser.id,
                username: username,
                email: appState.currentUser.email,
                avatar_url: appState.currentUser.user_metadata?.avatar_url || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error creating profile:', error);
            return;
        }
        
        appState.userProfile = data;
        appState.settings.username = data.username;
        appState.settings.email = data.email;
        
        console.log('Профиль создан:', data.username);
        
    } catch (error) {
        console.error('Error in createUserProfile:', error);
    }
}

async function loadFriends() {
    try {
        console.log('Загрузка друзей из AresCraftX...');
        
        const { data, error } = await supabase
            .from('myxomor_friends')  // НОВОЕ ИМЯ ТАБЛИЦЫ
            .select(`*, friend:profiles!myxomor_friends_friend_id_fkey(*)`)
            .eq('user_id', appState.currentUser.id);
        
        if (error) {
            console.error('Error loading friends:', error);
            return;
        }
        
        appState.friends = data.map(item => ({
            ...item.friend,
            isFriend: true,
            online: Math.random() > 0.3
        }));
        
        console.log('Друзья загружены:', appState.friends.length);
        
    } catch (error) {
        console.error('Error in loadFriends:', error);
    }
}

// Загрузить друзей
async function loadFriends() {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select(`*, friend:profiles!friends_friend_id_fkey(*)`)
            .eq('user_id', appState.currentUser.id);
        
        if (error) {
            console.error('Error loading friends:', error);
            return;
        }
        
        appState.friends = data.map(item => ({
            ...item.friend,
            isFriend: true,
            online: Math.random() > 0.3
        }));
        
    } catch (error) {
        console.error('Error in loadFriends:', error);
    }
}

// Загрузить статистику чтения
async function loadReadingStats() {
    try {
        console.log('Загрузка статистики чтения из AresCraftX...');
        
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Сегодняшняя статистика
        const { data: todayData, error: todayError } = await supabase
            .from('myxomor_reading_stats')
            .select('minutes')
            .eq('user_id', appState.currentUser.id)
            .eq('date', today)
            .single();
        
        if (todayError && todayError.code !== 'PGRST116') {
            console.error('Error loading today stats:', todayError);
        }
        
        // Статистика за неделю
        const { data: weekData, error: weekError } = await supabase
            .from('myxomor_reading_stats')
            .select('minutes')
            .eq('user_id', appState.currentUser.id)
            .gte('date', weekAgo);
        
        if (weekError) {
            console.error('Error loading week stats:', weekError);
        }
        
        // Общая статистика
        const { data: totalData, error: totalError } = await supabase
            .from('myxomor_reading_stats')
            .select('minutes')
            .eq('user_id', appState.currentUser.id);
        
        if (totalError) {
            console.error('Error loading total stats:', totalError);
        }
        
        const streak = await calculateReadingStreak();
        
        appState.readingStats = {
            today: todayData?.minutes || 0,
            week: weekData?.reduce((sum, item) => sum + item.minutes, 0) || 0,
            total: totalData?.reduce((sum, item) => sum + item.minutes, 0) || 0,
            streak: streak,
            booksCompleted: Math.floor((totalData?.reduce((sum, item) => sum + item.minutes, 0) || 0) / 60)
        };
        
        console.log('Статистика загружена:', appState.readingStats);
        
    } catch (error) {
        console.error('Error in loadReadingStats:', error);
    }
}

// Вычислить серию дней чтения
async function calculateReadingStreak() {
    try {
        const { data, error } = await supabase
            .from('reading_stats')
            .select('date')
            .eq('user_id', appState.currentUser.id)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error calculating streak:', error);
            return 0;
        }
        
        if (!data || data.length === 0) return 0;
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const record of data) {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            
            const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
        
    } catch (error) {
        console.error('Error in calculateReadingStreak:', error);
        return 0;
    }
}

// Загрузить заявки в друзья
async function loadFriendRequests() {
    try {
        const { data, error } = await supabase
            .from('friend_requests')
            .select(`*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)`)
            .or(`sender_id.eq.${appState.currentUser.id},receiver_id.eq.${appState.currentUser.id}`)
            .eq('status', 'pending');
        
        if (error) {
            console.error('Error loading friend requests:', error);
            return;
        }
        
        appState.friendRequests = data || [];
        
    } catch (error) {
        console.error('Error in loadFriendRequests:', error);
    }
}

// Загрузить беседы
async function loadConversations() {
    try {
        appState.conversations = [
            {
                id: 1,
                userId: 'temp-1',
                name: 'Алексей',
                username: 'alexey_vr',
                avatar: 'https://ui-avatars.com/api/?name=Алексей&background=6366f1&color=fff',
                messages: [
                    { id: 1, sender: 'Алексей', text: 'Привет! Как тебе последняя глава DES / DEATH?', time: '10:20', isMe: false },
                    { id: 2, sender: 'Вы', text: 'Просто потрясающе! Особенно момент с пророчеством', time: '10:22', isMe: true },
                    { id: 3, sender: 'Алексей', text: 'Да, я тоже обалдел. Жду продолжения!', time: '10:23', isMe: false }
                ],
                unread: 0,
                online: true
            }
        ];
        
    } catch (error) {
        console.error('Error in loadConversations:', error);
    }
}

// ============ НАВИГАЦИЯ И ВЫДВИГАЮЩЕЕСЯ МЕНЮ ============

function initializeNavigation() {
    console.log('Инициализация навигации...');
    
    const navIcons = document.querySelectorAll('.nav-icon');
    
    // Обработка кликов по иконкам навигации
    if (document.getElementById('homeBtn')) {
        document.getElementById('homeBtn').addEventListener('click', () => {
            console.log('Нажата кнопка "Главная"');
            showSection('home');
        });
    }
    
    if (document.getElementById('friendsBtn')) {
        document.getElementById('friendsBtn').addEventListener('click', () => {
            console.log('Нажата кнопка "Друзья"');
            showSection('friends');
        });
    }
    
    if (document.getElementById('messagesBtn')) {
        document.getElementById('messagesBtn').addEventListener('click', () => {
            console.log('Нажата кнопка "Сообщения"');
            showSection('messages');
        });
    }
    
    if (document.getElementById('readingTimeBtn')) {
        document.getElementById('readingTimeBtn').addEventListener('click', () => {
            console.log('Нажата кнопка "Время чтения"');
            showSection('reading');
        });
    }
    
    // Обработка клика по меню пользователя
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            console.log('Нажато меню пользователя');
            showSection('settings');
        });
    }
}

// Инициализация выдвигающегося меню
function initializeSlideMenu() {
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const menuHoverTrigger = document.getElementById('menuHoverTrigger');
    const menuOverlay = document.getElementById('menuOverlay');
    const sidebar = document.getElementById('mainSidebar');
    const contentMenuBtn = document.getElementById('contentMenuBtn');
    const contentSubmenu = document.getElementById('contentSubmenu');
    
    // Кнопка открытия/закрытия
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleSlideMenu);
    }
    
    // Закрытие по клику на оверлей
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeSlideMenu);
    }
    
    // Закрытие по нажатию ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSlideMenu();
    });
    
    // Кнопка меню в контенте
    if (contentMenuBtn && contentSubmenu) {
        contentMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            contentSubmenu.classList.toggle('show');
        });
        
        // Закрытие подменю при клике вне
        document.addEventListener('click', () => {
            contentSubmenu.classList.remove('show');
        });
        
        // Обработчики для пунктов подменю
        document.getElementById('submenuNotifications')?.addEventListener('click', () => {
            showNotificationMenu();
            contentSubmenu.classList.remove('show');
        });
        
        document.getElementById('submenuHelp')?.addEventListener('click', () => {
            showHelpMenu();
            contentSubmenu.classList.remove('show');
        });
        
        document.getElementById('submenuTheme')?.addEventListener('click', () => {
            toggleTheme();
            contentSubmenu.classList.remove('show');
        });
        
        document.getElementById('submenuProfile')?.addEventListener('click', () => {
            showProfileModal();
            contentSubmenu.classList.remove('show');
        });
        
        document.getElementById('submenuSettings')?.addEventListener('click', () => {
            showSection('settings');
            contentSubmenu.classList.remove('show');
            closeSlideMenu();
        });
    }
    
    // Обработчики для пунктов главного меню
    document.querySelectorAll('.menu-item-horizontal[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            
            // Обновляем активный пункт
            document.querySelectorAll('.menu-item-horizontal').forEach(i => 
                i.classList.remove('active'));
            item.classList.add('active');
            
            closeSlideMenu();
        });
    });
    
    // Дополнительные пункты меню
    document.getElementById('profileMenuBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
        closeSlideMenu();
    });
    
    document.getElementById('notificationsMenuBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showNotificationMenu();
        closeSlideMenu();
    });
    
    document.getElementById('helpMenuBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        showHelpMenu();
        closeSlideMenu();
    });
    
    document.getElementById('themeMenuBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
        closeSlideMenu();
    });
    
    document.getElementById('logoutMenuBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });
    
    // Автоматическое открытие при наведении (только для десктопов)
    if (menuHoverTrigger && window.innerWidth > 768) {
        let hoverTimeout;
        
        menuHoverTrigger.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                openSlideMenu();
            }, 300);
        });
        
        menuHoverTrigger.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
        
        sidebar.addEventListener('mouseleave', () => {
            if (sidebar.classList.contains('mobile-open')) {
                setTimeout(() => {
                    if (!sidebar.matches(':hover')) {
                        closeSlideMenu();
                    }
                }, 300);
            }
        });
    }
}

// Функции управления меню
function toggleSlideMenu() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('menuOverlay');
    const menuBtn = document.getElementById('menuToggleBtn');
    
    if (sidebar.classList.contains('mobile-open')) {
        closeSlideMenu();
        menuBtn?.classList.remove('active');
    } else {
        openSlideMenu();
        menuBtn?.classList.add('active');
    }
}

function openSlideMenu() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('menuOverlay');
    const menuBtn = document.getElementById('menuToggleBtn');
    
    sidebar.classList.add('mobile-open');
    if (overlay) overlay.style.display = 'block';
    if (menuBtn) menuBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSlideMenu() {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('menuOverlay');
    const menuBtn = document.getElementById('menuToggleBtn');
    
    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.style.display = 'none';
    if (menuBtn) menuBtn.classList.remove('active');
    document.body.style.overflow = '';
}

// Показать секцию
function showSection(sectionId) {
    console.log('Показ секции:', sectionId);
    
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionId;
        
        // Обновляем активный пункт в меню
        document.querySelectorAll('.menu-item-horizontal').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
        
        // Закрываем меню на мобильных
        if (window.innerWidth <= 768) {
            closeSlideMenu();
        }
    } else {
        console.error('Секция не найдена:', sectionId);
    }
}

// Обновить заголовок секции
function updateSectionTitle(sectionId) {
    const titles = {
        'home': 'Главная',
        'library': 'Все книги',
        'friends': 'Друзья',
        'messages': 'Сообщения',
        'reading': 'Статистика чтения',
        'settings': 'Настройки'
    };
    
    if (document.title) {
        document.title = titles[sectionId] + ' | MyxomorBook';
    }
}

// ============ ПОИСК ============

function initializeSearch() {
    console.log('Инициализация поиска...');
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                appState.searchResults = [];
                updateSearchResults([]);
                return;
            }
            
            performBookSearch(query);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performBookSearch(this.value);
            }
        });
    }
    
    const searchFriendsInput = document.getElementById('searchFriends');
    if (searchFriendsInput) {
        searchFriendsInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                updateFriendsList(appState.friends);
                return;
            }
            
            performFriendSearch(query);
        });
    }
}

// Выполнить поиск книг
function performBookSearch(query) {
    console.log('Поиск книг:', query);
    
    const results = appState.books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
    );
    
    appState.searchResults = results;
    updateSearchResults(results);
    
    if (results.length > 0) {
        showSection('library');
    }
}

// Обновить результаты поиска
function updateSearchResults(results) {
    const librarySection = document.getElementById('librarySection');
    if (!librarySection) return;
    
    const booksGrid = librarySection.querySelector('.books-grid');
    if (!booksGrid) return;
    
    if (results.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Книги не найдены</h3>
                <p>Попробуйте изменить запрос</p>
            </div>
        `;
        return;
    }
    
    booksGrid.innerHTML = results.map(book => `
        <div class="book-card-small" data-book="${book.id}">
            <div class="book-cover-small" style="background: ${book.coverColor || '#4f46e5'}">
                <h4>${book.title.split(':')[0]}</h4>
                <p>${book.title.split(':')[1] || ''}</p>
            </div>
            <div class="book-info-small">
                <h4>${book.title}</h4>
                <p class="book-author-small">${book.author}</p>
                <div class="book-actions">
                    <a href="read.html" class="btn-action" title="Читать">
                        <i class="fas fa-book-open"></i>
                    </a>
                    <button class="btn-action favorite-btn" title="В избранное">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    initializeBookActions();
}

// Поиск друзей
async function performFriendSearch(query) {
    console.log('Поиск друзей:', query);
    
    if (!appState.currentUser) return;
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .neq('id', appState.currentUser.id)
            .limit(10);
        
        if (error) {
            console.error('Error searching users:', error);
            showNotification('Ошибка поиска', 'error');
            return;
        }
        
        const enhancedResults = await Promise.all(data.map(async (user) => {
            const isFriend = appState.friends.some(f => f.id === user.id);
            
            const hasPendingRequest = appState.friendRequests.some(req => 
                (req.sender_id === appState.currentUser.id && req.receiver_id === user.id && req.status === 'pending') ||
                (req.receiver_id === appState.currentUser.id && req.sender_id === user.id && req.status === 'pending')
            );
            
            return {
                ...user,
                isFriend,
                hasPendingRequest,
                online: Math.random() > 0.3
            };
        }));
        
        updateFriendsList(enhancedResults);
        
    } catch (error) {
        console.error('Error in performFriendSearch:', error);
        showNotification('Ошибка поиска', 'error');
    }
}

// ============ СООБЩЕНИЯ ============

function initializeMessages() {
    console.log('Инициализация сообщений...');
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessageBtn');
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

// Обновить список бесед
function updateMessagesList() {
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;
    
    if (appState.conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-comments"></i>
                <h3>Нет диалогов</h3>
                <p>Начните общение с друзьями</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = appState.conversations.map(conv => `
        <div class="conversation ${conv.id === appState.conversationActive ? 'active' : ''}" 
             data-id="${conv.id}" onclick="loadConversation(${conv.id})">
            <img src="${conv.avatar}" alt="${conv.name}">
            <div class="conversation-info">
                <h4>${conv.name}</h4>
                <p>${conv.messages[conv.messages.length - 1]?.text || 'Нет сообщений'}</p>
                <span class="message-time">${conv.messages[conv.messages.length - 1]?.time || ''}</span>
            </div>
            ${conv.unread > 0 ? `<span class="unread-count">${conv.unread}</span>` : ''}
        </div>
    `).join('');
    
    updateUnreadCount();
}

// Загрузить беседу
function loadConversation(conversationId) {
    console.log('Загрузка беседы:', conversationId);
    
    const conversation = appState.conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    appState.conversationActive = conversationId;
    
    document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
    document.querySelector(`.conversation[data-id="${conversationId}"]`)?.classList.add('active');
    
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <img src="${conversation.avatar}" alt="${conversation.name}">
            <div>
                <h4>${conversation.name}</h4>
                <span class="user-status ${conversation.online ? 'online' : 'away'}">
                    ${conversation.online ? 'В сети' : 'Не в сети'}
                </span>
            </div>
        `;
    }
    
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        if (conversation.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-comments"></i>
                    <p>Начните диалог с ${conversation.name}</p>
                </div>
            `;
        } else {
            messagesContainer.innerHTML = conversation.messages.map(msg => `
                <div class="message ${msg.isMe ? 'sent' : 'received'}">
                    <p>${msg.text}</p>
                    <span class="message-time">${msg.time}</span>
                </div>
            `).join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessageBtn');
    if (messageInput && sendButton) {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
    
    conversation.unread = 0;
    updateUnreadCount();
    updateMessagesList();
}

// Отправить сообщение
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input?.value.trim();
    
    if (!message || !appState.conversationActive) return;
    
    const conversation = appState.conversations.find(c => c.id === appState.conversationActive);
    if (!conversation) return;
    
    const newMessage = {
        id: conversation.messages.length + 1,
        sender: 'Вы',
        text: message,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: true
    };
    
    conversation.messages.push(newMessage);
    
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        const noMessages = messagesContainer.querySelector('.no-messages');
        if (noMessages) {
            noMessages.remove();
        }
        
        const newMessageElement = document.createElement('div');
        newMessageElement.className = 'message sent';
        newMessageElement.innerHTML = `
            <p>${message}</p>
            <span class="message-time">${newMessage.time}</span>
        `;
        messagesContainer.appendChild(newMessageElement);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    if (input) {
        input.value = '';
        input.focus();
    }
    
    console.log('Сообщение отправлено:', message);
    
    setTimeout(() => {
        const responses = [
            'Интересно! А что тебе больше всего понравилось?',
            'Согласен, этот момент был мощным',
            'Жду продолжения истории!',
            'Как думаешь, что будет дальше?'
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        const replyMessage = {
            id: conversation.messages.length + 1,
            sender: conversation.name,
            text: response,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isMe: false
        };
        
        conversation.messages.push(replyMessage);
        
        if (appState.currentSection === 'messages' && appState.conversationActive === conversation.id) {
            loadConversation(conversation.id);
        } else {
            conversation.unread++;
            updateUnreadCount();
            updateMessagesList();
        }
    }, 1000 + Math.random() * 2000);
}

// Обновить счетчик непрочитанных
function updateUnreadCount() {
    const totalUnread = appState.conversations.reduce((sum, conv) => sum + conv.unread, 0);
    
    const messageBadge = document.querySelector('#messagesBtn .notification-badge');
    if (messageBadge) {
        if (totalUnread > 0) {
            messageBadge.textContent = totalUnread > 9 ? '9+' : totalUnread;
            messageBadge.style.display = 'flex';
        } else {
            messageBadge.style.display = 'none';
        }
    }
    
    const messagesTitle = document.querySelector('#messagesSection h2');
    if (messagesTitle) {
        messagesTitle.textContent = totalUnread > 0 ? `Сообщения (${totalUnread})` : 'Сообщения';
    }
}

// ============ ДРУЗЬЯ ============

function initializeFriendSystem() {
    console.log('Инициализация системы друзей...');
    
    const addFriendBtn = document.querySelector('.btn-add-friend');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', showAddFriendModal);
    }
    
    const searchFriendsBtn = document.querySelector('.btn-search');
    if (searchFriendsBtn) {
        searchFriendsBtn.addEventListener('click', async () => {
            const searchInput = document.getElementById('searchFriends');
            if (searchInput) {
                await performFriendSearch(searchInput.value);
            }
        });
    }
}

// Обновить список друзей
function updateFriendsList(friends = appState.friends) {
    const friendsList = document.getElementById('friendsListContainer');
    if (!friendsList) return;
    
    if (friends.length === 0) {
        friendsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-user-friends"></i>
                <h3>Друзья не найдены</h3>
                <p>Начните добавлять друзей!</p>
            </div>
        `;
        return;
    }
    
    friendsList.innerHTML = friends.map(friend => `
        <div class="friend-card" data-id="${friend.id}">
            <img src="${friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=6366f1&color=fff`}" 
                 alt="${friend.username}">
            <div class="friend-info">
                <h4>${friend.full_name || friend.username}</h4>
                <p>@${friend.username}</p>
                <p class="friend-activity">
                    ${friend.isFriend ? 'Друг' : 'Не в друзьях'}
                </p>
                <span class="friend-status ${friend.online ? 'online' : 'away'}">
                    ${friend.online ? 'В сети' : 'Не в сети'}
                </span>
            </div>
            <div class="friend-actions">
                <button class="btn-message" title="Написать сообщение" onclick="messageFriend('${friend.id}', '${friend.username}')">
                    <i class="fas fa-envelope"></i>
                </button>
                ${friend.isFriend ? `
                    <button class="btn-remove" title="Удалить из друзей" onclick="removeFriend('${friend.id}')">
                        <i class="fas fa-user-minus"></i>
                    </button>
                ` : friend.hasPendingRequest ? `
                    <button class="btn-pending" title="Заявка отправлена" disabled>
                        <i class="fas fa-clock"></i>
                    </button>
                ` : `
                    <button class="btn-add" title="Добавить в друзья" onclick="sendFriendRequestToUser('${friend.username}')">
                        <i class="fas fa-user-plus"></i>
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

// Написать сообщение другу
function messageFriend(friendId, friendUsername) {
    let conversation = appState.conversations.find(c => c.userId === friendId);
    
    if (!conversation) {
        conversation = {
            id: appState.conversations.length + 1,
            userId: friendId,
            name: friendUsername,
            username: friendUsername,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(friendUsername)}&background=6366f1&color=fff`,
            messages: [],
            unread: 0,
            online: true
        };
        appState.conversations.push(conversation);
    }
    
    showSection('messages');
    loadConversation(conversation.id);
}

// Удалить друга
async function removeFriend(friendId) {
    const friend = appState.friends.find(f => f.id === friendId);
    
    if (friend && confirm(`Удалить ${friend.username} из друзей?`)) {
        try {
            const { error: error1 } = await supabase
                .from('friends')
                .delete()
                .eq('user_id', appState.currentUser.id)
                .eq('friend_id', friendId);
            
            const { error: error2 } = await supabase
                .from('friends')
                .delete()
                .eq('user_id', friendId)
                .eq('friend_id', appState.currentUser.id);
            
            if (error1 || error2) {
                console.error('Error removing friend:', error1 || error2);
                showNotification('Ошибка удаления друга', 'error');
                return;
            }
            
            appState.friends = appState.friends.filter(f => f.id !== friendId);
            updateFriendsList();
            updateOnlineFriends();
            
            showNotification('Друг удален', 'success');
            
        } catch (error) {
            console.error('Error in removeFriend:', error);
            showNotification('Ошибка удаления друга', 'error');
        }
    }
}

// Обновить список друзей онлайн
function updateOnlineFriends() {
    const onlineFriends = appState.friends.filter(f => f.online);
    const onlineCount = onlineFriends.length;
    
    const onlineFriendsContainer = document.getElementById('onlineFriends');
    if (onlineFriendsContainer) {
        if (onlineCount === 0) {
            onlineFriendsContainer.innerHTML = `
                <div class="no-online">
                    <i class="fas fa-user-slash"></i>
                    <p>Нет друзей онлайн</p>
                </div>
            `;
        } else {
            onlineFriendsContainer.innerHTML = onlineFriends.slice(0, 3).map(friend => `
                <div class="friend" data-id="${friend.id}" onclick="messageFriend('${friend.id}', '${friend.username}')">
                    <img src="${friend.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=6366f1&color=fff`}" 
                         alt="${friend.username}">
                    <span>${friend.username}</span>
                    <div class="online-status"></div>
                </div>
            `).join('');
            
            if (onlineCount > 3) {
                onlineFriendsContainer.innerHTML += `
                    <div class="friend-more">
                        <span>+${onlineCount - 3} еще</span>
                    </div>
                `;
            }
        }
    }
    
    const friendsBadge = document.querySelector('#friendsBtn .notification-badge');
    if (friendsBadge) {
        if (onlineCount > 0) {
            friendsBadge.textContent = onlineCount > 9 ? '9+' : onlineCount;
            friendsBadge.style.display = 'flex';
        } else {
            friendsBadge.style.display = 'none';
        }
    }
}

// Показать модальное окно добавления друга
async function showAddFriendModal() {
    console.log('Открытие окна добавления друга');
    
    const modal = document.getElementById('addFriendModal');
    if (modal) {
        await updateFriendRequests();
        
        modal.style.display = 'flex';
        
        const input = document.getElementById('friendUsernameInput');
        if (input) {
            input.focus();
            input.value = '';
        }
    }
}

// Обновить заявки в друзья
async function updateFriendRequests() {
    try {
        await loadFriendRequests();
        
        const incomingRequests = appState.friendRequests.filter(r => r.receiver_id === appState.currentUser.id);
        const friendsBadge = document.querySelector('#friendsBtn .notification-badge');
        
        if (friendsBadge) {
            if (incomingRequests.length > 0) {
                friendsBadge.textContent = incomingRequests.length > 9 ? '9+' : incomingRequests.length;
                friendsBadge.style.display = 'flex';
            } else {
                friendsBadge.style.display = 'none';
            }
        }
        
        updateFriendRequestsModal();
        
    } catch (error) {
        console.error('Error updating friend requests:', error);
    }
}

// Обновить модальное окно с заявками
function updateFriendRequestsModal() {
    const modalBody = document.getElementById('friendModalBody');
    if (!modalBody) return;
    
    const incomingRequests = appState.friendRequests?.filter(r => r.receiver_id === appState.currentUser.id) || [];
    
    if (incomingRequests.length > 0) {
        modalBody.innerHTML = `
            <div class="friend-requests">
                <h4>Входящие заявки (${incomingRequests.length})</h4>
                ${incomingRequests.map(request => `
                    <div class="friend-request-item" data-id="${request.id}">
                        <img src="${request.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.sender?.username)}&background=6366f1&color=fff`}" 
                             alt="${request.sender?.username}">
                        <div class="request-info">
                            <h5>${request.sender?.username}</h5>
                            <p>${request.sender?.full_name || ''}</p>
                        </div>
                        <div class="request-actions">
                            <button class="btn-accept" onclick="acceptFriendRequest('${request.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-reject" onclick="rejectFriendRequest('${request.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
                <hr>
                <h4>Отправить заявку</h4>
                <input type="text" id="friendUsernameInput" placeholder="Имя пользователя" class="modal-input">
                <button class="btn-send-request" onclick="sendFriendRequest()">Отправить запрос</button>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="friend-requests">
                <h4>Отправить заявку в друзья</h4>
                <input type="text" id="friendUsernameInput" placeholder="Имя пользователя" class="modal-input">
                <button class="btn-send-request" onclick="sendFriendRequest()">Отправить запрос</button>
            </div>
        `;
    }
}

// Отправить заявку в друзья
async function sendFriendRequest() {
    const input = document.getElementById('friendUsernameInput');
    const username = input?.value.trim();
    
    if (!username) {
        showNotification('Введите имя пользователя', 'error');
        return;
    }
    
    if (username === appState.userProfile?.username) {
        showNotification('Нельзя отправить заявку самому себе', 'error');
        return;
    }
    
    console.log('Отправка запроса в друзья:', username);
    
    try {
        const { data: receiver, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
        
        if (findError || !receiver) {
            showNotification('Пользователь не найден', 'error');
            return;
        }
        
        const existingRequest = appState.friendRequests.find(req => 
            req.sender_id === appState.currentUser.id && 
            req.receiver_id === receiver.id && 
            req.status === 'pending'
        );
        
        if (existingRequest) {
            showNotification('Заявка уже отправлена', 'error');
            return;
        }
        
        const isAlreadyFriend = appState.friends.some(f => f.id === receiver.id);
        if (isAlreadyFriend) {
            showNotification('Вы уже друзья с этим пользователем', 'error');
            return;
        }
        
        const { data, error } = await supabase
            .from('friend_requests')
            .insert({
                sender_id: appState.currentUser.id,
                receiver_id: receiver.id,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error sending friend request:', error);
            showNotification('Ошибка отправки заявки', 'error');
            return;
        }
        
        const modal = document.getElementById('addFriendModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (input) {
            input.value = '';
        }
        
        showNotification('Запрос в друзья отправлен!', 'success');
        
        await updateFriendRequests();
        
    } catch (error) {
        console.error('Error in sendFriendRequest:', error);
        showNotification(error.message || 'Ошибка отправки заявки', 'error');
    }
}

// Функция отправки заявки конкретному пользователю
async function sendFriendRequestToUser(username) {
    try {
        const { data: receiver, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
        
        if (findError || !receiver) {
            showNotification('Пользователь не найден', 'error');
            return;
        }
        
        const existingRequest = appState.friendRequests.find(req => 
            req.sender_id === appState.currentUser.id && 
            req.receiver_id === receiver.id && 
            req.status === 'pending'
        );
        
        if (existingRequest) {
            showNotification('Заявка уже отправлена', 'error');
            return;
        }
        
        const { data, error } = await supabase
            .from('friend_requests')
            .insert({
                sender_id: appState.currentUser.id,
                receiver_id: receiver.id,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error sending friend request:', error);
            showNotification('Ошибка отправки заявки', 'error');
            return;
        }
        
        showNotification(`Заявка отправлена пользователю ${username}`, 'success');
        
        await updateFriendRequests();
        await performFriendSearch('');
        
    } catch (error) {
        console.error('Error in sendFriendRequestToUser:', error);
        showNotification(error.message || 'Ошибка отправки заявки', 'error');
    }
}

// Принять заявку в друзья
async function acceptFriendRequest(requestId) {
    try {
        const { data: request, error: updateError } = await supabase
            .from('friend_requests')
            .update({ 
                status: 'accepted', 
                accepted_at: new Date().toISOString() 
            })
            .eq('id', requestId)
            .select(`*, sender:profiles!friend_requests_sender_id_fkey(*)`)
            .single();
        
        if (updateError) {
            console.error('Error accepting friend request:', updateError);
            showNotification('Ошибка принятия заявки', 'error');
            return;
        }
        
        const { error: friendError1 } = await supabase
            .from('friends')
            .insert({
                user_id: appState.currentUser.id,
                friend_id: request.sender_id,
                created_at: new Date().toISOString()
            });
        
        const { error: friendError2 } = await supabase
            .from('friends')
            .insert({
                user_id: request.sender_id,
                friend_id: appState.currentUser.id,
                created_at: new Date().toISOString()
            });
        
        if (friendError1 || friendError2) {
            console.error('Error creating friendship:', friendError1 || friendError2);
            showNotification('Ошибка создания дружбы', 'error');
            return;
        }
        
        const newFriend = {
            ...request.sender,
            isFriend: true,
            online: Math.random() > 0.3
        };
        
        appState.friends.push(newFriend);
        
        showNotification('Заявка принята!', 'success');
        
        await updateFriendRequests();
        updateFriendsList();
        updateOnlineFriends();
        
    } catch (error) {
        console.error('Error in acceptFriendRequest:', error);
        showNotification('Ошибка принятия заявки', 'error');
    }
}

// Отклонить заявку в друзья
async function rejectFriendRequest(requestId) {
    try {
        const { error } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);
        
        if (error) {
            console.error('Error rejecting friend request:', error);
            showNotification('Ошибка отклонения заявки', 'error');
            return;
        }
        
        showNotification('Заявка отклонена', 'info');
        
        await updateFriendRequests();
        
    } catch (error) {
        console.error('Error in rejectFriendRequest:', error);
        showNotification('Ошибка отклонения заявки', 'error');
    }
}

// ============ НАСТРОЙКИ ============

function initializeSettings() {
    console.log('Инициализация настроек...');
    
    loadSettings();
    updateSettingsUI();
    
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
}

// Загрузить настройки
function loadSettings() {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            // Обновляем ТОЛЬКО настройки, не перезаписывая весь объект
            appState.settings = {
                ...appState.settings,
                theme: settings.theme || 'dark',
                fontSize: settings.fontSize || 'medium',
                notifications: {
                    ...appState.settings.notifications,
                    ...(settings.notifications || {})
                }
            };
            
            // Если есть username в настройках, используем его
            if (settings.username) {
                appState.settings.username = settings.username;
            }
            
            console.log('Настройки загружены:', appState.settings);
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e);
        }
    }
}

// Сохранить настройки
function saveSettings() {
    try {
        appState.settings.username = document.getElementById('usernameInput')?.value || appState.settings.username;
        appState.settings.theme = document.getElementById('themeSelect')?.value || appState.settings.theme;
        appState.settings.fontSize = document.getElementById('fontSizeSelect')?.value || appState.settings.fontSize;
        appState.settings.notifications.messages = document.getElementById('notifyMessages')?.checked || false;
        appState.settings.notifications.activity = document.getElementById('notifyActivity')?.checked || false;
        appState.settings.notifications.newBooks = document.getElementById('notifyNewBooks')?.checked || false;
        
        localStorage.setItem('userSettings', JSON.stringify(appState.settings));
        console.log('Настройки сохранены');
        
        applySettings();
        
        showNotification('Настройки сохранены', 'success');
    } catch (e) {
        console.error('Ошибка сохранения настроек:', e);
        showNotification('Ошибка сохранения настроек', 'error');
    }
}

// Применить настройки
// Применить настройки
function applySettings() {
    console.log('Применение настроек:', appState.settings);
    
    // Сначала применяем тему, чтобы она загрузилась сразу
    applyTheme();
    
    // Затем применяем размер шрифта
    applyFontSize();
    
    // Обновляем UI
    updateUserUI();
    updateSettingsUI();
}

// Применить тему
// Применить тему
function applyTheme() {
    const theme = appState.settings.theme || 'dark';
    
    console.log('Применение темы:', theme);
    
    // Удаляем все классы тем
    document.body.classList.remove('dark-theme', 'light-theme');
    
    // Добавляем нужную тему
    document.body.classList.add(theme + '-theme');
    
    // Добавляем класс на html элемент для надежности
    document.documentElement.setAttribute('data-theme', theme);
    
    // Обновляем цветовую схему мета-тега для мобильных устройств
    updateThemeMetaColor(theme);
    
    console.log('Тема применена:', theme);
}

// Обновить цвет в мета-теге для мобильных устройств
function updateThemeMetaColor(theme) {
    let themeColor = '#3b82f6'; // Цвет по умолчанию (синий)
    
    if (theme === 'dark') {
        themeColor = '#1a1a1a'; // Темный фон
    } else if (theme === 'light') {
        themeColor = '#ffffff'; // Светлый фон
    }
    
    // Обновляем или создаем мета-тег theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = themeColor;
}

// Применить размер шрифта
function applyFontSize() {
    const fontSize = appState.settings.fontSize || 'medium';
    const sizes = {
        'small': '0.9rem',
        'medium': '1rem',
        'large': '1.1rem'
    };
    
    document.documentElement.style.fontSize = sizes[fontSize] || sizes.medium;
    console.log('Размер шрифта применен:', fontSize);
}

// Обновить UI настроек
function updateSettingsUI() {
    const usernameInput = document.getElementById('usernameInput');
    const emailInput = document.getElementById('emailInput');
    const themeSelect = document.getElementById('themeSelect');
    const fontSizeSelect = document.getElementById('fontSizeSelect');
    const notifyMessages = document.getElementById('notifyMessages');
    const notifyActivity = document.getElementById('notifyActivity');
    const notifyNewBooks = document.getElementById('notifyNewBooks');
    
    if (usernameInput) usernameInput.value = appState.settings.username;
    if (emailInput) emailInput.value = appState.settings.email || appState.currentUser?.email || '';
    if (themeSelect) themeSelect.value = appState.settings.theme;
    if (fontSizeSelect) fontSizeSelect.value = appState.settings.fontSize;
    if (notifyMessages) notifyMessages.checked = appState.settings.notifications.messages;
    if (notifyActivity) notifyActivity.checked = appState.settings.notifications.activity;
    if (notifyNewBooks) notifyNewBooks.checked = appState.settings.notifications.newBooks;
    
    updateReadingStatsUI();
}

// ============ МОДАЛЬНЫЕ ОКНА ============

function initializeModals() {
    console.log('Инициализация модальных окон...');
    
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                console.log('Модальное окно закрыто');
            }
        });
    });
    
    window.addEventListener('click', function(e) {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                console.log('Модальное окно закрыто по клику вне');
            }
        });
    });
}

// ============ ПРОФИЛЬ ============

function initializeProfile() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    const editProfileBtn = document.querySelector('.btn-profile-edit');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showProfileModal);
    }
    
    const avatarEditBtn = document.querySelector('.avatar-edit');
    if (avatarEditBtn) {
        avatarEditBtn.addEventListener('click', showProfileModal);
    }
}

// Функция выхода
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Очищаем ВСЕ токены
        localStorage.clear();
        
        // Редирект на главную AresCraftX
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showNotification('Ошибка при выходе', 'error');
    }
}

function updateUserUI() {
    if (!appState.userProfile) return;
    
    const userMenuName = document.querySelector('.user-menu span');
    if (userMenuName) {
        userMenuName.textContent = appState.userProfile.username || 'Читатель';
    }
    
    const userAvatar = document.querySelector('.user-menu img');
    if (userAvatar) {
        userAvatar.src = appState.userProfile.avatar_url || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.userProfile.username)}&background=6366f1&color=fff`;
        userAvatar.alt = appState.userProfile.username;
    }
    
    updateSidebarProfile();
}

function updateSidebarProfile() {
    document.getElementById('sidebarUsername').textContent = appState.userProfile?.username || 'Загрузка...';
    document.getElementById('sidebarEmail').textContent = appState.userProfile?.email || appState.currentUser?.email || '...';
    document.getElementById('sidebarAvatar').src = appState.userProfile?.avatar_url || 
                                                 `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.userProfile?.username || 'User')}&background=6366f1&color=fff`;
    document.getElementById('sidebarBooks').textContent = appState.readingStats.booksCompleted;
    document.getElementById('sidebarStreak').textContent = `${appState.readingStats.streak}д`;
    
    const level = Math.floor(appState.readingStats.total / 600) + 1;
    document.getElementById('sidebarLevel').textContent = `Уровень ${level}`;
}

// Функция показа модального окна профиля
function showProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    
    document.getElementById('profileUsername').value = appState.userProfile?.username || '';
    document.getElementById('profileFullName').value = appState.userProfile?.full_name || '';
    document.getElementById('profileEmail').value = appState.userProfile?.email || appState.currentUser?.email || '';
    document.getElementById('profileBio').value = appState.userProfile?.bio || '';
    document.getElementById('avatarPreview').src = appState.userProfile?.avatar_url || 
                                                 `https://ui-avatars.com/api/?name=${encodeURIComponent(appState.userProfile?.username || 'User')}&background=6366f1&color=fff`;
    
    modal.style.display = 'flex';
    
    document.getElementById('avatarUpload').onchange = handleAvatarUpload;
    document.getElementById('saveProfileBtn').onclick = saveProfile;
    
    modal.querySelector('.btn-cancel').onclick = () => {
        modal.style.display = 'none';
    };
}

// Функция загрузки аватара
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой (макс 5MB)', 'error');
        return;
    }
    
    if (!file.type.match('image.*')) {
        showNotification('Выберите изображение', 'error');
        return;
    }
    
    try {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('avatarPreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        const fileName = `${appState.currentUser.id}/${Date.now()}_${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
        
        if (uploadError) {
            throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
        
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ 
                avatar_url: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', appState.currentUser.id)
            .select()
            .single();
        
        if (updateError) {
            throw updateError;
        }
        
        appState.userProfile = updatedProfile;
        updateUserUI();
        
        showNotification('Аватар обновлен!', 'success');
        
    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        showNotification('Ошибка загрузки аватара', 'error');
    }
}

// Функция сохранения профиля
async function saveProfile() {
    const username = document.getElementById('profileUsername').value.trim();
    const fullName = document.getElementById('profileFullName').value.trim();
    const bio = document.getElementById('profileBio').value.trim();
    
    if (!username) {
        showNotification('Введите имя пользователя', 'error');
        return;
    }
    
    try {
        if (username !== appState.userProfile.username) {
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .neq('id', appState.currentUser.id)
                .single();
            
            if (existingUser) {
                showNotification('Имя пользователя уже занято', 'error');
                return;
            }
        }
        
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                username: username,
                full_name: fullName || null,
                bio: bio || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', appState.currentUser.id)
            .select()
            .single();
        
        if (updateError) {
            throw updateError;
        }
        
        appState.userProfile = updatedProfile;
        appState.settings.username = username;
        
        updateUserUI();
        saveSettings();
        
        document.getElementById('profileModal').style.display = 'none';
        
        showNotification('Профиль сохранен!', 'success');
        
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        showNotification('Ошибка сохранения профиля', 'error');
    }
}

// ============ СТАТИСТИКА ============

// Обновить статистику чтения в UI
function updateReadingStats() {
    document.getElementById('todayStat').textContent = `${appState.readingStats.today} мин`;
    document.getElementById('weekStat').textContent = `${Math.floor(appState.readingStats.week / 60)} ч ${appState.readingStats.week % 60} мин`;
    document.getElementById('totalStat').textContent = `${Math.floor(appState.readingStats.total / 60)} ч`;
    
    updateReadingStatsUI();
}

// Обновить UI статистики чтения
function updateReadingStatsUI() {
    document.getElementById('totalTimeStat').textContent = `${Math.floor(appState.readingStats.total / 60)} часов`;
    document.getElementById('booksCompletedStat').textContent = `${appState.readingStats.booksCompleted} книг`;
    document.getElementById('streakStat').textContent = `${appState.readingStats.streak} дней`;
    document.getElementById('todayReadingTime').textContent = `${appState.readingStats.today} мин сегодня`;
}

// Сохранить время чтения
// ОБНОВЛЕННАЯ ФУНКЦИЯ: Сохранить статистику чтения
async function saveReadingTime(minutes) {
    if (!appState.currentUser) return;
    
    try {
        console.log('Сохранение статистики чтения в AresCraftX...');
        
        const today = new Date().toISOString().split('T')[0];
        
        // Ищем запись за сегодня в таблице myxomor_reading_stats
        const { data: existingRecord, error: fetchError } = await supabase
            .from('myxomor_reading_stats')
            .select('*')
            .eq('user_id', appState.currentUser.id)
            .eq('date', today)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing record:', fetchError);
        }
        
        if (existingRecord) {
            // Обновляем существующую запись
            const { error } = await supabase
                .from('myxomor_reading_stats')
                .update({ 
                    minutes: existingRecord.minutes + minutes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingRecord.id);
            
            if (error) throw error;
        } else {
            // Создаем новую запись
            const { error } = await supabase
                .from('myxomor_reading_stats')
                .insert({
                    user_id: appState.currentUser.id,
                    book_id: 'des-death',
                    date: today,
                    minutes: minutes,
                    created_at: new Date().toISOString()
                });
            
            if (error) throw error;
        }
        
        // Обновляем локальную статистику
        appState.readingStats.today += minutes;
        appState.readingStats.week += minutes;
        appState.readingStats.total += minutes;
        
        const newStreak = await calculateReadingStreak();
        appState.readingStats.streak = newStreak;
        
        updateReadingStats();
        
        console.log(`Время чтения сохранено в AresCraftX: +${minutes} мин`);
        
    } catch (error) {
        console.error('Ошибка сохранения времени чтения:', error);
    }
}
// ============ МОБИЛЬНОЕ МЕНЮ ============

function initializeMobileMenu() {
    console.log('Инициализация мобильного меню...');
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        createMobileMenuButton();
    }
    
    window.addEventListener('resize', function() {
        const isNowMobile = window.innerWidth <= 768;
        
        if (isNowMobile && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenuButton();
        } else if (!isNowMobile) {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (mobileBtn) {
                mobileBtn.remove();
            }
        }
    });
}

// Создать кнопку мобильного меню
function createMobileMenuButton() {
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileBtn.title = 'Меню';
    
    mobileBtn.addEventListener('click', function() {
        toggleMobileMenu();
    });
    
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
        navRight.prepend(mobileBtn);
    }
}

// Переключить мобильное меню
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        overlay.addEventListener('click', closeMobileMenu);
        
        if (sidebar.classList.contains('mobile-open')) {
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileMenu();
        }
    }
}

// Закрыть мобильное меню
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    
    const overlay = document.querySelector('.mobile-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    document.body.style.overflow = '';
}

// ============ ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ МЕНЮ ============

// Функция меню уведомлений
function showNotificationMenu() {
    showNotification('Уведомления: 3 новых', 'info');
}

// Функция меню помощи
function showHelpMenu() {
    showNotification('Раздел помощи в разработке', 'info');
}

// Функция переключения темы
function toggleTheme() {
    const currentTheme = appState.settings.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    appState.settings.theme = newTheme;
    applyTheme();
    saveSettings();
    
    showNotification(`Тема изменена на ${newTheme === 'dark' ? 'темную' : 'светлую'}`, 'success');
}

// ============ УТИЛИТЫ ============

// Инициализация действий с книгами
function initializeBookActions() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const isFavorite = icon.classList.contains('fas');
            
            if (isFavorite) {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showNotification('Удалено из избранного', 'info');
            } else {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showNotification('Добавлено в избранное', 'success');
            }
        });
    });
}

// Показать уведомление
function showNotification(message, type = 'info') {
    console.log('Показ уведомления:', message, type);
    
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                            type === 'error' ? 'exclamation-circle' : 
                            type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Запуск периодических обновлений
function startPeriodicUpdates() {
    setInterval(updateFriendsStatus, 30000);
    
    setInterval(async () => {
        if (document.visibilityState === 'visible' && appState.currentUser) {
            await saveReadingTime(1);
        }
    }, 60000);
}

// Обновление статуса друзей (симуляция)
function updateFriendsStatus() {
    appState.friends.forEach(friend => {
        if (Math.random() > 0.7) {
            friend.online = !friend.online;
        }
    });
    
    updateOnlineFriends();
    console.log('Статус друзей обновлен');
}

// Добавляем глобальные функции для использования в HTML
window.loadConversation = loadConversation;
window.removeFriend = removeFriend;
window.messageFriend = messageFriend;
window.sendFriendRequestToUser = sendFriendRequestToUser;
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.sendFriendRequest = sendFriendRequest;

// Добавляем стили для уведомлений
const notificationStyles = `
.notification {
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    padding: 15px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    max-width: 400px;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    border-left: 4px solid #3b82f6;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    border-left-color: #10b981;
}

.notification-error {
    border-left-color: #ef4444;
}

.notification-warning {
    border-left-color: #f59e0b;
}

.notification-info {
    border-left-color: #3b82f6;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
}

.notification-content i {
    font-size: 1.2rem;
}

.notification-success .notification-content i {
    color: #10b981;
}

.notification-error .notification-content i {
    color: #ef4444;
}

.notification-warning .notification-content i {
    color: #f59e0b;
}

.notification-info .notification-content i {
    color: #3b82f6;
}

.notification-close {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 5px;
    font-size: 1rem;
}

.notification-close:hover {
    color: #6b7280;
}
`;

const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);

console.log('MyxomorBook скрипт полностью загружен и готов к работе!');