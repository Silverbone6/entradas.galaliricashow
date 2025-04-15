async function obtenerAsientosBloqueados() {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxuublP5rJG030HLHQY_7nZ8p1JWhKjFUrhDZxSM3Xk_dVQRHFPUBT9prBh-vGYhwWrr3FROUlqmmA/pub?gid=0&single=true&output=csv";
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
    const filas = [
      { letra: "A", cantidad: 8, clase: "fila-a-b", precio: 32000 },
      { letra: "B", cantidad: 10, clase: "fila-a-b", precio: 32000 },
      { letra: "C", cantidad: 12, clase: "fila-c", precio: 28000 },
      { letra: "D", cantidad: 14, clase: "fila-d-e", precio: 24000 },
      { letra: "E", cantidad: 16, clase: "fila-d-e", precio: 24000 },
    ];
  
    let totalSeleccionados = 0;
    let totalPrecio = 0;
    let numeroAsientoGlobal = 1;

    const secciones = {
      puccini: "Puccini",
      mozart: "Mozart",
      bizet: "Bizet",
      verdi: "Verdi",
    };

    const actualizarResumen = () => {
      document.getElementById("asientos-seleccionados").textContent = totalSeleccionados;
      document.getElementById("total").textContent = totalPrecio.toLocaleString();
    };

    // Obtener asientos bloqueados
    obtenerAsientosBloqueados().then(asientosBloqueados => {
      Object.keys(secciones).forEach(id => {
        const bloque = document.getElementById(id);
        const nombreSeccion = secciones[id];

        const escenario = document.createElement("div");
        escenario.textContent = "ESCENARIO";
        escenario.style.fontWeight = "bold";
        escenario.style.marginBottom = "5px";
        bloque.appendChild(escenario);

        filas.forEach(fila => {
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

            const numeroSpan = document.createElement("span");
            numeroSpan.classList.add("numero-asiento");
            numeroSpan.textContent = i + 1;
            asiento.appendChild(numeroSpan);

            // Verificar si el asiento está bloqueado
            if (asientosBloqueados.has(idAsiento)) {
              asiento.classList.add("bloqueado");
            } else {
              asiento.addEventListener("click", () => {
                if (asiento.classList.contains("bloqueado")) return;

                asiento.classList.toggle("seleccionado");

                if (asiento.classList.contains("seleccionado")) {
                  totalSeleccionados++;
                  totalPrecio += fila.precio;
                } else {
                  totalSeleccionados--;
                  totalPrecio -= fila.precio;
                }

                actualizarResumen();
              });
            }

            filaDiv.appendChild(asiento);
          }

          bloque.appendChild(filaDiv);
        });
      });

      // Actualiza el resumen después de generar todo
      actualizarResumen();
    });
});
