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
     4) Form UX: validate + send (backend) + mailto fallback
     - Replace EMAIL_TO with your real email.
  --------------------------------------- */
  const EMAIL_TO = "contact@yourdomain.com"; // <-- replace with your real email
  const form = $(".form");
  const dropzone = $(".dropzone");
  const fileInput = $("#files");
  const fileList = $("#fileList");
  const status = $(".form__status");

  const renderFileList = () => {
    if (!fileList || !fileInput) return;
    const files = Array.from(fileInput.files || []);
    fileList.innerHTML = "";
    if (!files.length) return;
    files.forEach((file) => {
      const item = document.createElement("li");
      item.textContent = `${file.name} (${Math.round(file.size / 1024)} Ko)`;
      fileList.appendChild(item);
    });
  };

  const setStatus = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#b42318" : "";
  };

  if (dropzone && fileInput) {
    ["dragenter", "dragover"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("is-dragover");
      });
    });

    dropzone.addEventListener("drop", (e) => {
      if (!e.dataTransfer) return;
      fileInput.files = e.dataTransfer.files;
      renderFileList();
    });

    fileInput.addEventListener("change", renderFileList);
  }

  const buildMailtoFallback = () => {
    const name = $("#name")?.value.trim() || "";
    const email = $("#email")?.value.trim() || "";
    const app = $("#app")?.value || "";
    const urgency = $("#urgency")?.value || "";
    const msg = $("#msg")?.value.trim() || "";
    const files = Array.from(fileInput?.files || []).map((file) => file.name);

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
      files.length ? `Files prepared: ${files.join(", ")}` : "Files: none attached",
      "Photos: please attach photos of the connector / loom area when replying.",
    ];

    return (
      `mailto:${encodeURIComponent(EMAIL_TO)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`
    );
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const endpoint = form.getAttribute("action") || "/api/contact";
      const payload = new FormData(form);

      setStatus("Envoi en cours...");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: payload,
        });

        if (!response.ok) {
          throw new Error("request_failed");
        }

        setStatus("Merci ! Votre demande a été envoyée.");
        form.reset();
        renderFileList();
      } catch (err) {
        setStatus("Échec de l'envoi automatique. Ouverture de votre messagerie...", true);
        window.location.href = buildMailtoFallback();
      }
    });
  }

  /* ---------------------------------------
     5) Minimal carousel for "Réalisations"
  --------------------------------------- */
  const carousels = $$("[data-carousel]");

  carousels.forEach((carousel) => {
    const track = $(".carousel__track", carousel);
    const slides = $$(".carousel__slide", carousel);
    const prevBtn = $('[data-action="prev"]', carousel);
    const nextBtn = $('[data-action="next"]', carousel);
    const dotsWrap = $(".carousel__dots", carousel);

    if (!track || !slides.length || !prevBtn || !nextBtn || !dotsWrap) return;

    let index = 0;

    const buildDots = () => {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", `Aller à la réalisation ${i + 1}`);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
        dot.addEventListener("click", () => {
          index = i;
          update();
        });
        dotsWrap.appendChild(dot);
      });
    };

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      const dots = $$(".carousel__dot", carousel);
      dots.forEach((dot, i) => {
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    };

    const goPrev = () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    };

    const goNext = () => {
      index = (index + 1) % slides.length;
      update();
    };

    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", goNext);

    buildDots();
    update();
  });
})();
