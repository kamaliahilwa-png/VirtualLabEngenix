/* ==========================================================
   ENGENIX — Language Toggle Engine (ID / EN)
   Bekerja di semua halaman cukup dengan menyertakan:
     <script src="js/i18n-data.js"></script>
     <script src="js/i18n.js"></script>
   Tidak perlu menambahkan tombol secara manual — tombol
   toggle akan otomatis muncul di pojok kanan atas halaman.
   ========================================================== */
(function () {
    "use strict";

    var STORAGE_KEY = "engenix_lang";

    function getLang() {
        var saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch (e) {}
        return saved === "en" ? "en" : "id";
    }

    function setLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {}
        applyLang(lang);
        updateToggleUI(lang);
    }

    function applyLang(lang) {
        document.documentElement.setAttribute("lang", lang);

        var dict = window.ENGENIX_I18N || {};
        var nodes = document.querySelectorAll("[data-i18n]");

        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            // Jangan sentuh konten di dalam <iframe> (simulasi Virtual Lab)
            if (el.closest && el.closest("iframe")) continue;

            var key = el.getAttribute("data-i18n");
            var entry = dict[key];
            if (!entry) continue;

            var text = entry[lang];
            if (text === undefined || text === null) continue;

            var attrTarget = el.getAttribute("data-i18n-attr");
            if (attrTarget) {
                el.setAttribute(attrTarget, text);
            } else {
                el.innerHTML = text;
            }
        }

        // Placeholder input (opsional, jika ada elemen data-i18n-placeholder)
        var placeholders = document.querySelectorAll("[data-i18n-placeholder]");
        for (var j = 0; j < placeholders.length; j++) {
            var pEl = placeholders[j];
            var pKey = pEl.getAttribute("data-i18n-placeholder");
            var pEntry = dict[pKey];
            if (pEntry && pEntry[lang]) {
                pEl.setAttribute("placeholder", pEntry[lang]);
            }
        }
    }

    function updateToggleUI(lang) {
        var wrap = document.getElementById("engenixLangToggle");
        if (!wrap) return;
        var buttons = wrap.querySelectorAll("button");
        for (var i = 0; i < buttons.length; i++) {
            var isActive = buttons[i].getAttribute("data-lang") === lang;
            buttons[i].classList.toggle("active", isActive);
            buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
        }
    }

    function injectStyle() {
        if (document.getElementById("engenixLangStyle")) return;
        var style = document.createElement("style");
        style.id = "engenixLangStyle";
        style.textContent =
            "#engenixLangToggle{display:flex;gap:3px;background:rgba(255,255,255,.96);" +
            "border:1px solid #dcecff;border-radius:30px;padding:4px;" +
            "box-shadow:0 4px 14px rgba(36,93,171,.15);backdrop-filter:blur(6px);}" +
            "#engenixLangToggle button{border:none;background:transparent;" +
            "padding:8px 14px;border-radius:24px;font-family:'Plus Jakarta Sans'," +
            "'Poppins',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;" +
            "color:#245DAB;transition:.2s;line-height:1.3;white-space:nowrap;}" +
            "#engenixLangToggle button.active{background:#245DAB;color:#fff;}" +
            "#engenixLangToggle button:hover:not(.active){background:#eef7ff;}" +
            /* Posisi mengambang — hanya dipakai kalau halaman TIDAK punya
               navbar / header yang dikenali (mis. halaman materi) */
            "#engenixLangToggle.engenix-floating{position:fixed;top:14px;" +
            "right:18px;z-index:99999;transition:top .2s;}" +
            /* Posisi menyatu di dalam header/nav (menggantikan tombol login) */
            "#engenixLangToggle.engenix-inline{position:relative;flex-shrink:0;}" +
            "@media (max-width:640px){" +
            "#engenixLangToggle.engenix-floating{right:10px;}" +
            "#engenixLangToggle button{padding:6px 10px;font-size:.72rem;}}";
        document.head.appendChild(style);
    }

    // Untuk kasus tombol mengambang (halaman tanpa navbar dikenali):
    // pastikan tetap di bawah header sticky bila ada.
    function positionFloatingToggle() {
        var wrap = document.getElementById("engenixLangToggle");
        if (!wrap || !wrap.classList.contains("engenix-floating")) return;

        var candidates = document.querySelectorAll("header, .header, .virtual-header");
        var maxBottom = 0;

        for (var i = 0; i < candidates.length; i++) {
            var el = candidates[i];
            var style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden") continue;
            var rect = el.getBoundingClientRect();
            if (rect.top <= 5 && rect.bottom > maxBottom) {
                maxBottom = rect.bottom;
            }
        }

        wrap.style.top = maxBottom > 0 ? Math.round(maxBottom + 12) + "px" : "14px";
    }

    function injectToggle() {
        if (document.getElementById("engenixLangToggle")) return;
        var wrap = document.createElement("div");
        wrap.id = "engenixLangToggle";
        wrap.setAttribute("role", "group");
        wrap.setAttribute("aria-label", "Language / Bahasa");

        var btnId = document.createElement("button");
        btnId.type = "button";
        btnId.setAttribute("data-lang", "id");
        btnId.textContent = "🇮🇩 ID";

        var btnEn = document.createElement("button");
        btnEn.type = "button";
        btnEn.setAttribute("data-lang", "en");
        btnEn.textContent = "🇬🇧 EN";

        wrap.appendChild(btnId);
        wrap.appendChild(btnEn);

        // 1) Kalau ada tombol "Masuk" di navbar (index.html) —
        //    ganti posisinya persis di situ, tombol Masuk disembunyikan.
        var navLogin = document.querySelector(".nav-login");
        // 2) Kalau tidak ada tombol login tapi ada navbar/header lain —
        //    taruh menyatu di dalamnya (mis. virtuallab.html).
        var hostHeader = document.querySelector(
            "nav.navbar, .virtual-header, header, .header"
        );

        if (navLogin && navLogin.parentNode) {
            navLogin.parentNode.insertBefore(wrap, navLogin);
            navLogin.style.display = "none";
            wrap.classList.add("engenix-inline");
        } else if (hostHeader) {
            hostHeader.appendChild(wrap);
            wrap.classList.add("engenix-inline");
        } else {
            // Halaman materi (plts/pltb/pltmh) tidak punya header — mengambang.
            document.body.appendChild(wrap);
            wrap.classList.add("engenix-floating");
        }

        btnId.addEventListener("click", function () { setLang("id"); });
        btnEn.addEventListener("click", function () { setLang("en"); });
    }

    function init() {
        injectStyle();
        injectToggle();
        var lang = getLang();
        applyLang(lang);
        updateToggleUI(lang);

        positionFloatingToggle();
        window.addEventListener("resize", positionFloatingToggle);
        window.addEventListener("scroll", positionFloatingToggle, { passive: true });
        setTimeout(positionFloatingToggle, 300);
        setTimeout(positionFloatingToggle, 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Expose untuk dipakai manual bila perlu (misal dari console / halaman lain)
    window.ENGENIX_SET_LANG = setLang;
    window.ENGENIX_GET_LANG = getLang;
})();