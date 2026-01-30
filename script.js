// ===== СИСТЕМА УВЕДОМЛЕНИЙ =====
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }
    
    init() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
        
        this.addStyles();
    }
    
    addStyles() {
        const styles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            }
            
            .notification {
                padding: 16px 20px;
                border-radius: 12px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 102, 0, 0.2);
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            }
            
            .notification-success {
                background: linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(255, 102, 0, 0.9));
            }
            
            .notification-error {
                background: linear-gradient(135deg, rgba(255, 85, 0, 0.9), rgba(255, 51, 0, 0.9));
            }
            
            .notification-info {
                background: linear-gradient(135deg, rgba(255, 102, 0, 0.9), rgba(255, 153, 0, 0.9));
            }
            
            .notification-warning {
                background: linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(255, 85, 0, 0.9));
            }
            
            .notification i {
                font-size: 1.2rem;
            }
            
            .notification-content {
                flex: 1;
                font-size: 0.95rem;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <div class="notification-content">${message}</div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));
        
        if (duration > 0) {
            setTimeout(() => this.close(notification), duration);
        }
        
        return notification;
    }
    
    close(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode === this.container) {
                this.container.removeChild(notification);
            }
        }, 300);
    }
}

// ===== СИСТЕМА ПРОВЕРКИ АВТОРИЗАЦИИ =====
class AuthSystem {
    constructor() {
        this.user = null;
        this.init();
    }
    
    init() {
        this.checkAuthState();
        this.setupAuthListeners();
    }
    
    async checkAuthState() {
        const savedUser = localStorage.getItem('arescraftx_user');
        const savedToken = localStorage.getItem('arescraftx_token');
        
        if (savedUser && savedToken) {
            try {
                this.user = JSON.parse(savedUser);
                this.updateUI();
                return true;
            } catch (error) {
                console.error('Ошибка проверки сессии:', error);
                this.logout();
            }
        }
        
        return false;
    }
    
    setupAuthListeners() {
        // Обновляем кнопки авторизации
        this.updateAuthButtons();
        
        // Обработка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    updateUI() {
        if (!this.user) return;
        
        // Обновляем кнопки в шапке
        this.updateAuthButtons();
        
        // Показываем приветствие
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `Привет, ${this.user.username}!`;
            userGreeting.style.display = 'inline';
        }
        
        // Обновляем уведомление
        if (notifications && window.location.pathname.includes('index.html')) {
            notifications.show(`Добро пожаловать, ${this.user.username}! 🎮`, 'success', 3000);
        }
    }
    
    updateAuthButtons() {
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;
        
        const savedUser = localStorage.getItem('arescraftx_user');
        
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                
                authButtons.innerHTML = `
                    <div class="user-menu">
                        <button class="btn btn-primary" id="userMenuBtn">
                            <i class="fas fa-user-circle"></i> ${user.username}
                        </button>
                        <div class="user-dropdown">
                            <a href="profile.html"><i class="fas fa-user"></i> Профиль</a>
                            <a href="settings.html"><i class="fas fa-cog"></i> Настройки</a>
                            <div class="divider"></div>
                            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                        </div>
                    </div>
                `;
                
                // Инициализируем выпадающее меню
                const userMenuBtn = document.getElementById('userMenuBtn');
                const userDropdown = document.querySelector('.user-dropdown');
                
                if (userMenuBtn && userDropdown) {
                    userMenuBtn.addEventListener('click', () => {
                        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
                    });
                    
                    // Закрытие при клике вне меню
                    document.addEventListener('click', (e) => {
                        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                            userDropdown.style.display = 'none';
                        }
                    });
                }
                
                // Обработка выхода
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
            } catch (error) {
                console.error('Ошибка парсинга пользователя:', error);
                authButtons.innerHTML = `
                    <a href="auth.html" class="btn btn-primary">
                        <i class="fas fa-user-circle"></i> Войти / Регистрация
                    </a>
                `;
            }
        } else {
            authButtons.innerHTML = `
                <a href="auth.html" class="btn btn-primary">
                    <i class="fas fa-user-circle"></i> Войти / Регистрация
                </a>
            `;
        }
    }
    
    async logout() {
        // Очищаем локальное хранилище
        localStorage.removeItem('arescraftx_user');
        localStorage.removeItem('arescraftx_token');
        localStorage.removeItem('arescraftx_remember');
        
        this.user = null;
        
        // Обновляем UI
        this.updateAuthButtons();
        
        // Перенаправляем на главную
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        } else {
            // Показываем сообщение о выходе
            if (notifications) {
                notifications.show('Вы успешно вышли из системы', 'info', 3000);
            }
        }
    }
    
    async getCurrentUser() {
        if (this.user) return this.user;
        
        const savedUser = localStorage.getItem('arescraftx_user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                return this.user;
            } catch (error) {
                console.error('Ошибка получения пользователя:', error);
            }
        }
        
        return null;
    }
    
    // Метод для проверки подтверждения email
    async checkEmailVerified() {
        const user = await this.getCurrentUser();
        if (user && !user.email_confirmed) {
            if (notifications) {
                notifications.show('⚠️ Пожалуйста, подтвердите ваш email для полного доступа к функциям', 'warning', 5000);
            }
            return false;
        }
        return true;
    }
}

