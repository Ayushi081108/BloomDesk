
/* ==========================================
   BLOOMDESK - COMPLETE JAVASCRIPT
   ========================================== */

// DEFAULT ADMIN ACCOUNT
const ADMIN = {
    name: "BloomDesk Admin",
    email: "admin@bloomdesk.com",
    password: "admin123",
    role: "admin"
};

// DEFAULT FLOWERS
const defaultFlowers = [
    { id: 1, name: "Red Rose", price: 50, emoji: "🌹" },
    { id: 2, name: "Sunflower", price: 80, emoji: "🌻" },
    { id: 3, name: "Tulip", price: 100, emoji: "🌷" },
    { id: 4, name: "Lily", price: 120, emoji: "🪷" },
    { id: 5, name: "White Rose", price: 60, emoji: "🥀" },
    { id: 6, name: "Daisy", price: 40, emoji: "🌼" },
    { id: 7, name: "Lavender", price: 90, emoji: "💐" },
    { id: 8, name: "Orchid", price: 150, emoji: "🪻" }
];

// LOCAL STORAGE
function getData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

let flowers = getData("bloomFlowers", defaultFlowers);
let users = getData("bloomUsers", []);
let orders = getData("bloomOrders", []);
let cart = getData("bloomCart", []);

let currentUser = null;

// HTML SAFETY
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// PAGE NAVIGATION
function showPage(pageId) {

    if (pageId === "admin" &&
        (!currentUser || currentUser.role !== "admin")) {
        alert("Please login as Admin first.");
        showPage("login");
        return;
    }

    if (pageId === "orders" && !currentUser) {
        alert("Please login to view your orders.");
        showPage("login");
        return;
    }

    if (pageId === "cart") renderCart();
    if (pageId === "flowers") renderFlowers();
    if (pageId === "orders") renderOrders();
    if (pageId === "admin") renderAdmin();

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// LOGIN
function login() {

    const role = document.getElementById("loginRole").value;
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    let account = null;

    if (role === "admin") {

        if (
            email === ADMIN.email &&
            password === ADMIN.password
        ) {
            account = ADMIN;
        }

    } else {

        account = users.find(user =>
            user.email.toLowerCase() === email &&
            user.password === password
        );

    }

    if (!account) {
        message.textContent = "Invalid email or password!";
        return;
    }

    currentUser = {
        name: account.name,
        email: account.email,
        role: account.role
    };

    sessionStorage.setItem(
        "bloomCurrentUser",
        JSON.stringify(currentUser)
    );

    message.textContent = "";

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    updateNavigation();

    if (currentUser.role === "admin") {
        showPage("admin");
    } else {
        alert("Welcome to BloomDesk, " + currentUser.name + "!");
        showPage("home");
    }
}

// CUSTOMER REGISTRATION
function signup() {

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    const message = document.getElementById("signupMessage");

    if (!name || !email || !password) {
        message.textContent = "Please fill all fields.";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Password must contain at least 6 characters.";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = "Enter a valid email address.";
        return;
    }

    if (
        email === ADMIN.email ||
        users.some(user => user.email.toLowerCase() === email)
    ) {
        message.textContent = "This email is already registered.";
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: "customer"
    };

    users.push(newUser);
    saveData("bloomUsers", users);

    message.style.color = "green";
    message.textContent = "Account created successfully! Please login.";

    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";

    setTimeout(() => showPage("login"), 1200);
}

// NAVIGATION UPDATE
function updateNavigation() {

    const userLabel = document.getElementById("userLabel");
    const loginButton = document.getElementById("loginNavBtn");
    const logoutButton = document.getElementById("logoutBtn");

    if (currentUser) {
        userLabel.textContent = currentUser.name;
        loginButton.classList.add("hidden");
        logoutButton.classList.remove("hidden");
    } else {
        userLabel.textContent = "Guest";
        loginButton.classList.remove("hidden");
        logoutButton.classList.add("hidden");
    }

    updateCartCount();
}

// LOGOUT
function logout() {

    currentUser = null;

    sessionStorage.removeItem("bloomCurrentUser");

    updateNavigation();

    alert("You have logged out successfully.");

    showPage("home");
}

// FLOWER DISPLAY
function renderFlowers() {

    const grid = document.getElementById("flowerGrid");

    grid.innerHTML = "";

    if (flowers.length === 0) {
        grid.innerHTML = '<p class="empty-message">No flowers available.</p>';
        return;
    }

    flowers.forEach(flower => {

        grid.innerHTML += `
            <div class="flower-card">
                <div class="flower-image">${escapeHTML(flower.emoji)}</div>
                <h3>${escapeHTML(flower.name)}</h3>
                <p>₹${Number(flower.price).toFixed(2)}</p>
                <button onclick="addToCart(${flower.id})">
                    Add to Cart
                </button>
            </div>
        `;

    });
}

// SEARCH FLOWERS
function searchFlowers() {

    const search = document
        .getElementById("flowerSearch")
        .value.toLowerCase()
        .trim();

    const grid = document.getElementById("flowerGrid");

    const filtered = flowers.filter(flower =>
        flower.name.toLowerCase().includes(search)
    );

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-message">No matching flowers found.</p>';
        return;
    }

    filtered.forEach(flower => {

        grid.innerHTML += `
            <div class="flower-card">
                <div class="flower-image">${escapeHTML(flower.emoji)}</div>
                <h3>${escapeHTML(flower.name)}</h3>
                <p>₹${Number(flower.price).toFixed(2)}</p>
                <button onclick="addToCart(${flower.id})">
                    Add to Cart
                </button>
            </div>
        `;

    });
}

