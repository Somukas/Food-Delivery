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
  if (!user && location.pathname.endsWith("index.html")) {
    location.href = "login.html";
    return;
  }

  // Bind top controls if present
  if ($("setLocationBtn")) bindTopControls();

  // Initial UI
  renderWelcome();
  renderRestaurants();
  restoreCart();
  bindCartButtons();
});

/* ---------- Topbar control bindings ---------- */
function bindTopControls() {
  const setBtn = $("setLocationBtn");
  const select = $("locationSelect");
  const custom = $("customLocation");

  if (!setBtn) return;

  setBtn.addEventListener("click", () => {
    const chosen = (select.value || "").trim();
    const customLoc = (custom.value || "").trim();
    const final = customLoc || chosen;

    if (!final) {
      alert("Choose or enter a location first");
      return;
    }

    save(STORAGE.LOCATION, final);
    console.log("✅ Location set to:", final);
    custom.value = "";

    renderWelcome();
    renderRestaurants();
  });

  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE.USER);
    localStorage.removeItem(STORAGE.CART);
    location.href = "login.html";
  });

  $("searchBox").addEventListener("input", e => {
    const query = e.target.value.trim().toLowerCase();
    renderRestaurants(query);
  });

  $("cartToggle").addEventListener("click", () =>
    $("cartDrawer").classList.toggle("open")
  );
}

/* ---------- Welcome ---------- */
function renderWelcome() {
  const user = load(STORAGE.USER);
  const loc = load(STORAGE.LOCATION);
  const msg = user
    ? `Hello ${user.name}! ${loc ? "Location: " + loc : "Set your location"}`
    : `Hello! Choose your location to begin`;
  if ($("welcomeText")) $("welcomeText").textContent = msg;
}

/* ---------- Render Restaurants ---------- */
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
        <p class="muted">Select or type a location to see nearby restaurants</p>
      </div>`;
    return;
  }

  // Filter by location or search query
  const results = RESTAURANTS.filter(r =>
    r.branches.some(b => b.location.toLowerCase() === location.toLowerCase()) ||
    (query && (
      r.name.toLowerCase().includes(query) ||
      r.menu.some(m => m.name.toLowerCase().includes(query))
    ))
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

  results.forEach(r => grid.appendChild(makeRestaurantCard(r, location, query)));
}




