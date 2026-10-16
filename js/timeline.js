/**
 * Interactive chronological timeline
 */
(function () {
  function getBase() {
    return location.pathname.includes("/pages/") ? "../" : "./";
  }

  function resolveHref(href) {
    if (!href) return null;
    const base = getBase();
    if (href.startsWith("http")) return href;
    if (base === "./") return href.startsWith("pages/") ? href : "pages/" + href;
    return href.startsWith("pages/") ? href.replace(/^pages\//, "") : href;
  }

  async function loadEvents() {
    const res = await fetch(getBase() + "data/timeline.json");
    const data = await res.json();
    return data.events || [];
  }

  function lang() {
    return (window.I18n && I18n.getLang()) || "ru";
  }

  function field(ev, name) {
    const L = lang();
    return ev[name + "_" + L] || ev[name + "_ru"] || "";
  }

  function render(root, events, filter) {
    const filtered = filter && filter !== "all"
      ? events.filter((e) => e.period === filter)
      : events;
    root.innerHTML = filtered
      .map((ev, i) => {
        const title = field(ev, "title");
        const summary = field(ev, "summary");
        const period = field(ev, "periodLabel") || ev.period || "";
        return `<article class="tl-item fade-in" data-id="${ev.id}" style="transition-delay:${(i % 6) * 40}ms">
          <div class="tl-card" role="button" tabindex="0" data-id="${ev.id}" aria-label="${title}">
            <span class="tl-period">${period}</span>
            <div class="tl-year">${ev.yearLabel || ev.year}</div>
            <h3 class="tl-title">${title}</h3>
            <p class="tl-summary">${summary}</p>
          </div>
        </article>`;
      })
      .join("");

    // re-observe fade
    const els = root.querySelectorAll(".tl-item");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      els.forEach((el) => io.observe(el));
    }

    root.querySelectorAll(".tl-card").forEach((card) => {
      const open = () => showDetail(events.find((e) => e.id === card.dataset.id));
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function ensureOverlay() {
    let ov = document.getElementById("tl-detail-overlay");
    if (ov) return ov;
    ov = document.createElement("div");
    ov.id = "tl-detail-overlay";
    ov.className = "tl-detail-overlay";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="tl-detail">
      <button type="button" class="tl-detail-close" aria-label="Close">×</button>
      <div class="detail-year"></div>
      <h3></h3>
      <div class="detail-body"></div>
      <a class="detail-link" href="#" hidden></a>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector(".tl-detail-close").addEventListener("click", () => ov.classList.remove("open"));
    ov.addEventListener("click", (e) => {
      if (e.target === ov) ov.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") ov.classList.remove("open");
    });
    return ov;
  }

  function showDetail(ev) {
    if (!ev) return;
    const ov = ensureOverlay();
    ov.querySelector(".detail-year").textContent = ev.yearLabel || ev.year;
    ov.querySelector("h3").textContent = field(ev, "title");
    ov.querySelector(".detail-body").innerHTML = `<p>${field(ev, "detail") || field(ev, "summary")}</p>`;
    const link = ov.querySelector(".detail-link");
    const href = resolveHref(ev.href);
    if (href) {
      link.hidden = false;
      link.href = href;
      link.textContent = (window.I18n && I18n.t("timeline.readMore", "Подробнее →")) || "Подробнее →";
    } else {
      link.hidden = true;
    }
    ov.classList.add("open");
    ov.querySelector(".tl-detail-close").focus();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("timeline");
    if (!root) return;
    let events = [];
    try {
      events = await loadEvents();
    } catch (e) {
      root.innerHTML = "<p>Timeline data unavailable.</p>";
      return;
    }

    const filters = document.getElementById("timeline-filters");
    let current = "all";
    if (filters) {
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-filter]");
        if (!btn) return;
        current = btn.dataset.filter;
        filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
        render(root, events, current);
      });
    }

    render(root, events, current);

    document.addEventListener("i18n:changed", () => render(root, events, current));
  });
})();
