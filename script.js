// ===========================
// Google Form Configuration
// ===========================
const GOOGLE_FORM_CONFIG = {
    formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScXMIIKCc7n-oQCM5m-4D0bFX4xjoECj7xmQaubg9KjJ9bdPA/formResponse',
    entryIds: {
        name: 'entry.559352220',
        reception: 'entry.877086558',
        party: 'entry.816037791',
        allergy: 'entry.1597978308',
        address: 'entry.998262904'
    }
};

// ===========================
// Particle Effects System (Sakura Theme)
// ===========================
class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        if (!this.container) return;
        this.initParticles();
    }
    initParticles() {
        this.container.innerHTML = '';
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
    }
    createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        const size = Math.random() * 8 + 4 + 'px';
        particle.style.width = size;
        particle.style.height = size;
        if (Math.random() > 0.4) {
            particle.style.borderRadius = '50% 0 50% 0';
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        } else {
            particle.style.borderRadius = '50%';
        }
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * -20 + '%';
        if (Math.random() > 0.5) {
            particle.style.background = '#e6d370';
            particle.style.opacity = Math.random() * 0.4 + 0.1;
        } else {
            particle.style.background = '#fddde6';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
        }
        const duration = Math.random() * 10 + 10 + 's';
        const delay = Math.random() * 15 + 's';
        particle.style.animation = `sakuraFall ${duration} linear ${delay} infinite`;
        this.container.appendChild(particle);
    }
}

// ===========================
// Initialize on page load
// ===========================
(function init() {
    new ParticleSystem();
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    if (slides.length > 0) {
        setInterval(showNextSlide, 6000);
    }
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    const revealElements = document.querySelectorAll('.section-title, .section-subtitle, .message-text, .couple-card, .info-card, .rsvp-intro, .form-group');
    revealElements.forEach((el) => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });
})();

// ===========================
// RSVP Form Submission
// ===========================
(function initForm() {
    const rsvpForm = document.getElementById('rsvpForm');
    const thankYouMessage = document.getElementById('thankYou');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(rsvpForm);
            const googleFormData = new FormData();
            const entries = GOOGLE_FORM_CONFIG.entryIds;
            googleFormData.append(entries.name, formData.get('name'));
            googleFormData.append(entries.reception, formData.get('reception'));
            googleFormData.append(entries.party, formData.get('party'));
            googleFormData.append(entries.allergy, formData.get('allergy') || '');
            googleFormData.append(entries.address, formData.get('address') || '');

            if (!formData.get('name') || !formData.get('reception') || !formData.get('party')) {
                alert('お名前と出欠のご回答は必須項目です。');
                return;
            }

            try {
                await fetch(GOOGLE_FORM_CONFIG.formActionUrl, {
                    method: 'POST',
                    body: googleFormData,
                    mode: 'no-cors'
                });
                rsvpForm.style.display = 'none';
                thankYouMessage.style.display = 'block';
                thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (error) {
                console.error('Error:', error);
                alert('送信エラーが発生しました。');
            }
        });
    }
})();
