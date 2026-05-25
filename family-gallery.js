(function () {
  function buildImages(carousel) {
    var folder = carousel.dataset.galleryFolder;
    var prefix = carousel.dataset.galleryPrefix;
    var count = Number(carousel.dataset.galleryCount || 0);

    if (!folder || !prefix || !count) {
      return [
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
    }

    return Array.from({ length: count }, function (_, index) {
      return folder + "/" + prefix + (index + 1) + ".jpg";
    });
  }

  function initCarousel(carousel) {
    var images = buildImages(carousel);
    var seasonName = carousel.dataset.gallerySeason || "Family";
    var track = carousel.querySelector(".carousel-track");
    var carouselImages = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-image]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var currentIndex = 0;
    var imageRatios = {};
    var frameRatio = 3.72;

    if (!track || !carouselImages.length) {
      return;
    }

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
      var totalRatio = ratios.reduce(function (total, ratio) {
        return total + ratio;
      }, 0);
      var rowHeight = carouselWidth / frameRatio;

      track.style.height = rowHeight + "px";

      carouselImages.forEach(function (image) {
        image.closest(".carousel-slide").style.flexBasis = "";
      });

      activeImages.forEach(function (image, index) {
        image.closest(".carousel-slide").style.flexBasis = carouselWidth * (ratios[index] / totalRatio) + "px";
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
        image.alt = seasonName + " family gallery image " + (imageIndex + 1);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("active", index === currentIndex);
        dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
      });

      fitWhenReady();
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
        updateCarousel(currentIndex + 1);
      });
    });

    carousel.querySelectorAll("[data-carousel-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        updateCarousel(currentIndex - 1);
      });
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        updateCarousel(Number(dot.dataset.carouselDot));
      });
    });

    window.addEventListener("resize", fitSlides);

    preloadImageRatios();
    updateCarousel(0);
  }

  document.querySelectorAll("[data-season-carousel]").forEach(initCarousel);
})();
