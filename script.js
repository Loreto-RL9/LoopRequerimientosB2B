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
    actualizarEmpresas();
    timestamp.innerText = "Última actualización: " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    timestamp.innerText = "Error al cargar datos.";
  }
}

function actualizarEmpresas() {
  const estado = filtroEstado.value;
  const texto = filtroTexto.value.toLowerCase();

  const filtradas = empresas.filter(({ Disponibilidad, RE }) => {
    return (!estado || Disponibilidad === estado) &&
           (!texto || RE.toLowerCase().includes(texto));
  });

  const tarjetasExistentes = {};
  panel.querySelectorAll('.card').forEach(card => {
    const nombre = card.getAttribute('data-comprador');
    if (nombre) tarjetasExistentes[nombre] = card;
  });

  const nuevos = new Set();

  filtradas.forEach(({ Compradores, Disponibilidad, RE }) => {
    nuevos.add(Compradores);
    const emoji = Disponibilidad === "Disponible" ? "🟢" :
                  Disponibilidad === "Ocupado" ? "🟠" : "☕";

    if (tarjetasExistentes[Compradores]) {
      const card = tarjetasExistentes[Compradores];
      card.className = `card ${Disponibilidad}`;
      card.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || 'Sin requerimientos'}</em>`;
    } else {
      const div = document.createElement("div");
      div.className = `card ${Disponibilidad}`;
      div.setAttribute('data-comprador', Compradores);
      div.innerHTML = `<strong>${emoji} ${Compradores}</strong><br><em>${RE || 'Sin requerimientos'}</em>`;
      panel.appendChild(div);
    }
  });

  Object.keys(tarjetasExistentes).forEach(nombre => {
    if (!nuevos.has(nombre)) {
      panel.removeChild(tarjetasExistentes[nombre]);
    }
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

filtroEstado.addEventListener("change", actualizarEmpresas);
filtroTexto.addEventListener("input", actualizarEmpresas);

// Inicializar
cargarDatos();
setInterval(cargarDatos, 30000);
iniciarScroll();
