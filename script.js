const STORAGE_KEY = "cronicas_dados_tables_v1";

const initialTables = [
  {
    id: 1,
    title: "As Ruínas do Vale Esquecido",
    system: "D&D 5e",
    schedule: "Terças, 19h30",
    spots: 2,
    level: "Iniciantes bem-vindos",
    desc: "Exploração de ruínas antigas, enigmas e combates táticos em nível 1 a 5."
  },
  {
    id: 2,
    title: "Lâminas de Arton",
    system: "Tormenta20",
    schedule: "Quintas, 20h",
    spots: 3,
    level: "Todos os níveis",
    desc: "Uma jornada épica por reinos em conflito, com muita interpretação e ação."
  },
  {
    id: 3,
    title: "Arquivo 09: Névoa Vermelha",
    system: "Ordem Paranormal",
    schedule: "Sábados, 15h",
    spots: 2,
    level: "Iniciantes bem-vindos",
    desc: "Investigação urbana e eventos sobrenaturais com clima de suspense."
  },
  {
    id: 4,
    title: "Cartas de Arkham",
    system: "Call of Cthulhu",
    schedule: "Domingos, 18h",
    spots: 1,
    level: "Intermediário",
    desc: "Mistério histórico, investigação minuciosa e sanidade no limite."
  },
  {
    id: 5,
    title: "Coração de Ferro",
    system: "D&D 5e",
    schedule: "Sextas, 20h30",
    spots: 4,
    level: "Iniciantes bem-vindos",
    desc: "Aventura em uma cidade portuária cheia de intrigas, guildas e segredos."
  },
  {
    id: 6,
    title: "O Eco Além do Véu",
    system: "Ordem Paranormal",
    schedule: "Quartas, 21h",
    spots: 2,
    level: "Todos os níveis",
    desc: "Missão curta com foco em investigação, escolhas morais e tensão."
  }
];

function loadTables() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...initialTables];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...initialTables];
  } catch {
    return [...initialTables];
  }
}

function saveTables() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch {
    // Ignora falhas de armazenamento em modo privado restrito
  }
}

let tables = loadTables();
let activeSystem = "Todos";

const tablesGrid = document.getElementById("tablesGrid");
const filtersEl = document.getElementById("filters");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTables() {
  const filtered =
    activeSystem === "Todos"
      ? tables
      : tables.filter((t) => t.system === activeSystem);

  if (filtered.length === 0) {
    tablesGrid.innerHTML = `
      <article class="card">
        <h3>Nenhuma mesa encontrada</h3>
        <p>Não há campanhas cadastradas para o filtro selecionado.</p>
      </article>
    `;
    return;
  }

  tablesGrid.innerHTML = filtered
    .map(
      (t) => `
      <article class="card">
        <div>
          <div class="card-top">
            <span class="tag">${escapeHtml(t.system)}</span>
            <span class="vagas ${t.spots === 0 ? "empty" : ""}">${t.spots} ${t.spots === 1 ? "vaga" : "vagas"}</span>
          </div>
          <h3>${escapeHtml(t.title)}</h3>
          <p>${escapeHtml(t.desc)}</p>
        </div>
        <div>
          <div class="meta">
            <span>📅 ${escapeHtml(t.schedule)}</span>
            <span>🎯 ${escapeHtml(t.level)}</span>
          </div>
          <button
            class="btn btn-outline"
            type="button"
            style="width:100%"
            ${t.spots === 0 ? "disabled" : ""}
            onclick="applySpot(${t.id})"
          >
            ${t.spots === 0 ? "Sem Vagas" : "Solicitar Vaga"}
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function applySpot(id) {
  const table = tables.find((t) => t.id === id);
  if (!table || table.spots <= 0) return;
  table.spots -= 1;
  saveTables();
  renderTables();
  alert(`Solicitação enviada para "${table.title}"!`);
}

function resetTables() {
  tables = [...initialTables];
  saveTables();
  renderTables();
}

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeSystem = btn.dataset.system;
  renderTables();
});

function rollDice(sides) {
  const value = Math.floor(Math.random() * sides) + 1;
  const box = document.getElementById("diceResult");
  const note =
    sides === 20 && value === 20
      ? " • Sucesso crítico!"
      : sides === 20 && value === 1
      ? " • Falha crítica!"
      : "";

  box.innerHTML = `
    <span class="roll-value">${value}</span>
    <span class="roll-detail">Rolou 1d${sides} (1–${sides})${note}</span>
  `;
}

const modal = document.getElementById("createModal");

function openCreateModal() {
  modal.classList.add("open");
}

function closeCreateModal() {
  modal.classList.remove("open");
}

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeCreateModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCreateModal();
});

document.getElementById("createTableForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newTable = {
    id: Date.now(),
    title: document.getElementById("title").value.trim(),
    system: document.getElementById("system").value,
    schedule: document.getElementById("schedule").value.trim(),
    spots: Number(document.getElementById("spots").value),
    level: "Todos os níveis",
    desc: document.getElementById("desc").value.trim()
  };
  tables.unshift(newTable);
  saveTables();
  renderTables();
  e.target.reset();
  closeCreateModal();
});

renderTables();
