/* =========================
   script.js (Marketing + UX/UI improved)
   - Smooth scroll for anchors
   - Active nav highlight (scroll spy)
   - Sticky header shadow on scroll
   - Form UX (client-side validation + mailto fallback builder)
========================= */

(function () {
  "use strict";

  /* ---------------------------------------
     Helpers
  --------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------------------------------
     1) Smooth scroll for internal anchors
  --------------------------------------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------------------------------------
     2) Sticky header "scrolled" state
  --------------------------------------- */
  const header = $(".header");
  const toggleHeaderState = () => {
    if (!header) return;
    const scrolled = window.scrollY > 8;
    header.classList.toggle("is-scrolled", scrolled);
  };
  window.addEventListener("scroll", toggleHeaderState, { passive: true });
  toggleHeaderState();

  /* ---------------------------------------
     3) Scroll spy (highlight current section)
  --------------------------------------- */
  const navLinks = $$(".nav a[href^='#']");
  const sections = navLinks
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);

  const clearActive = () => navLinks.forEach((l) => l.classList.remove("is-active"));
  const setActive = (id) => {
    clearActive();
    const link = $(`.nav a[href="#${id}"]`);
    if (link) link.classList.add("is-active");
  };

  // Use IntersectionObserver if available
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target && visible.target.id) setActive(visible.target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-15% 0px -70% 0px" }
    );

    sections.forEach((sec) => io.observe(sec));
  }

  /* ---------------------------------------
     4) Form UX: validate + build email fallback
     - This is a static-site friendly approach.
     - Replace EMAIL_TO with your real email.
  --------------------------------------- */
  const rotator = document.querySelector("[data-rotate='true']");
  const rotateMessages = [
    "Éliminer les pannes intermittentes",
    "Sécuriser la connectique critique",
    "Assurer une étanchéité durable",
    "Remettre en route sans immobilisation longue",
  ];
  let rotateIndex = 0;

  if (rotator && (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    const applyMessage = () => {
      rotateIndex = (rotateIndex + 1) % rotateMessages.length;
      rotator.textContent = rotateMessages[rotateIndex];
    };

    setInterval(applyMessage, 3600);
  }

  const EMAIL_TO = "contact@yourdomain.com"; // <-- replace with your real email
  const form = $(".form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic HTML5 validity
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const name = $("#name")?.value.trim() || "";
      const email = $("#email")?.value.trim() || "";
      const app = $("#app")?.value || "";
      const urgency = $("#urgency")?.value || "";
      const msg = $("#msg")?.value.trim() || "";

      const subject = `[Quote Request] ${app} wiring harness repair (${urgency})`;
      const bodyLines = [
        "New request:",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Application: ${app}`,
        `Urgency: ${urgency}`,
        "",
        "Problem:",
        msg,
        "",
        "Photos: please attach photos of the connector / loom area when replying.",
      ];

      const mailto =
        `mailto:${encodeURIComponent(EMAIL_TO)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      // Open user's mail client (works on static hosting)
      window.location.href = mailto;

      // Optional: clear after triggering mail client
      // form.reset();
    });
  }
})();
