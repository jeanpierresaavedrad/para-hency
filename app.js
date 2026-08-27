'use strict';

/* ═══════ CONFIGURACIÓN — edita aquí ═══════ */
const FECHA_INICIO = new Date(2025, 8, 1); // 1 de septiembre de 2025 (mes 8 = septiembre)
const FOTOS = [                        // carrusel polaroid
  { src: 'fotos/1.jpg', alt: 'Un beso en el carro' },
  { src: 'fotos/2.jpg', alt: 'En la moto, con los brazos abiertos' },
  { src: 'fotos/3.jpg', alt: 'Con una nota escrita a mano, en las montañas' },
  { src: 'fotos/4.jpg', alt: 'Un beso entre globos de corazón' },
  { src: 'fotos/5.jpg', alt: 'En la playa, entre las rocas' },
  { src: 'fotos/6.jpg', alt: 'Una cena con velas' },
];
const FOTOS_GALERIA = [                // fotos grandes del final
  { src: 'fotos/g1.jpg', alt: 'Juntos en la playa al atardecer' },
  { src: 'fotos/g2.jpg', alt: 'Nuestras manos frente al atardecer' },
];

const $ = s => document.querySelector(s);
const conMovimiento = matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (conMovimiento) document.documentElement.classList.add('js-revela');

/* ═══════ Puerta de entrada ═══════ */
const puerta = $('#puerta');
const audio = $('#audio');
const btnMusica = $('#btnMusica');
let entrado = false;

$('#btnEntrar').addEventListener('click', () => {
  if (entrado) return;
  entrado = true;
  audio.play().then(() => { btnMusica.hidden = false; setMusica(true); }).catch(() => {});
  puerta.classList.add('fuera');
  document.body.classList.add('abierta');
  setTimeout(iniciaReveals, 250);
  setTimeout(() => puerta.remove(), 900);
});

/* ═══════ Música ═══════ */
audio.addEventListener('canplaythrough', () => { btnMusica.hidden = false; }, { once: true });
audio.addEventListener('error', () => { btnMusica.hidden = true; });
function setMusica(on) { btnMusica.classList.toggle('sonando', on); }
btnMusica.addEventListener('click', () => {
  if (audio.paused) audio.play().then(() => setMusica(true)).catch(() => {});
  else { audio.pause(); setMusica(false); }
});

/* ═══════ Carrusel polaroid ═══════ */
const carrusel = $('#carrusel');
const dots = $('#dots');

const corazonContorno =
  '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7-4.6-9.3-8.6C1.2 9 2.7 5.8 5.8 5.8c1.8 0 3.1 1 3.9 2.3L12 10l2.3-1.9c.8-1.3 2.1-2.3 3.9-2.3 3.1 0 4.6 3.2 3.1 6.1C19 15.9 12 20.5 12 20.5z"/></svg>';

FOTOS.forEach(({ src, alt }, i) => {
  const slide = document.createElement('div');
  slide.className = 'slide';
  const img = new Image();
  img.alt = alt;
  img.decoding = 'async';
  img.fetchPriority = i === 0 ? 'high' : 'low';
  img.onerror = () => {
    slide.classList.add('vacia');
    slide.innerHTML =
      `<div class="vacia-inner">${corazonContorno}<p>Aquí va una foto nuestra</p><small>${src}</small></div>`;
  };
  img.src = src;
  slide.appendChild(img);
  carrusel.appendChild(slide);

  const dot = document.createElement('span');
  dot.className = 'dot' + (i === 0 ? ' activa' : '');
  dots.appendChild(dot);
});

carrusel.addEventListener('scroll', () => {
  const i = Math.round(carrusel.scrollLeft / carrusel.clientWidth);
  dots.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('activa', j === i));
}, { passive: true });

/* ═══════ Galería final ═══════ */
const galeria = $('#galeria');
FOTOS_GALERIA.forEach(({ src, alt }) => {
  const foto = document.createElement('div');
  foto.className = 'foto rv';
  const img = new Image();
  img.alt = alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.onerror = () => {
    foto.classList.add('vacia');
    foto.innerHTML =
      `<div class="vacia-inner">${corazonContorno}<p>Aquí va una foto nuestra</p><small>${src}</small></div>`;
  };
  img.src = src;
  foto.appendChild(img);
  galeria.appendChild(foto);
});

/* ═══════ El sobre ═══════ */
const carta = $('#carta');
$('#btnLacre').addEventListener('click', () => {
  carta.classList.add('abierta');
  $('#btnLacre').disabled = true;
});

