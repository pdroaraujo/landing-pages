document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Promo banner marquee dynamic duration
  const promoBanner = document.getElementById('promo-banner');
  if (promoBanner) {
    promoBanner.style.setProperty('--promo-marquee-duration', '20s');
  }

  // 2. WhatsApp Community Button Click Handling
  const whatsappBtn = document.querySelector('.newsletter-action .btn-primary');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (event) => {
      event.preventDefault();
      alert('Você está sendo redirecionado para o grupo oficial da Lótus no WhatsApp!');
    });
  }

  // 3. Smooth scroll for anchor links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});
