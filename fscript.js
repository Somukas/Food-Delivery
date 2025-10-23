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

/* ---------- simple helpers ---------- */
const $ = id => document.getElementById(id);
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => JSON.parse(localStorage.getItem(k) || "null");

/* ---------- Auth Functions (login.html) ---------- */
function login(){
  const user = $("username") ? $("username").value.trim() : null;
  const pass = $("password") ? $("password").value.trim() : null;
  if(!user || !pass){ if($("loginMsg")) $("loginMsg").textContent = "Enter credentials"; return; }

  if(user === "admin" && pass === "1234"){
    save(STORAGE.USER, { name: user });
    if(!load(STORAGE.CART)) save(STORAGE.CART, []);
    location.href = "index.html";
  } else {
    if($("loginMsg")) $("loginMsg").textContent = "Invalid credentials — use admin / 1234";
  }
}

/* ---------- Init on index load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const user = load(STORAGE.USER);
  // redirect to login if not logged in
  if(!user && location.pathname.endsWith("index.html")) {
    location.href = "login.html";
    return;
  }
  // Bind top controls if present
  if($("setLocationBtn")) bindTopControls();
  renderWelcome();
  renderRestaurants();
  restoreCart();
  bindCartButtons();
});

/* ---------- Topbar control bindings ---------- */
function bindTopControls(){
  $("setLocationBtn").addEventListener("click", () => {
    const chosen = $("locationSelect").value;
    const custom = $("customLocation").value.trim();
    const final = custom || chosen;
    if(!final){ alert("Choose or enter a location"); return; }
    save(STORAGE.LOCATION, final);
    $("customLocation").value = "";
    renderWelcome();
    renderRestaurants();
  });

  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE.USER);
    localStorage.removeItem(STORAGE.CART);
    location.href = "login.html";
  });

  $("searchBox").addEventListener("input", e => renderRestaurants(e.target.value.trim().toLowerCase()));

  $("cartToggle").addEventListener("click", () => $("cartDrawer").classList.toggle("open"));
}

/* ---------- Welcome ---------- */
function renderWelcome(){
  const user = load(STORAGE.USER);
  const loc = load(STORAGE.LOCATION) || "No location set";
  if($("welcomeText")) $("welcomeText").textContent = user ? `Hello ${user.name}! Location: ${loc}` : `Hello! Location: ${loc}`;
}

