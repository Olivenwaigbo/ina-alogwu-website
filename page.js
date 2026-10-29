/* page.js — small script for sub-pages (advisory.html) */
const header=document.querySelector(".site-header"),backTop=document.querySelector(".back-top"),
      menuToggle=document.querySelector(".menu-toggle"),mobileMenu=document.querySelector(".mobile-menu");
window.addEventListener("scroll",()=>{header.classList.toggle("scrolled",scrollY>30);backTop.classList.toggle("show",scrollY>600)});
menuToggle.addEventListener("click",()=>mobileMenu.classList.toggle("open"));
mobileMenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobileMenu.classList.remove("open")));
backTop.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
document.getElementById("year").textContent=new Date().getFullYear();
