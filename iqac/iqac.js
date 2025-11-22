/* iqac.js — Elegant / Premium interactions
   - Parallax hero background
   - Hero title reveal (staggered words)
   - Section underline reveal
   - Card tilt on mousemove
   - Counters (ease)
   - Fade-up reveals (unchanged intersection)
*/

/* ---------- utility ---------- */
const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

/* ---------- smooth anchor scroll (keeps existing behavior) ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- hero parallax (translateY based on scroll) ---------- */
(function heroParallax(){
  const hero = qs('.iqac-hero');
  const bg = qs('.hero-image');
  if(!hero || !bg) return;
  let lastScroll = window.scrollY;
  function onScroll(){
    const rect = hero.getBoundingClientRect();
    const windowH = window.innerHeight;
    // only run when hero is visible
    if(rect.bottom > 0 && rect.top < windowH){
      // compute progress from -1 to 1 across hero
      const progress = (windowH/2 - rect.top) / (rect.height + windowH/2);
      const translate = Math.max(-40, Math.min(40, (progress-0.5)*40)); // px
      // use transform for GPU acceleration
      bg.style.transform = `translateY(${translate * 0.35}px) scale(1.02)`;
    }
    lastScroll = window.scrollY;
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

/* ---------- hero title split + reveal (staggered words) ---------- */
(function heroTitleReveal(){
  const h = qs('.hero-inner h1');
  if(!h) return;
  // split text into words wrapped by spans
  const words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  words.forEach((w,i)=>{
    const span = document.createElement('span');
    span.className = 'hero-title-word';
    span.textContent = w + (i < words.length-1 ? ' ' : '');
    h.appendChild(span);
  });
  // stagger reveal with small delay
  const spans = qsa('.hero-title-word');
  spans.forEach((sp, idx) => {
    sp.style.transition = `transform 650ms cubic-bezier(.2,.9,.3,1) ${idx*70}ms, opacity 520ms ease ${idx*70}ms`;
    requestAnimationFrame(()=> sp.style.opacity = '1');
    requestAnimationFrame(()=> sp.style.transform = 'translateY(0) rotateX(0deg)');
  });
})();

/* ---------- section headers underline reveal (on intersection) ---------- */
(function headerUnderlineReveal(){
  const headers = qsa('h2');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add('underline-visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.2 });
  headers.forEach(h => obs.observe(h));
})();

/* ---------- fade-up reveal (IntersectionObserver) ---------- */
(function fadeUpReveal(){
  const items = qsa('.fade-up');
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        o.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });
  items.forEach(i => obs.observe(i));
})();

/* ---------- counters (eased animation, per element) ---------- */
(function counters(){
  const nodes = qsa('.num');
  if(nodes.length === 0) return;
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        const el = en.target;
        const target = +el.dataset.target || 0;
        const duration = 1100;
        const start = performance.now();
        const initial = 0;
        function step(now){
          const t = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.floor(initial + (target - initial) * eased);
          if(t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        o.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  nodes.forEach(n => obs.observe(n));
})();

/* ---------- card tilt (mousemove) ---------- */
(function cardTilt(){
  const cards = qsa('.info-card');
  if(!cards.length) return;
  cards.forEach(card => {
    let rect = null;
    card.addEventListener('mousemove', (e) => {
      rect = rect || card.getBoundingClientRect();
      const cx = rect.left + rect.width/2;
      const cy = rect.top + rect.height/2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const rx = dy * 6; // tilt X
      const ry = dx * -10; // tilt Y
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    });
  });
})();

/* ---------- subtle mission area floating motion (parallax of pseudo) ---------- */
/* Already implemented via CSS pseudo ::before; keep lightweight */

/* ---------- hero canvas particles (kept as earlier but slight easing) ---------- */
(function heroParticles(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.clientWidth, h = canvas.clientHeight, DPR = window.devicePixelRatio || 1;
  function resize(){
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * DPR; canvas.height = h * DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  const particles = [];
  const count = Math.max(28, Math.min(80, Math.floor((w*h)/90000)));
  function rand(min,max){ return Math.random()*(max-min)+min; }
  for(let i=0;i<count;i++){
    particles.push({ x: rand(0,w), y: rand(0,h), r: rand(0.8,2.4), vx: rand(-0.3,0.3), vy: rand(-0.12,0.12), a: rand(0.06,0.4) });
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p => {
      p.x += p.vx + Math.sin(p.y*0.01)*0.02;
      p.y += p.vy - 0.01;
      if(p.x < -10) p.x = w + 10;
      if(p.x > w + 10) p.x = -10;
      if(p.y < -10) p.y = h + 10;
      if(p.y > h + 10) p.y = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });

    // subtle connections (sparser for perf)
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 100){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(173,216,255,${(1 - d/100) * 0.045})`;
          ctx.lineWidth = 0.55;
          ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- auto fill year (keeps existing) ---------- */
const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
