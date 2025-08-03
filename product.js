// Глобальные переменные
let cartCount = 0;
let cartItems = [];
let currentQuantity = 1;
let selectedWeight = 1;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    initializeProductGallery();
    initializeTabs();
    initializeQuantitySelector();
    initializeWeightSelector();
    updateCartCount();
    checkUserAuth();
    initializeAuthForms();
});

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

// Инициализация галереи товара
function initializeProductGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image .product-emoji-large');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Убираем активный класс со всех миниатюр
            thumbnails.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс к выбранной миниатюре
            this.classList.add('active');
            
            // Обновляем главное изображение
            const emoji = this.getAttribute('data-image');
            mainImage.textContent = emoji;
        });
    });
}

// Инициализация табов
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и панели
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Инициализация селектора количества
function initializeQuantitySelector() {
    const quantityInput = document.getElementById('quantity');
    
    quantityInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (value < 1) {
            this.value = 1;
            currentQuantity = 1;
        } else if (value > 50) {
            this.value = 50;
            currentQuantity = 50;
        } else {
            currentQuantity = value;
        }
    });
}

// Изменение количества
function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    let newQuantity = currentQuantity + delta;
    
    if (newQuantity < 1) {
        newQuantity = 1;
    } else if (newQuantity > 50) {
        newQuantity = 50;
    }
    
    currentQuantity = newQuantity;
    quantityInput.value = newQuantity;
}

// Инициализация селектора веса
function initializeWeightSelector() {
    const weightButtons = document.querySelectorAll('.weight-btn');
    
    weightButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс со всех кнопок
            weightButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к выбранной кнопке
            this.classList.add('active');
            
            // Обновляем выбранный вес
            selectedWeight = parseInt(this.getAttribute('data-weight'));
        });
    });
}

// Добавление товара в корзину со страницы товара
function addToCartFromProduct() {
    const productName = "Яблоки Голден";
    const productPrice = "150 ₽";
    const totalQuantity = currentQuantity * selectedWeight;
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cartItems.find(item => item.name === productName);
    
    if (existingItem) {
        existingItem.quantity += totalQuantity;
    } else {
        cartItems.push({ 
            name: productName, 
            price: productPrice, 
            quantity: totalQuantity 
        });
    }
    
    cartCount += totalQuantity;
    saveCartToStorage();
    updateCartCount();
    
    // Анимация кнопки
    const addButton = document.querySelector('.add-to-cart-large');
    const originalText = addButton.innerHTML;
    addButton.innerHTML = '<span class="cart-icon">✅</span> Добавлено!';
    addButton.style.background = '#28a745';
    
    setTimeout(() => {
        addButton.innerHTML = originalText;
        addButton.style.background = '#4a7c59';
    }, 2000);
    
    // Показываем уведомление
    showNotification(`${productName} (${totalQuantity} кг) добавлен в корзину!`);
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
    
    // Показываем уведомление
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

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
    
    // Наблюдаем за элементами для анимации
    const animatedElements = document.querySelectorAll('.product-details, .product-tabs, .related-products');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Инициализация анимаций
initializeAnimations();

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    // Пересчитываем позиции для анимаций
    initializeAnimations();
});

// Добавляем эффект параллакса для изображения товара
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const productGallery = document.querySelector('.product-gallery');
    
    if (productGallery) {
        const speed = 0.5;
        productGallery.style.transform = `translateY(${scrolled * speed}px)`;
    }
});

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

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

function logout() {
    localStorage.removeItem('freshMarketUser');
    checkUserAuth();
    showNotification('Вы вышли из аккаунта');
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