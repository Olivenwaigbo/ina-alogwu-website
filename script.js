const header = document.querySelector(".site-header");
const backTop = document.querySelector(".back-top");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
  backTop.classList.toggle("show", window.scrollY > 600);
});

menuToggle.addEventListener("click", () => mobileMenu.classList.toggle("open"));

document.querySelectorAll(".mobile-menu a").forEach(link => {
  link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold:0.12});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();

/* Booking form — direct email workflow for now.
   Change this address if the booking/contact email changes. */
const BOOKING_EMAIL = "olive.nwaigbo@t2mobile.com.ng";

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = new FormData(e.currentTarget);
  const subject = `Speaking Engagement Request — ${form.get("organisation") || "New Enquiry"}`;

  const body = [
    "Hello Olive,",
    "",
    "I would like to enquire about booking Ina Alogwu for a speaking engagement.",
    "",
    `Name: ${form.get("name")}`,
    `Organisation: ${form.get("organisation")}`,
    `Email: ${form.get("email")}`,
    `Event type: ${form.get("event_type")}`,
    `Event date: ${form.get("date") || "Not specified"}`,
    `Location: ${form.get("location") || "Not specified"}`,
    "",
    "Event details:",
    form.get("message"),
    "",
    "Sent from the Ina Alogwu speaker website."
  ].join("\n");

  window.location.href =
    `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* Speaking gallery — click any image for fullscreen viewing. */
const galleryCards = [...document.querySelectorAll("[data-gallery-item]")];
const lightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const galleryCounter = document.getElementById("galleryCounter");
const galleryClose = document.querySelector(".gallery-close");
const galleryPrev = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
let galleryIndex = 0;

function openGallery(index){
  if(!galleryCards.length) return;
  galleryIndex = (index + galleryCards.length) % galleryCards.length;
  const img = galleryCards[galleryIndex].querySelector("img");
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt;
  lightboxCaption.textContent = `Speaking moment ${String(galleryIndex + 1).padStart(2,"0")}`;
  galleryCounter.textContent = `${galleryIndex + 1} / ${galleryCards.length}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGallery(){
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

galleryCards.forEach((card,index) => card.addEventListener("click", () => openGallery(index)));
galleryClose.addEventListener("click", closeGallery);
galleryPrev.addEventListener("click", () => openGallery(galleryIndex - 1));
galleryNext.addEventListener("click", () => openGallery(galleryIndex + 1));
lightbox.addEventListener("click", (e) => { if(e.target === lightbox) closeGallery(); });
document.addEventListener("keydown", (e) => {
  if(!lightbox.classList.contains("open")) return;
  if(e.key === "Escape") closeGallery();
  if(e.key === "ArrowLeft") openGallery(galleryIndex - 1);
  if(e.key === "ArrowRight") openGallery(galleryIndex + 1);
});

/* Small cursor glow on desktop */
const glow = document.querySelector(".cursor-glow");
if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}
