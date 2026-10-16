/**
 * Shared UI: nav toggle, fade-in, dropdown, active link
 */
(function () {
  function initNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    document.querySelectorAll(".nav-drop > button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.parentElement.classList.toggle("open");
      });
    });
    document.addEventListener("click", () => {
      document.querySelectorAll(".nav-drop.open").forEach((d) => d.classList.remove("open"));
    });

    // Mark current page
    const path = location.pathname.replace(/\/$/, "");
    document.querySelectorAll(".site-nav a[href]").forEach((a) => {
      try {
        const href = new URL(a.getAttribute("href"), location.href).pathname.replace(/\/$/, "");
        if (href && path.endsWith(href.replace(/^\.\.\//, "").split("/").pop() ? path.includes(a.getAttribute("href").replace("../", "").replace("./", "")) : false)) {
          /* simpler check below */
        }
      } catch (_) {}
    });
    const file = path.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav a[href]").forEach((a) => {
      const h = a.getAttribute("href") || "";
      if (h.endsWith(file) || (file === "index.html" && (h === "./" || h === "index.html" || h.endsWith("/spain-history/") || h === "../index.html"))) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function initFadeIn() {
    const els = document.querySelectorAll(".fade-in");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initFadeIn();
  });
})();
