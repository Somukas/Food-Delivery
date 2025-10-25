const STORAGE = { 
  USER: "qe_user",
  CART: "qe_cart",
  LOCATION: "qe_location",
  RATINGS: "qe_ratings",
  COUPON: "qe_coupon"
};

const RESTAURANTS = [
  {
    id: "burger-hub",
    name: "Burger Hub",
    hero: "🍔",
    branches: [
      { location: "Akurdi", distance: 3 },
      { location: "Bhel Chowk", distance: 6 },
      { location: "Shree Nagar", distance: 9 }
    ],
    menu: [
      { id: "bh-1", name: "Classic Burger", price: 179 },
      { id: "bh-2", name: "Cheese Burst", price: 229 },
      { id: "bh-3", name: "Fries", price: 79 }
    ],
    rating: 4.2
  },
  {
    id: "pizza-palace",
    name: "Pizza Palace",
    hero: "🍕",
    branches: [
      { location: "Akurdi", distance: 4 },
      { location: "Nagpur", distance: 12 }
    ],
    menu: [
      { id: "pp-1", name: "Margherita", price: 249 },
      { id: "pp-2", name: "Farmhouse", price: 299 }
    ],
    rating: 4.6
  },
  {
    id: "pasta-point",
    name: "Pasta Point",
    hero: "🍝",
    branches: [
      { location: "Shree Nagar", distance: 2 },
      { location: "Bhel Chowk", distance: 7 }
    ],
    menu: [
      { id: "pp2-1", name: "Pasta Alfredo", price: 229 },
      { id: "pp2-2", name: "Arrabbiata", price: 209 }
    ],
    rating: 4.0
  }
];

const $ = id => document.getElementById(id);
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => JSON.parse(localStorage.getItem(k) || "null");

/* ---------- Login ---------- */
function login() {
  const user = $("username")?.value.trim();
  const pass = $("password")?.value.trim();
  if (!user || !pass) {
    $("loginMsg").textContent = "Enter credentials";
    return;
  }
  if (user === "admin" && pass === "1234") {
    save(STORAGE.USER, { name: user });
    if (!load(STORAGE.CART)) save(STORAGE.CART, []);
    location.href = "home.html";
  } else {
    $("loginMsg").textContent = "Invalid credentials — use admin / 1234";
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  const user = load(STORAGE.USER);

  // redirect unauthorized users
  if (path.endsWith("home.html") && !user) {
    location.href = "food.html";
    return;
  }

  if (path.endsWith("home.html")) {
    bindTopControls();
    renderWelcome();
    renderRestaurants();
    restoreCart();
    bindCartButtons();
  }
});

/* ---------- Controls ---------- */
function bindTopControls() {
  $("setLocationBtn").addEventListener("click", () => {
    const selected = $("locationSelect").value.trim();
    const custom = $("customLocation").value.trim();
    const loc = custom || selected;
    if (!loc) return alert("Please choose or enter a location");

    save(STORAGE.LOCATION, loc);
    $("customLocation").value = "";
    renderWelcome();
    renderRestaurants();
  });

  $("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    location.href = "food.html";
  });

  $("searchBox").addEventListener("input", e => {
    renderRestaurants(e.target.value.trim().toLowerCase());
  });

  $("cartToggle").addEventListener("click", () => {
    $("cartDrawer").classList.toggle("open");
  });
}

/* ---------- Welcome ---------- */
function renderWelcome() {
  const user = load(STORAGE.USER);
  const loc = load(STORAGE.LOCATION);
  const msg = user
    ? `Hello ${user.name}! ${loc ? "Location: " + loc : "Set your location"}`
    : "Welcome! Sign in to continue.";
  $("welcomeText").textContent = msg;
}

