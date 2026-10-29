/* mode.js — dark / light switch. Load in <head> so the saved theme applies before the page paints. */
(function () {
  var KEY = "ina-theme", root = document.documentElement, saved;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  root.setAttribute("data-theme", saved === "light" ? "light" : "dark");

  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header"), menu = document.querySelector(".menu-toggle");
    if (!header) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "theme-toggle";
    function paint() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.textContent = dark ? "☀" : "☾";
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });
    header.insertBefore(btn, menu);
    paint();
  });
})();
