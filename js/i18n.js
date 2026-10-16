/**
 * i18n: RU (default) / ES / EN via dictionaries + data-i18n attributes
 */
(function () {
  const SUPPORTED = ["ru", "es", "en"];
  const STORAGE_KEY = "spain-history-lang";
  let dict = {};
  let current = "ru";

  function getBase() {
    const scripts = document.querySelectorAll("script[src]");
    for (const s of scripts) {
      if (s.src.includes("i18n.js")) {
        return s.src.replace(/js\/i18n\.js.*$/, "");
      }
    }
    // fallback from path depth
    const path = location.pathname;
    if (path.includes("/pages/")) return "../";
    return "./";
  }

  async function loadDict(lang) {
    const base = getBase();
    const res = await fetch(`${base}data/i18n-${lang}.json`);
    if (!res.ok) throw new Error("i18n load failed: " + lang);
    return res.json();
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), dict);
      if (val == null) return;
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), dict);
      if (val != null) el.setAttribute("placeholder", val);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      const val = key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), dict);
      if (val != null) el.setAttribute("aria-label", val);
    });
    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    document.dispatchEvent(new CustomEvent("i18n:changed", { detail: { lang, dict } }));
  }

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = "ru";
    dict = await loadDict(lang);
    apply(lang);
  }

  function t(key, fallback) {
    const val = key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), dict);
    return val != null ? val : (fallback || key);
  }

  function getLang() { return current; }
  function getDict() { return dict; }

  window.I18n = { setLang, t, getLang, getDict, SUPPORTED };

  document.addEventListener("DOMContentLoaded", () => {
    let initial = "ru";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.includes(saved)) initial = saved;
    } catch (_) {}
    setLang(initial).catch((e) => console.warn(e));

    document.querySelectorAll(".lang-switcher button").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  });
})();
