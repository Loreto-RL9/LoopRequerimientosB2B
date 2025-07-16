const sheetID = '1w350hzNDgfeurVHzZNCjavN2HwbJDH6oL42_7_gwvoQ';
const sheetName = 'Estado';
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

let empresas = [];
let indexActual = 0;
let intervalo;
let pausado = false;
let filtradas = [];

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
  const textoFiltro = document.getElementById("filtroTexto").value.toLowerCase();

  filtradas = empresas.filter(({ Disponibilidad, RE }) =>
    (!estadoFiltro || Disponibilidad === estadoFiltro) &&
    (!textoFiltro || (RE || '').toLowerCase().includes(textoFiltro))
  );

  renderLoop();
}

function renderLoop() {
  const panel = document.getElementById("panel");
  panel.innerHTML = "";

  const tarjetasVisibles = 20; // 5 columnas x 4 filas
  const empresasVisibles = filtradas.slice(indexActual, indexActual + tarjetasVisibles);

  if (empresasVisibles.length < tarjetasVisibles) {
    empresasVisibles.push(...filtradas.slice(0, tarjetasVisibles - empresasVisibles.length));
  }

  empresasVisibles.forEach(({ Compradores, Disponibilidad, RE }) => {
    const div = document.createElement("div");
    const emoji =
      Disponibilidad === "Disponible" ? "🟢" :
      Disponibilidad === "Ocupado" ? "🟠" : "☕";
    div.className = `estado ${Disponibilidad}`;
    div.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || 'Sin requerimientos'}</em>`;
    panel.appendChild(div);
  });
}

function iniciarCarrusel() {
  clearInterval(intervalo);
  intervalo = setInterval(() => {
    indexActual = (indexActual + 4) % filtradas.length;
    renderLoop();
  }, 20000);
}

document.getElementById("toggleCarrusel").addEventListener("click", () => {
  pausado = !pausado;
  const btn = document.getElementById("toggleCarrusel");
  if (pausado) {
    clearInterval(intervalo);
    btn.textContent = "▶️ Reanudar";
  } else {
    iniciarCarrusel();
    btn.textContent = "⏸️ Pausar";
  }
});

document.getElementById("filtroEstado").addEventListener("change", () => {
  indexActual = 0;
  aplicarFiltrosYRender();
});

document.getElementById("filtroTexto").addEventListener("input", () => {
  indexActual = 0;
  aplicarFiltrosYRender();
});

// Inicializar
actualizar();
setInterval(actualizar, 20000);
iniciarCarrusel();
