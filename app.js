/*  Created by Patryk Piwowarczyk */

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Year
document.getElementById("year").textContent = String(new Date().getFullYear());

// Drawer (mobile)
const navToggle = document.getElementById("navToggle");
const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");

function setDrawer(open) {
  navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
  drawer?.classList.toggle("is-open", open);
  drawer?.setAttribute("aria-hidden", open ? "false" : "true");
}

navToggle?.addEventListener("click", () => {
  const open = drawer?.getAttribute("aria-hidden") !== "false";
  setDrawer(open);
});

drawerBackdrop?.addEventListener("click", () => setDrawer(false));
drawer?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => setDrawer(false));
});

document.addEventListener("click", (e) => {
  if (!drawer?.classList.contains("is-open")) return;

  const panel = drawer.querySelector(".drawer__panel");
  const clickedInsidePanel = panel?.contains(e.target);
  const clickedToggle = navToggle?.contains(e.target);

  if (!clickedInsidePanel && !clickedToggle) {
    setDrawer(false);
  }
});

/* =========================
   PROMO EXPIRY
   ========================= */

const promoEndDate = new Date("2026-04-01T00:00:00");

if (new Date() >= promoEndDate) {
  document.body.classList.add("promo-expired");
}

// Reveal on scroll
const revealEls = Array.from(document.querySelectorAll(".reveal"));

if (!prefersReduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

function setParallaxMode() {
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  document.body.classList.toggle("is-portrait", portrait);
  document.body.classList.toggle("is-wide", !portrait);
}

setParallaxMode();
window.addEventListener("resize", setParallaxMode, { passive: true });

// =========================
// Parallax (translate + scale(var))
// =========================
const hero = document.querySelector(".hero");
const layers = Array.from(document.querySelectorAll(".hero .layer"));

let mx = 0;
let my = 0;

function onMove(e) {
  if (!hero) return;

  const r = hero.getBoundingClientRect();
  mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  my = ((e.clientY - r.top) / r.height - 0.5) * 2;
}

function onParallax() {
  if (!hero) return;

  const y = window.scrollY || 0;
  const isPortrait = document.body.classList.contains("is-portrait");

  const kScroll = isPortrait ? 0.16 : 0.26;
  const kMouseX = isPortrait ? 10 : 18;
  const kMouseY = isPortrait ? 8 : 14;

  layers.forEach((layer) => {
    const d = Number(layer.dataset.depth || 0.1);

    const tx = mx * d * kMouseX;
    const ty = y * d * kScroll + my * d * kMouseY;

    if (layer.classList.contains("layer--car")) {
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      return;
    }

    const scaleStr = getComputedStyle(layer).getPropertyValue("--layer-scale").trim();
    const scale = scaleStr ? Number(scaleStr) : 1;

    layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
  });
}

if (!prefersReduced && hero) {
  const tick = rafThrottle(onParallax);

  window.addEventListener("mousemove", (e) => {
    onMove(e);
    tick();
  }, { passive: true });

  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick, { passive: true });

  onParallax();
}

// Magnetic buttons
const magnetic = document.querySelectorAll("[data-magnetic]");

magnetic.forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;

    btn.style.setProperty("--mx", `${mx}%`);
    btn.style.setProperty("--my", `${my}%`);

    if (!prefersReduced) {
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.transform = `translate3d(${dx * 6}px, ${dy * 6}px, 0)`;
    }
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.setProperty("--mx", "20%");
    btn.style.setProperty("--my", "20%");
  });
});

// Tilt cards
const tiltEls = document.querySelectorAll("[data-tilt]");

tiltEls.forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    if (prefersReduced) return;

    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 6;
    const ry = (x - 0.5) * 8;

    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
});

// Gallery lightbox
const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.showModal();
}

gallery?.addEventListener("click", (e) => {
  const figure = e.target?.closest("figure");
  const img = figure?.querySelector("img");
  if (!img) return;

  openLightbox(img.currentSrc || img.src, img.alt);
});

lightboxClose?.addEventListener("click", () => lightbox?.close());

lightbox?.addEventListener("click", (e) => {
  if (!lightboxImg) return;

  const rect = lightboxImg.getBoundingClientRect();
  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (!inside) lightbox.close();
});

