// Datos para el menú con categorías, valoraciones y tiempos de entrega.
const products = [
  {
    id: 1,
    category: 'Pizzas',
    name: 'Pizza Margarita',
    image: 'pizza_margarita.png',
    price: 7000,
    oldPrice: 8500,
    description: 'Clásica pizza margarita con salsa de tomate y albahaca fresca.',
    requiredOptions: {
      name: 'Tamaño',
      options: ['Individual', 'Mediana', 'Familiar'],
      required: true
    },
    extras: {
      name: 'Ingredientes extra',
      options: ['Queso extra', 'Jalapeños', 'Jamón'],
      required: false
    },
    rating: 4.6,
    time: '40-60 min'
  },
  {
    id: 2,
    category: 'Pizzas',
    name: 'Pizza Pepperoni',
    image: 'pizza_pepperoni.png',
    price: 8000,
    oldPrice: 9000,
    description: 'Pizza con rodajas de pepperoni y queso mozzarella derretido.',
    requiredOptions: {
      name: 'Tamaño',
      options: ['Individual', 'Mediana', 'Familiar'],
      required: true
    },
    extras: {
      name: 'Ingredientes extra',
      options: ['Queso extra', 'Aceitunas', 'Champiñones'],
      required: false
    },
    rating: 4.3,
    time: '45-70 min'
  },
  {
    id: 3,
    category: 'Bebidas',
    name: 'Bebida Cola 500ml',
    image: 'cola.png',
    price: 2000,
    description: 'Refresco cola en botella de 500ml.',
    rating: 4.8,
    time: '20-30 min'
  },
  {
    id: 4,
    category: 'Bebidas',
    name: 'Bebida Zero 500ml',
    image: 'cola.png',
    price: 2000,
    description: 'Refresco cola sin azúcar en botella de 500ml.',
    rating: 4.7,
    time: '20-30 min'
  },
  {
    id: 5,
    category: 'Postres',
    name: 'Postre Brownie',
    image: 'brownie.png',
    price: 3500,
    description: 'Delicioso brownie de chocolate con salsa de chocolate.',
    rating: 4.9,
    time: '30-45 min'
  }
];

// Carrito de compras
const cart = [];

// Estado para el modal de producto
let currentProduct = null;
let currentSelection = null;

// Elementos de interfaz que se inicializan en DOMContentLoaded
let cartCountEl;

// Inicializar la página al cargar
window.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  attachEventListeners();
  // Referencia al contador de carrito
  cartCountEl = document.getElementById('cart-count');
  updateCartCount();
});

/**
 * Genera los botones de categorías en la barra de navegación.
 */
function renderCategories() {
  const nav = document.getElementById('category-nav');
  // Obtener categorías únicas
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach((cat, index) => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      // Activar el botón seleccionado
      document.querySelectorAll('.categories button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Desplazar a la sección correspondiente
      const section = document.getElementById('category-' + slugify(cat));
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
    // Activar el primero por defecto
    if (index === 0) btn.classList.add('active');
    nav.appendChild(btn);
  });
}

/**
 * Convierte un nombre en un slug para id.
 */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Genera las secciones de productos por categoría y las inserta en el contenedor.
 */
function renderProducts(filter = '') {
  const container = document.getElementById('product-container');
  container.innerHTML = '';
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    // Filtrar productos de la categoría según el filtro de búsqueda
    const items = products.filter(p => p.category === cat && p.name.toLowerCase().includes(filter.toLowerCase()));
    if (items.length === 0) return;
    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = 'category-' + slugify(cat);
    const heading = document.createElement('h2');
    heading.textContent = cat;
    section.appendChild(heading);
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    items.forEach(item => {
      const card = createProductCard(item);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });
}

/**
 * Crea una tarjeta de producto con overlays de descuento, calificación y tiempo.
 */
