// Конфигурация Supabase
const SUPABASE_URL_AUTH = 'https://vclifktmbyaxwybpakgv.supabase.co';
const SUPABASE_ANON_KEY_AUTH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbGlma3RtYnlheHd5YnBha2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NjM0OTgsImV4cCI6MjA4NTMzOTQ5OH0.pOyne6Hs71mUe12_lx0a4go_PmGisVXpDPbDK0nwwro';

// Инициализация Supabase клиента
let supabaseAuthClient = null;

// Инициализация Supabase при загрузке
function initSupabaseAuth() {
    if (window.supabase) {
        supabaseAuthClient = window.supabase.createClient(SUPABASE_URL_AUTH, SUPABASE_ANON_KEY_AUTH);
        console.log('Supabase Auth клиент инициализирован');
        
        // Проверяем, было ли подтверждение email
        checkEmailConfirmation();
    } else {
        console.error('Supabase SDK не загружен');
    }
}

// Проверка подтверждения email из URL
function checkEmailConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const token = urlParams.get('token');
    
    if (type === 'signup' && token) {
        showMessage('success', '✅ Email успешно подтвержден! Теперь вы можете войти в свой аккаунт.');
        
        // Убираем параметры из URL
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
    }
}

// Функция для проверки статуса email пользователя
async function checkEmailVerificationStatus(userId) {
    try {
        if (!supabaseAuthClient) return false;
        
        const { data: user, error } = await supabaseAuthClient.auth.getUser();
        if (error) throw error;
        
        return user.user?.email_confirmed_at !== null;
    } catch (error) {
        console.error('Ошибка проверки email:', error);
        return false;
    }
}

