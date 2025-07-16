const sheetID = '1w350hzNDgfeurVHzZNCjavN2HwbJDH6oL42_7_gwvoQ';
const sheetName = 'Estado';
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

let empresas = [];
let pausado = false;

async function actualizar() {
  try {
    const res = await fetch(url);
    empresas = await res.json();
    aplicarFiltrosYRender();
    document.getElementById("timestamp").innerText =
      "Última actualización: " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

function aplicarFiltrosYRender() {
  const estadoFiltro = document.getElementById("filtroEstado").value;
  const requerimientoFiltro = document.getElementById("filtroRequerimiento").value.toLowerCase();

  const filtradas = empresas.filter(({ Disponibilidad, RE }) =>
    (!estadoFiltro || Disponibilidad === estadoFiltro) &&
    (!requerimientoFiltro || RE.toLowerCase().includes(requerimientoFiltro))
  );

  renderLoop(filtradas);
}

function renderLoop(empresasFiltradas) {
  const panel = document.getElementById("panel");
  panel.innerHTML = ""; // Limpiar

  const contenedor = document.createElement("div");
  contenedor.className = "marquee";
  contenedor.id = "marquee-container";

  empresasFiltradas.forEach(({ Compradores, Disponibilidad, RE }) => {
    const div = document.createElement("div");
    const emoji =
      Disponibilidad === "Disponible"
        ? "🟢"
        : Disponibilidad === "Ocupado"
        ? "🟠"
        : "☕";

    div.className = `estado ${Disponibilidad.replace(/\s/g, '')}`;
    div.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || "Sin requerimientos"}</em>`;
    contenedor.appendChild(div);
  });

  // Clonamos los elementos para loop infinito
  const clon = contenedor.cloneNode(true);
  contenedor.appendChild(clon);

  panel.appendChild(contenedor);
}

// Pausar o reanudar animación CSS
document.getElementById("toggleCarrusel").addEventListener("click", () => {
  pausado = !pausado;
  const btn = document.getElementById("toggleCarrusel");
  const marquee = document.getElementById("marquee-container");

  if (pausado) {
    marquee.style.animationPlayState = "paused";
    btn.textContent = "▶️ Reanudar";
  } else {
    marquee.style.animationPlayState = "running";
    btn.textContent = "⏸️ Pausar";
  }
});

document.getElementById("filtroEstado").addEventListener("change", aplicarFiltrosYRender);
document.getElementById("filtroRequerimiento").addEventListener("input", aplicarFiltrosYRender);

// Carga inicial
actualizar();
setInterval(actualizar, 20000);
