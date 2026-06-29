(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const loader = document.querySelector("[data-loader]");
  const nav = document.querySelector("[data-nav]");
  const cursor = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");

  body.classList.add("is-loading");

  function splitHeroText() {
    document.querySelectorAll("[data-split] span").forEach((line) => {
      const text = line.textContent.trim();
      line.textContent = "";
      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.className = "char";
        span.style.setProperty("--char-index", index);
        span.textContent = char === " " ? "\u00A0" : char;
        line.appendChild(span);
      });
    });
  }

  function prepareStagger() {
    document.querySelectorAll(".stagger").forEach((group) => {
      [...group.children].forEach((child, index) => child.style.setProperty("--stagger-index", index));
    });
  }

  function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");

    if (prefersReducedMotion) {
      reveals.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((item) => observer.observe(item));
  }

  function animateCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const target = Number(element.dataset.counter);
          const duration = 1450;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          observer.unobserve(element);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function setupCursor() {
    if (!cursor || !cursorDot || prefersReducedMotion || window.matchMedia("(max-width: 640px)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;

    window.addEventListener("pointermove", (event) => {
      x = event.clientX;
      y = event.clientY;
      cursorDot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    function render() {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      cursor.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    document.querySelectorAll("a, button, .dish-card, .gallery-item, input, select").forEach((item) => {
      item.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
      item.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
    });
  }

  function setupMagneticButtons() {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("pointermove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        item.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });

      item.addEventListener("pointerleave", () => {
        item.style.transform = "translate(0, 0)";
      });
    });
  }

  function setupParallax() {
    if (prefersReducedMotion) return;

    const heroImage = document.querySelector(".parallax-img");
    const floatCards = document.querySelectorAll(".float-card");

    window.addEventListener("pointermove", (event) => {
      const px = event.clientX / window.innerWidth - 0.5;
      const py = event.clientY / window.innerHeight - 0.5;

      if (heroImage) {
        heroImage.style.transform = `scale(1.08) translate(${px * -18}px, ${py * -12}px)`;
      }

      floatCards.forEach((card) => {
        const depth = Number(card.dataset.depth || 10);
        card.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
      });
    });
  }

  function setupNav() {
    const onScroll = () => {
      nav?.classList.toggle("is-scrolled", window.scrollY > 28);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setupTestimonials() {
    const track = document.querySelector("[data-testimonial-track]");
    const dots = document.querySelector("[data-testimonial-dots]");
    if (!track || !dots) return;

    const slides = [...track.children];
    let active = 0;

    slides.forEach((_, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Show testimonial ${index + 1}`);
      button.addEventListener("click", () => update(index, true));
      dots.appendChild(button);
    });

    function update(index, userInitiated = false) {
      active = index;
      track.style.transform = `translateX(-${active * 100}%)`;
      [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === active));

      if (userInitiated) {
        clearInterval(timer);
        timer = setInterval(next, 4600);
      }
    }

    function next() {
      update((active + 1) % slides.length);
    }

    let timer = setInterval(next, 4600);
    update(0);
  }

  function setupBookingForm() {
    const form = document.querySelector(".booking");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector("button");
      const original = button.textContent;
      button.textContent = "Request Sent";
      button.disabled = true;

      setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
        form.reset();
      }, 2200);
    });
  }

  splitHeroText();
  prepareStagger();
  revealOnScroll();
  animateCounters();
  setupCursor();
  setupMagneticButtons();
  setupParallax();
  setupNav();
  setupTestimonials();
  setupBookingForm();

  window.addEventListener("load", () => {
    window.setTimeout(() => {
      loader?.classList.add("is-hidden");
      body.classList.remove("is-loading");
      body.classList.add("is-ready");
      document.querySelectorAll(".hero .reveal").forEach((item) => item.classList.add("is-visible"));
    }, 900);
  });
})();
