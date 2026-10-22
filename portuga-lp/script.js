document.addEventListener('DOMContentLoaded', () => {
  const reviewBar = document.querySelector('.review-bar');
  const dismissBtn = document.querySelector('.review-bar .dismiss');
  if (reviewBar && dismissBtn) {
    try {
      if (sessionStorage.getItem('portuga-review-bar-closed') === '1') reviewBar.hidden = true;
    } catch (e) {}
    dismissBtn.addEventListener('click', () => {
      reviewBar.hidden = true;
      try { sessionStorage.setItem('portuga-review-bar-closed', '1'); } catch (e) {}
    });
  }

  // Pop-up de avaliação: aparece 5s após abrir e volta 1 min depois de cada fechamento,
  // até a pessoa clicar em algum link de avaliação (aí some de vez neste aparelho).
  const pop = document.getElementById('reviewPop');
  if (!pop) return;
  const KEY = 'portuga-avaliou';
  const FIRST = 5000, EVERY = 60000;
  const done = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  let timer;
  const schedule = ms => { clearTimeout(timer); if (!done()) timer = setTimeout(show, ms); };
  function show() {
    if (done()) return;
    if (document.hidden) { schedule(5000); return; } // espera a aba voltar a ficar visível
    pop.hidden = false;
    pop.querySelector('.review-pop__close').focus({ preventScroll: true });
  }
  function close() { pop.hidden = true; schedule(EVERY); }
  function reviewed() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    clearTimeout(timer);
    pop.hidden = true;
  }
  pop.querySelector('.review-pop__close').addEventListener('click', close);
  pop.addEventListener('click', e => { if (e.target === pop) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) close(); });
  document.querySelectorAll('.review-pop__link, .btn-review').forEach(a => a.addEventListener('click', reviewed));
  schedule(FIRST);
});
