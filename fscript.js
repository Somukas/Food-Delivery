/* ---------- Storage keys ---------- */
const STORAGE = {
  USER: "qe_user",
  CART: "qe_cart",
  LOCATION: "qe_location",
  RATINGS: "qe_ratings",
  COUPON: "qe_coupon"
};

/* ---------- Sample data ---------- */
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

/* ---------- Helpers ---------- */
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
    location.href = "index.html";
  } else {
    $("loginMsg").textContent = "Invalid credentials — use admin / 1234";
  }
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const user = load(STORAGE.USER);

  // redirect to login if not logged in
  if (!user && location.pathname.endsWith("index.html")) {
    location.href = "login.html";
    return;
  }

  // Bind topbar controls if present
  if ($("setLocationBtn")) bindTopControls();

  // Initialize UI
  renderWelcome();
  renderRestaurants();
  restoreCart();
  bindCartButtons();
});

/* ---------- Topbar Controls ---------- */
function bindTopControls() {
  const setBtn = $("setLocationBtn");
  const select = $("locationSelect");
  const custom = $("customLocation");

  setBtn?.addEventListener("click", () => {
    const final = (custom.value || select.value).trim();
    if (!final) {
      alert("Choose or enter a location first");
      return;
    }
    save(STORAGE.LOCATION, final);
    custom.value = "";
    renderWelcome();
    renderRestaurants();
  });

  $("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE.USER);
    localStorage.removeItem(STORAGE.CART);
    location.href = "login.html";
  });

  $("searchBox")?.addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    renderRestaurants(query);
  });

  $("cartToggle")?.addEventListener("click", () =>
    $("cartDrawer").classList.toggle("open")
  );
}

/* ---------- Welcome ---------- */
function renderWelcome() {
  const user = load(STORAGE.USER);
  const loc = load(STORAGE.LOCATION);
  $("welcomeText").textContent = user
    ? `Hello ${user.name}! ${loc ? "Location: " + loc : "Set your location"}`
    : `Hello! Choose your location to begin`;
}

/* ---------- Render Restaurants ---------- */
function renderRestaurants(query = "") {
  const grid = $("restaurantGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const location = (load(STORAGE.LOCATION) || "").trim().toLowerCase();
  if (!location) {
    grid.innerHTML = `<div class="card"><div class="hero">📍</div><h3>Pick a location</h3><p class="muted">Select or type a location to see nearby restaurants</p></div>`;
    return;
  }

  const results = RESTAURANTS.filter(r =>
    r.branches.some(b => b.location.toLowerCase() === location) ||
    (query && (
      r.name.toLowerCase().includes(query) ||
      r.menu.some(m => m.name.toLowerCase().includes(query))
    ))
  );

  if (!results.length) {
    grid.innerHTML = `<div class="card"><div class="hero">😔</div><h3>No restaurants found</h3><p class="muted">Try another location or clear your search</p></div>`;
    return;
  }

  results.forEach(r => grid.appendChild(makeRestaurantCard(r, location, query)));
}

/* ---------- Restaurant Card ---------- */
function makeRestaurantCard(r, location, query) {
  const card = document.createElement("div");
  card.className = "card";

  const branch = r.branches.find(b => b.location.toLowerCase() === location) || r.branches[0];
  const ratings = load(STORAGE.RATINGS) || {};
  const savedRating = ratings[r.id] ?? r.rating;

  card.innerHTML = `
    <div class="hero">${r.hero}</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>${r.name}</h3>
      <div class="star-row"><span class="star">★</span> <strong>${savedRating.toFixed(1)}</strong></div>
    </div>
    <div class="meta">Branch: ${branch.location} • ${branch.distance} km away</div>
    <ul class="menu-list">
      ${r.menu
        .filter(m => !query || r.name.toLowerCase().includes(query) || m.name.toLowerCase().includes(query))
        .map(m => `<li>${m.name} <span>₹${m.price}</span> <button onclick="openMenuModal('${r.id}')">View</button></li>`).join("")
      }
    </ul>
    <div style="display:flex;gap:8px;align-items:center">
      <div id="stars-${r.id}" class="star-rating" style="display:flex;gap:6px"></div>
      <button class="small" onclick="openMenuModal('${r.id}')">Open Menu</button>
    </div>
  `;

  setTimeout(() => {
    renderStars(r.id, savedRating);
    attachStarHandlers(r.id);
  }, 0);

  return card;
}

/* ---------- Menu Modal ---------- */
function openMenuModal(restaurantId) {
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if (!r) return;
  const location = (load(STORAGE.LOCATION) || "").trim();
  const branch = r.branches.find(b => b.location.toLowerCase() === location.toLowerCase()) || r.branches[0];

  $("modalRestaurantName").textContent = r.name;
  $("modalBranchInfo").textContent = `Branch: ${branch.location} • ${branch.distance} km away`;
  const ul = $("modalMenuList");
  ul.innerHTML = "";
  r.menu.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `${m.name} <span>₹${m.price}</span> <button onclick="addToCart('${r.id}','${m.id}', ${branch.distance})">Add</button>`;
    ul.appendChild(li);
  });

  $("menuModal")?.classList.remove("hidden");
}

$("closeMenuBtn")?.addEventListener("click", () => $("menuModal").classList.add("hidden"));

/* ---------- Ratings ---------- */
function renderStars(id, value) {
  const container = $(`stars-${id}`);
  if (!container) return;
  container.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.textContent = "★";
    span.className = "star";
    if (i <= Math.round(value)) span.style.color = "#ffd26b";
    span.dataset.value = i;
    container.appendChild(span);
  }
}