// Helpers
function rafThrottle(fn) {
  let ticking = false;

  return function (...args) {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      fn.apply(this, args);
      ticking = false;
    });
  };
}

/* =========================
   Google Rating (dynamic stars)
   ========================= */

function renderRating(rating) {
  const starsContainer = document.getElementById("ratingStars");
  if (!starsContainer) return;

  starsContainer.innerHTML = "";

  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars;
  const totalStars = 5;

  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement("span");
    star.classList.add("star");

    if (i < fullStars) {
      star.classList.add("star--full");
    } else if (i === fullStars && decimal > 0) {
      star.classList.add("star--partial");
      star.style.setProperty("--star-fill", decimal);
    } else {
      star.classList.add("star--empty");
    }

    starsContainer.appendChild(star);
  }
}

async function fetchGoogleRating() {
  const rating = 4.6;
  const reviews = 296;

  const ratingValueEl = document.getElementById("googleRatingValue");
  const reviewCountEl = document.getElementById("googleReviewCount");

  if (ratingValueEl) ratingValueEl.textContent = rating;
  if (reviewCountEl) reviewCountEl.textContent = reviews;

  renderRating(rating);
}

fetchGoogleRating();

/* =========================
   Promo popup
   ========================= */

const promoPopup = document.getElementById("promoPopup");
const promoPopupBackdrop = document.getElementById("promoPopupBackdrop");
const promoPopupClose = document.getElementById("promoPopupClose");
const promoPopupDismiss = document.getElementById("promoPopupDismiss");
const promoPopupCta = document.getElementById("promoPopupCta");
const promoPopupConfetti = document.getElementById("promoPopupConfetti");

function openPromoPopup() {
  if (!promoPopup) return;

  promoPopup.classList.add("is-open");
  promoPopup.setAttribute("aria-hidden", "false");
  document.body.classList.add("promo-open");

  burstPromoConfetti();
}

function closePromoPopup() {
  if (!promoPopup) return;

  promoPopup.classList.remove("is-open");
  promoPopup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("promo-open");
}

promoPopupBackdrop?.addEventListener("click", closePromoPopup);
promoPopupClose?.addEventListener("click", closePromoPopup);
promoPopupDismiss?.addEventListener("click", closePromoPopup);
promoPopupCta?.addEventListener("click", closePromoPopup);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && promoPopup?.classList.contains("is-open")) {
    closePromoPopup();
  }
});

function burstPromoConfetti() {
  if (!promoPopupConfetti || prefersReduced) return;

  promoPopupConfetti.innerHTML = "";

  const colors = [
    "confetti-piece--bmw-blue",
    "confetti-piece--bmw-navy",
    "confetti-piece--silver",
    "confetti-piece--white",
    "confetti-piece--red"
  ];

  const shapes = [
    "confetti-piece--line",
    "confetti-piece--sliver",
    "confetti-piece--chip"
  ];

  const total = 42;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement("span");
    piece.classList.add("confetti-piece");

    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const startX = `${Math.random() * 140 - 70}px`;
    const endX = `${Math.random() * 560 - 280}px`;
    const endY = `${260 + Math.random() * 220}px`;
    const rotation = `${180 + Math.random() * 420}deg`;
    const delay = `${Math.random() * 300}ms`;
    const duration = `${2600 + Math.random() * 1800}ms`;
    const left = `${8 + Math.random() * 84}%`;

    piece.classList.add(color, shape);
    piece.style.left = left;
    piece.style.animationDelay = delay;
    piece.style.animationDuration = duration;
    piece.style.setProperty("--x-start", startX);
    piece.style.setProperty("--x-end", endX);
    piece.style.setProperty("--y-end", endY);
    piece.style.setProperty("--rot-end", rotation);

    promoPopupConfetti.appendChild(piece);
  }

  window.setTimeout(() => {
    if (promoPopupConfetti) {
      promoPopupConfetti.innerHTML = "";
    }
  }, 5600);
}

window.addEventListener("load", () => {
  window.setTimeout(() => {
    openPromoPopup();
  }, 500);
});

/* =========================
   Promo pill reopen popup
   ========================= */

const promoPill = document.getElementById("promoPill");

promoPill?.addEventListener("click", () => {
  openPromoPopup();
});