/* ---------- Render Restaurants (grid) ---------- */
function renderRestaurants(query = "") {
  const grid = $("restaurantGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const location = (load(STORAGE.LOCATION) || "").trim();
  if (!location) {
    grid.innerHTML = `
      <div class="card">
        <div class="hero">📍</div>
        <h3>Pick a location</h3>
        <p class="muted">Select a location to see nearby branches</p>
      </div>`;
    return;
  }

  // Case-insensitive matching
  const results = RESTAURANTS.filter(r =>
    r.branches.some(b => b.location.toLowerCase() === location.toLowerCase()) ||
    (query && (r.name.toLowerCase().includes(query) || r.menu.some(m => m.name.toLowerCase().includes(query))))
  );

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="card">
        <div class="hero">😔</div>
        <h3>No restaurants found</h3>
        <p class="muted">Try another location or clear search</p>
      </div>`;
    return;
  }

  results.forEach(r => grid.appendChild(makeRestaurantCard(r, location, query)));
}


  const results = RESTAURANTS.filter(r => {
    const hasBranch = r.branches.some(b => b.location.toLowerCase() === location.toLowerCase());
    const matchesQuery = query && (r.name.toLowerCase().includes(query) || r.menu.some(m => m.name.toLowerCase().includes(query)));
    return hasBranch || matchesQuery;
  });

  if(results.length === 0){
    grid.innerHTML = `<div class="card"><div class="hero">😔</div><h3>No restaurants found</h3><p class="muted">Try another location or clear search</p></div>`;
    return;
  }

  results.forEach(r => grid.appendChild(makeRestaurantCard(r, location, query)));
}

/* ---------- Build a single restaurant card ---------- */
function makeRestaurantCard(r, location, query){
  const card = document.createElement("div");
  card.className = "card";

  const branchesAtLoc = r.branches.filter(b => b.location.toLowerCase() === location.toLowerCase());
  const branch = branchesAtLoc.length ? branchesAtLoc[0] : r.branches[0];
  const ratings = load(STORAGE.RATINGS) || {};
  const savedRating = ratings[r.id] !== undefined ? ratings[r.id] : r.rating;

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
        .map(m => `<li>${m.name} <span>₹${m.price}</span> <button onclick="openMenuModal('${r.id}')">View</button></li>`)
        .join("")}
    </ul>
    <div style="display:flex;gap:8px;align-items:center">
      <div id="stars-${r.id}" class="star-rating" style="display:flex;gap:6px"></div>
      <button class="small" onclick="openMenuModal('${r.id}')">Open Menu</button>
    </div>
  `;

  // render and attach stars
  setTimeout(() => { renderStars(r.id, savedRating); attachStarHandlers(r.id); }, 0);

  return card;
}

/* ---------- Menu Modal (popup) ---------- */
function openMenuModal(restaurantId){
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if(!r) return;
  const location = load(STORAGE.LOCATION) || "";
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
  $("menuModal").classList.remove("hidden");
}
if($("closeMenuBtn")) $("closeMenuBtn").addEventListener("click", () => $("menuModal").classList.add("hidden"));

/* ---------- Ratings ---------- */
function renderStars(id, value){
  const container = document.getElementById(`stars-${id}`);
  if(!container) return;
  container.innerHTML = "";
  for(let i=1;i<=5;i++){
    const span = document.createElement("span");
    span.textContent = "★";
    span.className = "star";
    if(i <= Math.round(value)) span.style.color = "#ffd26b";
    span.dataset.value = i;
    container.appendChild(span);
  }
}
function attachStarHandlers(id){
  const container = document.getElementById(`stars-${id}`);
  if(!container) return;
  container.querySelectorAll(".star").forEach(s => {
    s.onclick = () => {
      const v = parseInt(s.dataset.value);
      const ratings = load(STORAGE.RATINGS) || {};
      ratings[id] = v;
      save(STORAGE.RATINGS, ratings);
      // update display
      const card = s.closest(".card");
      if(card) card.querySelector(".star-row strong").textContent = v.toFixed(1);
      renderStars(id, v);
    };
  });
}

/* ---------- Cart functions ---------- */
function restoreCart(){
  window.CART = load(STORAGE.CART) || [];
  updateCartUI();
}
function saveCart(){ save(STORAGE.CART, window.CART || []); }

/* Add to cart - passed branchDistance for delivery fee calc */
function addToCart(restaurantId, menuId, branchDistance = 5){
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if(!r) return;
  const item = r.menu.find(m => m.id === menuId);
  if(!item) return;
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
  // feedback
  animateAdd();
  // close menu modal if open
  if($("menuModal")) $("menuModal").classList.add("hidden");
}

/* small animate cart button */
function animateAdd(){
  const btn = document.querySelector(".cart-btn");
  if(!btn) return;
  btn.animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}], {duration:300});
}

