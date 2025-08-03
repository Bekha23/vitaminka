// Глобальные переменные
let cartCount = 0;
let cartItems = [];
let currentUser = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    loadUserData();
    initializeProfileTabs();
    initializeForms();
    updateCartCount();
    checkAuthentication();
    checkUserAuth();
    initializeAuthForms();
});

// Проверка аутентификации
function checkAuthentication() {
    const user = localStorage.getItem('freshMarketUser');
    if (!user) {
        // Если пользователь не авторизован, перенаправляем на главную
        window.location.href = 'index.html';
        return;
    }
    currentUser = JSON.parse(user);
    updateProfileDisplay();
}

// Загрузка корзины из localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('freshMarketCart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    }
}

// Сохранение корзины в localStorage
function saveCartToStorage() {
    localStorage.setItem('freshMarketCart', JSON.stringify(cartItems));
}

// Загрузка данных пользователя
function loadUserData() {
    const user = localStorage.getItem('freshMarketUser');
    if (user) {
        currentUser = JSON.parse(user);
    }
}

// Обновление отображения профиля
function updateProfileDisplay() {
    if (!currentUser) return;

    // Обновляем информацию в профиле
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');
    
    if (profileName) {
        profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }

    // Заполняем форму профиля
    const form = document.getElementById('profileForm');
    if (form) {
        form.querySelector('input[name="firstName"]').value = currentUser.firstName || '';
        form.querySelector('input[name="lastName"]').value = currentUser.lastName || '';
        form.querySelector('input[name="email"]').value = currentUser.email || '';
        form.querySelector('input[name="phone"]').value = currentUser.phone || '';
        form.querySelector('input[name="birthDate"]').value = currentUser.birthDate || '';
        form.querySelector('select[name="gender"]').value = currentUser.gender || '';
    }
}

// Инициализация табов профиля
function initializeProfileTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Инициализация форм
function initializeForms() {
    // Форма профиля
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileData();
        });
    }

    // Форма пароля
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Фильтр заказов
    const orderFilter = document.getElementById('orderStatusFilter');
    if (orderFilter) {
        orderFilter.addEventListener('change', function() {
            filterOrders(this.value);
        });
    }
}

// Сохранение данных профиля
function saveProfileData() {
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    
    const updatedUser = {
        ...currentUser,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        birthDate: formData.get('birthDate'),
        gender: formData.get('gender')
    };

    // Сохраняем в localStorage
    localStorage.setItem('freshMarketUser', JSON.stringify(updatedUser));
    currentUser = updatedUser;
    
    // Обновляем отображение
    updateProfileDisplay();
    
    showNotification('Профиль успешно обновлен!');
}

// Изменение пароля
function changePassword() {
    const form = document.getElementById('passwordForm');
    const formData = new FormData(form);
    
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // Проверяем текущий пароль
    if (currentPassword !== currentUser.password) {
        showNotification('Неверный текущий пароль');
        return;
    }

    // Проверяем совпадение паролей
    if (newPassword !== confirmPassword) {
        showNotification('Пароли не совпадают');
        return;
    }

    // Проверяем длину пароля
    if (newPassword.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов');
        return;
    }

    // Обновляем пароль
    currentUser.password = newPassword;
    localStorage.setItem('freshMarketUser', JSON.stringify(currentUser));
    
    form.reset();
    showNotification('Пароль успешно изменен!');
}

// Фильтрация заказов
function filterOrders(status) {
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const orderStatus = item.querySelector('.order-status').textContent.toLowerCase();
        
        if (status === 'all' || orderStatus.includes(status)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Просмотр деталей заказа
function viewOrderDetails(orderId) {
    // В реальном проекте здесь была бы страница с деталями заказа
    showNotification(`Детали заказа #${orderId} будут показаны в отдельном окне`);
}

// Удаление из избранного
function removeFromFavorites(productId) {
    const favoriteItem = document.querySelector(`[onclick="removeFromFavorites('${productId}')"]`).closest('.favorite-item');
    favoriteItem.style.animation = 'slideOut 0.3s ease';
    
    setTimeout(() => {
        favoriteItem.remove();
        showNotification('Товар удален из избранного');
    }, 300);
}

// Очистка избранного
function clearFavorites() {
    if (confirm('Вы уверены, что хотите очистить избранное?')) {
        const favoritesGrid = document.querySelector('.favorites-grid');
        favoritesGrid.innerHTML = '<p class="empty-favorites">Избранное пусто</p>';
        showNotification('Избранное очищено');
    }
}

// Добавление в корзину из избранного
function addToCartFromFavorites(productId) {
    const productMap = {
        'apple': { name: 'Яблоки Голден', price: '150 ₽' },
        'strawberry': { name: 'Клубника', price: '350 ₽' },
        'carrot': { name: 'Морковь', price: '80 ₽' }
    };

    const product = productMap[productId];
    if (product) {
        addToCart(product.name, product.price);
        showNotification(`${product.name} добавлен в корзину!`);
    }
}

// Добавление товара в корзину
function addToCart(name, price) {
    const existingItem = cartItems.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ name, price, quantity: 1 });
    }
    
    cartCount++;
    saveCartToStorage();
    updateCartCount();
}

