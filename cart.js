// Глобальные переменные
let cartItems = [];
let cartCount = 0;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    displayCart();
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

// Отображение корзины
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.querySelector('.cart-content');

    if (cartItems.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }

    cartContent.style.display = 'flex';
    emptyCart.style.display = 'none';

    cartItemsContainer.innerHTML = '';

    cartItems.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <div class="cart-item-emoji">${getProductEmoji(item.name)}</div>
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="cart-item-price">${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                <span>${calculateItemTotal(item)} ₽</span>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">🗑️</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    updateSummary();
}

// Получение эмодзи для продукта
function getProductEmoji(productName) {
    const emojiMap = {
        'Яблоки Голден': '🍎',
        'Апельсины': '🍊',
        'Бананы': '🍌',
        'Морковь': '🥕',
        'Помидоры': '🍅',
        'Салат': '🥬',
        'Клубника': '🍓',
        'Черника': '🫐'
    };
    return emojiMap[productName] || '🥬';
}

// Изменение количества товара
function changeQuantity(index, change) {
    const item = cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeItem(index);
        return;
    }

    item.quantity = newQuantity;
    saveCartToStorage();
    displayCart();
    updateCartCount();
}

// Удаление товара из корзины
function removeItem(index) {
    cartItems.splice(index, 1);
    saveCartToStorage();
    displayCart();
    updateCartCount();
}

// Подсчет общей стоимости товара
function calculateItemTotal(item) {
    const price = parseInt(item.price.replace(/\D/g, ''));
    return price * item.quantity;
}

// Обновление сводки заказа
function updateSummary() {
    const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);

    document.getElementById('itemsCount').textContent = itemsCount;
    document.getElementById('totalPrice').textContent = `${totalPrice} ₽`;
    document.getElementById('finalPrice').textContent = `${totalPrice} ₽`;
}

// Обновление сводки заказа в модальном окне
function updateModalSummary(deliveryType = 'pickup') {
    const totalPrice = cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    const deliveryCost = deliveryType === 'courier' ? 200 : 0; // Стоимость доставки курьером
    const finalPrice = totalPrice + deliveryCost;
    
    const orderTotalElement = document.querySelector('.order-total strong');
    const deliveryCostItem = document.getElementById('deliveryCostItem');
    
    if (orderTotalElement) {
        orderTotalElement.textContent = `Итого: ${finalPrice} ₽`;
    }
    
    if (deliveryCostItem) {
        if (deliveryType === 'courier') {
            deliveryCostItem.style.display = 'flex';
        } else {
            deliveryCostItem.style.display = 'none';
        }
    }
}

// Обновление счетчика корзины
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    cartCountElement.textContent = cartCount;
}

// Очистка корзины
function clearCart() {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
        cartItems = [];
        cartCount = 0;
        saveCartToStorage();
        displayCart();
        updateCartCount();
        showNotification('Корзина очищена');
    }
}

