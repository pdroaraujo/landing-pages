document.addEventListener('DOMContentLoaded', () => {
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for scroll animations
    const revealElements = document.querySelectorAll('.reveal-up');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, revealOptions);
    
    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Number Counter Animation
    const yearsStat = document.getElementById('years-stat');
    if (yearsStat) {
        let countStarted = false;
        let timer = null;
        let timeoutId = null;
        const targetNumber = parseInt(yearsStat.getAttribute('data-target'), 10);
        
        const countObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !countStarted) {
                countStarted = true;
                
                // Aguarda a animação do CSS (reveal-up) para começar a contar
                timeoutId = setTimeout(() => {
                    let current = 0;
                    const duration = 800; // 0.8 seconds (mais rápido)
                    const stepTime = Math.abs(Math.floor(duration / targetNumber));
                    
                    timer = setInterval(() => {
                        current += 1;
                        yearsStat.textContent = '+' + current;
                        if (current >= targetNumber) {
                            clearInterval(timer);
                        }
                    }, stepTime);
                }, 400); // 400ms delay
            } else if (!entry.isIntersecting) {
                countStarted = false;
                clearInterval(timer);
                clearTimeout(timeoutId);
                yearsStat.textContent = '+0';
            }
        }, { threshold: 0.5 });
        
        countObserver.observe(yearsStat);
    }

    // Marquee scroll is handled entirely by CSS now.

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('open');
            mobileMenuBtn.classList.toggle('active');
        });

        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
});