function createProductCard(item) {
  const card = document.createElement('div');
  card.className = 'product-card';
  // Imagen
  const img = document.createElement('img');
  img.src = 'images/' + item.image;
  img.alt = item.name;
  card.appendChild(img);
  // Badge de descuento
  if (item.oldPrice && item.oldPrice > item.price) {
    const discountPerc = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);
    const badge = document.createElement('div');
    badge.className = 'discount-badge';
    badge.textContent = 'Hasta ' + discountPerc + '% DCTO';
    card.appendChild(badge);
  }
  // Rating
  const rating = document.createElement('div');
  rating.className = 'rating';
  rating.innerHTML = '★ ' + item.rating.toFixed(1);
  card.appendChild(rating);
  // Tiempo de entrega
  const shipping = document.createElement('div');
  shipping.className = 'shipping';
  shipping.textContent = item.time;
  card.appendChild(shipping);
  // Contenedor de información
  const info = document.createElement('div');
  info.className = 'info';
  const name = document.createElement('h3');
  name.textContent = item.name;
  info.appendChild(name);
  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = '$' + item.price;
  info.appendChild(price);
  if (item.oldPrice) {
    const old = document.createElement('p');
    old.className = 'old-price';
    old.textContent = '$' + item.oldPrice;
    info.appendChild(old);
  }
  card.appendChild(info);
  // Evento para abrir el modal de detalles
  card.addEventListener('click', () => openProductModal(item));
  return card;
}

/**
 * Muestra el modal con información y opciones del producto seleccionado.
 */
function openProductModal(product) {
  currentProduct = product;
  currentSelection = {
    quantity: 1,
    requiredChoice: null,
    extras: [],
    note: ''
  };
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = '';
  // Imagen
  const img = document.createElement('img');
  img.src = 'images/' + product.image;
  img.alt = product.name;
  body.appendChild(img);
  // Nombre
  const h3 = document.createElement('h3');
  h3.textContent = product.name;
  body.appendChild(h3);
  // Precio y precio antiguo
  const priceEl = document.createElement('p');
  priceEl.className = 'price';
  priceEl.textContent = '$' + product.price;
  body.appendChild(priceEl);
  if (product.oldPrice) {
    const oldEl = document.createElement('p');
    oldEl.className = 'old-price';
    oldEl.textContent = '$' + product.oldPrice;
    body.appendChild(oldEl);
  }
  // Descripción
  if (product.description) {
    const desc = document.createElement('p');
    desc.textContent = product.description;
    body.appendChild(desc);
  }
  // Opciones requeridas
  if (product.requiredOptions) {
    const section = document.createElement('div');
    section.className = 'options-section';
    const title = document.createElement('h4');
    title.textContent = product.requiredOptions.name + ' (requerido)';
    section.appendChild(title);
    product.requiredOptions.options.forEach(opt => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'option-item';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'required-option';
      input.value = opt;
      input.addEventListener('change', () => {
        currentSelection.requiredChoice = opt;
        updateAddButtonState();
      });
      const label = document.createElement('label');
      label.textContent = opt;
      itemDiv.appendChild(input);
      itemDiv.appendChild(label);
      section.appendChild(itemDiv);
    });
    body.appendChild(section);
  }
  // Opciones extra
  if (product.extras) {
    const section = document.createElement('div');
    section.className = 'extras-section';
    const title = document.createElement('h4');
    title.textContent = product.extras.name;
    section.appendChild(title);
    product.extras.options.forEach(opt => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'option-item';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = opt;
      input.addEventListener('change', () => {
        if (input.checked) {
          currentSelection.extras.push(opt);
        } else {
          currentSelection.extras = currentSelection.extras.filter(o => o !== opt);
        }
      });
      const label = document.createElement('label');
      label.textContent = opt;
      itemDiv.appendChild(input);
      itemDiv.appendChild(label);
      section.appendChild(itemDiv);
    });
    body.appendChild(section);
  }
  // Cantidad
  const qtySection = document.createElement('div');
  qtySection.className = 'quantity-section';
  const qtyLabel = document.createElement('h4');
  qtyLabel.textContent = 'Cantidad';
  qtySection.appendChild(qtyLabel);
  const qtySelector = document.createElement('div');
  qtySelector.className = 'quantity-selector';
  const minusBtn = document.createElement('button');
  minusBtn.textContent = '-';
  minusBtn.addEventListener('click', () => {
    if (currentSelection.quantity > 1) {
      currentSelection.quantity--;
      qtyDisplay.textContent = currentSelection.quantity;
    }
  });
  const qtyDisplay = document.createElement('span');
  qtyDisplay.textContent = currentSelection.quantity;
  const plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => {
    currentSelection.quantity++;
    qtyDisplay.textContent = currentSelection.quantity;
  });
  qtySelector.appendChild(minusBtn);
  qtySelector.appendChild(qtyDisplay);
  qtySelector.appendChild(plusBtn);
  qtySection.appendChild(qtySelector);
  body.appendChild(qtySection);
  // Comentario adicional
  const noteSection = document.createElement('div');
  noteSection.className = 'note-section';
  const noteLabel = document.createElement('h4');
  noteLabel.textContent = 'Comentario adicional';
  noteSection.appendChild(noteLabel);
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Escribe una nota opcional...';
  textarea.addEventListener('input', () => {
    currentSelection.note = textarea.value;
  });
  noteSection.appendChild(textarea);
  body.appendChild(noteSection);
  // Botones de acción
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'modal-actions';
  const addBtn = document.createElement('button');
  addBtn.className = 'primary';
  addBtn.id = 'add-to-cart-btn';
  addBtn.textContent = 'Agregar al carrito';
  addBtn.disabled = product.requiredOptions ? true : false;
  addBtn.addEventListener('click', () => {
    addProductToCart(product, currentSelection);
    closeModal();
  });
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', closeModal);
  actionsDiv.appendChild(addBtn);
  actionsDiv.appendChild(cancelBtn);
  body.appendChild(actionsDiv);
  // Mostrar el modal
  modal.style.display = 'flex';
}

