/* Carosello home: loop infinito, autoscorrimento, pallini e parallasse.
   Le slide vengono copiate prima e dopo (3 serie identiche): si parte dalla serie
   centrale e, finito lo scorrimento, si torna in modo invisibile alla serie centrale.
   Dopo l'ultima foto si ritorna quindi alla prima. */
(function () {
  var track = document.querySelector('.hc-track');
  var bar = document.querySelector('.hc-dots');
  if (!track || !bar) return;

  var originals = Array.prototype.slice.call(track.querySelectorAll('.hc-slide'));
  var N = originals.length;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  var settleTimer = null;
  var section = track.parentElement;

  /* Autoscorrimento: ogni INTERVAL ms si passa alla foto successiva. Il conteggio riparte
     a fine scorrimento (anche manuale), e sta fermo mentre il dito o il mouse sono sul carosello. */
  var INTERVAL = 5000;
  var autoTimer = null;
  var touching = false;

  function stopAuto() {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  function startAuto() {
    stopAuto();
    if (reduce) return;
    autoTimer = setTimeout(function () {
      track.scrollBy({ left: slideW(), behavior: 'smooth' });
    }, INTERVAL);
  }
  ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) {
    track.addEventListener(ev, function () {
      touching = ev !== 'wheel';
      stopAuto();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 400);
    }, { passive: true });
  });
  ['touchend', 'touchcancel', 'pointerup', 'pointercancel'].forEach(function (ev) {
    track.addEventListener(ev, function () {
      touching = false;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 200);
    }, { passive: true });
  });
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    section.addEventListener('mouseenter', stopAuto);
    section.addEventListener('mouseleave', startAuto);
  }

  function clones() {
    return originals.map(function (s) {
      var c = s.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
  }
  var before = clones(), after = clones();
  before.forEach(function (c) { track.insertBefore(c, originals[0]); });
  after.forEach(function (c) { track.appendChild(c); });

  var slides = track.querySelectorAll('.hc-slide');

  function slideW() { return slides[0].getBoundingClientRect().width; }

  function jumpTo(left) {
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    track.style.scrollSnapType = '';
  }

  function build() {
    bar.innerHTML = '';
    bar.style.display = N <= 1 ? 'none' : 'flex';
    for (var i = 0; i < N; i++) {
      (function (i) {
        var d = document.createElement('button');
        d.className = 'hc-dot';
        d.setAttribute('aria-label', 'Vai alla foto ' + (i + 1));
        d.addEventListener('click', function () {
          var cur = Math.round(track.scrollLeft / slideW());
          var curMod = ((cur % N) + N) % N;
          /* strada piu' corta, passando anche per il giro completo */
          var diff = i - curMod;
          if (diff > N / 2) diff -= N;
          if (diff < -N / 2) diff += N;
          track.scrollTo({ left: (cur + diff) * slideW(), behavior: 'smooth' });
        });
        bar.appendChild(d);
      })(i);
    }
    jumpTo(N * slideW());
    update();
    startAuto();
  }

  function settle() {
    if (touching) return;
    var w = slideW();
    var i = Math.round(track.scrollLeft / w);
    if (i < N) jumpTo(track.scrollLeft + N * w);
    else if (i >= 2 * N) jumpTo(track.scrollLeft - N * w);
    update();
    startAuto();
  }

  function update() {
    ticking = false;
    var w = slideW();
    var i = ((Math.round(track.scrollLeft / w) % N) + N) % N;
    for (var k = 0; k < bar.children.length; k++) {
      bar.children[k].classList.toggle('is-active', k === i);
    }
    if (reduce) return;
    var tRect = track.getBoundingClientRect();
    var tc = tRect.left + tRect.width / 2;
    for (var s = 0; s < slides.length; s++) {
      var r = slides[s].getBoundingClientRect();
      if (r.right < tRect.left - r.width || r.left > tRect.right + r.width) continue;
      var p = (r.left + r.width / 2 - tc) / r.width;      /* 0 = al centro */
      var max = r.width * 0.1;                            /* margine disponibile */
      var x = Math.max(-max, Math.min(max, -p * max));
      slides[s].firstElementChild.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }

  track.addEventListener('scroll', onScroll, { passive: true });
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    /* la barra del browser su mobile cambia solo l'altezza durante lo scroll: non e' un vero resize */
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    build();
  });
  window.addEventListener('load', build);
  build();
})();
