const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const revealSections = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll(".main-nav a");
const sectionTargets = [
  ...new Set(
    [...navLinks]
      .map((link) => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return null;
        return document.querySelector(href);
      })
      .filter(Boolean)
  ),
];

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.tab;

    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");

    tabPanels.forEach((panel) => {
      const isActive = panel.id === targetId;
      if (isActive) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add("active"));
      } else {
        panel.classList.remove("active");
        setTimeout(() => {
          if (!panel.classList.contains("active")) {
            panel.hidden = true;
          }
        }, 480);
      }
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
);

revealSections.forEach((section) => {
  if (!section.classList.contains("is-visible")) {
    revealObserver.observe(section);
  }
});

const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeId = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("nav-active", link.getAttribute("href") === activeId);
      });
    });
  },
  { threshold: 0.45 }
);

sectionTargets.forEach((section) => activeObserver.observe(section));

(function initGalleryLightbox() {
  const galleryImages = document.querySelectorAll(".gallery-grid img");
  if (!galleryImages.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("hidden", "");
  lightbox.innerHTML = `
    <div class="lightbox-backdrop" aria-hidden="true"></div>
    <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" class="lightbox-close" aria-label="Close image preview">&times;</button>
      <img class="lightbox-image" alt="" />
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const closeButton = lightbox.querySelector(".lightbox-close");
  const backdrop = lightbox.querySelector(".lightbox-backdrop");
  let lastFocused = null;

  function openLightbox(image) {
    lastFocused = document.activeElement;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || "Expanded gallery image";
    lightbox.removeAttribute("hidden");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute("hidden", "");
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  galleryImages.forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open image: ${image.alt || "gallery image"}`);
    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hasAttribute("hidden")) {
      e.preventDefault();
      closeLightbox();
    }
  });
})();

(function initMobileNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("#nav-toggle");
  const backdrop = document.querySelector(".nav-backdrop");
  const nav = document.querySelector("#site-nav");
  if (!header || !toggle || !nav) return;

  const mq = window.matchMedia("(max-width: 900px)");

  function setNavOpen(open) {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
    if (backdrop) {
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
  }

  toggle.addEventListener("click", () => {
    setNavOpen(!header.classList.contains("nav-open"));
  });

  backdrop?.addEventListener("click", () => {
    setNavOpen(false);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setNavOpen(false);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNavOpen(false);
  });

  const onMq = () => {
    if (!mq.matches) setNavOpen(false);
  };
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onMq);
  } else {
    mq.addListener(onMq);
  }
})();
