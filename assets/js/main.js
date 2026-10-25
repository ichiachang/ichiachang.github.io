// Renders publications from PUBLICATIONS (publications.js).
// Home: <div id="selected-pubs">. Publications page: <div id="pub-filters"> + <div id="all-pubs">.

const LINK_ICONS = {
  arXiv: "ai ai-arxiv",
  Paper: "fa-solid fa-file-lines",
  PDF: "fa-solid fa-file-pdf",
  Video: "fa-brands fa-youtube",
  Code: "fa-brands fa-github",
  Project: "fa-solid fa-globe",
  Talk: "fa-solid fa-person-chalkboard",
};

function renderAuthors(authors) {
  return authors
    .map((a) => (a.replace(/[*†]+$/, "") === OWNER ? `<strong>${a}</strong>` : a))
    .join(", ");
}

function renderMedia(pub) {
  if (!pub.media) {
    return `<div class="pub-media placeholder" aria-hidden="true"><span>GIF coming soon</span></div>`;
  }
  if (/\.(mp4|webm)$/i.test(pub.media)) {
    return `<video class="pub-media" src="${pub.media}" autoplay loop muted playsinline></video>`;
  }
  return `<img class="pub-media" src="${pub.media}" alt="" loading="lazy">`;
}

function titleUrl(pub) {
  const preferred = pub.type === "journal" ? pub.links.Paper : pub.links.arXiv;
  return preferred || Object.values(pub.links)[0];
}

function renderPub(pub) {
  const links = Object.entries(pub.links)
    .map(([label, url]) =>
      `<a class="pub-link" href="${url}" target="_blank" rel="noopener"><i class="${LINK_ICONS[label.split(" ")[0]]}"></i>${label}</a>`)
    .join("");
  const tags = pub.tags.map((t) => `<span class="tag">${t}</span>`).join("");
  return `
    <article class="pub">
      ${renderMedia(pub)}
      <div class="pub-body">
        <h3 class="pub-title"><a href="${titleUrl(pub)}" target="_blank" rel="noopener">${pub.title}</a></h3>
        <p class="pub-authors">${renderAuthors(pub.authors)}</p>
        <p class="pub-meta"><span class="venue">${pub.venue}</span>${tags}</p>
        ${pub.description ? `<p class="pub-desc">${pub.description}</p>` : ""}
        <div class="pub-links">${links}</div>
      </div>
    </article>`;
}

function renderByYear(container, pubs) {
  const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);
  container.innerHTML = years
    .map((y) => `<h2 class="year">${y}</h2>` + pubs.filter((p) => p.year === y).map(renderPub).join(""))
    .join("");
}

function initPublicationsPage(filters, container) {
  let active = "All";
  const draw = () => {
    filters.innerHTML = ["All", ...TAGS]
      .map((t) => {
        const n = t === "All" ? PUBLICATIONS.length : PUBLICATIONS.filter((p) => p.tags.includes(t)).length;
        return `<button class="chip${t === active ? " active" : ""}" data-tag="${t}">${t} <span>${n}</span></button>`;
      })
      .join("");
    renderByYear(container, active === "All" ? PUBLICATIONS : PUBLICATIONS.filter((p) => p.tags.includes(active)));
  };
  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    active = chip.dataset.tag;
    draw();
  });
  draw();
}

// Light/dark toggle. The saved choice is applied early by the inline script in each page's <head>.
function currentTheme() {
  return document.documentElement.dataset.theme
    || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

const themeToggle = document.getElementById("theme-toggle");
const drawToggle = () => {
  const dark = currentTheme() === "dark";
  themeToggle.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}"></i>`;
  themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
};
themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
  drawToggle();
});
drawToggle();

const selected = document.getElementById("selected-pubs");
if (selected) selected.innerHTML = PUBLICATIONS.filter((p) => p.selected).map(renderPub).join("");

const filters = document.getElementById("pub-filters");
if (filters) initPublicationsPage(filters, document.getElementById("all-pubs"));