/**
 * Actualiza el botón de agregar al carrito dependiendo si se han escogido las opciones requeridas.
 */
function updateAddButtonState() {
  const btn = document.getElementById('add-to-cart-btn');
  if (!btn || !currentProduct) return;
  if (currentProduct.requiredOptions) {
    btn.disabled = !currentSelection.requiredChoice;
  } else {
    btn.disabled = false;
  }
}

/**
 * Cierra el modal de producto.
 */
function closeModal() {
  const modal = document.getElementById('product-modal');
  modal.style.display = 'none';
  currentProduct = null;
  currentSelection = null;
}

/**
 * Añade el producto seleccionado al carrito y vuelve a dibujarlo.
 */
function addProductToCart(product, selection) {
  const item = {
    id: product.id,
    name: product.name,
    price: product.price,
    requiredChoice: selection.requiredChoice,
    extras: [...selection.extras],
    note: selection.note,
    quantity: selection.quantity
  };
  cart.push(item);
  renderCart();
  // Actualizar contador del icono de carrito cuando se agrega un producto
  updateCartCount();
}

/**
 * Actualiza el contador del carrito en el icono.
 */
function updateCartCount() {
  if (!cartCountEl) return;
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCountEl.textContent = count;
}

/**
 * Muestra el modal del carrito y actualiza su contenido.
 */
function openCartModal() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }
  renderCartModal();
  document.getElementById('cart-modal').style.display = 'flex';
}

/**
 * Oculta el modal del carrito.
 */
function hideCartModal() {
  document.getElementById('cart-modal').style.display = 'none';
}

/**
 * Genera el contenido del carrito en el modal y calcula importes.
 */
function renderCartModal() {
  const itemsContainer = document.getElementById('cart-items-modal');
  itemsContainer.innerHTML = '';
  let subtotal = 0;
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    const details = document.createElement('div');
    details.className = 'details';
    const name = document.createElement('div');
    name.textContent = item.name + (item.requiredChoice ? ' (' + item.requiredChoice + ')' : '');
    details.appendChild(name);
    if (item.extras && item.extras.length > 0) {
      const extras = document.createElement('div');
      extras.style.fontSize = '0.85rem';
      extras.style.color = '#555';
      extras.textContent = 'Extras: ' + item.extras.join(', ');
      details.appendChild(extras);
    }
    if (item.note) {
      const note = document.createElement('div');
      note.style.fontSize = '0.85rem';
      note.style.color = '#555';
      note.textContent = 'Nota: ' + item.note;
      details.appendChild(note);
    }
    const priceLine = document.createElement('div');
    priceLine.textContent = item.quantity + ' x $' + item.price + ' = $' + (item.price * item.quantity);
    priceLine.style.fontWeight = 'bold';
    details.appendChild(priceLine);
    div.appendChild(details);
    const actions = document.createElement('div');
    actions.className = 'actions';
    const minus = document.createElement('button');
    minus.textContent = '-';
    minus.addEventListener('click', () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart.splice(index, 1);
      }
      updateCartCount();
      renderCartModal();
    });
    const qtyDisplay = document.createElement('span');
    qtyDisplay.textContent = item.quantity;
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      item.quantity++;
      updateCartCount();
      renderCartModal();
    });
    const remove = document.createElement('button');
    remove.textContent = 'x';
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      updateCartCount();
      renderCartModal();
    });
    actions.appendChild(minus);
    actions.appendChild(qtyDisplay);
    actions.appendChild(plus);
    actions.appendChild(remove);
    div.appendChild(actions);
    itemsContainer.appendChild(div);
    subtotal += item.price * item.quantity;
  });
  // Calcular envío y descuentos
  let delivery = 2000 + cart.reduce((acc, it) => acc + (it.quantity * 500), 0);
  let discount = 0;
  const total = subtotal + delivery - discount;
  document.getElementById('modal-delivery-amount').textContent = '$' + delivery;
  document.getElementById('modal-discount-amount').textContent = '$' + discount;
  document.getElementById('modal-cart-total').textContent = '$' + total;
}