function attachStarHandlers(id) {
  const container = $(`stars-${id}`);
  if (!container) return;
  container.querySelectorAll(".star").forEach(s => {
    s.onclick = () => {
      const v = parseInt(s.dataset.value);
      const ratings = load(STORAGE.RATINGS) || {};
      ratings[id] = v;
      save(STORAGE.RATINGS, ratings);
      renderStars(id, v);
      const card = s.closest(".card");
      if (card) card.querySelector(".star-row strong").textContent = v.toFixed(1);
    };
  });
}

/* ---------- Cart ---------- */
function restoreCart() {
  window.CART = load(STORAGE.CART) || [];
  updateCartUI();
}

function saveCart() {
  save(STORAGE.CART, window.CART || []);
}

function addToCart(restaurantId, menuId, branchDistance = 5) {
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if (!r) return;
  const item = r.menu.find(m => m.id === menuId);
  if (!item) return;

  const delivery = branchDistance * 10;
  window.CART = window.CART || [];
  window.CART.push({
    cartId: Date.now() + "-" + Math.random().toString(36).slice(2,7),
    restaurantId,
    restaurantName: r.name,
    itemId: item.id,
    itemName: item.name,
    price: item.price,
    deliveryFee: delivery
  });

  saveCart();
  updateCartUI();
  animateAdd();
  $("menuModal")?.classList.add("hidden");
}

function animateAdd() {
  const btn = document.querySelector(".cart-btn");
  btn?.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}], {duration:300});
}

function updateCartUI() {
  const itemsDiv = $("cartItems");
  if (!itemsDiv) return;
  itemsDiv.innerHTML = "";

  const cart = window.CART || [];
  if (!cart.length) {
    itemsDiv.innerHTML = `<p class="muted">Your cart is empty 🍟</p>`;
  } else {
    cart.forEach(c => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div><strong>${c.itemName}</strong><div class="muted">${c.restaurantName}</div></div>
        <div style="text-align:right">
          <div>₹${c.price}</div>
          <div class="muted">Del: ₹${c.deliveryFee}</div>
          <div style="margin-top:8px"><button onclick="removeCart('${c.cartId}')">Remove</button></div>
        </div>`;
      itemsDiv.appendChild(div);
    });
  }

  const sub = cart.reduce((s,i)=>s+i.price,0);
  const delivery = cart.reduce((s,i)=>s+i.deliveryFee,0);
  const coupon = load(STORAGE.COUPON) || {code:"", discountVal:0};
  const discount = coupon.discountVal || 0;
  const grand = Math.max(0, sub+delivery-discount);

  $("subTotal")?.textContent = sub.toFixed(2);
  $("deliveryFee")?.textContent = delivery.toFixed(2);
  $("discountVal")?.textContent = discount.toFixed(2);
  $("grandTotal")?.textContent = grand.toFixed(2);
  $("cartCount")?.textContent = cart.length;
}

function removeCart(cartId) {
  window.CART = (window.CART || []).filter(i => i.cartId !== cartId);
  saveCart();
  updateCartUI();
}

/* ---------- Cart / Coupon / Checkout ---------- */
function bindCartButtons() {
  $("closeCart")?.addEventListener("click", () => $("cartDrawer").classList.remove("open"));
  $("applyCouponBtn")?.addEventListener("click", applyCoupon);
  $("checkoutBtn")?.addEventListener("click", () => {
    if (!(window.CART || []).length) { alert("Cart is empty!"); return; }
    showPaymentModal();
  });
  $("cancelPay")?.addEventListener("click", () => $("paymentModal").classList.add("hidden"));
  $("confirmPay")?.addEventListener("click", confirmPayment);
}

function applyCoupon() {
  const code = ($("couponInput")?.value || "").trim().toUpperCase();
  if (!code) { alert("Enter a coupon code"); return; }

  const cart = window.CART || [];
  const sub = cart.reduce((s,i)=>s+i.price,0);
  let discountVal = 0;

  if (code === "FOOD10") discountVal = sub*0.10;
  else if (code === "WELCOME15") discountVal = sub*0.15;
  else if (code === "FREESHIP") discountVal = cart.reduce((s,i)=>s+i.deliveryFee,0);
  else { alert("Invalid coupon"); return; }

  save(STORAGE.COUPON, {code, discountVal});
  updateCartUI();
  alert(`Coupon ${code} applied!`);
  $("couponInput").value = "";
}

function showPaymentModal() {
  const sub = parseFloat($("subTotal")?.textContent||0);
  const delivery = parseFloat($("deliveryFee")?.textContent||0);
  const discount = parseFloat($("discountVal")?.textContent||0);
  const total = parseFloat($("grandTotal")?.textContent||0);

  $("paymentSummary").innerHTML = `
    <p>Subtotal: ₹${sub.toFixed(2)}</p>
    <p>Delivery: ₹${delivery.toFixed(2)}</p>
    <p>Discount: -₹${discount.toFixed(2)}</p>
    <hr/>
    <h3>Total: ₹${total.toFixed(2)}</h3>
  `;

  $("paymentModal")?.classList.remove("hidden");
}

function confirmPayment() {
  $("confirmPay").disabled = true;
  $("confirmPay").textContent = "Processing...";
  setTimeout(() => {
    $("confirmPay").disabled = false;
    $("confirmPay").textContent = "Pay Now";
    $("paymentModal").classList.add("hidden");

    alert(`Payment successful! ₹${$("grandTotal")?.textContent} paid 🎉`);
    window.CART = [];
    save(STORAGE.CART, []);
    localStorage.removeItem(STORAGE.COUPON);
    updateCartUI();
    $("cartDrawer")?.classList.remove("open");
  }, 900);
}