// ===== ПРОСТОЙ СЛАЙДЕР =====
class SimpleSlider {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.dots = document.querySelectorAll('.slider-dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentSlideEl = document.querySelector('.current-slide');
        this.totalSlidesEl = document.querySelector('.total-slides');
        
        if (this.slides.length === 0) {
            console.log('Слайды не найдены');
            return;
        }
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.interval = null;
        
        console.log(`Найдено ${this.totalSlides} слайдов`);
        
        this.init();
    }
    
    init() {
        // Показываем общее количество
        if (this.totalSlidesEl) {
            this.totalSlidesEl.textContent = this.totalSlides;
        }
        
        // Показываем первый слайд
        this.showSlide(this.currentSlide);
        
        // Вешаем обработчики
        this.setupEventListeners();
        
        // Запускаем автопрокрутку
        this.startAutoSlide();
    }
    
    setupEventListeners() {
        // Кнопки влево/вправо
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.resetAutoSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoSlide();
            });
        }
        
        // Точки навигации
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.resetAutoSlide();
            });
        });
        
        // Пауза при наведении
        const wrapper = document.querySelector('.slides-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mouseenter', () => this.stopAutoSlide());
            wrapper.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }
    
    showSlide(index) {
        // Скрываем все слайды
        this.slides.forEach(slide => {
            slide.style.display = 'none';
            slide.style.opacity = '0';
            slide.classList.remove('active');
        });
        
        // Обновляем все точки
        this.dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Показываем нужный слайд
        if (this.slides[index]) {
            this.slides[index].style.display = 'block';
            setTimeout(() => {
                this.slides[index].style.opacity = '1';
                this.slides[index].classList.add('active');
            }, 10);
        }
        
        // Активируем точку
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }
        
        // Обновляем счетчик
        if (this.currentSlideEl) {
            this.currentSlideEl.textContent = index + 1;
        }
        
        this.currentSlide = index;
    }
    
    goToSlide(index) {
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        this.showSlide(index);
    }
    
    prevSlide() {
        this.goToSlide(this.currentSlide - 1);
    }
    
    nextSlide() {
        this.goToSlide(this.currentSlide + 1);
    }
    
    startAutoSlide() {
        this.stopAutoSlide();
        this.interval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    stopAutoSlide() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
}

