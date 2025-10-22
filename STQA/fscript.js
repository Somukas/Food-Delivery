/* ---------- Data & Persistence Keys ---------- */
const STORAGE = {
  USER: "qe_user",
  CART: "qe_cart",
  LOCATION: "qe_location",
  RATINGS: "qe_ratings",
  COUPON: "qe_coupon"
};

/* ---------- Sample restaurants with branches (locations + distance km) ---------- */
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

/* ---------- Utility helpers ---------- */
const $ = id => document.getElementById(id);
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = k => JSON.parse(localStorage.getItem(k) || "null");

/* ---------- Auth (login.html) ---------- */
function login(){
  const user = $("username") ? $("username").value.trim() : null;
  const pass = $("password") ? $("password").value.trim() : null;
  if(!user || !pass){ if($("loginMsg")) $("loginMsg").textContent = "Enter credentials"; return; }

  // demo auth: admin / 1234
  if(user === "admin" && pass === "1234"){
    save(STORAGE.USER, { name: user });
    // preserve empty cart
    if(!load(STORAGE.CART)) save(STORAGE.CART, []);
    window.location.href = "index.html";
  } else {
    if($("loginMsg")) $("loginMsg").textContent = "Invalid credentials — use admin / 1234";
  }
}

/* ---------- On index load: initialize UI ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // redirect to login if not signed in
  const user = load(STORAGE.USER);
  if(!user && location.pathname.endsWith("index.html")){
    location.href = "login.html";
    return;
  }
  // bind controls
  bindTopControls();
  renderWelcome();
  renderRestaurants();
  restoreCart();
  bindCartButtons();
});

/* ---------- Topbar controls ---------- */
function bindTopControls(){
  // location set
  $("setLocationBtn").addEventListener("click", () => {
    const chosen = $("locationSelect").value;
    const custom = $("customLocation").value.trim();
    const final = custom || chosen;
    if(!final){ alert("Choose or enter a location"); return; }
    save(STORAGE.LOCATION, final);
    renderWelcome();
    renderRestaurants();
    $("customLocation").value = "";
  });

  // logout
  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE.USER);
    // keep cart optionally — for demo we'll clear
    localStorage.removeItem(STORAGE.CART);
    location.href = "login.html";
  });

  // search
  $("searchBox").addEventListener("input", e => renderRestaurants(e.target.value.trim().toLowerCase()));

  // cart toggle
  $("cartToggle").addEventListener("click", () => {
    $("cartDrawer").classList.toggle("open");
  });
}

/* ---------- Welcome text ---------- */
function renderWelcome(){
  const user = load(STORAGE.USER);
  const loc = load(STORAGE.LOCATION) || "No location set";
  $("welcomeText").textContent = user ? `Hello ${user.name}! Location: ${loc}` : `Hello! Location: ${loc}`;
}

