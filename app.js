document.getElementById("product-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const productCode = document.getElementById("product-code").value.trim();
  const name = document.getElementById("name").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value);
  const size = document.getElementById("size").value.trim();
  const gender = document.getElementById("gender").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const qrCode = document.getElementById("qr-code").value.trim();

  // Validar si el código QR ya existe
  const rows = document.querySelectorAll("#product-table-body tr");
  for (let row of rows) {
    if (row.dataset.qrcode === qrCode) {
      alert(`⚠️ El código QR ${qrCode} ya está registrado.`);
      return;
    }
  }

  const row = document.createElement("tr");
  row.dataset.qrcode = qrCode;
  row.innerHTML = `
    <td><input type="checkbox" class="select-product"></td>
    <td>${productCode}</td>
    <td>${name}</td>
    <td class="quantity">${quantity}</td>
    <td>${size}</td>
    <td>${gender}</td>
    <td>$${price.toFixed(2)}</td>
    <td>${qrCode}</td>
    <td><button onclick="removeProduct(this, '${qrCode}')">Eliminar</button></td>
  `;

  document.getElementById("product-table-body").appendChild(row);
  this.reset();
});

function removeProduct(button, qrCode) {
  if (confirm(`¿Estás seguro de eliminar el producto con QR ${qrCode}?`)) {
    button.closest("tr").remove();
  }
}