/* ═══════ "Sí, quiero" ═══════ */
$('#btnSiQuiero').addEventListener('click', function () {
  this.disabled = true;
  $('#respuesta').classList.add('visible');
  iniciaLluvia();
  setTimeout(() => {
    $('#contador').scrollIntoView({ behavior: conMovimiento ? 'smooth' : 'auto', block: 'center' });
  }, 1100);
});

/* ═══════ Contador en vivo ═══════ */
function renderContador() {
  const ahora = new Date();
  let a = ahora.getFullYear() - FECHA_INICIO.getFullYear();
  let m = ahora.getMonth() - FECHA_INICIO.getMonth();
  let d = ahora.getDate() - FECHA_INICIO.getDate();
  if (d < 0) { m--; d += new Date(ahora.getFullYear(), ahora.getMonth(), 0).getDate(); }
  if (m < 0) { a--; m += 12; }

  const unidades = [];
  if (a > 0) unidades.push([a, a === 1 ? 'año' : 'años']);
  if (m > 0) unidades.push([m, m === 1 ? 'mes' : 'meses']);
  if (d > 0 || unidades.length === 0) unidades.push([d, d === 1 ? 'día' : 'días']);

  $('#cifras').innerHTML = unidades
    .map(([n, l]) => `<div class="cifra"><span class="num">${n}</span><span class="uni">${l}</span></div>`)
    .join('');
  $('#contadorPre').textContent =
    unidades.length === 1 && unidades[0][0] === 1 ? 'Ha sido el mejor' : 'Han sido los mejores';
}
renderContador();
setInterval(renderContador, 60000);

/* ═══════ Revelado al hacer scroll ═══════ */
function iniciaReveals() {
  const els = document.querySelectorAll('.rv');
  if (!conMovimiento || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visto'));
    return;
  }
  const io = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* ═══════ Atajo de revisión (solo con ?vista=sobre|abierta en la URL) ═══════ */
const vista = new URLSearchParams(location.search).get('vista');
if (vista) {
  document.getElementById('btnEntrar').click();
  document.querySelectorAll('.rv').forEach(e => e.classList.add('visto'));
  if (vista === 'abierta') {
    carta.classList.add('abierta');
    document.getElementById('btnLacre').disabled = true;
    document.getElementById('respuesta').classList.add('visible');
  }
}

/* ═══════ Lluvia de corazones ═══════ */
let lluviaActiva = false;
function iniciaLluvia() {
  if (lluviaActiva || !conMovimiento) return;
  lluviaActiva = true;

  const cv = $('#lluvia');
  const ctx = cv.getContext('2d');
  cv.classList.add('activa');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H;
  const redimensiona = () => {
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  redimensiona();
  addEventListener('resize', redimensiona);

  const COLORES = ['#B04A32', '#C4694A', '#D98B6A', '#9C2721', '#DDA079'];
  const partes = [];
  const nueva = (y) => ({
    x: Math.random() * W,
    y: y !== undefined ? y : -24,
    s: 5 + Math.random() * 8,
    vy: 38 + Math.random() * 55,
    fase: Math.random() * Math.PI * 2,
    fre: .6 + Math.random() * 1.2,
    amp: 10 + Math.random() * 22,
    op: .45 + Math.random() * .5,
    c: COLORES[(Math.random() * COLORES.length) | 0],
  });
  // ráfaga inicial repartida por encima de la pantalla
  for (let i = 0; i < 55; i++) partes.push(nueva(-Math.random() * H * 1.2));

  function corazon(x, y, s, rot, op, c) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = op;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, s * .32);
    ctx.bezierCurveTo(-s * .55, -s * .3, -s * 1.05, s * .35, 0, s);
    ctx.bezierCurveTo(s * 1.05, s * .35, s * .55, -s * .3, 0, s * .32);
    ctx.fill();
    ctx.restore();
  }

  let ultimo = performance.now();
  let goteo = 0;
  let corriendo = true;

  document.addEventListener('visibilitychange', () => {
    const visible = !document.hidden;
    if (visible && !corriendo) { corriendo = true; ultimo = performance.now(); requestAnimationFrame(paso); }
    if (!visible) corriendo = false;
  });

  function paso(t) {
    if (!corriendo) return;
    const dt = Math.min((t - ultimo) / 1000, .05);
    ultimo = t;
    ctx.clearRect(0, 0, W, H);
    goteo += dt;
    if (goteo > .5 && partes.length < 60) { partes.push(nueva()); goteo = 0; }
    for (let i = partes.length - 1; i >= 0; i--) {
      const p = partes[i];
      p.y += p.vy * dt;
      p.fase += p.fre * dt;
      corazon(p.x + Math.sin(p.fase) * p.amp, p.y, p.s, Math.sin(p.fase) * .3, p.op, p.c);
      if (p.y > H + 30) partes.splice(i, 1);
    }
    requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
