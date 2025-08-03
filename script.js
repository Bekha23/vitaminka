// Глобальные переменные
let cartCount = 0;
let cartItems = [];

// Загрузка корзины из localStorage при инициализации
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    initializeTabs();
    initializeCart();
    initializeProductLinks();
    initializeSmoothScrolling();
    initializeForm();
    initializeAnimations();
    updateCartCount();
    checkUserAuth();
    initializeAuthForms();
});

// Инициализация вкладок категорий
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const productCards = document.querySelectorAll('.product-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            
            // Убираем активный класс со всех кнопок
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            button.classList.add('active');
            
            // Фильтруем продукты
            filterProducts(category);
        });
    });
}

// Фильтрация продуктов по категории
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-in-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// Инициализация корзины
function initializeCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCountElement = document.querySelector('.cart-count');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const productCard = button.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.price').textContent;
            
            addToCart(productName, productPrice);
            
            // Анимация кнопки
            button.textContent = 'Добавлено!';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.textContent = 'Добавить в корзину';
                button.style.background = '#4a7c59';
            }, 1000);
        });
    });
}

// Инициализация ссылок на страницы товаров
function initializeProductLinks() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent;
        const productImage = card.querySelector('.product-image');
        
        // Добавляем ссылку на изображение товара
        productImage.style.cursor = 'pointer';
        productImage.addEventListener('click', () => {
            // В реальном проекте здесь была бы логика определения URL товара
            // Пока что перенаправляем на страницу яблок
            window.location.href = 'product.html';
        });
        
        // Добавляем ссылку на название товара
        const productTitle = card.querySelector('h3');
        productTitle.style.cursor = 'pointer';
        productTitle.addEventListener('click', () => {
            window.location.href = 'product.html';
        });
    });
}

// Добавление товара в корзину
function addToCart(name, price) {
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cartItems.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ name, price, quantity: 1 });
    }
    
    cartCount++;
    saveCartToStorage();
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Анимация счетчика
    const cartCountElement = document.querySelector('.cart-count');
    cartCountElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartCountElement.style.transform = 'scale(1)';
    }, 200);
    
    // Показываем уведомление
    showNotification(`${name} добавлен в корзину!`);
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
    // Создаем элемент уведомления
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

// Плавная прокрутка для навигации
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Инициализация формы обратной связи
function initializeForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const message = contactForm.querySelector('textarea').value;
            
            if (name && email && message) {
                // Имитация отправки формы
                showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
                contactForm.reset();
            } else {
                showNotification('Пожалуйста, заполните все поля формы.');
            }
        });
    }
}

// Инициализация анимаций при скролле
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
    const animatedElements = document.querySelectorAll('.feature-card, .product-card, .stat, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Анимация появления для продуктов
const fadeInAnimation = `
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Добавляем CSS анимацию
const style = document.createElement('style');
style.textContent = fadeInAnimation;
document.head.appendChild(style);

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    // Пересчитываем позиции для анимаций
    initializeAnimations();
});

// Добавляем эффект параллакса для hero секции
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const fruits = document.querySelectorAll('.fruit');
    
    if (hero) {
        fruits.forEach((fruit, index) => {
            const speed = 0.5 + (index * 0.1);
            fruit.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
});

// Добавляем функциональность для кнопок в hero секции
document.addEventListener('DOMContentLoaded', function() {
    const orderButton = document.querySelector('.hero-buttons .btn-primary');
    const learnMoreButton = document.querySelector('.hero-buttons .btn-secondary');
    
    if (orderButton) {
        orderButton.addEventListener('click', () => {
            // Прокручиваем к секции продуктов
            const productsSection = document.querySelector('#products');
            if (productsSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = productsSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', () => {
            // Прокручиваем к секции "О нас"
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
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