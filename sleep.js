/* Schermo di riposo: dopo 15 s senza attività il sito si copre di rosa
   (modalità "schiarisci") con la scritta "Zzz...".
   Un tocco, un movimento del mouse, un tasto o lo scroll lo fanno sparire. */
(function () {
  var IDLE_MS = 15000;      // 15 secondi
  var GRACE_MS = 600;       // dopo l'apparizione ignora eventi spuri
  var SWALLOW_MS = 400;     // dopo il risveglio il primo tocco non deve cliccare sotto
  
  var bg, box, idleTimer, hideTimer, asleep = false, shownAt = 0, built = false;

  function build() {
    if (built) return;
    built = true;

    bg = document.createElement('div');
    bg.className = 'sleep-bg';
    bg.setAttribute('aria-hidden', 'true');

    box = document.createElement('div');
    box.className = 'sleep-box';
    box.setAttribute('aria-hidden', 'true');

    var text = document.createElement('p');
    text.className = 'sleep-text';
    text.textContent = 'Zzz...';

    box.appendChild(text);
    document.body.appendChild(bg);
    document.body.appendChild(box);
  }

  function sleep() {
    build();
    clearTimeout(hideTimer);
    asleep = true;
    shownAt = Date.now();
    // due frame: prima il browser registra lo stato iniziale, poi parte la transizione
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bg.classList.add('is-on');
        box.classList.add('is-on', 'is-active');
      });
    });
  }

  function wake() {
    asleep = false;
    bg.classList.remove('is-on');
    box.classList.remove('is-on');
    // il box resta a schermo intero ancora un attimo per assorbire il tocco
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      if (asleep) return;
      box.classList.remove('is-active');
    }, SWALLOW_MS);
  }

  function arm() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(sleep, IDLE_MS);
  }

  function onActivity(e) {
    // lo scroll interno (es. il carosello che avanza da solo) non e' attivita' dell'utente
    if (e && e.type === 'scroll' && e.target !== document) return;
    if (asleep) {
      if (Date.now() - shownAt < GRACE_MS) return;
      // il tocco serve solo a svegliare lo schermo
      if (e && e.cancelable && e.type !== 'scroll' && e.type !== 'mousemove') e.preventDefault();
      wake();
    }
    arm();
  }

  ['mousemove', 'mousedown', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']
    .forEach(function (t) {
      window.addEventListener(t, onActivity, { passive: false, capture: true });
    });

  // un click che arriva mentre il box assorbe i tocchi non deve toccare la pagina
  window.addEventListener('click', function (e) {
    if (box && box.classList.contains('is-active') && !asleep) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  arm();
})();
