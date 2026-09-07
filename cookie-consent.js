/* ===========================
   HANAMI PRESS — Cookie Consent
   =========================== */

(function () {
  const CONSENT_KEY = 'hanami_cookie_consent';

  function getConsent() {
    return localStorage.getItem(CONSENT_KEY);
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    hideBanner();
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.remove('is-visible');
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <p class="cookie-banner-text">
        Usiamo cookie tecnici necessari al funzionamento del sito e cookie di servizi esterni (Stripe, PayPal, Google Fonts) per offrirti un'esperienza migliore.
        Consulta la <a href="/cookie-policy.html">Cookie Policy</a> per saperne di più.
      </p>
      <div class="cookie-banner-actions">
        <button id="cookie-decline" class="cookie-banner-btn cookie-banner-btn--outline">Rifiuta</button>
        <button id="cookie-accept" class="cookie-banner-btn cookie-banner-btn--filled">Accetta</button>
      </div>
    `;
    document.body.appendChild(banner);

    requestAnimationFrame(() => banner.classList.add('is-visible'));

    document.getElementById('cookie-accept').addEventListener('click', () => setConsent('accepted'));
    document.getElementById('cookie-decline').addEventListener('click', () => setConsent('declined'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!getConsent()) {
      createBanner();
    }
  });
})();