// ===== СИСТЕМА ПРОЕКТОВ =====
class ProjectManager {
    constructor() {
        this.projects = {
            myxomor: {
                id: 'myxomor',
                name: 'MyxomorBook',
                description: 'Современная платформа для чтения книг с искусственным интеллектом, рекомендательной системой и социальными функциями. Читайте где угодно и когда угодно.',
                status: 'development',
                features: [
                    'Поддержка всех популярных форматов',
                    'AI-рекомендации на основе ваших предпочтений',
                    'Оффлайн-чтение с синхронизацией',
                    'Социальные функции и книжные клубы',
                    'Аудиокниги и текстовый синтезатор'
                ]
            },
            aresgram: {
                id: 'aresgram',
                name: 'AresGram',
                description: 'Приватная социальная сеть нового поколения. Без рекламы, без слежки, с шифрованием сообщений и контролем над вашими данными.',
                status: 'development',
                features: [
                    'End-to-end шифрование сообщений',
                    'Режим инкогнито и самоуничтожающиеся сообщения',
                    'Stories и прямые трансляции',
                    'Создание тематических каналов и групп',
                    'Интеграция с другими проектами AresCraftX'
                ]
            },
            minecraft: {
                id: 'minecraft',
                name: 'Minecraft Сервер',
                description: 'Уникальный игровой мир с кастомными модами, мини-играми и активным сообществом. Ежедневные события, турниры и уникальные возможности.',
                status: 'available',
                features: [
                    '200+ кастомных модов и плагинов',
                    '5+ уникальных мини-игр',
                    'Система экономики и магазин',
                    'Защита территории и клановые войны',
                    'Поддержка Java и Bed Edition'
                ]
            },
            launcher: {
                id: 'launcher',
                name: 'AresCraftX Launcher',
                description: 'Универсальный лаунчер для всех проектов экосистемы. Автоматические обновления, облачные сохранения и оптимизация ресурсов.',
                status: 'beta',
                features: [
                    'Автоматические обновления всех проектов',
                    'Облачные сохранения игрового прогресса',
                    'Менеджер модов с одним кликом',
                    'Оптимизация для слабых ПК',
                    'Ночной режим и кастомные темы'
                ]
            }
        };
        
        this.modal = null;
    }
    
    openProject(projectId) {
        const project = this.projects[projectId];
        if (!project) {
            notifications.show('Проект не найден', 'error');
            return;
        }
        
        this.showProjectModal(project);
    }
    
    showProjectModal(project) {
        this.closeProjectModal();
        
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = this.getModalHTML(project);
        
        document.body.appendChild(this.modal);
        this.modal.style.display = 'flex';
        
        this.setupModalHandlers(project);
        document.body.style.overflow = 'hidden';
    }
    
