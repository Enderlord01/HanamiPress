/* ===========================
   HANAMI PRESS — Cart System
   =========================== */

const CART_STORAGE_KEY = 'hanami_cart';

// Tariffe di spedizione
const SHIPPING = {
  italy_zine: 2,
  italy_other: 8,
  eu: 12,      // PLACEHOLDER — modifica con il costo reale
  world: 20    // PLACEHOLDER — modifica con il costo reale
};

/* ---------------------------
   Stato carrello (localStorage)
   --------------------------- */

function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  openCart();
}

function updateQuantity(name, delta) {
  const cart = getCart();
  const item = cart.find(i => i.name === name);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    const filtered = cart.filter(i => i.name !== name);
    saveCart(filtered);
  } else {
    saveCart(cart);
  }
}

function removeFromCart(name) {
  const cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
}

/* ---------------------------
   Calcolo totali e spedizione
   --------------------------- */

function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getShippingCost(cart, zone) {
  if (cart.length === 0) return 0;

  if (zone === 'italy') {
    const hasNonZine = cart.some(item => item.category !== 'zine');
    return hasNonZine ? SHIPPING.italy_other : SHIPPING.italy_zine;
  }

  if (zone === 'eu') return SHIPPING.eu;
  return SHIPPING.world;
}

/* ---------------------------
   UI: pannello carrello
   --------------------------- */

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (!badge) return;

  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCart() {
  const cart = getCart();
  const itemsContainer = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (footer) footer.style.display = 'flex';

  itemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">€${item.price.toFixed(2)}</span>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQuantity('${item.name}', -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name}')" aria-label="Rimuovi">×</button>
    </div>
  `).join('');

  updateCartTotals();
}

function updateCartTotals() {
  const cart = getCart();
  const zoneSelect = document.getElementById('cart-zone');
  const zone = zoneSelect ? zoneSelect.value : 'italy';

  const subtotal = getSubtotal(cart);
  const shipping = getShippingCost(cart, zone);
  const total = subtotal + shipping;

  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `€${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `€${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `€${total.toFixed(2)}`;
}

function openCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel) panel.classList.add('is-open');
  if (overlay) overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel) panel.classList.remove('is-open');
  if (overlay) overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

/* ---------------------------
   Checkout — Stripe
   --------------------------- */

async function goToCheckout() {
  const cart = getCart();
  if (cart.length === 0) return;

  const zoneSelect = document.getElementById('cart-zone');
  const zone = zoneSelect ? zoneSelect.value : 'italy';
  const shipping = getShippingCost(cart, zone);

  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Caricamento...';
  }

  try {
    // URL della funzione serverless ospitata su Vercel
    // SOSTITUISCI con il tuo URL reale una volta deployato
    const response = await fetch('https://hanami-press-checkout-vercel.vercel.app/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        shipping: shipping,
        zone: zone
      })
    });

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('URL di checkout non ricevuto');
    }
  } catch (err) {
    console.error('Errore checkout:', err);
    alert('Si è verificato un errore. Riprova più tardi.');
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Vai al pagamento';
    }
  }
}

/* ---------------------------
   Inizializzazione
   --------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Collega tutti i bottoni "Acquista" presenti nella pagina
  document.querySelectorAll('.product-buy').forEach(button => {
    button.addEventListener('click', () => {
      const product = {
        name: button.dataset.name,
        price: parseFloat(button.dataset.price),
        category: button.dataset.category,
        image: button.dataset.image
      };
      addToCart(product);
    });
  });

  // Apertura/chiusura pannello
  const cartTrigger = document.getElementById('cart-trigger');
  const cartClose = document.getElementById('cart-close');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartZone = document.getElementById('cart-zone');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartZone) cartZone.addEventListener('change', updateCartTotals);
  if (checkoutBtn) checkoutBtn.addEventListener('click', goToCheckout);

  renderCart();
  updateCartCount();
});
