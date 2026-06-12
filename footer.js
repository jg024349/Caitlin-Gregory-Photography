(function () {
  "use strict";

  var footerMount = document.querySelector("[data-site-footer]");
  if (!footerMount) {
    return;
  }

  var instagramUrl = "https://www.instagram.com/caitlingregoryphotography/";
  var fallbackPosts = [
    { imageUrl: "hero.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" },
    { imageUrl: "Bundle.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" },
    { imageUrl: "Maternity.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" },
    { imageUrl: "Newborn.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" },
    { imageUrl: "Crown.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" },
    { imageUrl: "Sapphire.jpg", postUrl: instagramUrl, alt: "Caitlin Gregory Photography on Instagram" }
  ];

  footerMount.innerHTML = [
    '<footer class="brand-footer">',
    '  <div class="social-links" aria-label="Follow Caitlin Gregory Photography">',
    '    <a href="https://www.facebook.com/caitlingregoryphotography/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">',
    '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.5-3h-3.2V8.1c0-.9.4-1.5 1.6-1.5h1.7V3.9c-.3 0-1.1-.1-2.2-.1-2.2 0-3.7 1.4-3.7 4V10H8.8v3h2.5v8h2.2Z"/></svg>',
    '    </a>',
    '    <a href="https://www.linkedin.com/in/caitlin-gregory-612293147" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">',
    '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.1 8.3a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4.5 20h3.2V10H4.5v10Zm5.3 0H13v-5.7c0-1.5.3-2.5 1.9-2.5 1.5 0 1.5 1.4 1.5 2.6V20h3.2v-6.3c0-3.1-.7-5.4-4.2-5.4-1.7 0-2.8.9-3.3 1.8h-.1V10H9.8v10Z"/></svg>',
    '    </a>',
    '    <a href="' + instagramUrl + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram">',
    '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 3.8h9.2a3.6 3.6 0 0 1 3.6 3.6v9.2a3.6 3.6 0 0 1-3.6 3.6H7.4a3.6 3.6 0 0 1-3.6-3.6V7.4a3.6 3.6 0 0 1 3.6-3.6Zm0 2A1.6 1.6 0 0 0 5.8 7.4v9.2a1.6 1.6 0 0 0 1.6 1.6h9.2a1.6 1.6 0 0 0 1.6-1.6V7.4a1.6 1.6 0 0 0-1.6-1.6H7.4Zm4.6 1a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0 2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm3-3a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z"/></svg>',
    '    </a>',
    '  </div>',
    '  <a href="index.html" class="footer-logo" aria-label="Caitlin Gregory Photography home">',
    '    <img src="CAITLIN GREGORY_WhiteLogo.png" alt="Caitlin Gregory Photography">',
    '  </a>',
    '  <p class="footer-info"><a href="mailto:caitlin.gregory@caitlingregoryphotography.com">caitlin.gregory@caitlingregoryphotography.com</a> | Caitlin Gregory Photography, L.L.C. <span data-footer-year></span></p>',
    '  <div class="footer-instagram" data-instagram-feed aria-label="Latest Instagram posts"></div>',
    '</footer>'
  ].join("");

  footerMount.querySelector("[data-footer-year]").textContent = new Date().getFullYear();

  var feedContainer = footerMount.querySelector("[data-instagram-feed]");

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function renderPosts(posts) {
    feedContainer.innerHTML = posts.slice(0, 6).map(function (post) {
      return [
        '<a href="' + escapeText(post.postUrl) + '" target="_blank" rel="noopener noreferrer">',
        '  <img src="' + escapeText(post.imageUrl) + '" alt="' + escapeText(post.alt) + '" loading="lazy">',
        '</a>'
      ].join("");
    }).join("");
  }

  renderPosts(fallbackPosts);

  // This endpoint is served by server.js and keeps the Instagram token private.
  var feedEndpoint = window.CGP_INSTAGRAM_FEED_ENDPOINT || "/api/instagram-feed";

  fetch(feedEndpoint, { headers: { Accept: "application/json" } })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Instagram feed request failed.");
      }
      return response.json();
    })
    .then(function (payload) {
      var media = Array.isArray(payload) ? payload : payload.data;
      var posts = (media || []).slice(0, 6).map(function (item) {
        return {
          imageUrl: item.thumbnail_url || item.media_url,
          postUrl: item.permalink,
          alt: item.caption || "View this Instagram post"
        };
      }).filter(function (post) {
        return post.imageUrl && post.postUrl;
      });

      if (posts.length > 0) {
        renderPosts(posts);
      }
    })
    .catch(function () {
      // Keep the local gallery visible when the configured feed is unavailable.
    });
}());
