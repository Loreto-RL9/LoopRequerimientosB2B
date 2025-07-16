const sheetID = '1w350hzNDgfeurVHzZNCjavN2HwbJDH6oL42_7_gwvoQ';
const sheetName = 'Estado';
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const panel = document.getElementById('panel');
const filtroEstado = document.getElementById('filtroEstado');
const filtroTexto = document.getElementById('filtroTexto');
const toggleLoop = document.getElementById('toggleLoop');
const timestamp = document.getElementById('timestamp');

let empresas = [];
let animando = true;
let scrollInterval;

async function cargarDatos() {
  try {
    const res = await fetch(url);
    empresas = await res.json();
    renderizarEmpresas();
    timestamp.innerText = "Última actualización: " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    timestamp.innerText = "Error al cargar datos.";
  }
}

function renderizarEmpresas() {
  panel.innerHTML = "";
  const estado = filtroEstado.value;
  const texto = filtroTexto.value.toLowerCase();

  const filtradas = empresas.filter(({ Disponibilidad, RE }) => {
    return (!estado || Disponibilidad === estado) &&
           (!texto || RE.toLowerCase().includes(texto));
  });

  if (filtradas.length === 0) {
    panel.innerHTML = `<div class="card">Sin coincidencias</div>`;
    return;
  }

  filtradas.forEach(({ Compradores, Disponibilidad, RE }) => {
    const div = document.createElement("div");
    const emoji = Disponibilidad === "Disponible" ? "🟢" :
                  Disponibilidad === "Ocupado" ? "🟠" : "☕";

    div.className = `card ${Disponibilidad}`;
    div.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || 'Sin requerimientos'}</em>`;
    panel.appendChild(div);
  });
}

function iniciarScroll() {
  clearInterval(scrollInterval);
  scrollInterval = setInterval(() => {
    if (!animando) return;
    panel.scrollLeft += 1;
    if (panel.scrollLeft >= panel.scrollWidth - panel.clientWidth) {
      panel.scrollLeft = 0;
    }
  }, 30);
}

toggleLoop.addEventListener("click", () => {
  animando = !animando;
  toggleLoop.textContent = animando ? "⏸️ Pausar" : "▶️ Reanudar";
});

filtroEstado.addEventListener("change", renderizarEmpresas);
filtroTexto.addEventListener("input", renderizarEmpresas);

// Inicializar
cargarDatos();
setInterval(cargarDatos, 30000);
iniciarScroll();