/* update cart UI */
function updateCartUI(){
  const itemsDiv = $("cartItems");
  itemsDiv.innerHTML = "";
  const cart = window.CART || [];
  if(cart.length === 0){
    itemsDiv.innerHTML = `<p class="muted">Your cart is empty — add tasty items 🍟</p>`;
  } else {
    cart.forEach(c => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div>
          <strong>${c.itemName}</strong>
          <div class="muted">${c.restaurantName}</div>
        </div>
        <div style="text-align:right">
          <div>₹${c.price}</div>
          <div class="muted">Del: ₹${c.deliveryFee}</div>
          <div style="margin-top:8px"><button onclick="removeCart('${c.cartId}')">Remove</button></div>
        </div>
      `;
      itemsDiv.appendChild(div);
    });
  }

  // totals
  const sub = cart.reduce((s,i) => s + i.price, 0);
  const delivery = cart.reduce((s,i) => s + i.deliveryFee, 0);
  const coupon = load(STORAGE.COUPON) || { code: "", discountVal: 0 };
  const discount = coupon.discountVal || 0;
  const grand = Math.max(0, sub + delivery - discount);

  $("subTotal").textContent = sub.toFixed(2);
  $("deliveryFee").textContent = delivery.toFixed(2);
  $("discountVal").textContent = discount.toFixed(2);
  $("grandTotal").textContent = grand.toFixed(2);

  $("cartCount").textContent = cart.length;
}

/* remove an item */
function removeCart(cartId){
  window.CART = (window.CART || []).filter(i => i.cartId !== cartId);
  saveCart();
  updateCartUI();
}

/* ---------- Cart / Coupon / Checkout bindings ---------- */
function bindCartButtons(){
  if($("closeCart")) $("closeCart").addEventListener("click", () => $("cartDrawer").classList.remove("open"));
  if($("applyCouponBtn")) $("applyCouponBtn").addEventListener("click", applyCoupon);
  if($("checkoutBtn")) $("checkoutBtn").addEventListener("click", () => {
    const cart = window.CART || [];
    if(cart.length === 0){ alert("Your cart is empty!"); return; }
    showPaymentModal();
  });

  if($("cancelPay")) $("cancelPay").addEventListener("click", () => $("paymentModal").classList.add("hidden"));
  if($("confirmPay")) $("confirmPay").addEventListener("click", confirmPayment);
}

/* ---------- Coupon logic ---------- */
function applyCoupon(){
  const code = ($("couponInput").value || "").trim().toUpperCase();
  if(!code){ alert("Enter a coupon code"); return; }
  const cart = window.CART || [];
  const sub = cart.reduce((s,i) => s + i.price, 0);
  let discountVal = 0;
  if(code === "FOOD10"){
    discountVal = sub * 0.10;
  } else if(code === "WELCOME15"){
    discountVal = sub * 0.15;
  } else if(code === "FREESHIP"){
    discountVal = cart.reduce((s,i) => s + i.deliveryFee, 0);
  } else {
    alert("Invalid coupon");
    return;
  }
  save(STORAGE.COUPON, { code, discountVal });
  updateCartUI();
  alert(`Coupon ${code} applied!`);
  if($("couponInput")) $("couponInput").value = "";
}

/* ---------- Payment modal ---------- */
function showPaymentModal(){
  const sub = parseFloat($("subTotal").textContent) || 0;
  const delivery = parseFloat($("deliveryFee").textContent) || 0;
  const discount = parseFloat($("discountVal").textContent) || 0;
  const total = parseFloat($("grandTotal").textContent) || 0;
  $("paymentSummary").innerHTML = `
    <p>Subtotal: ₹${sub.toFixed(2)}</p>
    <p>Delivery: ₹${delivery.toFixed(2)}</p>
    <p>Discount: -₹${discount.toFixed(2)}</p>
    <hr/>
    <h3>Total: ₹${total.toFixed(2)}</h3>
  `;
  $("paymentModal").classList.remove("hidden");
}

function confirmPayment(){
  $("confirmPay").disabled = true;
  $("confirmPay").textContent = "Processing...";
  setTimeout(() => {
    $("confirmPay").disabled = false;
    $("confirmPay").textContent = "Pay Now";
    $("paymentModal").classList.add("hidden");
    alert(`Payment successful! ₹${$("grandTotal").textContent} paid 🎉`);
    window.CART = [];
    save(STORAGE.CART, []);
    localStorage.removeItem(STORAGE.COUPON);
    updateCartUI();
    $("cartDrawer").classList.remove("open");
  }, 900);
}

/* ---------- utility wrappers ---------- */
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k){ return JSON.parse(localStorage.getItem(k) || "null"); }
function $(id){ return document.getElementById(id); }





