/* fx.js — load AFTER script.js. Pure add-on; safe to remove. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Gallery: always visible, staggered fade-in per card */
  const grid = document.getElementById("speakingGallery");
  if (grid) {
    grid.classList.add("visible");
    const cards = [...grid.querySelectorAll(".gallery-card")];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = cards.indexOf(en.target) % 4;
        setTimeout(() => en.target.classList.add("in"), i * 90);
        io.unobserve(en.target);
      });
    }, { threshold: 0.05 });
    cards.forEach((c) => io.observe(c));
  }

  /* 2. Hero: scan line + particle network */
  const frame = document.querySelector(".portrait-frame");
  if (frame) {
    const s = document.createElement("div");
    s.className = "scanline";
    frame.appendChild(s);
  }

  const hero = document.querySelector(".hero");
  if (hero && !reduce) {
    const cv = document.createElement("canvas");
    cv.className = "hero-canvas";
    hero.prepend(cv);
    const ctx = cv.getContext("2d");
    let w, h, pts;
    const mouse = { x: -999, y: -999 };
    const size = () => {
      w = cv.width = hero.offsetWidth;
      h = cv.height = hero.offsetHeight;
      const n = Math.min(70, Math.floor((w * h) / 22000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }));
    };
    size();
    window.addEventListener("resize", size);
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    (function draw() {
      ctx.clearRect(0, 0, w, h);
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.283);
        ctx.fillStyle = "rgba(124,92,255,.65)"; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(25,160,200,${0.22 * (1 - d / 130)})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 170) {
          ctx.strokeStyle = `rgba(25,227,255,${0.5 * (1 - dm / 170)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      });
      requestAnimationFrame(draw);
    })();
  }

  /* 3. Typing effect on hero eyebrow */
  const eb = document.querySelector(".hero .eyebrow");
  if (eb && !reduce) {
    const txt = eb.lastChild.textContent.trim();
    eb.lastChild.textContent = " ";
    const t = document.createElement("span");
    t.className = "type-cursor";
    t.style.cssText = "width:auto;height:auto;background:none";
    eb.appendChild(t);
    let i = 0;
    const tick = () => { t.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(tick, 32); };
    setTimeout(tick, 500);
  }

  /* 4. Count-up on "15+" */
  const stat = document.querySelector(".hero-proof strong");
  if (stat && !reduce && /^\d+\+?$/.test(stat.textContent.trim())) {
    const target = parseInt(stat.textContent, 10), plus = stat.textContent.includes("+") ? "+" : "";
    let n = 0;
    const step = () => { n += 1; stat.textContent = n + plus; if (n < target) setTimeout(step, 70); };
    setTimeout(step, 900);
  }

  /* 5. Seamless marquee: duplicate content */
  const mq = document.querySelector(".logo-marquee");
  if (mq) mq.innerHTML += mq.innerHTML;

  /* 6. Expertise orbit — items travel around the rings */
  const orbit = document.querySelector(".expertise-orbit");
  if (orbit) {
    const items = [...orbit.querySelectorAll(".orbit-item")];
    items.forEach((el) => el.classList.add("js-orbit"));
    let paused = false, base = 0, last = performance.now();
    orbit.addEventListener("mouseenter", () => (paused = true));
    orbit.addEventListener("mouseleave", () => (paused = false));
    const R = 217; // sits between the two rings
    (function frame(now) {
      const dt = now - last; last = now;
      if (!paused && !reduce) base += dt * 0.007; // degrees per ms (~1 turn per 50s)
      items.forEach((el, i) => {
        const a = ((base + (360 / items.length) * i - 90) * Math.PI) / 180;
        el.style.transform = `translate(${Math.cos(a) * R}px, ${Math.sin(a) * R}px)`;
      });
      requestAnimationFrame(frame);
    })(last);
  }
})();

/* 7. Lightbox shows each photo's real caption (instead of "Speaking moment NN") */
(function () {
  const img = document.getElementById("lightboxImage");
  const cap = document.getElementById("lightboxCaption");
  const counter = document.getElementById("galleryCounter");
  const cards = [...document.querySelectorAll("[data-gallery-item]")];
  if (!img || !cap || !counter) return;
  new MutationObserver(() => {
    const n = parseInt(counter.textContent, 10) - 1;
    const fc = cards[n] && cards[n].querySelector("figcaption");
    if (fc) cap.textContent = fc.textContent;
  }).observe(counter, { childList: true, characterData: true, subtree: true });
})();