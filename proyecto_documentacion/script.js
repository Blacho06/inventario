// Cargar Google Charts
google.charts.load('current', {'packages':['corechart']});

// Variable global para productos
let productos = [];

// Función para cargar productos desde la base de datos
async function cargarProductos() {
    try {
        const response = await fetch('operaciones.php');
        const data = await response.json();
        if (data) {
            productos = data;
            actualizarTablaInventario();
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Inicialización cuando se carga el documento
document.addEventListener('DOMContentLoaded', function() {
    const btnInventario = document.getElementById('btn-inventario');
    const btnGraficos = document.getElementById('btn-graficos');
    const seccionInventario = document.getElementById('seccion-inventario');
    const seccionGraficos = document.getElementById('seccion-graficos');
    const controlesInventario = document.querySelector('.controles-inventario');

    // Mostrar inventario por defecto
    seccionInventario.classList.add('active');
    controlesInventario.style.display = 'block';

    // Cargar productos desde la base de datos
    cargarProductos();

    // Event listeners para los botones de navegación
    btnInventario.addEventListener('click', function() {
        seccionInventario.classList.add('active');
        seccionGraficos.classList.remove('active');
        btnInventario.classList.add('active');
        btnGraficos.classList.remove('active');
        controlesInventario.style.display = 'block';
    });

    btnGraficos.addEventListener('click', function() {
        seccionInventario.classList.remove('active');
        seccionGraficos.classList.add('active');
        btnInventario.classList.remove('active');
        btnGraficos.classList.add('active');
        controlesInventario.style.display = 'none';
    });

    // Agregar event listeners para los botones de control
    document.querySelector('.controles-inventario').innerHTML = `
        <button onclick="mostrarFormularioAgregar()">Agregar Producto</button>
        <button onclick="quitarProducto()">Quitar Producto</button>
    `;
});

// Función para actualizar toda la tabla
function actualizarTablaInventario() {
    const tableBody = document.getElementById("inventario-tbody");
    if (!tableBody) return;
    
    tableBody.innerHTML = ''; // Limpiar tabla
    
    productos.forEach((producto) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <input type="checkbox" class="producto-checkbox" data-id="${producto.id}">
                ${producto.nombre}
            </td>
            <td>${producto.cantidad}</td>
            <td>$${parseFloat(producto.precioUnitario).toLocaleString()}</td>
            <td>$${(producto.cantidad * producto.precioUnitario).toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

function mostrarFormularioAgregar() {
    // Crear y mostrar el formulario modal
    const formHTML = `
        <div id="formulario-agregar" class="formulario-modal" style="display:block;">
            <div class="formulario-contenido">
                <h3>Agregar Nuevo Producto</h3>
                <form id="form-agregar" onsubmit="agregarNuevoProducto(event)">
                    <input type="text" id="nombre-producto" placeholder="Nombre del producto" required>
                    <input type="number" id="cantidad-producto" placeholder="Cantidad" required>
                    <input type="number" id="precio-producto" placeholder="Precio unitario" required>
                    <div class="botones-formulario">
                        <button type="submit">Agregar</button>
                        <button type="button" onclick="cerrarFormulario()">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Agregar el formulario al DOM si no existe
    if (!document.getElementById('formulario-agregar')) {
        document.body.insertAdjacentHTML('beforeend', formHTML);
    } else {
        document.getElementById('formulario-agregar').style.display = 'block';
    }
}

function cerrarFormulario() {
    const formulario = document.getElementById('formulario-agregar');
    if (formulario) {
        formulario.style.display = 'none';
    }
    limpiarFormulario();
}

function limpiarFormulario() {
    const form = document.getElementById('form-agregar');
    if (form) {
        form.reset();
    }
}

async function agregarNuevoProducto(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre-producto').value;
    const cantidad = document.getElementById('cantidad-producto').value;
    const precio = document.getElementById('precio-producto').value;

    if (nombre && cantidad && precio) {
        const formData = new FormData();
        formData.append('action', 'addProduct');
        formData.append('nombre', nombre);
        formData.append('cantidad', cantidad);
        formData.append('precio', precio);

        try {
            const response = await fetch('operaciones.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                await cargarProductos();
                cerrarFormulario();
                alert('Producto agregado correctamente');
            } else {
                alert("Error al agregar el producto: " + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error al agregar el producto");
        }
    } else {
        alert("Por favor, completa todos los campos correctamente.");
    }
}

async function quitarProducto() {
    const checkboxes = document.querySelectorAll('.producto-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Por favor, selecciona al menos un producto para eliminar.");
        return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar ${checkboxes.length} producto(s)?`)) {
        const ids = Array.from(checkboxes).map(checkbox => 
            parseInt(checkbox.getAttribute('data-id'))
        );

        const formData = new FormData();
        formData.append('action', 'deleteProduct');
        formData.append('ids[]', ids.join(','));

        try {
            const response = await fetch('operaciones.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                await cargarProductos();
                alert('Productos eliminados correctamente');
            } else {
                alert("Error al eliminar los productos: " + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error al eliminar los productos");
        }
    }
}

// Funciones para los gráficos
function cargarGrafico() {
    google.charts.setOnLoadCallback(dibujarGrafico);
}

function dibujarGrafico() {
    const tipo = document.getElementById('tipo').value;
    const titulo = document.getElementById('titulo').value || 'Inventario';

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Producto');
    data.addColumn('number', 'Valor Total');

    productos.forEach(producto => {
        data.addRow([
            producto.nombre,
            producto.cantidad * parseFloat(producto.precioUnitario)
        ]);
    });

    const options = {
        title: titulo,
        width: '100%',
        height: 500
    };

    const chart = tipo === 'circular' 
        ? new google.visualization.PieChart(document.getElementById('piechart'))
        : new google.visualization.BarChart(document.getElementById('piechart'));

    chart.draw(data, options);
}