// Добавление нового адреса
function addNewAddress() {
    const addressName = prompt('Название адреса (например: Дом, Работа):');
    if (!addressName) return;
    
    const addressStreet = prompt('Улица и номер дома:');
    if (!addressStreet) return;
    
    const addressCity = prompt('Город:');
    if (!addressCity) return;
    
    const addressZip = prompt('Почтовый индекс:');
    if (!addressZip) return;

    const addressesList = document.querySelector('.addresses-list');
    const newAddress = document.createElement('div');
    newAddress.className = 'address-item';
    newAddress.innerHTML = `
        <div class="address-info">
            <h3>${addressName}</h3>
            <p>${addressStreet}</p>
            <p>${addressCity}, ${addressZip}</p>
        </div>
        <div class="address-actions">
            <button class="btn btn-secondary" onclick="editAddress('${addressName.toLowerCase()}')">Изменить</button>
            <button class="btn btn-danger" onclick="deleteAddress('${addressName.toLowerCase()}')">Удалить</button>
        </div>
    `;
    
    addressesList.appendChild(newAddress);
    showNotification('Адрес успешно добавлен!');
}

// Редактирование адреса
function editAddress(addressId) {
    showNotification('Функция редактирования адреса будет доступна в следующем обновлении');
}

// Удаление адреса
function deleteAddress(addressId) {
    if (confirm('Вы уверены, что хотите удалить этот адрес?')) {
        const addressItem = document.querySelector(`[onclick="deleteAddress('${addressId}')"]`).closest('.address-item');
        addressItem.style.animation = 'slideOut 0.3s ease';
        
        setTimeout(() => {
            addressItem.remove();
            showNotification('Адрес удален');
        }, 300);
    }
}

// Удаление аккаунта
function deleteAccount() {
    if (confirm('ВНИМАНИЕ! Это действие нельзя отменить. Вы уверены, что хотите удалить аккаунт?')) {
        if (confirm('Последнее предупреждение. Удалить аккаунт?')) {
            localStorage.removeItem('freshMarketUser');
            localStorage.removeItem('freshMarketCart');
            showNotification('Аккаунт удален. Перенаправление на главную страницу...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
}

// Переключение пользовательского меню
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Выход из аккаунта
function logout() {
    localStorage.removeItem('freshMarketUser');
    showNotification('Вы вышли из аккаунта');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Обновление счетчика корзины
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    cartCountElement.textContent = cartCount;
}

// Функция для открытия корзины
function openCart() {
    window.location.href = 'cart.html';
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4a7c59;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Закрытие пользовательского меню при клике вне его
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Анимация появления элементов при скролле
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.profile-card, .order-item, .favorite-item, .address-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Инициализация анимаций
initializeAnimations();

// Функции авторизации
function checkUserAuth() {
    const user = localStorage.getItem('freshMarketUser');
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');

    if (user) {
        // Пользователь авторизован
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    } else {
        // Пользователь не авторизован
        if (loginBtn) loginBtn.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function initializeAuthForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
}

function handleLogin() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    const email = formData.get('email');
    const password = formData.get('password');

    // В реальном проекте здесь была бы проверка через API
    // Для демонстрации используем простую проверку
    if (email === 'ivan@example.com' && password === '123456') {
        // Успешный вход
        const user = {
            firstName: 'Иван',
            lastName: 'Иванов',
            email: email,
            phone: '+7 (999) 123-45-67',
            password: password
        };

        localStorage.setItem('freshMarketUser', JSON.stringify(user));
        closeLoginModal();
        checkUserAuth();
        showNotification('Успешный вход в аккаунт!');
    } else {
        showNotification('Неверный email или пароль');
    }
}

function handleRegister() {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);

    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Проверка паролей
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов');
        return;
    }

    // Создание нового пользователя
    const user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password
    };

    localStorage.setItem('freshMarketUser', JSON.stringify(user));
    closeRegisterModal();
    checkUserAuth();
    showNotification('Регистрация успешна! Добро пожаловать!');
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('show');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
    document.getElementById('loginForm').reset();
}

function showRegisterModal() {
    closeLoginModal();
    const modal = document.getElementById('registerModal');
    modal.classList.add('show');
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.classList.remove('show');
    document.getElementById('registerForm').reset();
}

// Закрытие модальных окон при клике вне их
document.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const userMenu = document.querySelector('.user-menu');
    const userDropdown = document.getElementById('userDropdown');

    // Закрытие модальных окон
    if (loginModal && event.target === loginModal) {
        closeLoginModal();
    }

    if (registerModal && event.target === registerModal) {
        closeRegisterModal();
    }

    // Закрытие пользовательского меню
    if (userMenu && !userMenu.contains(event.target)) {
        userDropdown.classList.remove('show');
    }
}); 