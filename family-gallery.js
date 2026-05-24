(function () {
  var images = [
    "Family-Spring/Spring1.jpg",
    "Family-Spring/Spring2.jpg",
    "Family-Spring/Spring3.jpg",
    "Family-Spring/Spring4.jpg",
    "Family-Spring/Spring5.jpg",
    "Family-Spring/Spring6.jpg",
    "Family-Spring/Spring7.jpg",
    "Family-Spring/Spring8.jpg",
    "Family-Spring/Spring9.jpg",
    "Family-Spring/Spring10.jpg",
    "Family-Spring/Spring11.jpg",
    "Family-Spring/Spring12.jpg"
  ];

  var carousel = document.querySelector("[data-season-carousel]");

  if (!carousel) {
    return;
  }

  var track = carousel.querySelector(".carousel-track");
  var carouselImages = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-image]"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
  var currentIndex = 0;
  var imageRatios = {};

  function getActiveImages() {
    return carouselImages.filter(function (image) {
      return window.getComputedStyle(image.closest(".carousel-slide")).display !== "none";
    });
  }

  function fitSlides() {
    var activeImages = getActiveImages();
    var carouselWidth = carousel.clientWidth;

    if (!carouselWidth || !activeImages.length) {
      return;
    }

    var ratios = activeImages.map(function (image) {
      if (!image.naturalWidth || !image.naturalHeight) {
        return 1;
      }

      return image.naturalWidth / image.naturalHeight;
    });

    var visibleCount = activeImages.length;
    var widestSetRatio = 0;

    images.forEach(function (_, index) {
      var setRatio = 0;

      for (var offset = 0; offset < visibleCount; offset += 1) {
        setRatio += imageRatios[images[(index + offset) % images.length]] || ratios[offset] || 1;
      }

      widestSetRatio = Math.max(widestSetRatio, setRatio);
    });

    var rowHeight = carouselWidth / widestSetRatio;

    track.style.height = rowHeight + "px";

    carouselImages.forEach(function (image) {
      image.closest(".carousel-slide").style.flexBasis = "";
    });

    activeImages.forEach(function (image, index) {
      image.closest(".carousel-slide").style.flexBasis = rowHeight * ratios[index] + "px";
    });
  }

  function fitWhenReady() {
    var activeImages = getActiveImages();
    var remaining = activeImages.length;

    function done() {
      remaining -= 1;

      if (remaining <= 0) {
        fitSlides();
      }
    }

    activeImages.forEach(function (image) {
      if (image.complete && image.naturalWidth) {
        done();
        return;
      }

      image.addEventListener("load", done, { once: true });
      image.addEventListener("error", done, { once: true });
    });
  }

  function updateCarousel(nextIndex) {
    currentIndex = (nextIndex + images.length) % images.length;

    carouselImages.forEach(function (image, offset) {
      var imageIndex = (currentIndex + offset) % images.length;
      image.src = images[imageIndex];
      image.alt = "Spring family gallery image " + (imageIndex + 1);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });

    fitWhenReady();
  }

  function next() {
    updateCarousel(currentIndex + 1);
  }

  function previous() {
    updateCarousel(currentIndex - 1);
  }

  function preloadImageRatios() {
    images.forEach(function (src) {
      var image = new Image();

      image.addEventListener("load", function () {
        imageRatios[src] = image.naturalWidth / image.naturalHeight;
        fitSlides();
      });

      image.src = src;
    });
  }

  carousel.querySelectorAll("[data-carousel-next]").forEach(function (button) {
    button.addEventListener("click", function () {
      next();
    });
  });

  carousel.querySelector("[data-carousel-prev]").addEventListener("click", function () {
    previous();
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      updateCarousel(Number(dot.dataset.carouselDot));
    });
  });

  window.addEventListener("resize", fitSlides);

  preloadImageRatios();
  updateCarousel(0);
})();