/* ---------- Restaurant Rendering ---------- */
function renderRestaurants(query = "") {
  const grid = $("restaurantGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const location = load(STORAGE.LOCATION);
  if (!location) {
    grid.innerHTML = `
      <div class="card">
        <div class="hero">📍</div>
        <h3>Pick a location</h3>
        <p class="muted">Select or type a location to see nearby restaurants</p>
      </div>`;
    return;
  }

  const results = RESTAURANTS.filter(r =>
    r.branches.some(b => b.location.toLowerCase() === location.toLowerCase()) &&
    (!query ||
      r.name.toLowerCase().includes(query) ||
      r.menu.some(m => m.name.toLowerCase().includes(query)))
  );

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="card">
        <div class="hero">😔</div>
        <h3>No restaurants found</h3>
        <p class="muted">Try another location or clear your search</p>
      </div>`;
    return;
  }

  results.forEach(r => grid.appendChild(makeRestaurantCard(r, location)));
}

function makeRestaurantCard(r, location) {
  const branch = r.branches.find(b => b.location.toLowerCase() === location.toLowerCase());
  const div = document.createElement("div");
  div.className = "card restaurant-card";
  div.innerHTML = `
    <div class="hero">${r.hero}</div>
    <h3>${r.name}</h3>
    <p class="muted">${branch ? branch.distance + " km away" : "Available nearby"}</p>
    <p>⭐ ${r.rating}</p>
    <button class="primary" onclick="openMenu('${r.id}')">View Menu</button>
  `;
  return div;
}

/* ---------- Menu Popup ---------- */
function openMenu(id) {
  const r = RESTAURANTS.find(x => x.id === id);
  if (!r) return;

  $("modalRestaurantName").textContent = r.name;
  $("modalMenuList").innerHTML = "";
  $("modalBranchInfo").textContent = "Serving from your selected location’s branch.";

  r.menu.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} — ₹${item.price}
      <button onclick="addToCart('${r.id}','${item.id}','${item.name}',${item.price})">Add</button>
    `;
    $("modalMenuList").appendChild(li);
  });

  $("menuModal").classList.remove("hidden");
  $("closeMenuBtn").onclick = () => $("menuModal").classList.add("hidden");
}

/* ---------- Cart ---------- */
function addToCart(rid, mid, name, price) {
  const cart = load(STORAGE.CART) || [];
  const existing = cart.find(x => x.mid === mid);
  if (existing) existing.qty++;
  else cart.push({ rid, mid, name, price, qty: 1 });

  save(STORAGE.CART, cart);
  $("cartCount").textContent = cart.reduce((a, b) => a + b.qty, 0);
  restoreCart();
}

function restoreCart() {
  const cart = load(STORAGE.CART) || [];
  const cont = $("cartItems");
  if (!cont) return;
  cont.innerHTML = "";

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      ${item.name} — ₹${item.price} × ${item.qty}
      <button onclick="removeItem('${item.mid}')">−</button>
    `;
    cont.appendChild(div);
  });
  updateCartTotals();
}

function removeItem(mid) {
  let cart = load(STORAGE.CART) || [];
  cart = cart.filter(i => i.mid !== mid);
  save(STORAGE.CART, cart);
  restoreCart();
}

/* ---------- Cart Totals ---------- */
function updateCartTotals() {
  const cart = load(STORAGE.CART) || [];
  const sub = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const delivery = sub > 500 ? 0 : 40;
  const coupon = load(STORAGE.COUPON) || {};
  const discount = coupon.amount || 0;
  const total = Math.max(0, sub + delivery - discount);

  $("subTotal").textContent = sub;
  $("deliveryFee").textContent = delivery;
  $("discountVal").textContent = discount;
  $("grandTotal").textContent = total;
}

/* ---------- Coupon ---------- */
$("applyCouponBtn")?.addEventListener("click", () => {
  const val = $("couponInput").value.trim().toUpperCase();
  let discount = 0;
  if (val === "FOOD10") discount = 50;
  else if (val === "WELCOME15") discount = 75;
  else if (val === "FREESHIP") discount = 40;
  else return alert("Invalid coupon code");

  save(STORAGE.COUPON, { code: val, amount: discount });
  updateCartTotals();
  alert(`Coupon ${val} applied!`);
});

/* ---------- Checkout ---------- */
function bindCartButtons() {
  $("closeCart").onclick = () => $("cartDrawer").classList.remove("open");
  $("checkoutBtn").onclick = () => openPayment();
}

function openPayment() {
  const total = $("grandTotal").textContent;
  $("paymentSummary").innerHTML = `<p>Total payable: ₹${total}</p>`;
  $("paymentModal").classList.remove("hidden");

  $("cancelPay").onclick = () => $("paymentModal").classList.add("hidden");
  $("confirmPay").onclick = () => {
    alert("✅ Payment Successful! Enjoy your meal!");
    localStorage.removeItem(STORAGE.CART);
    $("paymentModal").classList.add("hidden");
    restoreCart();
  };
}