/**
 * Muestra el modal de datos del cliente.
 */
function openClientModal() {
  // Resetear campos del formulario
  document.getElementById('modal-customer-name').value = '';
  document.getElementById('modal-customer-lastname').value = '';
  document.getElementById('modal-customer-phone').value = '';
  document.getElementById('modal-customer-street').value = '';
  document.getElementById('modal-customer-town').value = '';
  document.getElementById('modal-customer-number').value = '';
  document.getElementById('modal-delivery-note').value = '';
  document.getElementById('modal-coupon-code').value = '';
  updateClientSummary('');
  document.getElementById('client-modal').style.display = 'flex';
}

/**
 * Oculta el modal de datos del cliente.
 */
function hideClientModal() {
  document.getElementById('client-modal').style.display = 'none';
}

/**
 * Muestra el modal de pago.
 */
function openPaymentModal() {
  document.getElementById('payment-modal').style.display = 'flex';
}

/**
 * Oculta el modal de pago.
 */
function hidePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
}

/**
 * Valida los campos del formulario de datos del cliente.
 */
function validateClientForm() {
  const name = document.getElementById('modal-customer-name');
  const lastname = document.getElementById('modal-customer-lastname');
  const phone = document.getElementById('modal-customer-phone');
  const street = document.getElementById('modal-customer-street');
  const town = document.getElementById('modal-customer-town');
  const number = document.getElementById('modal-customer-number');
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (!name.value || !nameRegex.test(name.value.trim())) {
    alert('Ingresa un nombre válido.');
    name.focus();
    return false;
  }
  if (!lastname.value || !nameRegex.test(lastname.value.trim())) {
    alert('Ingresa apellidos válidos.');
    lastname.focus();
    return false;
  }
  if (!phone.value || !phoneRegex.test(phone.value.trim())) {
    alert('Ingresa un teléfono válido.');
    phone.focus();
    return false;
  }
  if (!street.value.trim()) {
    alert('Ingresa la calle.');
    street.focus();
    return false;
  }
  if (!town.value.trim()) {
    alert('Ingresa la población.');
    town.focus();
    return false;
  }
  if (!number.value.trim()) {
    alert('Ingresa el número de casa/departamento.');
    number.focus();
    return false;
  }
  return true;
}

/**
 * Actualiza el resumen de costos en el modal de cliente.
 */
function updateClientSummary(coupon) {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  let delivery = 2000 + cart.reduce((acc, it) => acc + (it.quantity * 500), 0);
  let discount = 0;
  if (coupon && coupon.trim().toUpperCase() === 'DESCUENTO10') {
    discount = Math.round((subtotal + delivery) * 0.10);
  }
  const total = subtotal + delivery - discount;
  document.getElementById('modal-checkout-subtotal').textContent = '$' + subtotal;
  document.getElementById('modal-checkout-delivery').textContent = '$' + delivery;
  document.getElementById('modal-checkout-discount').textContent = '-$' + discount;
  document.getElementById('modal-checkout-total').textContent = '$' + total;
}

/**
 * Confirma la orden desde el flujo de modales.
 */
function confirmOrderModal(method) {
  if (!validateClientForm()) return;
  const name = document.getElementById('modal-customer-name').value.trim();
  const lastname = document.getElementById('modal-customer-lastname').value.trim();
  alert('¡Pedido realizado! Gracias, ' + name + ' ' + lastname + '.');
  // Vaciar el carrito y actualizar contador
  cart.length = 0;
  updateCartCount();
  // Ocultar modales
  hidePaymentModal();
  hideClientModal();
  hideCartModal();
  closeModal();
  // Asegurarse de ocultar secciones
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'none';
  renderCart();
  // Mostrar progreso del pedido
  showOrderProgress();
}

/**
 * Muestra el contenido del carrito y calcula los importes.
 */
