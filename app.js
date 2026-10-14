/* ФИЛОСОФТ — Telegram Mini App (баннер-картинка)
 * Главный экран: квадратный баннер-картинка + логотип с анимацией
 * «прелоадер по центру -> уезжает вверх в шапку» + ссылка на сайт внизу.
 *
 * Данные — из config.json:
 *   banner.image  — путь к картинке (квадрат, см. README)
 *   banner.link   — ссылка под баннером
 *   app.footerLink — ссылка внизу
 */
(function () {
  "use strict";

  var Telegram = window.Telegram;
  var webapp = Telegram && Telegram.WebApp;

  if (webapp) {
    webapp.ready();
    webapp.expand();
    if (webapp.disableVerticalSwipes) webapp.disableVerticalSwipes();
    if (webapp.setHeaderColor) webapp.setHeaderColor("#0a083c");
    if (webapp.setBackgroundColor) webapp.setBackgroundColor("#0a083c");
    try { if (webapp.setBottomBarColor) webapp.setBottomBarColor("#0a083c"); } catch (e) {}
  }

  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openUrl(url) {
    var u = String(url || "").trim();
    if (!u) return;
    if (webapp && webapp.openLink) webapp.openLink(u, { try_instant_view: false });
    else window.open(u, "_blank");
  }

  fetch("config.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("config " + r.status); return r.json(); })
    .then(render)
    .catch(function (err) {
      app.innerHTML =
        '<div class="empty">Не удалось загрузить настройки.<br><small>' +
        esc(err.message) + "</small></div>";
      finishLoader();
    });

  function render(cfg) {
    cfg = cfg || {};
    var banner = cfg.banner || {};
    var appCfg = cfg.app || {};

    // шапка с логотипом (сюда приезжает лого)
    var header = document.createElement("div");
    header.className = "header";
    header.innerHTML =
      '<img class="header-logo" id="headerLogo" src="assets/logo-h-white.svg" alt="ФИЛОСОФТ" />';
    app.innerHTML = "";
    app.appendChild(header);

    var body = "";
    if (banner && banner.active !== false && banner.image) {
      body += '<div class="banner">';
      body += '<img class="banner-img" src="' + esc(banner.image) + '" alt="" />';
      body += "</div>";
    } else {
      body = '<div class="empty">Здесь появится актуальное событие.</div>';
    }
    app.insertAdjacentHTML("beforeend", body);

    // футер со ссылкой на сайт
    if (appCfg.footerLink && appCfg.footerLink.label) {
      var footer = document.createElement("a");
      footer.className = "footer-link";
      footer.href = "#";
      footer.textContent = appCfg.footerLink.label;
      footer.addEventListener("click", function (e) {
        e.preventDefault();
        openUrl(appCfg.footerLink.url);
      });
      var footWrap = document.createElement("div");
      footWrap.className = "footer";
      footWrap.appendChild(footer);
      app.appendChild(footWrap);
    }

    runLogoFlow();
    if (webapp) webapp.ready();
  }

  /* Анимация лого: из центра (прелоадер) поднимается в шапку */
  function runLogoFlow() {
    // создаём прелоадер с логотипом ПО ЦЕНТРУ
    var loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = '<img class="loader-logo" src="assets/logo-h-white.svg" alt="" />';
    document.body.appendChild(loader);

    var headerLogo = document.getElementById("headerLogo");
    if (!headerLogo) { finishLoader(loader); return; }

    // ждём рендер, затем анимируем перемещение
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var loaderLogo = loader.querySelector(".loader-logo");
        if (!loaderLogo) { finishLoader(loader); return; }

        // стартовая позиция логотипа (центр экрана)
        var lr = loaderLogo.getBoundingClientRect();
        var lrx = lr.left + lr.width / 2;
        var lry = lr.top + lr.height / 2;

        // целевая позиция (шапка)
        var hr = headerLogo.getBoundingClientRect();
        var hx = hr.left + hr.width / 2;
        var hy = hr.top + hr.height / 2;

        // перемещение логотипа из центра в шапку
        var dx = hx - lrx;
        var dy = hy - lry;

        loaderLogo.style.transition = "transform 0.65s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.65s ease";
        loaderLogo.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.6)";
        loaderLogo.style.opacity = "0.95";
        headerLogo.style.opacity = "1";

        setTimeout(finishLoader, 700, loader);
      });
    });
  }

  function finishLoader(loader) {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    var hl = document.getElementById("headerLogo");
    if (hl) hl.classList.add("settled");
    if (webapp) webapp.ready();
  }
})();