
    const cart = [];

    function addToCart(name, price) {
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price, quantity: 1 });
      }
      updateCartIcon();
    }

    function updateCartIcon() {
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      document.getElementById("cart-count").textContent = count;
    }

    function toggleCart() {
      const modal = document.getElementById("cart-modal");
      modal.style.display = modal.style.display === "flex" ? "none" : "flex";
      renderCart();
    }

    function renderCart() {
      const cartItems = document.getElementById("cart-items");
      const cartTotal = document.getElementById("cart-total");
      cartItems.innerHTML = "";

      let total = 0;
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement("li");
        li.innerHTML = `
          ${item.name} 
          <div>
            <button onclick="changeQuantity(${index}, -1)">➖</button>
            <span style="margin: 0 10px;">${item.quantity}</span>
            <button onclick="changeQuantity(${index}, 1)">➕</button>
            = $${(item.price * item.quantity).toFixed(2)}
            <button onclick="removeFromCart(${index})">❌</button>
          </div>
        `;
        cartItems.appendChild(li);
      });

      cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function changeQuantity(index, delta) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      renderCart();
      updateCartIcon();
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      renderCart();
      updateCartIcon();
    }

    function checkout() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ You must be logged in to checkout.");
        return;
      }

      fetch("http://localhost:5000/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart })
      })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          alert("✅ Order placed successfully!");
          cart.length = 0;
          renderCart();
          updateCartIcon();
          toggleCart();
        } else {
          alert("❌ Checkout failed.");
        }
      })
      .catch(error => {
        console.error("Checkout error:", error);
        alert("❌ Something went wrong!");
      });
    }

    // Auth UI update + welcome
    document.addEventListener("DOMContentLoaded", () => {
      const token = localStorage.getItem('token');
      const loginBtn = document.getElementById('loginBtn');
      const signupBtn = document.getElementById('signupBtn');
      const logoutBtn = document.getElementById('logoutBtn');
      const ordersBtn = document.getElementById('ordersBtn');
      const banner = document.getElementById('welcome-banner');

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const email = payload.email;
          banner.textContent = `Welcome, ${email}!`;
          banner.style.visibility = "visible";
          banner.style.height = "auto";

          loginBtn.style.display = "none";
          signupBtn.style.display = "none";
          logoutBtn.style.display = "inline-block";

          logoutBtn.onclick = () => {
            localStorage.removeItem("token");
            location.reload();
          };

          ordersBtn.onclick = () => window.location.href = "order-history.html";
        } catch (e) {
          console.error("Invalid token:", e);
        }
      } else {
        logoutBtn.style.display = "none";
        ordersBtn.onclick = () => window.location.href = "order-history.html";
        loginBtn.onclick = () => window.location.href = "login.html";
        signupBtn.onclick = () => window.location.href = "signup.html";
      }

      document.getElementById("add-to-cart-btn")
        .addEventListener("click", () => {
          addToCart("3-in-1 Magnetic USB Cable", 19.99);
        });

      updateCartIcon();
    });
  