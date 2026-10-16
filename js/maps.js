/**
 * Empire map viewer: year tabs, pan/zoom, hover highlight
 */
(function () {
  const YEARS = ["1550", "1580", "1780", "1898", "1975"];

  function getBase() {
    return location.pathname.includes("/pages/") ? "../" : "./";
  }

  function initViewer(root) {
    const stage = root.querySelector(".map-stage");
    const yearLabel = root.querySelector(".map-year-label");
    const caption = document.getElementById("map-caption");
    const tabs = document.getElementById("map-tabs");
    if (!stage) return;

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let currentYear = root.dataset.year || "1580";

    const captions = {
      "1550": {
        ru: "Около 1550: владения Карла V / раннего Филиппа II — Иберия, Нидерланды, итальянские земли, Новая Испания, Карибы, зачатки Перу и Филиппин.",
        es: "Hacia 1550: dominios de Carlos V / Felipe II temprano — Iberia, Países Bajos, posesiones italianas, Nueva España, Caribe, inicios de Perú y Filipinas.",
        en: "c. 1550: Charles V / early Philip II — Iberia, Low Countries, Italian holdings, New Spain, Caribbean, early Peru and Philippines.",
      },
      "1580": {
        ru: "1580: Иберийская уния — к испанской монархии присоединяется португальская империя (Бразилия, Африка, Азия).",
        es: "1580: Unión Ibérica — el imperio portugués (Brasil, África, Asia) bajo la monarquía hispánica.",
        en: "1580: Iberian Union — Portuguese empire (Brazil, Africa, Asia) under the Spanish Habsburg crown.",
      },
      "1780": {
        ru: "Около 1780: пик бурбонской Америки — обширная Новая Испания и Южная Америка, Филиппины, Луизиана; Нидерланды утрачены.",
        es: "Hacia 1780: apogeo borbónico en América — vasta Nueva España y Sudamérica, Filipinas, Luisiana; Países Bajos perdidos.",
        en: "c. 1780: Bourbon American peak — vast New Spain and South America, Philippines, Louisiana; Netherlands gone.",
      },
      "1898": {
        ru: "1898 (накануне войны): Куба, Пуэрто-Рико, Филиппины, Гуам и африканские опорные пункты.",
        es: "1898 (vísperas de la guerra): Cuba, Puerto Rico, Filipinas, Guam y enclaves africanos.",
        en: "1898 (eve of war): Cuba, Puerto Rico, Philippines, Guam and African footholds.",
      },
      "1975": {
        ru: "1975: метрополия, Канары, Балеары, Сеута и Мелилья; Западная Сахара до соглашений 1975–76. Экваториальная Гвинея независима с 1968.",
        es: "1975: metrópoli, Canarias, Baleares, Ceuta y Melilla; Sáhara Occidental hasta 1975–76. Guinea Ecuatorial independiente desde 1968.",
        en: "1975: metropolitan Spain, Canaries, Balearics, Ceuta and Melilla; Western Sahara until 1975–76. Equatorial Guinea independent since 1968.",
      },
    };

    function applyTransform(svg) {
      if (!svg) return;
      svg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function setCaption(year) {
      if (!caption) return;
      const L = (window.I18n && I18n.getLang()) || "ru";
      const c = captions[year];
      caption.textContent = c ? c[L] || c.ru : "";
    }

    async function loadYear(year) {
      currentYear = year;
      if (yearLabel) yearLabel.textContent = year;
      setCaption(year);
      if (tabs) {
        tabs.querySelectorAll("button").forEach((b) => {
          b.setAttribute("aria-selected", b.dataset.year === year ? "true" : "false");
        });
      }
      const url = getBase() + `maps/empire-${year}.svg`;
      try {
        const res = await fetch(url);
        const text = await res.text();
        stage.innerHTML = text;
        const svg = stage.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "100%");
          scale = 1;
          tx = 0;
          ty = 0;
          applyTransform(svg);
          svg.querySelectorAll(".spanish-land").forEach((p) => {
            p.addEventListener("mouseenter", () => p.classList.add("highlight"));
            p.addEventListener("mouseleave", () => p.classList.remove("highlight"));
          });
        }
      } catch (e) {
        stage.innerHTML = `<p style="color:#E8D48B;padding:2rem;text-align:center">Map ${year} unavailable</p>`;
      }
    }

    // Zoom
    root.querySelectorAll("[data-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const op = btn.dataset.zoom;
        if (op === "in") scale = Math.min(4, scale * 1.25);
        else if (op === "out") scale = Math.max(0.5, scale / 1.25);
        else {
          scale = 1;
          tx = 0;
          ty = 0;
        }
        applyTransform(stage.querySelector("svg"));
      });
    });

    // Pan
    stage.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      tx += e.clientX - lastX;
      ty += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      applyTransform(stage.querySelector("svg"));
    });
    stage.addEventListener("pointerup", () => { dragging = false; });
    stage.addEventListener("pointercancel", () => { dragging = false; });

    // Wheel zoom
    stage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        scale = Math.min(4, Math.max(0.5, scale * factor));
        applyTransform(stage.querySelector("svg"));
      },
      { passive: false }
    );

    if (tabs) {
      tabs.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-year]");
        if (btn) loadYear(btn.dataset.year);
      });
    }

    document.addEventListener("i18n:changed", () => setCaption(currentYear));
    loadYear(currentYear);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".maps-viewer").forEach(initViewer);
  });

  window.EmpireMaps = { YEARS };
})();
