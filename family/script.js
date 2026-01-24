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

/**
 * Main Initialization Function
 * Executed via multiple triggers to ensure it runs exactly once.
 */
let isInitialized = false;

function initializeApp() {
    if (isInitialized) return;
    isInitialized = true;
    console.log("Wedding Invitation App (Family): Initializing...");

    // 1. Initialize Particles
    try {
        initParticles();
    } catch (e) {
        console.error("Particle System Error:", e);
    }

    // 2. Initialize Hero Slideshow
    try {
        initSlideshow();
    } catch (e) {
        console.error("Slideshow Error:", e);
    }

    // 3. Initialize Scroll Functions
    try {
        initScrollFeatures();
    } catch (e) {
        console.error("Scroll Features Error:", e);
    }

    // 4. Initialize Scroll Reveal Animations
    try {
        initScrollReveal();
    } catch (e) {
        document.querySelectorAll('.reveal-text').forEach(el => el.style.opacity = '1');
        console.error("Scroll Reveal Error:", e);
    }

    // 5. Initialize Form
    try {
        initForm();
    } catch (e) {
        console.error("Form Initialization Error:", e);
    }
}

// ===========================
// Feature Implementations
// ===========================

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    container.innerHTML = '';
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';

        const size = Math.random() * 8 + 4 + 'px';
        particle.style.width = size;
        particle.style.height = size;

        if (Math.random() > 0.4) {
            particle.style.borderRadius = '50% 0 50% 0';
            particle.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
        } else {
            particle.style.borderRadius = '50%';
        }

        if (Math.random() > 0.5) {
            particle.style.background = '#e6d370';
            particle.style.opacity = Math.random() * 0.4 + 0.1;
        } else {
            particle.style.background = '#fddde6';
            particle.style.opacity = Math.random() * 0.5 + 0.2;
        }

        const duration = Math.random() * 10 + 10 + 's';
        const delay = Math.random() * 15 + 's';
        particle.style.animation = 'sakuraFall ' + duration + ' linear ' + delay + ' infinite';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * -20 + '%';

        container.appendChild(particle);
    }
}

function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    slides.forEach((slide, index) => {
        if (index === 0) slide.classList.add('active');
        else slide.classList.remove('active');
    });

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 6000);
}

function initScrollFeatures() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-text').forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.section-title, .section-subtitle, .message-text, .couple-card, .info-card, .rsvp-intro, .form-group').forEach((el) => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });
}

function initForm() {
    const rsvpForm = document.getElementById('rsvpForm');
    const thankYouMessage = document.getElementById('thankYou');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(rsvpForm);

            // Validation: Changed for Family - name, reception, and address required
            if (!formData.get('name') || !formData.get('reception') || !formData.get('address')) {
                alert('お名前、出欠、ご住所は必須項目です。');
                return;
            }

            const googleFormData = new FormData();
            const entries = GOOGLE_FORM_CONFIG.entryIds;

            googleFormData.append(entries.name, formData.get('name'));
            googleFormData.append(entries.reception, formData.get('reception'));
            
            // Family Version Specific: Automatically set Party to '欠席' (Absent)
            googleFormData.append(entries.party, '欠席');
            
            googleFormData.append(entries.allergy, formData.get('allergy') || '');
            googleFormData.append(entries.address, formData.get('address') || '');

            try {
                await fetch(GOOGLE_FORM_CONFIG.formActionUrl, {
                    method: 'POST',
                    body: googleFormData,
                    mode: 'no-cors'
                });

                rsvpForm.style.display = 'none';
                if (thankYouMessage) {
                    thankYouMessage.style.display = 'block';
                    thankYouMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            } catch (error) {
                console.error('Form Submit Error:', error);
                alert('送信エラーが発生しました。');
            }
        });
    }
}

// ===========================
// Triggers
// ===========================

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializeApp();
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('load', initializeApp);
