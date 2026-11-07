/* Card "Potrebbe piacerti": su mobile e iPad scorrono in orizzontale.
   I pallini della barra indicano a quale "pagina" di card si è arrivati. */
(function () {
  var grid = document.querySelector('.pp-related .products-grid');
  var bar = document.querySelector('.pp-related-dots');
  if (!grid || !bar) return;

  function pages() {
    return Math.max(1, Math.round(grid.scrollWidth / grid.clientWidth));
  }

  function build() {
    var n = pages();
    bar.innerHTML = '';
    for (var i = 0; i < n; i++) {
      var d = document.createElement('span');
      d.className = 'pp-related-dot';
      bar.appendChild(d);
    }
    update();
  }

  function update() {
    var i = Math.round(grid.scrollLeft / grid.clientWidth);
    var dots = bar.children;
    for (var k = 0; k < dots.length; k++) dots[k].classList.toggle('is-active', k === i);
  }

  grid.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', build);
  window.addEventListener('load', build);
  build();
})();