// Проверка авторизации при загрузке
function checkAuth() {
    const savedUser = localStorage.getItem('arescraftx_user');
    const savedToken = localStorage.getItem('arescraftx_token');
    
    if (savedUser && savedToken) {
        if (!window.location.pathname.includes('index.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Supabase
    initSupabaseAuth();
    
    // Проверка авторизации
    checkAuth();
    
    // Переключение между вкладками
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Удаляем активный класс у всех вкладок и форм
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке и форме
            this.classList.add('active');
            document.querySelector(`[data-form="${tabId}"]`).classList.add('active');
        });
    });
    
    // Валидация пароля при регистрации
    const passwordInput = document.getElementById('regPassword');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Проверка длины
            if (password.length >= 8) strength += 25;
            if (password.length >= 12) strength += 25;
            
            // Проверка наличия символов разного типа
            if (/[a-z]/.test(password)) strength += 20;
            if (/[A-Z]/.test(password)) strength += 20;
            if (/[0-9]/.test(password)) strength += 10;
            if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
            
            // Ограничиваем максимальную силу
            strength = Math.min(strength, 100);
            
            // Обновляем индикатор
            strengthFill.style.width = `${strength}%`;
            
            // Обновляем текст
            if (strength < 40) {
                strengthText.textContent = 'Сложность: низкая';
                strengthFill.style.background = 'linear-gradient(to right, #ff3300, #ff6600)';
            } else if (strength < 70) {
                strengthText.textContent = 'Сложность: средняя';
                strengthFill.style.background = 'linear-gradient(to right, #ff6600, #ff9900)';
            } else {
                strengthText.textContent = 'Сложность: высокая';
                strengthFill.style.background = 'linear-gradient(to right, #00aa00, #00cc66)';
            }
        });
    }
    
    // Обработка формы входа
    document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        // Валидация
        if (!username || !password) {
            showMessage('error', 'Пожалуйста, заполните все поля');
            return;
        }
        
        showMessage('info', 'Выполняется вход...');
        
        try {
            if (!supabaseAuthClient) {
                throw new Error('Supabase клиент не инициализирован');
            }
            
            // Определяем, что ввел пользователь: email или username
            const isEmail = username.includes('@');
            
            let userData;
            
            if (isEmail) {
                // Вход по email
                const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
                    email: username,
                    password: password
                });
                
                if (error) throw error;
                userData = data.user;
            } else {
                // Вход по username - нужно найти пользователя по username
                const { data: userDataResult, error: fetchError } = await supabaseAuthClient
                    .from('profiles')
                    .select('email')
                    .eq('username', username)
                    .single();
                
                if (fetchError) throw new Error('Пользователь не найден');
                
                // Затем выполняем вход по email
                const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
                    email: userDataResult.email,
                    password: password
                });
                
                if (error) throw error;
                userData = data.user;
            }
            
            // Проверяем, подтвержден ли email
            if (!userData.email_confirmed_at) {
                showMessage('warning', '⚠️ Email не подтвержден. Проверьте вашу почту и подтвердите email перед входом.');
                return;
            }
            
            // Получаем профиль пользователя
            const { data: profile, error: profileError } = await supabaseAuthClient
                .from('profiles')
                .select('username')
                .eq('id', userData.id)
                .single();
            
            if (profileError) {
                console.warn('Не удалось получить профиль:', profileError);
            }
            
            // Сохраняем данные пользователя
            const userToSave = {
                id: userData.id,
                email: userData.email,
                username: profile?.username || username.includes('@') ? userData.email.split('@')[0] : username,
                email_confirmed: userData.email_confirmed_at !== null
            };
            
            localStorage.setItem('arescraftx_user', JSON.stringify(userToSave));
            localStorage.setItem('arescraftx_token', userData.id);
            
            if (rememberMe) {
                localStorage.setItem('arescraftx_remember', 'true');
            }
            
            showMessage('success', '✅ Вход выполнен успешно! Перенаправляем...');
            
            // Через 2 секунды редирект на главную
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка входа:', error);
            
            let errorMessage = 'Неверный логин или пароль';
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Неверный логин или пароль';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = '❌ Email не подтвержден. Проверьте вашу почту и подтвердите регистрацию.';
            } else if (error.message.includes('User not found')) {
                errorMessage = 'Пользователь не найден';
            } else if (error.message.includes('Supabase клиент')) {
                errorMessage = 'Ошибка инициализации системы';
            }
            
            showMessage('error', errorMessage);
        }
    });
    
    // Обработка формы регистрации
    document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const termsAgree = document.getElementById('termsAgree').checked;
        const newsletter = document.getElementById('newsletter')?.checked || false;
        
        // Валидация
        if (!username || !email || !password || !passwordConfirm) {
            showMessage('error', 'Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        if (!termsAgree) {
            showMessage('error', 'Необходимо согласиться с условиями использования');
            return;
        }
        
        if (password !== passwordConfirm) {
            showMessage('error', 'Пароли не совпадают');
            return;
        }
        
        if (password.length < 8) {
            showMessage('error', 'Пароль должен содержать минимум 8 символов');
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            showMessage('error', 'Имя пользователя должно быть от 3 до 20 символов');
            return;
        }
        
        // Проверка формата email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('error', 'Введите корректный email адрес');
            return;
        }
        
        showMessage('info', 'Регистрируем ваш аккаунт...');
        
        try {
            if (!supabaseAuthClient) {
                throw new Error('Supabase клиент не инициализирован');
            }
            
            // 1. Регистрация в Supabase Auth
            const { data: authData, error: authError } = await supabaseAuthClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        newsletter_subscribed: newsletter
                    },
                    emailRedirectTo: `${window.location.origin}/auth.html`
                }
            });
            
            if (authError) throw authError;
            
            if (!authData.user) {
                throw new Error('Не удалось создать пользователя');
            }
            
            // 2. Показываем сообщение о подтверждении email
            const confirmationDiv = document.createElement('div');
            confirmationDiv.className = 'email-confirmation-message';
            confirmationDiv.innerHTML = `
                <div style="
                    background: rgba(255, 102, 0, 0.1);
                    border: 2px solid #ff6600;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: center;
                ">
                    <h3 style="color: #ff6600; margin-bottom: 10px;">
                        <i class="fas fa-envelope"></i> Подтверждение email
                    </h3>
                    <p style="color: white; margin-bottom: 15px;">
                        ✅ Регистрация успешна!<br>
                        📧 На вашу почту <strong>${email}</strong> отправлено письмо с подтверждением.
                    </p>
                    <p style="color: #aaa; font-size: 14px;">
                        <i class="fas fa-exclamation-circle"></i> 
                        Пожалуйста, проверьте почту и перейдите по ссылке в письме, чтобы активировать аккаунт.
                    </p>
                    <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                        <button onclick="resendConfirmationEmail('${email}')" style="
                            background: #ff6600;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            <i class="fas fa-redo"></i> Отправить письмо повторно
                        </button>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: transparent;
                            color: #aaa;
                            border: 1px solid #aaa;
                            padding: 8px 16px;
                            border-radius: 5px;
                            cursor: pointer;
                        ">
                            Закрыть
                        </button>
                    </div>
                </div>
            `;
            
            // Вставляем сообщение после формы
            const registerForm = document.getElementById('registerForm');
            registerForm.parentNode.insertBefore(confirmationDiv, registerForm.nextSibling);
            
            // Сбрасываем форму
            registerForm.reset();
            
            // Показываем успешное сообщение
            showMessage('success', 'Регистрация успешна! Проверьте вашу почту для подтверждения.');
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            
            let errorMessage = 'Ошибка при регистрации';
            if (error.message.includes('User already registered')) {
                errorMessage = 'Пользователь с таким email уже существует';
            } else if (error.message.includes('username уже занято')) {
                errorMessage = 'Имя пользователя уже занято';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Неверный формат email';
            } else if (error.message.includes('Password')) {
                errorMessage = 'Пароль слишком слабый';
            } else if (error.message.includes('duplicate key')) {
                if (error.message.includes('username')) {
                    errorMessage = 'Имя пользователя уже занято';
                } else if (error.message.includes('email')) {
                    errorMessage = 'Email уже зарегистрирован';
                }
            } else if (error.message.includes('Supabase клиент')) {
                errorMessage = 'Ошибка инициализации системы';
            }
            
            showMessage('error', errorMessage);
        }
    });
    
    // Обработка социальной авторизации
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const provider = this.classList.contains('google') ? 'google' :
                           this.classList.contains('discord') ? 'discord' : 
                           this.classList.contains('vk') ? 'vk' : null;
            
            if (!provider || !supabaseAuthClient) return;
            
            showMessage('info', `Перенаправляем на авторизацию через ${provider}...`);
            
            try {
                const { data, error } = await supabaseAuthClient.auth.signInWithOAuth({
                    provider: provider,
                    options: {
                        redirectTo: `${window.location.origin}/index.html`
                    }
                });
                
                if (error) throw error;
                
            } catch (error) {
                console.error('Ошибка социальной авторизации:', error);
                showMessage('error', 'Ошибка при авторизации через социальную сеть');
            }
        });
    });
    
    // Кнопка "Забыли пароль?"
    document.querySelector('.forgot-password')?.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername')?.value.trim();
        
        if (!username) {
            const email = prompt('Введите ваш email для восстановления пароля:');
            if (email && supabaseAuthClient) {
                await resetPassword(email);
            }
        } else {
            // Определяем, что ввел пользователь: email или username
            const isEmail = username.includes('@');
            
            if (isEmail) {
                await resetPassword(username);
            } else {
                // Нужно найти email по username
                try {
                    if (!supabaseAuthClient) {
                        showMessage('error', 'Система не инициализирована');
                        return;
                    }
                    
                    const { data: userData, error } = await supabaseAuthClient
                        .from('profiles')
                        .select('email')
                        .eq('username', username)
                        .single();
                    
                    if (error) {
                        showMessage('error', 'Пользователь не найден');
                        return;
                    }
                    
                    await resetPassword(userData.email);
                } catch (error) {
                    console.error('Ошибка поиска пользователя:', error);
                    showMessage('error', 'Ошибка при поиске пользователя');
                }
            }
        }
    });
    
    // Функция сброса пароля
    async function resetPassword(email) {
        try {
            if (!supabaseAuthClient) {
                showMessage('error', 'Система не инициализирована');
                return;
            }
            
            const { error } = await supabaseAuthClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth.html?action=reset-password`
            });
            
            if (error) throw error;
            
            showMessage('success', `📧 Инструкции по сбросу пароля отправлены на ${email}`);
        } catch (error) {
            console.error('Ошибка сброса пароля:', error);
            showMessage('error', 'Ошибка при отправке инструкций по сбросу пароля');
        }
    }
    
    // Функция показа сообщений
    function showMessage(type, text) {
        // Удаляем предыдущие сообщения
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Создаем новое сообщение
        const message = document.createElement('div');
        message.className = `auth-message auth-message-${type}`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' :
                              type === 'warning' ? 'exclamation-triangle' :
                              'info-circle'}"></i>
            <span>${text}</span>
        `;
        
        // Добавляем стили
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0, 170, 0, 0.9)' : 
                        type === 'error' ? 'rgba(255, 51, 0, 0.9)' : 
                        type === 'warning' ? 'rgba(255, 153, 0, 0.9)' :
                        'rgba(255, 102, 0, 0.9)'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(message);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }
    
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        .email-confirmation-message {
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Глобальная функция для повторной отправки письма подтверждения
window.resendConfirmationEmail = async function(email) {
    if (!supabaseAuthClient) {
        showMessage('error', 'Система не инициализирована');
        return;
    }
    
    try {
        const { error } = await supabaseAuthClient.auth.resend({
            type: 'signup',
            email: email
        });
        
        if (error) throw error;
        
        showMessage('success', '📧 Письмо с подтверждением отправлено повторно!');
    } catch (error) {
        console.error('Ошибка повторной отправки:', error);
        showMessage('error', 'Ошибка при отправке письма');
    }
};

// Проверка статуса подтверждения email
window.checkEmailStatus = async function() {
    const savedUser = localStorage.getItem('arescraftx_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const isVerified = await checkEmailVerificationStatus(user.id);
            
            if (!isVerified) {
                showMessage('warning', '⚠️ Ваш email не подтвержден. Проверьте почту.');
            }
        } catch (error) {
            console.error('Ошибка проверки статуса email:', error);
        }
    }
};
