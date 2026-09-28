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
});
