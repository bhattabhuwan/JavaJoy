// Navigation scroll effect
const nav = document.querySelector('nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navLinks.classList.remove('active');
        }
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            this.reset();
            
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// Add loading animation to images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.classList.add('loaded');
    });
});

// Add hover effect to menu items
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Cart functionality
let cart = [];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const paymentView = document.getElementById('payment-view');
    const cartView = document.getElementById('cart-view');
    const backToCartBtn = document.getElementById('back-to-cart');
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    const bankDetails = document.getElementById('bank-details');
    const esewaDetails = document.getElementById('esewa-details');

    // Initialize cart count
    updateCartCount();

    // Show cart modal when clicking cart icon
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cartModal.style.display = 'block';
        });
    }

    // Close cart modal when clicking close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            cartModal.style.display = 'none';
            // Reset views when closing
            paymentView.style.display = 'none';
            cartView.style.display = 'block';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
            // Reset views when closing
            paymentView.style.display = 'none';
            cartView.style.display = 'block';
        }
    });

    // Add click event listeners to all order buttons
    const orderButtons = document.querySelectorAll('.order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const menuItem = this.closest('.menu-item');
            const name = menuItem.querySelector('h3').textContent;
            const price = parseFloat(menuItem.querySelector('.price').textContent.replace('$', ''));
            const image = menuItem.querySelector('img').src;
            
            addToCart(name, price, image, this);
        });
    });

    // Show payment methods when clicking checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('<i class="fas fa-exclamation-circle"></i> Your cart is empty!');
                return;
            }
            
            cartView.style.display = 'none';
            paymentView.style.display = 'block';
            updateConfirmPaymentButton();
        });
    }

    // Back to cart button
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', () => {
            paymentView.style.display = 'none';
            cartView.style.display = 'block';
        });
    }

    // Handle payment method change
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            // Hide all payment details first
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Show relevant payment details
            if (e.target.value === 'bank') {
                bankDetails.style.display = 'block';
            } else if (e.target.value === 'esewa') {
                esewaDetails.style.display = 'block';
            }
            
            updateConfirmPaymentButton();
        });
    });

    // Handle payment confirmation
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => {
            const selectedMethod = document.querySelector('input[name="payment"]:checked');
            if (!selectedMethod) {
                showNotification('<i class="fas fa-exclamation-circle"></i> Please select a payment method!');
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Handle different payment methods
            switch(selectedMethod.value) {
                case 'esewa':
                    showNotification('<i class="fas fa-spinner fa-spin"></i> Redirecting to eSewa payment...');
                    setTimeout(() => {
                        showNotification('<i class="fas fa-check-circle"></i> Payment successful! Order placed.');
                        clearCart();
                    }, 2000);
                    break;
                    
                case 'bank':
                    showNotification('<i class="fas fa-info-circle"></i> Please complete the bank transfer using the provided details');
                    setTimeout(() => {
                        showNotification('<i class="fas fa-check-circle"></i> Order placed! Please complete the bank transfer.');
                        clearCart();
                    }, 2000);
                    break;
                    
                case 'cash':
                    showNotification('<i class="fas fa-check-circle"></i> Order placed successfully! Cash on delivery selected.');
                    clearCart();
                    break;
            }
        });
    }
});

// Add to cart functionality
function addToCart(name, price, image, button) {
    // Add visual feedback to button
    button.classList.add('adding');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Adding...</span>';
    
    setTimeout(() => {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name,
                price,
                image,
                quantity: 1
            });
        }
        
        // Show success state
        button.classList.remove('adding');
        button.classList.add('success');
        button.innerHTML = '<i class="fas fa-check"></i><span>Added!</span>';
        
        // Update cart immediately
        updateCart();
        updateCartCount();
        
        // Reset button after 1 second
        setTimeout(() => {
            button.classList.remove('success');
            button.innerHTML = '<i class="fas fa-shopping-cart"></i><span>Add to Cart</span>';
        }, 1000);
        
        // Show notification
        showNotification(`<i class="fas fa-check-circle"></i> Added ${name} to cart!`);
        
        // Show cart modal
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'block';
        }
    }, 500);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItems || !cartTotal || !checkoutBtn) return;
    
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                        <p class="item-total">$${itemTotal.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
            `;
        });
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
    }
    
    cartTotal.textContent = total.toFixed(2);
}

// Update item quantity
function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
            showNotification(`<i class="fas fa-trash"></i> Removed ${name} from cart`);
        }
        updateCart();
        updateCartCount();
    }
}

// Show notification
function showNotification(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = message;
    
    container.appendChild(notification);
    
    // Add slide-in animation
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Update confirm payment button text based on selected payment method
function updateConfirmPaymentButton() {
    const selectedMethod = document.querySelector('input[name="payment"]:checked');
    if (!selectedMethod) return;
    
    switch(selectedMethod.value) {
        case 'esewa':
            confirmPaymentBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Pay with eSewa';
            break;
        case 'bank':
            confirmPaymentBtn.innerHTML = '<i class="fas fa-university"></i> Pay with Bank Transfer';
            break;
        case 'cash':
            confirmPaymentBtn.innerHTML = '<i class="fas fa-money-bill-wave"></i> Place Order (Cash on Delivery)';
            break;
    }
}

// Function to clear cart
function clearCart() {
    cart = [];
    updateCart();
    updateCartCount();
    const cartModal = document.getElementById('cart-modal');
    const paymentView = document.getElementById('payment-view');
    const cartView = document.getElementById('cart-view');
    
    if (cartModal) cartModal.style.display = 'none';
    if (paymentView) paymentView.style.display = 'none';
    if (cartView) cartView.style.display = 'block';
}

// Initialize payment button text
updateConfirmPaymentButton();
  