/* Wordmark: il testo riempie esattamente la larghezza disponibile
   (finestra meno il padding sinistro e destro, che resta costante).
   Si misura il testo reale perché il carattere si allarga in modo diverso
   da browser a browser (per esempio su iOS), quindi un rapporto fisso nel CSS non basta. */
(function () {
  function fit() {
    document.querySelectorAll('.wordmark-text').forEach(function (el) {
      var box = el.parentElement;
      var cs = getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(avail > 0)) return;

      var probe = 100;
      el.style.display = 'inline-block';
      el.style.fontSize = probe + 'px';
      var w = el.getBoundingClientRect().width;
      el.style.display = '';
      if (w > 0) el.style.fontSize = (probe * avail / w) + 'px';
    });
  }

  function init() {
    fit();
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(fit);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fit);
    }
    window.addEventListener('load', fit);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