    getModalHTML(project) {
        const statusText = {
            development: '🚧 В разработке',
            available: '✅ Доступно',
            beta: '🔄 Бета-версия'
        };
        
        const statusClass = {
            development: 'coming-soon',
            available: 'available',
            beta: 'beta'
        };
        
        return `
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-rocket"></i> ${project.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="project-status ${statusClass[project.status]}">
                        ${statusText[project.status]}
                    </div>
                    
                    <p>${project.description}</p>
                    
                    <div class="project-features mt-30">
                        <h3><i class="fas fa-star"></i> Ключевые особенности:</h3>
                        <ul>
                            ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="project-actions mt-30">
                        <button class="btn btn-primary" data-action="more-info">
                            <i class="fas fa-info-circle"></i> Подробнее
                        </button>
                        <button class="btn btn-secondary" data-action="notify">
                            <i class="fas fa-bell"></i> Уведомить о запуске
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupModalHandlers(project) {
        const closeBtn = this.modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => this.closeProjectModal());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeProjectModal();
            }
        });
        
        const actionBtns = this.modal.querySelectorAll('.project-actions .btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleProjectAction(project, action);
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProjectModal();
            }
        });
    }
    
    handleProjectAction(project, action) {
        switch (action) {
            case 'more-info':
                notifications.show(`Дополнительная информация о "${project.name}" скоро будет доступна!`, 'info');
                break;
            case 'notify':
                notifications.show(`Мы уведомим вас о запуске "${project.name}"!`, 'success');
                break;
        }
    }
    
    closeProjectModal() {
        if (this.modal) {
            this.modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (this.modal.parentNode) {
                    this.modal.parentNode.removeChild(this.modal);
                }
                this.modal = null;
                document.body.style.overflow = '';
            }, 300);
        }
    }
}

// ===== СИСТЕМА АНИМАЦИЙ =====
class AnimationSystem {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateNumber(entry.target);
                    }
                }
            });
        }, options);
    }
    
    observe(elements) {
        elements.forEach(el => {
            if (el) this.observer.observe(el);
        });
    }
    
    animateNumber(element) {
        const value = element.textContent;
        if (value === '∞' || value.includes('+')) return;
        
        const finalValue = parseInt(value);
        if (isNaN(finalValue)) return;
        
        element.style.opacity = '0';
        
        setTimeout(() => {
            let current = 0;
            const increment = finalValue / 50;
            const duration = 1000;
            const stepTime = duration / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalValue) {
                    clearInterval(timer);
                    element.textContent = value;
                } else {
                    element.textContent = Math.floor(current);
                }
                element.style.opacity = '1';
            }, stepTime);
        }, 300);
    }
}

// ===== ФОРМЫ =====
class FormManager {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.init();
    }
    
    init() {
        this.setupNewsletterForm();
        this.setupQuickButtons();
    }
    
    setupNewsletterForm() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!this.validateEmail(email)) {
                notifications.show('Введите корректный email адрес', 'error');
                return;
            }
            
            notifications.show('Спасибо за подписку!', 'success');
            emailInput.value = '';
        });
    }
    
    setupQuickButtons() {
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const projectId = btn.dataset.project;
                if (projectId && projectManager) {
                    projectManager.openProject(projectId);
                }
            });
        });
        
        const projectButtons = document.querySelectorAll('.project-card .btn-secondary');
        projectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = btn.closest('.project-card');
                const title = card.querySelector('h3').textContent.toLowerCase();
                
                let projectId = '';
                if (title.includes('myxomor')) projectId = 'myxomor';
                else if (title.includes('aresgram')) projectId = 'aresgram';
                else if (title.includes('minecraft')) projectId = 'minecraft';
                else if (title.includes('launcher')) projectId = 'launcher';
                
                if (projectId && projectManager) {
                    projectManager.openProject(projectId);
                }
            });
        });
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
class AresCraftXApp {
    constructor() {
        this.slider = null;
        this.projectManager = null;
        this.animationSystem = null;
        this.formManager = null;
        this.authSystem = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMLoaded());
        } else {
            this.onDOMLoaded();
        }
    }
    
    onDOMLoaded() {
        console.log('AresCraftX App загружен!');
        
        // Инициализация систем
        this.authSystem = new AuthSystem();
        this.projectManager = new ProjectManager();
        this.animationSystem = new AnimationSystem();
        this.formManager = new FormManager(this.authSystem);
        
        // Инициализация слайдера
        this.initSlider();
        
        // Настройка вкладок "О нас"
        this.setupAboutTabs();
        
        // Настройка плавной прокрутки
        this.setupSmoothScroll();
        
        // Наблюдение за анимациями
        this.setupAnimations();
        
        // Проверка состояния авторизации
        setTimeout(() => {
            this.authSystem.checkAuthState().then(isAuthenticated => {
                if (isAuthenticated) {
                    this.showWelcomeMessage();
                    // Проверяем email
                    this.authSystem.checkEmailVerified();
                }
            });
        }, 1000);
    }
    
    initSlider() {
        // Проверяем наличие элементов слайдера
        const hasSlider = document.querySelector('.slides-track') !== null;
        
        if (hasSlider) {
            this.slider = new SimpleSlider();
            console.log('Слайдер инициализирован');
            
            // Проверяем работу
            setTimeout(() => {
                if (this.slider && this.slider.slides) {
                    console.log(`Слайдер работает: ${this.slider.slides.length} слайдов`);
                }
            }, 100);
        } else {
            console.log('Слайдер не найден на странице');
        }
    }
    
    setupAboutTabs() {
        const tabs = document.querySelectorAll('.about-tab');
        const panels = document.querySelectorAll('.about-panel');
        
        if (tabs.length === 0) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const panel = document.getElementById(`${tabId}-panel`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });
    }
    
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupAnimations() {
        const elementsToAnimate = document.querySelectorAll(
            '.project-card, .feature-card, .team-member, .faq-item, .stat-card, .contact-card'
        );
        
        this.animationSystem.observe(elementsToAnimate);
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            if (notifications) {
                notifications.show('Добро пожаловать в AresCraftX! 🚀', 'info', 3000);
            }
        }, 1000);
    }
}

// ===== ГЛОБАЛЬНЫЕ ЭКСПОРТЫ =====
let app = null;
let notifications = null;
let projectManager = null;
let authSystem = null;
// ===== ПЕРЕХОД В ПРОЕКТЫ =====

// Переход в MyxomorBook
window.goToMyxomorBook = async function() {
    console.log('Переход в MyxomorBook...');
    
    // 1. Проверяем авторизацию
    const savedUser = localStorage.getItem('arescraftx_user');
    const savedToken = localStorage.getItem('arescraftx_token');
    
    if (!savedUser || !savedToken) {
        // Если не авторизован - на страницу входа
        showNotification('Сначала войдите в аккаунт', 'warning');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 1500);
        return;
    }
    
    // 2. Проверяем, подтвержден ли email
    try {
        const userData = JSON.parse(savedUser);
        if (!userData.email_confirmed) {
            showNotification('Подтвердите email перед доступом к проектам', 'warning');
            setTimeout(() => {
                window.location.href = 'verify-email.html';
            }, 1500);
            return;
        }
    } catch (error) {
        console.error('Ошибка проверки email:', error);
    }
    
    // 3. Показываем сообщение о переходе
    showNotification('Переходим в MyxomorBook...', 'info');
    
    // 4. Ждем 1 секунду и переходим НА СТРАНИЦУ ЗАГРУЗКИ
    setTimeout(() => {
        window.location.href = 'loading.html?project=myxomorbook';
    }, 1000);
};
// Переход в другие проекты (можно добавить позже)
window.goToAresGram = function() {
    showNotification('AresGram скоро будет доступен!', 'info');
};

window.goToMinecraft = function() {
    showNotification('Minecraft сервер скоро будет доступен!', 'info');
};

window.goToLauncher = function() {
    showNotification('Лаунчер скоро будет доступен!', 'info');
};
window.openProject = function(projectId) {
    if (projectManager) {
        projectManager.openProject(projectId);
    }
};

window.showNotification = function(message, type = 'info') {
    if (notifications) {
        notifications.show(message, type);
    }
};

window.getCurrentUser = async function() {
    if (authSystem) {
        return await authSystem.getCurrentUser();
    }
    return null;
};

window.logout = function() {
    if (authSystem) {
        authSystem.logout();
    }
};

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
window.addEventListener('load', () => {
    // Инициализация системы уведомлений первой
    notifications = new NotificationSystem();
    
    // Запуск основного приложения
    app = new AresCraftXApp();
    projectManager = app.projectManager;
    authSystem = app.authSystem;
    
    console.log('%c AresCraftX %c Упрощенная система %c', 
        'background: #ff6600; color: white; padding: 5px 10px; border-radius: 4px;',
        'background: #000; color: #ff6600; padding: 5px 10px; border-radius: 4px;',
        ''
    );
});

// ===== ОБРАБОТКА ОШИБОК =====
window.addEventListener('error', (e) => {
    console.error('AresCraftX Error:', e.error);
    if (notifications) {
        notifications.show('Произошла ошибка. Пожалуйста, обновите страницу.', 'error');
    }
});

// ===== ПРОСТАЯ ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА =====
// Эта функция запускается всегда, даже если основной скрипт не сработал
(function() {
    console.log('Запуск резервного слайдера...');
    
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (slides.length === 0) {
        console.log('Слайды не найдены');
        return;
    }
    
    console.log(`Найдено ${slides.length} слайдов`);
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Показываем первый слайд
    showSlide(currentSlide);
    
    function showSlide(index) {
        // Скрываем все слайды
        slides.forEach(slide => {
            slide.style.opacity = '0';
            slide.style.display = 'none';
        });
        
        // Показываем текущий слайд
        if (slides[index]) {
            slides[index].style.display = 'block';
            setTimeout(() => {
                slides[index].style.opacity = '1';
                slides[index].style.transition = 'opacity 0.5s ease';
            }, 10);
        }
        
        currentSlide = index;
    }
    
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= totalSlides) next = 0;
        showSlide(next);
    }
    
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) prev = totalSlides - 1;
        showSlide(prev);
    }
    
    // Обработчики кнопок
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
        console.log('Кнопка "Назад" подключена');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
        console.log('Кнопка "Вперед" подключена');
    }
    
    // Автопрокрутка
    setInterval(nextSlide, 5000);
    
    console.log('Резервный слайдер запущен');
})();