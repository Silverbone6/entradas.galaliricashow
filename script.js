async function obtenerAsientosBloqueados() {
  const url = "https://script.google.com/macros/s/AKfycbx9V4a-b2ZHCThzDVjqpfFIJUx0eMuTVgQctPU0p11twd7I6tRLy6fuDvrl32iWNv70Rg/exec";
  const response = await fetch(url);
  const data = await response.text();

  const filas = data.trim().split("\n").slice(1); // salta encabezado
  const ocupados = new Set();

  for (const fila of filas) {
      const [seccion, letra, numero, nombre, apellido, codigo] = fila.split(",");

      if (nombre || apellido || codigo) {
          const id = `${seccion.trim()}-${letra.trim()}-${numero.trim()}`;
          ocupados.add(id);
      }
  }

  return ocupados;
}

document.addEventListener("DOMContentLoaded", () => {
  const filasConfig = [
      { letra: "A", cantidad: 8, clase: "fila-a-b", precio: 32000 },
      { letra: "B", cantidad: 10, clase: "fila-a-b", precio: 32000 },
      { letra: "C", cantidad: 12, clase: "fila-c", precio: 28000 },
      { letra: "D", cantidad: 14, clase: "fila-d-e", precio: 24000 },
      { letra: "E", cantidad: 16, clase: "fila-d-e", precio: 24000 },
  ];

  let asientosSeleccionadosArray = [];
  let totalPrecio = 0;

  const secciones = {
      puccini: "Puccini",
      mozart: "Mozart",
      bizet: "Bizet",
      verdi: "Verdi",
  };

  const actualizarResumen = () => {
      document.getElementById("asientos-seleccionados").textContent = asientosSeleccionadosArray.length;
      document.getElementById("total").textContent = totalPrecio.toLocaleString();
  };

  // Obtener asientos bloqueados y generar la grilla
  obtenerAsientosBloqueados().then(asientosBloqueados => {
      Object.keys(secciones).forEach(id => {
          const bloque = document.getElementById(id);
          const nombreSeccion = secciones[id];

          const escenario = document.createElement("div");
          escenario.textContent = "ESCENARIO";
          escenario.style.fontWeight = "bold";
          escenario.style.marginBottom = "5px";
          bloque.appendChild(escenario);

          filasConfig.forEach(fila => {
              const filaDiv = document.createElement("div");
              filaDiv.classList.add("fila", fila.clase);

              const label = document.createElement("span");
              label.classList.add("fila-label");
              label.textContent = fila.letra;
              filaDiv.appendChild(label);

              for (let i = 0; i < fila.cantidad; i++) {
                  const asiento = document.createElement("div");
                  asiento.classList.add("asiento", fila.clase);
                  asiento.title = `Fila ${fila.letra}, Asiento ${i + 1}`;
                  const idAsiento = `${nombreSeccion}-${fila.letra}-${i + 1}`;
                  asiento.dataset.id = idAsiento;
                  asiento.dataset.seccion = nombreSeccion;
                  asiento.dataset.fila = fila.letra;
                  asiento.dataset.numero = i + 1;
                  asiento.dataset.precio = fila.precio;

                  const numeroSpan = document.createElement("span");
                  numeroSpan.classList.add("numero-asiento");
                  numeroSpan.textContent = i + 1;
                  asiento.appendChild(numeroSpan);

                  if (asientosBloqueados.has(idAsiento)) {
                      asiento.classList.add("bloqueado");
                  } else {
                      asiento.addEventListener("click", () => {
                          if (asiento.classList.contains("bloqueado")) return;

                          asiento.classList.toggle("seleccionado");

                          const index = asientosSeleccionadosArray.findIndex(a => a.id === idAsiento);

                          if (asiento.classList.contains("seleccionado")) {
                              asientosSeleccionadosArray.push({
                                  id: idAsiento,
                                  seccion: nombreSeccion,
                                  fila: fila.letra,
                                  numero: i + 1,
                                  precio: fila.precio
                              });
                              totalPrecio += fila.precio;
                          } else {
                              if (index > -1) {
                                  asientosSeleccionadosArray.splice(index, 1);
                                  totalPrecio -= fila.precio;
                              }
                          }

                          actualizarResumen();
                      });
                  }

                  filaDiv.appendChild(asiento);
              }

              bloque.appendChild(filaDiv);
          });
      });

      actualizarResumen();

      // Evento para el formulario de datos del comprador
      const formularioComprador = document.getElementById('datos-comprador-form');
      const mensajeCompra = document.getElementById('mensaje-compra');
      const scriptURL = 'LA_URL_DE_TU_APLICACIÓN_WEB'; // Reemplaza con tu URL de Apps Script

      formularioComprador.addEventListener('submit', function(event) {
          event.preventDefault();

          if (asientosSeleccionadosArray.length === 0) {
              mensajeCompra.textContent = 'Por favor, selecciona al menos un asiento.';
              mensajeCompra.style.display = 'block';
              setTimeout(() => mensajeCompra.style.display = 'none', 3000);
              return;
          }

          const nombre = document.getElementById('nombre').value;
          const apellido = document.getElementById('apellido').value;
          const asientos = JSON.stringify(asientosSeleccionadosArray);

          const formData = new FormData();
          formData.append('nombre', nombre);
          formData.append('apellido', apellido);
          formData.append('asientos', asientos);

          fetch(scriptURL, {
              method: 'POST',
              mode: 'no-cors',
              body: formData
          })
          .then(response => {
              mensajeCompra.textContent = '¡Compra realizada con éxito! Redirigiendo...';
              mensajeCompra.style.display = 'block';
              formularioComprador.reset();
              asientosSeleccionadosArray = [];
              totalPrecio = 0;
              actualizarResumen();
              // Opcional: Redirigir a una página de confirmación
              // setTimeout(() => window.location.href = 'pagina-de-confirmacion.html', 2000);
          })
          .catch(error => {
              console.error('Error al enviar los datos:', error);
              mensajeCompra.textContent = 'Hubo un error al procesar tu compra. Inténtalo de nuevo más tarde.';
              mensajeCompra.style.display = 'block';
          });
      });
  });
});