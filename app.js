/* ФИЛОСОФТ — Telegram Mini App
 * Главный экран: баннер-картинка + логотип (вертикально: знак </> + текст)
 * «прелоадер -> в шапку» + кнопка-картинка на сайте внизу.
 * Данные — из config.json.
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
      showHeaderLogo(false);
    });

  function render(cfg) {
    cfg = cfg || {};
    var banner = cfg.banner || {};
    var appCfg = cfg.app || {};

    // фон-картинка
    if (appCfg.backgroundImage) {
      document.body.style.backgroundImage = "url('" + esc(appCfg.backgroundImage) + "')";
    }

    // шапка: знак + текст
    var header = document.createElement("div");
    header.className = "header";
    header.innerHTML =
      '<img class="header-mark" id="headerMark" src="assets/mark-white.svg" alt="ФИЛОСОФТ" />' +
      '<div class="header-word" id="headerWord">ФИЛОСОФТ</div>';
    app.innerHTML = "";
    app.appendChild(header);

    // баннер
    if (banner && banner.active !== false && banner.image) {
      var bn = document.createElement("div");
      bn.className = "banner";
      bn.innerHTML = '<img class="banner-img" src="' + esc(banner.image) + '" alt="" />';
      app.appendChild(bn);
    } else {
      var empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Здесь появится актуальное событие.";
      app.appendChild(empty);
    }

    // футер: кнопка-картинка
    if (appCfg.footerImage) {
      var btn = document.createElement("button");
      btn.className = "footer-btn";
      btn.type = "button";
      btn.innerHTML = '<img src="' + esc(appCfg.footerImage) + '" alt="' + esc(appCfg.footerLink && appCfg.footerLink.label) + '" />';
      btn.addEventListener("click", function () {
        openUrl(appCfg.footerLink && appCfg.footerLink.url);
      });
      var foot = document.createElement("div");
      foot.className = "footer";
      foot.appendChild(btn);
      app.appendChild(foot);
    }

    runLogoFlow();
    if (webapp) webapp.ready();
  }

  /* Анимация лого: прелоадер (центр) уезжает в шапку */
  function runLogoFlow() {
    var loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = '<img class="loader-mark" src="assets/mark-white.svg" alt="" />';
    // наследуем фон body на прелоадер
    loader.style.backgroundImage = getComputedStyle(document.body).backgroundImage;
    loader.style.backgroundColor = "#0a083c";
    document.body.appendChild(loader);

    var headerMark = document.getElementById("headerMark");
    var headerWord = document.getElementById("headerWord");
    if (!headerMark) { finishLoader(loader); return; }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var lm = loader.querySelector(".loader-mark");
        if (!lm) { finishLoader(loader); return; }

        var lr = lm.getBoundingClientRect();
        var lrx = lr.left + lr.width / 2;
        var lry = lr.top + lr.height / 2;

        var hr = headerMark.getBoundingClientRect();
        var hx = hr.left + hr.width / 2;
        var hy = hr.top + hr.height / 2;

        var dx = hx - lrx;
        var dy = hy - lry;

        lm.style.transition = "transform 0.6s cubic-bezier(0.2,0.8,0.3,1), opacity 0.5s ease";
        lm.style.transform = "translate(" + dx + "px, " + dy + "px) scale(0.5)";
        lm.style.opacity = "0.9";
        showHeaderLogo(true);

        setTimeout(finishLoader, 650, loader);
      });
    });
  }

  function showHeaderLogo(show) {
    var hm = document.getElementById("headerMark");
    var hw = document.getElementById("headerWord");
    if (show) { if (hm) hm.style.opacity = "1"; if (hw) hw.style.opacity = "1"; }
    // классы для анимации появления
  }

  function finishLoader(loader) {
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    var hm = document.getElementById("headerMark");
    var hw = document.getElementById("headerWord");
    if (hm) hm.classList.add("settled");
    if (hw) hw.classList.add("settled");
    if (webapp) webapp.ready();
  }
})();