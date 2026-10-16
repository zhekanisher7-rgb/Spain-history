/**
 * Client-side search over timeline.json + page index
 */
(function () {
  let index = [];
  let loaded = false;

  function getBase() {
    const path = location.pathname;
    if (path.includes("/pages/")) return "../";
    return "./";
  }

  const PAGES = [
    { id: "antigua", titleKey: "pages.antigua", year: "—200", href: "pages/antigua.html", tags: ["иберы", "рим", "карфаген", "iberians", "rome", "carthage", "hispania"] },
    { id: "edad-media", titleKey: "pages.edadMedia", year: "409–1492", href: "pages/edad-media.html", tags: ["visigoths", "reconquista", "средневековье"] },
    { id: "reconquista", titleKey: "pages.reconquista", year: "722–1492", href: "pages/reconquista.html", tags: ["covadonga", "granada", "navas"] },
    { id: "habsburgos", titleKey: "pages.habsburgos", year: "1516–1700", href: "pages/habsburgos.html", tags: ["carlos v", "felipe ii", "habsburg"] },
    { id: "armada", titleKey: "pages.armada", year: "1588", href: "pages/armada.html", tags: ["armada", "invincible", "непобедимая"] },
    { id: "imperio", titleKey: "pages.imperio", year: "1492–1898", href: "pages/imperio.html", tags: ["empire", "империя"] },
    { id: "sucesion", titleKey: "pages.sucesion", year: "1701–1714", href: "pages/sucesion.html", tags: ["succession", "utrecht"] },
    { id: "borbones", titleKey: "pages.borbones", year: "1700–1808", href: "pages/borbones.html", tags: ["bourbon", "бурбон"] },
    { id: "napoleon", titleKey: "pages.napoleon", year: "1808–1814", href: "pages/napoleon.html", tags: ["peninsular", "байлен", "wellington"] },
    { id: "carlistas", titleKey: "pages.carlistas", year: "1833–1876", href: "pages/carlistas.html", tags: ["carlist", "карлист"] },
    { id: "guerra-1898", titleKey: "pages.guerra1898", year: "1898", href: "pages/guerra-1898.html", tags: ["cuba", "philippines", "disaster"] },
    { id: "siglos-xix-xx", titleKey: "pages.siglos", year: "1808–1939", href: "pages/siglos-xix-xx.html", tags: ["xix", "xx", "rif"] },
    { id: "guerra-civil", titleKey: "pages.guerraCivil", year: "1936–1939", href: "pages/guerra-civil.html", tags: ["civil", "franco", "republic"] },
    { id: "contemporanea", titleKey: "pages.contemporanea", year: "1975–", href: "pages/contemporanea.html", tags: ["democracy", "eu", "nato", "transition"] },
    { id: "personajes", titleKey: "pages.personajes", year: "", href: "pages/personajes.html", tags: ["biography", "персонажи"] },
    { id: "mapas", titleKey: "pages.mapas", year: "", href: "pages/mapas.html", tags: ["maps", "карты"] },
  ];

  async function ensureIndex() {
    if (loaded) return;
    const base = getBase();
    try {
      const res = await fetch(base + "data/timeline.json");
      const data = await res.json();
      (data.events || []).forEach((ev) => {
        index.push({
          type: "event",
          year: String(ev.year),
          title: { ru: ev.title_ru, es: ev.title_es, en: ev.title_en },
          summary: { ru: ev.summary_ru, es: ev.summary_es, en: ev.summary_en },
          href: ev.href ? (ev.href.startsWith("pages/") || ev.href.startsWith("http") ? ev.href : "pages/" + ev.href) : null,
          tags: (ev.tags || []).join(" ").toLowerCase(),
        });
      });
    } catch (e) {
      console.warn("timeline search load", e);
    }
    PAGES.forEach((p) => {
      index.push({
        type: "page",
        year: p.year,
        titleKey: p.titleKey,
        title: null,
        href: p.href,
        tags: p.tags.join(" "),
      });
    });
    loaded = true;
  }

  function resolveHref(href) {
    if (!href) return "#";
    const base = getBase();
    if (href.startsWith("http")) return href;
    if (base === "./") return href;
    // from pages/
    if (href.startsWith("pages/")) return href.replace(/^pages\//, "");
    return "../" + href;
  }

  function search(q) {
    q = (q || "").trim().toLowerCase();
    if (q.length < 2) return [];
    const lang = (window.I18n && I18n.getLang()) || "ru";
    const results = [];
    for (const item of index) {
      let title = "";
      if (item.title) title = item.title[lang] || item.title.ru || "";
      else if (item.titleKey && window.I18n) title = I18n.t(item.titleKey, item.titleKey);
      const hay = [title, item.year, item.tags, item.summary ? item.summary[lang] || "" : ""].join(" ").toLowerCase();
      if (hay.includes(q) || item.year.includes(q)) {
        results.push({ title, year: item.year, href: resolveHref(item.href), type: item.type });
      }
      if (results.length >= 12) break;
    }
    return results;
  }

  function renderResults(box, results) {
    if (!results.length) {
      const empty = (window.I18n && I18n.t("search.empty", "Ничего не найдено")) || "Ничего не найдено";
      box.innerHTML = `<div class="sr-empty">${empty}</div>`;
      box.classList.add("open");
      return;
    }
    box.innerHTML = results
      .map(
        (r) =>
          `<a href="${r.href}"><span class="sr-year">${r.year || "—"}</span>${r.title}</a>`
      )
      .join("");
    box.classList.add("open");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#site-search");
    const box = document.querySelector("#search-results");
    if (!input || !box) return;

    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await ensureIndex();
        renderResults(box, search(input.value));
      }, 180);
    });
    input.addEventListener("focus", async () => {
      await ensureIndex();
      if (input.value.trim().length >= 2) renderResults(box, search(input.value));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-wrap")) box.classList.remove("open");
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") box.classList.remove("open");
    });
  });
})();