function renderCart() {
  const cartSection = document.getElementById('cart-section');
  const itemsContainer = document.getElementById('cart-items');
  itemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartSection.style.display = 'none';
    return;
  }
  cartSection.style.display = 'block';
  let subtotal = 0;
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    const details = document.createElement('div');
    details.className = 'details';
    const name = document.createElement('div');
    name.textContent = item.name + (item.requiredChoice ? ' (' + item.requiredChoice + ')' : '');
    details.appendChild(name);
    if (item.extras && item.extras.length > 0) {
      const extras = document.createElement('div');
      extras.style.fontSize = '0.85rem';
      extras.style.color = '#555';
      extras.textContent = 'Extras: ' + item.extras.join(', ');
      details.appendChild(extras);
    }
    if (item.note) {
      const note = document.createElement('div');
      note.style.fontSize = '0.85rem';
      note.style.color = '#555';
      note.textContent = 'Nota: ' + item.note;
      details.appendChild(note);
    }
    const priceLine = document.createElement('div');
    priceLine.textContent = item.quantity + ' x $' + item.price + ' = $' + (item.price * item.quantity);
    priceLine.style.fontWeight = 'bold';
    details.appendChild(priceLine);
    div.appendChild(details);
    const actions = document.createElement('div');
    actions.className = 'actions';
    const minus = document.createElement('button');
    minus.textContent = '-';
    minus.addEventListener('click', () => {
      if (item.quantity > 1) {
        item.quantity--;
        renderCart();
      }
    });
    const qtyDisplay = document.createElement('span');
    qtyDisplay.textContent = item.quantity;
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.addEventListener('click', () => {
      item.quantity++;
      renderCart();
    });
    const remove = document.createElement('button');
    remove.textContent = 'x';
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      renderCart();
    });
    actions.appendChild(minus);
    actions.appendChild(qtyDisplay);
    actions.appendChild(plus);
    actions.appendChild(remove);
    div.appendChild(actions);
    itemsContainer.appendChild(div);
    subtotal += item.price * item.quantity;
  });
  // Calcular envío: base 2000 + 500 por ítem
  let delivery = 2000;
  delivery += cart.reduce((acc, it) => acc + (it.quantity * 500), 0);
  // Por defecto no hay descuento hasta aplicar cupón en checkout
  const discount = 0;
  const total = subtotal + delivery - discount;
  document.getElementById('delivery-amount').textContent = '$' + delivery;
  document.getElementById('discount-amount').textContent = '$' + discount;
  document.getElementById('cart-total').textContent = '$' + total;
}

/**
 * Calcula y actualiza el resumen en el checkout.
 */
function updateCheckoutSummary(coupon) {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  let delivery = 2000;
  delivery += cart.reduce((acc, it) => acc + (it.quantity * 500), 0);
  let discount = 0;
  if (coupon && coupon.trim().toUpperCase() === 'DESCUENTO10') {
    discount = Math.round((subtotal + delivery) * 0.10);
  }
  const total = subtotal + delivery - discount;
  document.getElementById('checkout-subtotal').textContent = '$' + subtotal;
  document.getElementById('checkout-delivery').textContent = '$' + delivery;
  document.getElementById('checkout-discount').textContent = '-$' + discount;
  document.getElementById('checkout-total').textContent = '$' + total;
}

/**
 * Valida los campos del formulario de entrega.
 */
function validateCheckoutForm() {
  const name = document.getElementById('customer-name');
  const lastname = document.getElementById('customer-lastname');
  const phone = document.getElementById('customer-phone');
  const street = document.getElementById('customer-street');
  const town = document.getElementById('customer-town');
  const number = document.getElementById('customer-number');
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{7,15}$/;
  if (!name.value || !nameRegex.test(name.value.trim())) {
    alert('Ingresa un nombre válido.');
    name.focus();
    return false;
  }
  if (!lastname.value || !nameRegex.test(lastname.value.trim())) {
    alert('Ingresa apellidos válidos.');
    lastname.focus();
    return false;
  }
  if (!phone.value || !phoneRegex.test(phone.value.trim())) {
    alert('Ingresa un teléfono válido.');
    phone.focus();
    return false;
  }
  if (!street.value.trim()) {
    alert('Ingresa la calle.');
    street.focus();
    return false;
  }
  if (!town.value.trim()) {
    alert('Ingresa la población.');
    town.focus();
    return false;
  }
  if (!number.value.trim()) {
    alert('Ingresa el número de casa/departamento.');
    number.focus();
    return false;
  }
  return true;
}

/**
 * Muestra la sección de checkout.
 */
function showCheckoutSection() {
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'block';
  updateCheckoutSummary(document.getElementById('coupon-code').value);
}

