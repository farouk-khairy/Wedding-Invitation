/* Editable Content - غيّر من هنا فقط */
const weddingData = {
  groom: "فاروق",
  bride: "سلمى",
  date: "2026-12-12", // YYYY-MM-DD
  displayDate: "السبت، 12 ديسمبر 2026",
  time: "19:00", // 7 PM
  locationUrl: "https://maps.app.goo.gl/x3oKAE6XPMecfYgn8"
};
const assets = {
  heroImage: "assets/hero.png",
  music: "assets/music.mp3"
};

// Preloader
window.addEventListener('load', () => {
  setTimeout(()=> document.getElementById('preloader')?.classList.add('hidden'), 600);
});

// Elements
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const msgEl = document.getElementById('countdown-message');
const gridEl = document.getElementById('countdown');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicToggle');

// Countdown - Dynamic every second
function updateCountdown(){
  const target = new Date(`${weddingData.date}T${weddingData.time}:00`);
  const now = new Date();
  const diff = target - now;
  if(diff <= 0){
    gridEl.classList.add('hidden');
    msgEl.classList.remove('hidden');
    msgEl.textContent = "اليوم بدأت حكايتنا 🤍";
    return;
  }
  const d = Math.floor(diff/1000/60/60/24);
  const h = Math.floor(diff/1000/60/60%24);
  const m = Math.floor(diff/1000/60%60);
  const s = Math.floor(diff/1000%60);
  daysEl.textContent = String(d).padStart(2,'0');
  hoursEl.textContent = String(h).padStart(2,'0');
  minutesEl.textContent = String(m).padStart(2,'0');
  secondsEl.textContent = String(s).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Location - smart open
document.getElementById('locationBtn').addEventListener('click', (e)=>{
  // fallback is href itself, works on all devices
  e.currentTarget.href = weddingData.locationUrl;
});

// Music UX - no autoplay, loop
if(music){ music.loop = true; music.volume = 0.7; }
let isPlaying = false;
musicBtn.addEventListener('click', async ()=>{
  try{
    if(!isPlaying){
      await music.play();
      isPlaying = true;
      musicBtn.classList.add('playing');
      musicBtn.querySelector('.music-text').textContent = "إيقاف";
    } else {
      music.pause();
      isPlaying = false;
      musicBtn.classList.remove('playing');
      musicBtn.querySelector('.music-text').textContent = "الموسيقى";
    }
  }catch(err){ console.warn("Audio play blocked:", err); }
});

// Lenis Smooth Scroll + GSAP Cinematic Scroll
const lenis = new Lenis({ duration: 1.1, easing: (t)=> Math.min(1, 1.001 - Math.pow(2, -10*t)) });
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

// Hero Parallax + Cream Transition (Magic Scroll)
const heroTl = gsap.timeline({
  scrollTrigger:{
    trigger:"#hero",
    start:"top top",
    end:"+=110%",
    scrub:1,
    pin:true,
    anticipatePin:1
  }
});
heroTl.to("#heroImage", { scale:1.14, yPercent:-8, filter:"blur(1.5px) brightness(.85)", ease:"none"}, 0)
      .to(".hero-overlay", { opacity:.65, ease:"none"}, 0)
      .to(".hero-cream-layer", { opacity:1, ease:"none"}, 0.35)
      .to(".hero-content", { y:-60, opacity:0, scale:.96, ease:"none"}, 0.15);

// Cards Reveal - layered depth
gsap.utils.toArray("[data-card]").forEach((card,i)=>{
  // gsap.from(card, {
  //   y: 50,
  //   opacity: 0,
  //   scale: .96,
  //   duration: .8,
  //   ease:"power2.out",
  //   scrollTrigger:{
  //     trigger: card,
  //     start:"top 88%",
  //     end:"top 60%",
  //     scrub: false,
  //     toggleActions:"play none none reverse"
  //   }
  // });
  // subtle parallax for sticky depth
  // gsap.to(card, {
  //   scale: 0.98,
  //   scrollTrigger:{
  //     trigger: card,
  //     start:"top 12%",
  //     end:"bottom top",
  //     scrub:true
  //   }
  // });
});

// Text reveal micro-interaction
gsap.from(".couple-names", { opacity:0, y:20, duration:.7, scrollTrigger:{trigger:".card-1", start:"top 75%"} });