// --- Check Login ---
const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "food.html";
}

// --- Elements ---
const locationSelect = document.getElementById("locationSelect");
const customLocation = document.getElementById("customLocation");
const setLocationBtn = document.getElementById("setLocationBtn");
const restaurantGrid = document.getElementById("restaurantGrid");
const welcomeText = document.getElementById("welcomeText");

// --- Restaurant Data ---
const restaurantsData = {
  Akurdi: [
    { name: "Spice Hub", cuisine: "Indian", rating: 4.5 },
    { name: "Burger Town", cuisine: "Fast Food", rating: 4.2 },
  ],
  "Bhel Chowk": [
    { name: "Pizza Point", cuisine: "Italian", rating: 4.3 },
    { name: "Tandoor Treats", cuisine: "Indian", rating: 4.6 },
  ],
  "Shree Nagar": [
    { name: "Café Bliss", cuisine: "Continental", rating: 4.4 },
    { name: "Sushi Express", cuisine: "Japanese", rating: 4.1 },
  ],
  Nagpur: [
    { name: "Royal Thali", cuisine: "Gujarati", rating: 4.5 },
    { name: "Chili Chinese", cuisine: "Chinese", rating: 4.3 },
  ],
};

// --- Event: Set Location ---
setLocationBtn.addEventListener("click", () => {
  const selected = locationSelect.value || customLocation.value.trim();

  if (!selected) {
    alert("Please choose or enter a location!");
    return;
  }

  showRestaurants(selected);
});

// --- Show Restaurants ---
function showRestaurants(location) {
  const restaurants = restaurantsData[location];
  restaurantGrid.innerHTML = "";

  if (!restaurants) {
    restaurantGrid.innerHTML = `<p>No restaurants found for "${location}"</p>`;
    return;
  }

  welcomeText.textContent = `Restaurants near ${location} 🍽️`;

  restaurants.forEach((r) => {
    const card = document.createElement("div");
    card.className = "restaurant-card";
    card.innerHTML = `
      <h3>${r.name}</h3>
      <p>${r.cuisine}</p>
      <p>⭐ ${r.rating}</p>
      <button class="view-menu-btn" data-name="${r.name}">View Menu</button>
    `;
    restaurantGrid.appendChild(card);
  });

  attachMenuEvents();
}

// --- View Menu ---
function attachMenuEvents() {
  document.querySelectorAll(".view-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const restName = btn.dataset.name;
      openMenu(restName);
    });
  });
}

function openMenu(name) {
  const modal = document.getElementById("menuModal");
  const title = document.getElementById("modalRestaurantName");
  const menuList = document.getElementById("modalMenuList");

  title.textContent = name;
  menuList.innerHTML = `
    <li>Burger — ₹120 <button onclick="addToCart('Burger',120)">Add</button></li>
    <li>Pizza — ₹250 <button onclick="addToCart('Pizza',250)">Add</button></li>
    <li>Pasta — ₹180 <button onclick="addToCart('Pasta',180)">Add</button></li>
  `;

  modal.classList.remove("hidden");
}

document.getElementById("closeMenuBtn").addEventListener("click", () => {
  document.getElementById("menuModal").classList.add("hidden");
});

// --- Cart Logic ---
const cart = [];
function addToCart(name, price) {
  cart.push({ name, price });
  document.getElementById("cartCount").textContent = cart.length;
  alert(`${name} added to cart`);
}

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "food.html";
});











