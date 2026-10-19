(function () {
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // substitua pelo Measurement ID do Google Analytics (GA4)
  var CONSENT_KEY = 'cookie_consent';
  var PRIVACY_URL = '/politica-de-privacidade.html';

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
    banner.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0f0f0f;color:#fff;padding:16px 20px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;font-family:"Plus Jakarta Sans",sans-serif;font-size:14px;border-top:1px solid rgba(255,255,255,.1);';
    banner.innerHTML =
      '<span style="flex:1;min-width:240px;">Usamos cookies para melhorar sua experiência e para fins de análise. Ao continuar navegando, você concorda com nossa <a href="' + PRIVACY_URL + '" style="color:#fff;text-decoration:underline;">Política de Privacidade</a>.</span>' +
      '<span style="display:flex;gap:8px;">' +
      '<button id="cookie-consent-accept" style="background:#fe0000;color:#fff;border:none;padding:8px 16px;border-radius:999px;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.05em;cursor:pointer;">Aceitar</button>' +
      '<button id="cookie-consent-decline" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);padding:8px 16px;border-radius:999px;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.05em;cursor:pointer;">Recusar</button>' +
      '</span>';
    document.body.appendChild(banner);

    document.getElementById('cookie-consent-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      loadAnalytics();
    });
    document.getElementById('cookie-consent-decline').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'declined');
      banner.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent !== 'declined') {
      showBanner();
    }
  });
})();
