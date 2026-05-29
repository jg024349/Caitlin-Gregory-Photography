(function () {
  "use strict";

  var toggle = document.querySelector(".mobile-nav-toggle");
  var nav = document.querySelector(".main-nav");
  var galleryToggle = document.querySelector(".dropdown-toggle");
  var galleryDropdown = galleryToggle ? galleryToggle.closest(".dropdown") : null;
  var mobileQuery = window.matchMedia("(max-width: 768px)");

  if (!toggle || !nav) {
    return;
  }

  function setMenuState(isOpen) {
    document.body.classList.toggle("mobile-menu-open", isOpen);
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");

    if (!isOpen && galleryDropdown) {
      galleryDropdown.classList.remove("is-open");
    }
  }

  toggle.addEventListener("click", function () {
    setMenuState(!document.body.classList.contains("mobile-menu-open"));
  });

  nav.addEventListener("click", function (event) {
    var link = event.target.closest("a");

    if (!link) {
      return;
    }

    if (link === galleryToggle && mobileQuery.matches) {
      event.preventDefault();
      galleryDropdown.classList.toggle("is-open");
      return;
    }

    if (link) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });
}());
