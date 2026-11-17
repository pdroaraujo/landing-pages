(function () {
  // === Google Analytics 4 ===
  // 1. Crie a propriedade em analytics.google.com e cole o Measurement ID abaixo.
  // 2. No GA4 > Administrador > Eventos, marque como CONVERSÃO os eventos:
  //    'contato_whatsapp', 'contato_telefone', 'clique_avaliacao'.
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  var CONSENT_KEY = 'cookie_consent';
  var PRIVACY_URL = '/politica-de-privacidade/';

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function trackEvent(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function wireConversionTracking() {
    var map = [
      ['a[href*="wa.me"], a[href*="api.whatsapp.com"]', 'contato_whatsapp', 'whatsapp'],
      ['a[href^="tel:"]', 'contato_telefone', 'telefone'],
      ['a[data-track="avaliar"]', 'clique_avaliacao', 'google']
    ];
    map.forEach(function (row) {
      document.querySelectorAll(row[0]).forEach(function (el) {
        el.addEventListener('click', function () {
          trackEvent(row[1], { metodo: row[2], destino: el.getAttribute('href') || '' });
        });
      });
    });
  }

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<span class="cookie-banner__text">Usamos cookies para melhorar sua experiência e para fins de análise. Ao continuar navegando, você concorda com nossa <a href="' + PRIVACY_URL + '">Política de Privacidade</a>.</span>' +
      '<span class="cookie-banner__actions">' +
      '<button type="button" id="cookie-consent-accept" class="cookie-banner__accept">Aceitar</button>' +
      '<button type="button" id="cookie-consent-decline" class="cookie-banner__decline">Recusar</button>' +
      '</span>';
    document.body.appendChild(banner);

    document.getElementById('cookie-consent-accept').addEventListener('click', function () {
      safeSet(CONSENT_KEY, 'accepted');
      banner.remove();
      loadAnalytics();
    });
    document.getElementById('cookie-consent-decline').addEventListener('click', function () {
      safeSet(CONSENT_KEY, 'declined');
      banner.remove();
    });
  }

  function init() {
    wireConversionTracking();
    var consent = safeGet(CONSENT_KEY);
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent !== 'declined') {
      showBanner();
    }
  }

  // O Next carrega este script depois do DOMContentLoaded; roda na hora se já passou.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
