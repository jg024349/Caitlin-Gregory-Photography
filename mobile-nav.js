(function () {
  "use strict";

  var toggle = document.querySelector(".mobile-nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (!toggle || !nav) {
    return;
  }

  function setMenuState(isOpen) {
    document.body.classList.toggle("mobile-menu-open", isOpen);
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  }

  toggle.addEventListener("click", function () {
    setMenuState(!document.body.classList.contains("mobile-menu-open"));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}());
