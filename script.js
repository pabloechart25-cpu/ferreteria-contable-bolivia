let inventario = [];
let ventas = [];
let totalDiario = 0;

const inventarioForm = document.getElementById("inventarioForm");
const ventaForm = document.getElementById("ventaForm");
const tablaInventario = document.querySelector("#tablaInventario tbody");
const tablaVentas = document.querySelector("#tablaVentas tbody");
const totalDiarioEl = document.getElementById("totalDiario");
const productoVenta = document.getElementById("productoVenta");

// Agregar al inventario
inventarioForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value;
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const stock = parseInt(document.getElementById("stockProducto").value);

  inventario.push({ nombre, precio, stock });
  actualizarInventario();
  actualizarSelectProductos();
  inventarioForm.reset();
});

// Actualizar inventario en tabla
function actualizarInventario() {
  tablaInventario.innerHTML = "";
  inventario.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.precio}</td>
      <td>${item.stock}</td>
      <td class="${item.stock <= 5 ? 'estado-bajo' : ''}">
        ${item.stock <= 5 ? 'Stock Bajo' : 'Disponible'}
      </td>
    `;
    tablaInventario.appendChild(row);
  });
}

// Actualizar select de productos en ventas
function actualizarSelectProductos() {
  productoVenta.innerHTML = "";
  inventario.forEach((item, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `${item.nombre} (${item.stock} u.)`;
    productoVenta.appendChild(option);
  });
}

// Registrar venta
ventaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const index = productoVenta.value;
  const cantidad = parseInt(document.getElementById("cantidadVenta").value);
  const metodoPago = document.getElementById("metodoPago").value;

  if (cantidad > inventario[index].stock) {
    alert("Stock insuficiente para esta venta.");
    return;
  }

  inventario[index].stock -= cantidad;
  const total = inventario[index].precio * cantidad;
  totalDiario += total;

  ventas.push({ producto: inventario[index].nombre, cantidad, total, metodoPago });

  actualizarInventario();
  actualizarTablaVentas();
  actualizarSelectProductos();
  ventaForm.reset();
});

// Actualizar tabla de ventas
function actualizarTablaVentas() {
  tablaVentas.innerHTML = "";
  ventas.forEach((venta, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${venta.producto}</td>
      <td>${venta.cantidad}</td>
      <td>${venta.total.toFixed(2)}</td>
      <td>${venta.metodoPago}</td>
      <td><button onclick="eliminarVenta(${i})">❌</button></td>
    `;
    tablaVentas.appendChild(row);
  });
  totalDiarioEl.textContent = totalDiario.toFixed(2);
}

// Eliminar venta
function eliminarVenta(i) {
  totalDiario -= ventas[i].total;
  ventas.splice(i, 1);
  actualizarTablaVentas();
}

// Exportar PDF
function exportarPDF(tipo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("📊 Reporte de Ferretería", 20, 20);
  doc.text(`Tipo de reporte: ${tipo.toUpperCase()}`, 20, 30);

  let y = 40;
  doc.text("Ventas:", 20, y);
  y += 10;

  ventas.forEach((venta, i) => {
    doc.text(
      `${i + 1}. ${venta.producto} - Cant: ${venta.cantidad} - Total: ${venta.total} Bs (${venta.metodoPago})`,
      20,
      y
    );
    y += 10;
  });

  y += 10;
  doc.text(`💵 Total Diario: ${totalDiario.toFixed(2)} Bs`, 20, y);

  y += 20;
  doc.text("Inventario Actual:", 20, y);
  y += 10;

  inventario.forEach((item, i) => {
    doc.text(`${i + 1}. ${item.nombre} - Stock: ${item.stock}`, 20, y);
    y += 10;
  });

  doc.save(`reporte_${tipo}.pdf`);
}

// Cargar jsPDF
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.body.appendChild(script);
