const restaurantData = {
  "Akurdi": [
    { name: "Tandoori Treats", rating: 4.3, img: "https://i.imgur.com/EHn85Rl.jpg" },
    { name: "Spice Garden", rating: 4.5, img: "https://i.imgur.com/ovr0NAF.jpg" },
    { name: "Burger Hub", rating: 4.1, img: "https://i.imgur.com/RXW7jXL.jpg" }
  ],
  "Bhel Chowk": [
    { name: "Pizza Mania", rating: 4.6, img: "https://i.imgur.com/lzLMQ4t.jpg" },
    { name: "Veg Delight", rating: 4.2, img: "https://i.imgur.com/3k3qP0E.jpg" }
  ],
  "Shree Nagar": [
    { name: "Rolls Point", rating: 4.4, img: "https://i.imgur.com/7J2y2FW.jpg" },
    { name: "Taste of India", rating: 4.3, img: "https://i.imgur.com/aQ4Qk8M.jpg" }
  ],
  "Nagpur": [
    { name: "City Bites", rating: 4.7, img: "https://i.imgur.com/jK5jqzW.jpg" },
    { name: "Nagpur Spice", rating: 4.5, img: "https://i.imgur.com/ovr0NAF.jpg" }
  ]
};

const menuItems = [
  { id: 1, name: "Margherita Pizza", price: 249, img: "https://i.imgur.com/ovr0NAF.jpg" },
  { id: 2, name: "Cheese Burger", price: 199, img: "https://i.imgur.com/RXW7jXL.jpg" },
  { id: 3, name: "Pasta Alfredo", price: 229, img: "https://i.imgur.com/EHn85Rl.jpg" },
  { id: 4, name: "Veg Sandwich", price: 149, img: "https://i.imgur.com/Tw0Z8eB.jpg" }
];

let cart = [];
let currentUser = localStorage.getItem("username");
let currentLocation = "";

// Load user name
window.onload = () => {
  const welcomeText = document.getElementById("welcome-text");
  if (welcomeText && currentUser) welcomeText.textContent = `Welcome, ${currentUser}!`;
};

// DOM Elements
const locationSelect = document.getElementById("location-select");
const restaurantList = document.getElementById("restaurant-list");
const foodSection = document.getElementById("food-section");
const menuDiv = document.getElementById("menu");

// Location selection
document.getElementById("set-location-btn").onclick = () => {
  const selected = locationSelect.value;
  const custom = document.getElementById("custom-location").value.trim();
  currentLocation = custom || selected;
  if (!currentLocation) return alert("Please choose or enter a location!");
  showRestaurants(currentLocation);
};

// Show restaurant cards
function showRestaurants(location) {
  restaurantList.innerHTML = "";
  const restaurants = restaurantData[location];
  if (!restaurants) {
    restaurantList.innerHTML = `<p>No restaurants available in ${location}</p>`;
    return;
  }

  restaurants.forEach(r => {
    const div = document.createElement("div");
    div.className = "restaurant-card";

    const savedRating = getSavedRating(r.name) || r.rating;
    div.innerHTML = `
      <img src="${r.img}" alt="${r.name}">
      <h3>${r.name}</h3>
      <p class="rating">⭐ ${savedRating.toFixed(1)}</p>
      <div class="star-rating" id="rating-${r.name.replace(/\s+/g, '')}">
        ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
      </div>
      <button onclick="viewMenu('${r.name}')">View Menu</button>
    `;

    restaurantList.appendChild(div);

    const starContainer = div.querySelector(".star-rating");
    const stars = starContainer.querySelectorAll(".star");
    const roundedRating = Math.round(savedRating);

    stars.forEach((star, i) => {
      if (i < roundedRating) star.classList.add("active");
      star.addEventListener("click", () => handleRatingClick(r.name, i + 1, stars, div));
    });
  });
}

// Handle rating click
function handleRatingClick(name, rating, stars, cardDiv) {
  stars.forEach((s, i) => s.classList.toggle("active", i < rating));
  saveRating(name, rating);
  cardDiv.querySelector(".rating").textContent = `⭐ ${rating.toFixed(1)}`;
}

// Save rating in localStorage
function saveRating(name, rating) {
  let ratings = JSON.parse(localStorage.getItem("restaurantRatings") || "{}");
  ratings[name] = rating;
  localStorage.setItem("restaurantRatings", JSON.stringify(ratings));
}

// Retrieve rating
function getSavedRating(name) {
  const ratings = JSON.parse(localStorage.getItem("restaurantRatings") || "{}");
  return ratings[name];
}

// View restaurant menu
function viewMenu(name) {
  document.getElementById("food-section").style.display = "block";
  menuDiv.innerHTML = "";
  menuItems.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    `;
    menuDiv.appendChild(card);
  });
}

// Add to cart
function addToCart(id) {
  const item = menuItems.find(m => m.id === id);
  cart.push(item);
  updateCart();
}

// Cart functionality
const cartBtn = document.getElementById("cart-btn");
const cartDiv = document.getElementById("cart");
const cartItemsList = document.getElementById("cart-items");
const totalPrice = document.getElementById("total-price");
const cartCount = document.getElementById("cart-count");

cartBtn.onclick = () => cartDiv.classList.toggle("open");

function updateCart() {
  cartItemsList.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₹${item.price}`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => removeItem(index);
    li.appendChild(removeBtn);
    cartItemsList.appendChild(li);
  });
  totalPrice.textContent = total;
  cartCount.textContent = cart.length;
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Coupon
document.getElementById("apply-coupon").onclick = () => {
  const code = document.getElementById("coupon").value.trim().toUpperCase();
  let total = parseFloat(totalPrice.textContent);
  if (code === "SAVE20") total *= 0.8;
  else if (code === "SAVE10") total *= 0.9;
  else return alert("Invalid coupon!");
  totalPrice.textContent = total.toFixed(2);
  alert("Coupon applied!");
};

// Checkout
document.getElementById("checkout-btn").onclick = () => {
  if (cart.length === 0) return alert("Your cart is empty!");
  alert("Order placed successfully!");
  cart = [];
  updateCart();
  cartDiv.classList.remove("open");
};

// Search function
document.getElementById("searchInput").addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  const filtered = menuItems.filter(m => m.name.toLowerCase().includes(query));
  menuDiv.innerHTML = "";
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button onclick="addToCart(${item.id})">Add to Cart</button>
    `;
    menuDiv.appendChild(card);
  });
});