// Оформление заказа
function checkout() {
    if (cartItems.length === 0) {
        showNotification('Корзина пуста');
        return;
    }

    const totalPrice = cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    
    // Создаем модальное окно для оформления заказа
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Оформление заказа</h2>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form id="checkoutForm">
                    <div class="form-group">
                        <label>Имя *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Телефон *</label>
                        <input type="tel" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email">
                    </div>
                    <div class="form-group">
                        <label>Способ получения *</label>
                        <div class="delivery-options">
                            <label class="delivery-option">
                                <input type="radio" name="delivery" value="pickup" checked>
                                <span class="delivery-option-text">
                                    <span class="delivery-icon">🏪</span>
                                    <span>Самовывоз</span>
                                </span>
                            </label>
                            <label class="delivery-option">
                                <input type="radio" name="delivery" value="courier">
                                <span class="delivery-option-text">
                                    <span class="delivery-icon">🚚</span>
                                    <span>Доставка курьером</span>
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group" id="addressGroup" style="display: none;">
                        <label>Адрес доставки *</label>
                        <textarea name="address"></textarea>
                    </div>
                    <div class="form-group" id="pickupGroup">
                        <label>Пункт самовывоза *</label>
                        <select name="pickup" required>
                            <option value="">Выберите пункт самовывоза</option>
                            <option value="center">Москва, ул. Енисейская 19к1 ТЦ "Радужный"</option>
                        </select>
                    </div>
                                        <div class="form-group">
                        <label>Способ оплаты *</label>
                        <div class="payment-options">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card_online" checked>
                                <span class="payment-option-text">
                                    <span class="payment-icon">💳</span>
                                    <span>Онлайн оплата картой</span>
                                </span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card_delivery">
                                <span class="payment-option-text">
                                    <span class="payment-icon">💳</span>
                                    <span>Картой при доставке</span>
                                </span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cash">
                                <span class="payment-option-text">
                                    <span class="payment-icon">💵</span>
                                    <span>Наличными при доставке</span>
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group" id="cardDetailsGroup" style="display: none;">
                        <label>Данные карты *</label>
                        <div class="card-form">
                            <div class="card-input-group">
                                <input type="text" name="cardNumber" placeholder="Номер карты" maxlength="19">
                                <div class="card-icons">
                                    <span class="card-icon">💳</span>
                                    <span class="card-icon">🔒</span>
                                </div>
                            </div>
                            <div class="card-row">
                                <div class="card-input-group">
                                    <input type="text" name="cardExpiry" placeholder="ММ/ГГ" maxlength="5">
                                </div>
                                <div class="card-input-group">
                                    <input type="text" name="cardCvv" placeholder="CVV" maxlength="3">
                                </div>
                            </div>
                            <div class="card-input-group">
                                <input type="text" name="cardHolder" placeholder="Имя держателя карты">
                            </div>
                            <div class="security-info">
                                <div class="security-icon">🔒</div>
                                <div class="security-text">
                                    <strong>Безопасная оплата</strong>
                                    <p>Ваши данные защищены SSL-шифрованием</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Комментарий к заказу</label>
                        <textarea name="comment"></textarea>
                    </div>
                    <div class="order-summary">
                            <h3>Ваш заказ:</h3>
                            <div class="order-items">
                                ${cartItems.map(item => `
                                    <div class="order-item">
                                        <span>${item.name} × ${item.quantity}</span>
                                        <span>${calculateItemTotal(item)} ₽</span>
                                    </div>
                                `).join('')}
                                <div class="order-item delivery-cost" id="deliveryCostItem" style="display: none;">
                                    <span>Доставка курьером</span>
                                    <span>200 ₽</span>
                                </div>
                            </div>
                            <div class="order-total">
                                <strong>Итого: ${totalPrice} ₽</strong>
                            </div>
                        </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Отмена</button>
                        <button type="submit" class="btn btn-primary">Подтвердить заказ</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Обработка переключения способа доставки
    const deliveryOptions = modal.querySelectorAll('input[name="delivery"]');
    const addressGroup = modal.querySelector('#addressGroup');
    const pickupGroup = modal.querySelector('#pickupGroup');
    const addressField = modal.querySelector('textarea[name="address"]');
    const pickupField = modal.querySelector('select[name="pickup"]');

    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'courier') {
                addressGroup.style.display = 'block';
                pickupGroup.style.display = 'none';
                addressField.required = true;
                pickupField.required = false;
            } else {
                addressGroup.style.display = 'none';
                pickupGroup.style.display = 'block';
                addressField.required = false;
                pickupField.required = true;
            }
            // Обновляем сводку заказа
            updateModalSummary(this.value);
        });
    });

    // Обработка переключения способа оплаты
    const paymentOptions = modal.querySelectorAll('input[name="payment"]');
    const cardDetailsGroup = modal.querySelector('#cardDetailsGroup');
    const cardInputs = modal.querySelectorAll('input[name="cardNumber"], input[name="cardExpiry"], input[name="cardCvv"], input[name="cardHolder"]');

    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card_online') {
                cardDetailsGroup.style.display = 'block';
                cardInputs.forEach(input => input.required = true);
            } else {
                cardDetailsGroup.style.display = 'none';
                cardInputs.forEach(input => input.required = false);
            }
        });
    });

    // Обработка ввода номера карты
    const cardNumberInput = modal.querySelector('input[name="cardNumber"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            this.value = value;
        });
    }

    // Обработка ввода срока действия карты
    const cardExpiryInput = modal.querySelector('input[name="cardExpiry"]');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }

    // Обработка ввода CVV
    const cardCvvInput = modal.querySelector('input[name="cardCvv"]');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Валидация формы
    function validateCardForm() {
        const cardNumber = modal.querySelector('input[name="cardNumber"]').value.replace(/\s/g, '');
        const cardExpiry = modal.querySelector('input[name="cardExpiry"]').value;
        const cardCvv = modal.querySelector('input[name="cardCvv"]').value;
        const cardHolder = modal.querySelector('input[name="cardHolder"]').value;

        if (cardNumber.length < 16) {
            showNotification('Введите корректный номер карты');
            return false;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            showNotification('Введите корректный срок действия карты (ММ/ГГ)');
            return false;
        }

        if (cardCvv.length < 3) {
            showNotification('Введите корректный CVV код');
            return false;
        }

        if (cardHolder.trim().length < 2) {
            showNotification('Введите имя держателя карты');
            return false;
        }

        return true;
    }

    // Обработка отправки формы
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const paymentType = formData.get('payment');
        
        // Проверяем валидность данных карты, если выбрана онлайн оплата
        if (paymentType === 'card_online' && !validateCardForm()) {
            return;
        }
        const deliveryType = formData.get('delivery');
        const deliveryCost = deliveryType === 'courier' ? 200 : 0;
        const finalTotal = totalPrice + deliveryCost;
        
        const deliveryInfo = deliveryType === 'courier' 
            ? { type: 'courier', address: formData.get('address'), cost: deliveryCost }
            : { type: 'pickup', location: formData.get('pickup'), cost: 0 };

        const paymentInfo = {
            type: paymentType,
            method: paymentType === 'card_online' ? 'online_card' : 
                   paymentType === 'card_delivery' ? 'card_on_delivery' : 'cash_on_delivery',
            cardDetails: paymentType === 'card_online' ? {
                number: formData.get('cardNumber'),
                expiry: formData.get('cardExpiry'),
                cvv: formData.get('cardCvv'),
                holder: formData.get('cardHolder')
            } : null
        };

        const orderData = {
            customer: {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                comment: formData.get('comment')
            },
            delivery: deliveryInfo,
            payment: paymentInfo,
            items: cartItems,
            subtotal: totalPrice,
            deliveryCost: deliveryCost,
            total: finalTotal,
            date: new Date().toISOString()
        };

        // Имитация отправки заказа
        let orderMessage = '';
        
        if (paymentType === 'card_online') {
            // Показываем индикатор загрузки для онлайн оплаты
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Обработка платежа...';
            submitButton.disabled = true;
            
            // Имитируем обработку платежа
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                if (deliveryType === 'courier') {
                    orderMessage = 'Заказ успешно оформлен! Курьер свяжется с вами для уточнения времени доставки.';
                } else {
                    orderMessage = 'Заказ успешно оформлен! Вы можете забрать заказ в выбранном пункте самовывоза.';
                }
                orderMessage += ' Оплата прошла успешно.';
                showNotification(orderMessage);
                
                // Очищаем корзину и закрываем модальное окно
                cartItems = [];
                cartCount = 0;
                saveCartToStorage();
                closeModal();
                displayCart();
                updateCartCount();
            }, 2000);
            return;
        }
        
        // Для других способов оплаты
        if (deliveryType === 'courier') {
            orderMessage = 'Заказ успешно оформлен! Курьер свяжется с вами для уточнения времени доставки.';
        } else {
            orderMessage = 'Заказ успешно оформлен! Вы можете забрать заказ в выбранном пункте самовывоза.';
        }
        
        if (paymentType === 'card_delivery') {
            orderMessage += ' Оплата картой при получении.';
        } else {
            orderMessage += ' Оплата наличными при получении.';
        }
        
        showNotification(orderMessage);
        
        // Очищаем корзину
        cartItems = [];
        cartCount = 0;
        saveCartToStorage();
        
        closeModal();
        displayCart();
        updateCartCount();
    });
}

// Закрытие модального окна
function closeModal() {
    const modal = document.querySelector('.checkout-modal');
    if (modal) {
        modal.remove();
    }
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

// Функция для открытия корзины (используется на главной странице)
function openCart() {
    window.location.href = 'cart.html';
}

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