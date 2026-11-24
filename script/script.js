
// ======= MODAL ==============
const menuToggle = document.getElementById("menuToggle");
        const header = document.querySelector("header");

        menuToggle.addEventListener("click", () => {
            const isOpen = header.classList.toggle("menu-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        header.querySelector("nav").addEventListener("click", (event) => {
            if (event.target.closest("a")) {
                header.classList.remove("menu-open");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                header.classList.remove("menu-open");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });





// ===================================
// SHOPPING CART FUNCTIONALITY
// ===================================

const cartButton = document.getElementById("cartButton");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");

const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const totalItemsElement = document.getElementById("totalItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");

const checkoutButton = document.getElementById("checkoutButton");

// Store cart products
const cart = new Map();

// Philippine Peso formatter
const peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2
});

// Open modal
function openCart() {
    cartModal.hidden = false;
    document.body.style.overflow = "hidden";
}

// Close modal
function closeCartModal() {
    cartModal.hidden = true;
    document.body.style.overflow = "";
}

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);
cartOverlay.addEventListener("click", closeCartModal);

// Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeCartModal();
    }
});

// Add product to cart
document.querySelectorAll(".card").forEach((card, index) => {

    const addButton = card.querySelector(".order button");

    addButton.addEventListener("click", () => {

        const name = card.querySelector(".productName").textContent.trim();

        const image = card.querySelector("img").getAttribute("src");

        const priceText = card.querySelector(".price").textContent;

        const price = Number(priceText.replace(/[^\d.]/g, ""));

        if (!Number.isFinite(price) || price <= 0) {
            return;
        }

        if (cart.has(index)) {

            cart.get(index).quantity++;

        } else {

            cart.set(index, {
                id: index,
                name,
                image,
                price,
                quantity: 1
            });

        }

        renderCart();

        // Small visual feedback
        const originalText = addButton.textContent;
        addButton.textContent = "ADDED";

        setTimeout(() => {
            addButton.textContent = originalText;
        }, 700);

    });

});

// Increase / decrease / remove products
cartItemsContainer.addEventListener("click", (event) => {

    const button = event.target.closest("button");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const item = cart.get(id);

    if (!item) return;

    if (action === "increase") {
        item.quantity++;
    }

    if (action === "decrease") {
        item.quantity--;

        if (item.quantity <= 0) {
            cart.delete(id);
        }
    }

    if (action === "remove") {
        cart.delete(id);
    }

    renderCart();

});

// Render cart
function renderCart() {

    let totalItems = 0;
    let totalPrice = 0;

    cartItemsContainer.innerHTML = "";

    if (cart.size === 0) {

        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet.</p>
            </div>
        `;

    } else {

        cart.forEach((item) => {

            const subtotal = item.price * item.quantity;

            totalItems += item.quantity;
            totalPrice += subtotal;

            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `
                <img src="${escapeHTML(item.image)}"
                     alt="${escapeHTML(item.name)}">

                <div class="cart-item-info">

                    <h4>${escapeHTML(item.name)}</h4>

                    <p>${peso.format(item.price)} each</p>

                    <div class="quantity-controls">

                        <button data-action="decrease"
                                data-id="${item.id}"
                                aria-label="Decrease quantity">−</button>

                        <span>${item.quantity}</span>

                        <button data-action="increase"
                                data-id="${item.id}"
                                aria-label="Increase quantity">+</button>

                    </div>

                    <div class="cart-item-subtotal">
                        Subtotal: ${peso.format(subtotal)}
                    </div>

                    <button class="remove-item"
                            data-action="remove"
                            data-id="${item.id}">
                        Remove
                    </button>

                </div>
            `;

            cartItemsContainer.appendChild(cartItem);

        });

    }

    // Update header counter
    cartCount.textContent = totalItems;

    // Update calculations
    totalItemsElement.textContent = totalItems;

    cartSubtotal.textContent = peso.format(totalPrice);

    cartTotal.textContent = peso.format(totalPrice);

    // Disable checkout when empty
    checkoutButton.disabled = cart.size === 0;

    checkoutButton.style.opacity = cart.size === 0 ? "0.5" : "1";
}

// Escape HTML special characters
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Initial rendering
renderCart();



// ===================================
// CHECKOUT FUNCTIONALITY
// ===================================

checkoutButton.addEventListener("click", () => {

    // VALIDATION 1: Check if cart is empty
    if (cart.size === 0) {
        alert("Your cart is now empty.");
        return;
    }

    // Calculate total purchase amount
    let purchaseTotal = 0;
    let purchasedItems = 0;

    cart.forEach((item) => {
        purchaseTotal += item.price * item.quantity;
        purchasedItems += item.quantity;
    });

    // VALIDATION 2: Customer confirmation
    const confirmCheckout = confirm(
        `Are you sure you want to proceed with your purchase?\n\n` +
        `Total Items: ${purchasedItems}\n` +
        `Total Amount: ${peso.format(purchaseTotal)}`
    );

    // Stop if customer cancels
    if (!confirmCheckout) {
        return;
    }

    // VALIDATION PASSED: Complete purchase

    // Clear all cart products
    cart.clear();

    // Reset cart display and calculations
    renderCart();

    // Display successful checkout message
    cartItemsContainer.innerHTML = `
        <div class="checkout-success">

            <div class="success-icon">✓</div>

            <h2>Thank You for Shopping!</h2>

            <p>Your order has been successfully placed.</p>

            <div class="purchase-receipt">

                <span>Total Purchase Amount</span>

                <h3>${peso.format(purchaseTotal)}</h3>

                <p>${purchasedItems} item(s) purchased</p>

            </div>

            <p class="success-note">
                We appreciate your order. Have a wonderful day!
            </p>

        </div>
    `;

    // Change checkout button
    checkoutButton.textContent = "Continue Shopping";

    checkoutButton.disabled = false;
    checkoutButton.style.opacity = "1";

    // Allow customer to close the receipt
    checkoutButton.onclick = () => {

        closeCartModal();

        checkoutButton.textContent = "Proceed to Checkout";

        checkoutButton.onclick = null;

    };

});




const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = newsletterForm.querySelector('input[type="email"]');

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stops the page from refreshing on submit

        if (emailInput.value.trim() !== "") {
            alert("Subscribed!");
            newsletterForm.reset(); // Clears the input field after subscribing
        }
    });
