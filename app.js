const form = document.getElementById('productForm');
const inventoryBody = document.getElementById('inventoryBody');
const status = document.getElementById('status');
const products = [];

// Mostrar mensaje de estado
function showStatus(message, type = 'success') {
  status.textContent = message;
  status.className = type;
}

// Cargar productos guardados al iniciar
loadFromLocalStorage();

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const productCode = document.getElementById('productCode').value.trim();
  const name = document.getElementById('name').value.trim();
  const quantity = parseInt(document.getElementById('quantity').value);
  const size = document.getElementById('size').value.trim();
  const gender = document.getElementById('gender').value;
  const price = parseFloat(document.getElementById('price').value);
  const qrCode = document.getElementById('qrCode').value.trim();
  const file = document.getElementById('image').files[0];

  if (!productCode || !name || !quantity || !size || !gender || !price || !qrCode || !file) {
    showStatus('⚠️ Todos los campos son obligatorios.', 'error');
    return;
  }

  if (products.some(p => p.qrCode === qrCode)) {
    showStatus(`⚠️ El código QR ${qrCode} ya está registrado.`, 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const imageUrl = event.target.result;

    const row = document.createElement('tr');
    row.dataset.qr = qrCode;

    row.innerHTML = `
      <td><img src="${imageUrl}" alt="producto" width="60"></td>
      <td>${productCode}</td>
      <td>${name}</td>
      <td class="quantity">${quantity}</td>
      <td>${size}</td>
      <td>${gender}</td>
      <td>$${price.toFixed(2)}</td>
      <td>${qrCode}</td>
      <td><button onclick="removeProduct(this, '${qrCode}')">Eliminar</button></td>
    `;

    inventoryBody.appendChild(row);
    products.push({ qrCode, row });
    saveToLocalStorage();
    showStatus(`✅ Producto agregado: ${name}`, 'success');
    form.reset();
  };

  reader.readAsDataURL(file);
});

function removeProduct(btn, qrCode) {
  const index = products.findIndex(p => p.qrCode === qrCode);
  if (index !== -1) {
    products.splice(index, 1);
  }
  btn.closest('tr').remove();
  saveToLocalStorage();
  showStatus(`🗑️ Producto eliminado: ${qrCode}`, 'success');
}

function onScanSuccess(decodedText) {
  const product = products.find(p => p.qrCode === decodedText);
  if (product) {
    let quantityCell = product.row.querySelector('.quantity');
    let current = parseInt(quantityCell.textContent);
    if (current > 0) {
      quantityCell.textContent = current - 1;
      saveToLocalStorage();
      showStatus(`📦 Cantidad actualizada para: ${decodedText}`, 'success');
    } else {
      showStatus(`🚫 El producto ${decodedText} está agotado.`, 'error');
    }
  } else {
    showStatus(`❓ Código ${decodedText} no encontrado.`, 'error');
  }
}

const html5QrCode = new Html5Qrcode("reader");
Html5Qrcode.getCameras().then(devices => {
  if (devices && devices.length) {
    const cameraId = devices[0].id;
    html5QrCode.start(cameraId, { fps: 10, qrbox: 250 }, onScanSuccess);
  }
}).catch(err => {
  console.error("Error al acceder a la cámara:", err);
});

function saveToLocalStorage() {
  const data = Array.from(inventoryBody.children).map(row => {
    const cells = row.children;
    return {
      image: cells[0].querySelector('img').src,
      code: cells[1].textContent,
      name: cells[2].textContent,
      quantity: parseInt(cells[3].textContent),
      size: cells[4].textContent,
      gender: cells[5].textContent,
      price: parseFloat(cells[6].textContent.replace('$', '')),
      qrCode: cells[7].textContent
    };
  });
  localStorage.setItem('products', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('products')) || [];
  data.forEach(product => {
    const row = document.createElement('tr');
    row.dataset.qr = product.qrCode;

    row.innerHTML = `
      <td><img src="${product.image}" alt="producto" width="60"></td>
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td class="quantity">${product.quantity}</td>
      <td>${product.size}</td>
      <td>${product.gender}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td>${product.qrCode}</td>
      <td><button onclick="removeProduct(this, '${product.qrCode}')">Eliminar</button></td>
    `;

    inventoryBody.appendChild(row);
    products.push({ qrCode: product.qrCode, row });
  });
}