// ADD TO CART
function addToCart(flowerId) {

    if (!currentUser || currentUser.role !== "customer") {
        alert("Please login as a customer to add flowers to cart.");
        showPage("login");
        return;
    }

    const flower = flowers.find(item => item.id === flowerId);

    if (!flower) return;

    const existingItem = cart.find(item =>
        item.flowerId === flowerId &&
        item.email === currentUser.email
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            flowerId: flower.id,
            name: flower.name,
            price: flower.price,
            emoji: flower.emoji,
            quantity: 1,
            email: currentUser.email
        });
    }

    saveData("bloomCart", cart);

    updateCartCount();

    alert(flower.name + " added to cart!");
}

// CART COUNT
function updateCartCount() {

    const count = cart
        .filter(item => currentUser && item.email === currentUser.email)
        .reduce((total, item) => total + item.quantity, 0);

    document.getElementById("cartCount").textContent = count;
}

// DISPLAY CART
function renderCart() {

    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!currentUser || currentUser.role !== "customer") {
        cartItems.innerHTML = '<p class="empty-message">Please login as a customer to view your cart.</p>';
        cartTotal.textContent = "";
        checkoutBtn.classList.add("hidden");
        return;
    }

    checkoutBtn.classList.remove("hidden");

    const myCart = cart.filter(item =>
        item.email === currentUser.email
    );

    if (myCart.length === 0) {
        cartItems.innerHTML = '<p class="empty-message">Your cart is empty 🌸</p>';
        cartTotal.textContent = "";
        checkoutBtn.classList.add("hidden");
        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    myCart.forEach(item => {

        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div>
                    <h3>${escapeHTML(item.emoji)} ${escapeHTML(item.name)}</h3>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <div>
                    <strong>₹${subtotal}</strong>
                    <button onclick="changeQuantity(${item.flowerId}, -1)">−</button>
                    <button onclick="changeQuantity(${item.flowerId}, 1)">+</button>
                    <button onclick="removeFromCart(${item.flowerId})">Remove</button>
                </div>
            </div>
        `;
    });

    cartTotal.textContent = "Total: ₹" + total.toFixed(2);
}

// CHANGE QUANTITY
function changeQuantity(flowerId, change) {

    const item = cart.find(item =>
        item.flowerId === flowerId &&
        item.email === currentUser.email
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(flowerId);
        return;
    }

    saveData("bloomCart", cart);
    updateCartCount();
    renderCart();
}

// REMOVE CART ITEM
function removeFromCart(flowerId) {

    cart = cart.filter(item =>
        !(item.flowerId === flowerId &&
          item.email === currentUser.email)
    );

    saveData("bloomCart", cart);
    updateCartCount();
    renderCart();
}

// CHECKOUT
function checkout() {

    if (!currentUser || currentUser.role !== "customer") {
        alert("Please login as a customer.");
        showPage("login");
        return;
    }

    const myCart = cart.filter(item =>
        item.email === currentUser.email
    );

    if (myCart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = myCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const newOrder = {
        id: Date.now(),
        customer: currentUser.name,
        email: currentUser.email,
        items: myCart.map(item => ({ ...item })),
        total: total,
        status: "Pending",
        date: new Date().toLocaleString()
    };

    orders.push(newOrder);

    saveData("bloomOrders", orders);

    cart = cart.filter(item =>
        item.email !== currentUser.email
    );

    saveData("bloomCart", cart);

    updateCartCount();

    alert("Your order has been placed successfully!");

    showPage("orders");
}

// CUSTOMER ORDER DISPLAY
function renderOrders() {

    const list = document.getElementById("ordersList");

    if (!currentUser) {
        list.innerHTML = '<p class="empty-message">Please login first.</p>';
        return;
    }

    const myOrders = orders.filter(order =>
        currentUser.role === "admin" ||
        order.email === currentUser.email
    );

    if (myOrders.length === 0) {
        list.innerHTML = '<p class="empty-message">No orders found.</p>';
        return;
    }

    list.innerHTML = "";

    myOrders.forEach(order => {

        list.innerHTML += `
            <div class="order-item">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>${escapeHTML(order.date)}</p>
                    <p>${order.items.map(item =>
                        escapeHTML(item.name) + " × " + item.quantity
                    ).join(", ")}</p>
                    <strong>₹${order.total}</strong>
                </div>
                <span>Status: ${escapeHTML(order.status)}</span>
            </div>
        `;
    });
}

// ADMIN DASHBOARD
function renderAdmin() {

    if (!currentUser || currentUser.role !== "admin") return;

    document.getElementById("totalFlowers").textContent = flowers.length;

    document.getElementById("totalOrders").textContent = orders.length;

    const revenue = orders.reduce(
        (total, order) => total + order.total,
        0
    );

    document.getElementById("totalRevenue").textContent =
        "₹" + revenue.toFixed(2);

    renderAdminFlowers();
    renderAdminOrders();
}

// ADD FLOWER
function addFlower() {

    if (!currentUser || currentUser.role !== "admin") {
        alert("Admin access required.");
        return;
    }

    const name = document.getElementById("newFlowerName").value.trim();
    const price = Number(document.getElementById("newFlowerPrice").value);
    const emoji = document.getElementById("newFlowerEmoji").value.trim() || "🌸";

    if (!name || !Number.isFinite(price) || price <= 0) {
        alert("Please enter a valid flower name and price.");
        return;
    }

    const newFlower = {
        id: Date.now(),
        name: name,
        price: price,
        emoji: emoji
    };

    flowers.push(newFlower);

    saveData("bloomFlowers", flowers);

    document.getElementById("newFlowerName").value = "";
    document.getElementById("newFlowerPrice").value = "";
    document.getElementById("newFlowerEmoji").value = "";

    renderAdmin();

    alert("Flower added successfully!");
}

// ADMIN FLOWER LIST
function renderAdminFlowers() {

    const list = document.getElementById("adminFlowerList");

    list.innerHTML = "";

    flowers.forEach(flower => {

        list.innerHTML += `
            <div class="admin-item">
                <span>${escapeHTML(flower.emoji)} ${escapeHTML(flower.name)} - ₹${flower.price}</span>
                <button onclick="deleteFlower(${flower.id})">Delete</button>
            </div>
        `;
    });
}

// DELETE FLOWER
function deleteFlower(id) {

    if (!currentUser || currentUser.role !== "admin") return;

    if (!confirm("Are you sure you want to delete this flower?")) return;

    flowers = flowers.filter(flower => flower.id !== id);

    saveData("bloomFlowers", flowers);

    renderAdmin();
}

// ADMIN ORDER MANAGEMENT
function renderAdminOrders() {

    const list = document.getElementById("adminOrders");

    if (orders.length === 0) {
        list.innerHTML = '<p class="empty-message">No orders received yet.</p>';
        return;
    }

    list.innerHTML = "";

    orders.forEach(order => {

        list.innerHTML += `
            <div class="order-item">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>Customer: ${escapeHTML(order.customer)}</p>
                    <p>Email: ${escapeHTML(order.email)}</p>
                    <p>Total: ₹${order.total}</p>
                    <p>Status: ${escapeHTML(order.status)}</p>
                </div>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
                    <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                    <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
            </div>
        `;
    });
}

// UPDATE ORDER STATUS
function updateOrderStatus(id, status) {

    if (!currentUser || currentUser.role !== "admin") return;

    const order = orders.find(item => item.id === id);

    if (!order) return;

    order.status = status;

    saveData("bloomOrders", orders);

    renderAdmin();
}

// RESTORE SESSION
function restoreSession() {

    try {
        const savedUser = sessionStorage.getItem("bloomCurrentUser");

        if (savedUser) {
            const user = JSON.parse(savedUser);

            if (user.role === "admin" &&
                user.email === ADMIN.email) {
                currentUser = user;
            } else if (
                user.role === "customer" &&
                users.some(account =>
                    account.email === user.email &&
                    account.role === "customer"
                )
            ) {
                currentUser = user;
            } else {
                sessionStorage.removeItem("bloomCurrentUser");
            }
        }
    } catch {
        sessionStorage.removeItem("bloomCurrentUser");
    }

    updateNavigation();

    if (currentUser && currentUser.role === "admin") {
        showPage("admin");
    } else {
        showPage("home");
    }
}

// INITIALIZE APPLICATION
document.addEventListener("DOMContentLoaded", function () {

    // Ensure default flowers are saved on first visit
    if (!localStorage.getItem("bloomFlowers")) {
        saveData("bloomFlowers", defaultFlowers);
    }

    document.getElementById("flowerSearch")
        .addEventListener("input", searchFlowers);

    restoreSession();

    renderFlowers();

    updateCartCount();
});