/* ---------- Restaurants render & search ---------- */
function renderRestaurants(query = ""){
  const grid = $("restaurantGrid");
  grid.innerHTML = "";

  const location = load(STORAGE.LOCATION);
  if(!location){
    grid.innerHTML = `<div class="card"><div class="hero">📍</div><h3>Pick a location</h3><p class="muted">Select a location to see nearby branches</p></div>`;
    return;
  }

  // filter restaurants that have a branch at chosen location OR whose name/menu matches query
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

/* ---------- Make restaurant card element ---------- */
function makeRestaurantCard(r, location, query){
  const card = document.createElement("div");
  card.className = "card";

  // find branch (closest if multiple)
  const branches = r.branches.filter(b => b.location.toLowerCase() === location.toLowerCase());
  const branch = branches.length ? branches[0] : r.branches[0];

  // rating (persisted)
  const ratings = load(STORAGE.RATINGS) || {};
  const saved = ratings[r.id] !== undefined ? ratings[r.id] : r.rating;

  card.innerHTML = `
    <div class="hero">${r.hero}</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>${r.name}</h3>
      <div class="star-row"><span class="star">★</span> <strong>${saved.toFixed(1)}</strong></div>
    </div>
    <div class="meta">Branch: ${branch.location} • ${branch.distance} km away</div>

    <ul class="menu-list">
      ${r.menu
        .filter(m => !query || r.name.toLowerCase().includes(query) || m.name.toLowerCase().includes(query))
        .map(m => `<li>${m.name} <span>₹${m.price}</span> <button onclick="addToCart('${r.id}','${m.id}')">Add</button></li>`)
        .join("")}
    </ul>

    <div style="display:flex;gap:8px;align-items:center">
      <div id="stars-${r.id}" class="star-rating" style="display:flex;gap:6px"></div>
      <button class="small" onclick="viewMenu('${r.id}')">View menu</button>
    </div>
  `;

  // attach dynamic stars (click to rate)
  setTimeout(() => { renderStars(r.id, saved); attachStarHandlers(r.id, r.name); }, 0);

  return card;
}

/* ---------- Rating UI ---------- */
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
function attachStarHandlers(id, name){
  const container = document.getElementById(`stars-${id}`);
  if(!container) return;
  container.querySelectorAll(".star").forEach(s => {
    s.onclick = () => {
      const v = parseInt(s.dataset.value);
      const ratings = load(STORAGE.RATINGS) || {};
      ratings[id] = v;
      save(STORAGE.RATINGS, ratings);
      // update visible rating in card
      const cardStars = s.closest(".card");
      if(cardStars) cardStars.querySelector(".star-row strong").textContent = v.toFixed(1);
      renderStars(id, v);
    };
  });
}

/* ---------- View menu (simple modal-like behavior) ---------- */
function viewMenu(restaurantId){
  // scroll to restaurant card or open a focused view - here we just highlight the card
  const cards = Array.from(document.querySelectorAll(".card"));
  const target = cards.find(c => c.querySelector(`#stars-${restaurantId}`));
  if(target){
    target.scrollIntoView({behavior:"smooth", block:"center"});
    target.style.boxShadow = "0 18px 40px rgba(255,107,107,0.12)";
    setTimeout(()=> target.style.boxShadow = "var(--shadow)", 1000);
  }
}

/* ---------- Cart management ---------- */
function restoreCart(){
  const stored = load(STORAGE.CART) || [];
  window.CART = stored;
  updateCartUI();
}
function saveCart(){
  save(STORAGE.CART, window.CART || []);
}

/* Add to cart by restaurantId + menuId */
function addToCart(restaurantId, menuId){
  // find restaurant and menu item
  const r = RESTAURANTS.find(x => x.id === restaurantId);
  if(!r) return;
  const item = r.menu.find(m => m.id === menuId);
  if(!item) return;
  // determine delivery distance from branch at chosen location
  const location = load(STORAGE.LOCATION);
  const branch = r.branches.find(b => b.location.toLowerCase() === (location||"").toLowerCase()) || r.branches[0];
  const delivery = branch ? branch.distance * 10 : 50; // ₹10 per km fallback 50

  // push to cart: keep restaurant name, itemname, price, delivery
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
  // small feedback
  animateAdd();
}

/* Animate add feedback */
function animateAdd(){
  const btn = document.querySelector(".cart-btn");
  if(!btn) return;
  btn.animate([{transform:"scale(1)"},{transform:"scale(1.06)"},{transform:"scale(1)"}], {duration:300});
}

/* Update cart UI */
function updateCartUI(){
  const itemsDiv = $("cartItems");
  itemsDiv.innerHTML = "";
  const cart = window.CART || [];
  if(cart.length === 0){
    itemsDiv.innerHTML = `<p class="muted">Your cart is empty — add tasty items 🍟</p>`;
  } else {
    cart.forEach((c, idx) => {
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

  // calculate totals
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

/* remove cart item */
function removeCart(cartId){
  window.CART = (window.CART || []).filter(i => i.cartId !== cartId);
  saveCart();
  updateCartUI();
}

/* ---------- Cart / Coupon / Checkout ---------- */
function bindCartButtons(){
  $("closeCart").addEventListener("click", () => $("cartDrawer").classList.remove("open"));
  $("applyCouponBtn").addEventListener("click", applyCoupon);
  $("checkoutBtn").addEventListener("click", () => {
    // show payment modal with summary
    const sub = parseFloat($("subTotal").textContent) || 0;
    const delivery = parseFloat($("deliveryFee").textContent) || 0;
    const discount = parseFloat($("discountVal").textContent) || 0;
    const total = parseFloat($("grandTotal").textContent) || 0;
    if((window.CART || []).length === 0){ alert("Your cart is empty!"); return; }

    const html = `
      <p>Subtotal: ₹${sub.toFixed(2)}</p>
      <p>Delivery: ₹${delivery.toFixed(2)}</p>
      <p>Discount: -₹${discount.toFixed(2)}</p>
      <hr/>
      <h3>Total: ₹${total.toFixed(2)}</h3>
    `;
    $("paymentSummary").innerHTML = html;
    $("paymentModal").classList.remove("hidden");
  });

  // payment modal actions
  $("cancelPay").addEventListener("click", () => $("paymentModal").classList.add("hidden"));
  $("confirmPay").addEventListener("click", confirmPayment);
}

/* Apply coupon codes */
function applyCoupon(){
  const code = ($("couponInput").value || "").trim().toUpperCase();
  if(!code){ alert("Enter a coupon code"); return; }
  // codes: FOOD10 => 10% of subtotal, WELCOME15 => 15% subtotal, FREESHIP => free delivery
  const cart = window.CART || [];
  const sub = cart.reduce((s,i) => s + i.price, 0);
  let discountVal = 0;
  if(code === "FOOD10"){
    discountVal = sub * 0.10;
  } else if(code === "WELCOME15"){
    discountVal = sub * 0.15;
  } else if(code === "FREESHIP"){
    // free delivery = eliminate delivery fees
    discountVal = cart.reduce((s,i) => s + i.deliveryFee, 0);
  } else {
    alert("Invalid coupon");
    return;
  }
  save(STORAGE.COUPON, { code, discountVal });
  updateCartUI();
  alert(`Coupon ${code} applied!`);
  $("couponInput").value = "";
}

/* Confirm payment (mock) */
function confirmPayment(){
  // simulate processing...
  $("confirmPay").disabled = true;
  $("confirmPay").textContent = "Processing...";
  setTimeout(() => {
    $("confirmPay").disabled = false;
    $("confirmPay").textContent = "Pay Now";
    $("paymentModal").classList.add("hidden");
    // success
    const total = $("grandTotal").textContent;
    alert(`Payment successful! ₹${total} paid 🎉`);
    // clear cart and coupon
    window.CART = [];
    save(STORAGE.CART, []);
    localStorage.removeItem(STORAGE.COUPON);
    updateCartUI();
    $("cartDrawer").classList.remove("open");
  }, 1000);
}

/* ---------- Helpers for DOM access in this file ---------- */
function $(id){ return document.getElementById(id); }
