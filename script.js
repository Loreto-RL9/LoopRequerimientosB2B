const sheetID = '1w350hzNDgfeurVHzZNCjavN2HwbJDH6oL42_7_gwvoQ';
const sheetName = 'Estado';
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const carrusel = document.getElementById('carrusel');
const filtroEstado = document.getElementById('filtroEstado');
const filtroTexto = document.getElementById('filtroTexto');
const toggleLoop = document.getElementById('toggleLoop');
let empresas = [];
let animando = true;
let scrollInterval;

async function cargarDatos() {
  const res = await fetch(url);
  empresas = await res.json();
  renderizarEmpresas();
  document.getElementById("timestamp").innerText =
    "Última actualización: " + new Date().toLocaleTimeString();
}

function renderizarEmpresas() {
  carrusel.innerHTML = "";
  const estado = filtroEstado.value;
  const texto = filtroTexto.value.toLowerCase();

  const filtradas = empresas.filter(({ Disponibilidad, RE }) => {
    return (!estado || Disponibilidad === estado) &&
           (!texto || RE.toLowerCase().includes(texto));
  });

  filtradas.forEach(({ Compradores, Disponibilidad, RE }) => {
    const div = document.createElement("div");
    const emoji = Disponibilidad === "Disponible" ? "🟢" :
                  Disponibilidad === "Ocupado" ? "🟠" : "☕";

    div.className = `card ${Disponibilidad}`;
    div.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || 'Sin requerimientos'}</em>`;
    carrusel.appendChild(div);
  });
}

function iniciarScroll() {
  clearInterval(scrollInterval);
  scrollInterval = setInterval(() => {
    if (!animando) return;
    carrusel.scrollLeft += 1;
    if (carrusel.scrollLeft >= carrusel.scrollWidth - carrusel.clientWidth) {
      carrusel.scrollLeft = 0;
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
