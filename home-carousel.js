/* Carosello home: pallini + parallasse.
   L'immagine si muove un po' meno della cornice mentre si scorre. */
(function () {
  var track = document.querySelector('.hc-track');
  var bar = document.querySelector('.hc-dots');
  if (!track || !bar) return;

  var slides = track.querySelectorAll('.hc-slide');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;

  function slideW() { return slides[0].getBoundingClientRect().width; }

  function build() {
    var perView = Math.max(1, Math.round(track.clientWidth / slideW()));
    var n = Math.max(1, slides.length - perView + 1);
    bar.innerHTML = '';
    bar.style.display = n <= 1 ? 'none' : 'flex';
    for (var i = 0; i < n; i++) {
      (function (i) {
        var d = document.createElement('button');
        d.className = 'hc-dot';
        d.setAttribute('aria-label', 'Vai alla foto ' + (i + 1));
        d.addEventListener('click', function () {
          track.scrollTo({ left: i * slideW(), behavior: 'smooth' });
        });
        bar.appendChild(d);
      })(i);
    }
    update();
  }

  function update() {
    ticking = false;
    var w = slideW();
    var i = Math.round(track.scrollLeft / w);
    for (var k = 0; k < bar.children.length; k++) {
      bar.children[k].classList.toggle('is-active', k === i);
    }
    if (reduce) return;
    var tRect = track.getBoundingClientRect();
    var tc = tRect.left + tRect.width / 2;
    for (var s = 0; s < slides.length; s++) {
      var r = slides[s].getBoundingClientRect();
      var p = (r.left + r.width / 2 - tc) / r.width;      /* 0 = al centro */
      var max = r.width * 0.1;                            /* margine disponibile */
      var x = Math.max(-max, Math.min(max, -p * max));
      slides[s].firstElementChild.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  build();
})();