/**
 * Cancela el checkout y regresa al carrito.
 */
function cancelCheckout() {
  document.getElementById('checkout-section').style.display = 'none';
  document.getElementById('cart-section').style.display = 'block';
}

/**
 * Confirma la orden y muestra el progreso del pedido.
 */
function confirmOrder() {
  if (!validateCheckoutForm()) return;
  // Guardar datos del cliente si se desea (para la demo no se persiste)
  const name = document.getElementById('customer-name').value.trim();
  const lastname = document.getElementById('customer-lastname').value.trim();
  alert('¡Pedido realizado! Gracias, ' + name + ' ' + lastname + '.');
  // Vaciar el carrito y reiniciar
  cart.length = 0;
  renderCart();
  document.getElementById('checkout-section').style.display = 'none';
  // Mostrar progreso del pedido
  showOrderProgress();
}

/**
 * Muestra la sección de progreso del pedido y actualiza los estados de forma simulada.
 */
function showOrderProgress() {
  // Ocultar contenido principal
  document.getElementById('category-nav').style.display = 'none';
  document.getElementById('product-container').style.display = 'none';
  document.getElementById('cart-section').style.display = 'none';
  document.getElementById('checkout-section').style.display = 'none';
  // Mostrar progreso
  const progressSection = document.getElementById('order-progress');
  progressSection.style.display = 'block';
  const steps = document.querySelectorAll('#progress-steps .step');
  let current = 0;
  function updateStep() {
    if (current > 0) {
      steps[current - 1].classList.remove('active');
    }
    if (current < steps.length) {
      steps[current].classList.add('active');
      current++;
      // Avanzar al siguiente estado después de unos segundos
      setTimeout(updateStep, 3000);
    }
  }
  updateStep();
}

/**
 * Adjunta los listeners a los botones y campos de entrada principales.
 */
function attachEventListeners() {
  // Cerrar modal
  document.getElementById('modal-close').addEventListener('click', closeModal);
  // El icono del carrito abre el modal del carrito
  document.getElementById('cart-icon').addEventListener('click', openCartModal);
  // Cerrar y cancelar carrito
  document.getElementById('close-cart').addEventListener('click', hideCartModal);
  document.getElementById('cancel-cart').addEventListener('click', hideCartModal);
  // Continuar desde el carrito al formulario de cliente
  document.getElementById('continue-to-client').addEventListener('click', () => {
    hideCartModal();
    openClientModal();
  });
  // Cerrar o cancelar el formulario de cliente
  document.getElementById('close-client').addEventListener('click', hideClientModal);
  document.getElementById('cancel-client').addEventListener('click', hideClientModal);
  // Continuar desde el formulario de cliente al pago
  document.getElementById('continue-to-payment').addEventListener('click', () => {
    if (validateClientForm()) {
      hideClientModal();
      openPaymentModal();
    }
  });
  // Actualizar resumen en el modal de cliente al cambiar el cupón
  document.getElementById('modal-coupon-code').addEventListener('input', (e) => {
    updateClientSummary(e.target.value);
  });
  // Cerrar o cancelar modal de pago
  document.getElementById('close-payment').addEventListener('click', hidePaymentModal);
  document.getElementById('cancel-payment').addEventListener('click', hidePaymentModal);
  // Selección de método de pago
  document.getElementById('payment-cash').addEventListener('click', () => {
    confirmOrderModal('cash');
  });
  document.getElementById('payment-card').addEventListener('click', () => {
    confirmOrderModal('card');
  });
  // Eventos originales para checkout se mantienen ocultos, pero podrían usarse
  // Navegar al checkout desde el carrito (sección clásica)
  const goToCheckoutBtn = document.getElementById('go-to-checkout');
  if (goToCheckoutBtn) {
    goToCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      showCheckoutSection();
    });
  }
  // Cancelar checkout
  const cancelCheckoutBtn = document.getElementById('cancel-checkout');
  if (cancelCheckoutBtn) {
    cancelCheckoutBtn.addEventListener('click', cancelCheckout);
  }
  // Confirmar pedido
  const confirmOrderBtn = document.getElementById('confirm-order');
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener('click', confirmOrder);
  }
  // Recalcular resumen en checkout clásico
  const couponInput = document.getElementById('coupon-code');
  if (couponInput) {
    couponInput.addEventListener('input', (e) => {
      updateCheckoutSummary(e.target.value);
    });
  }
  // Buscar productos
  document.getElementById('search-input').addEventListener('input', (e) => {
    renderProducts(e.target.value);
  });
}