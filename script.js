// ===========================
// Google Form Configuration
// ===========================

const GOOGLE_FORM_CONFIG = {
    // フォームのAction URL
    formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScXMIIKCc7n-oQCM5m-4D0bFX4xjoECj7xmQaubg9KjJ9bdPA/formResponse',

    // 各項目のEntry ID
    entryIds: {
        name: 'entry.559352220',           // お名前
        reception: 'entry.877086558',       // 披露宴（出欠）
        party: 'entry.816037791',           // 二次会（出欠）
        allergy: 'entry.1597978308',        // アレルギー
        address: 'entry.998262904'          // お住まい（住所）
    }
};

// ===========================
// Smooth Scroll Navigation & Cinematic FX
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Floating Particles Generation
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positions and animations
            const size = Math.random() * 5 + 2 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            const duration = Math.random() * 20 + 10 + 's';
            const delay = Math.random() * 10 + 's';
            particle.style.animation = `float ${duration} ease-in-out ${delay} infinite`;
            particle.style.opacity = Math.random() * 0.4 + 0.1;
            
            particlesContainer.appendChild(particle);
        }
    }

    // Hero Image Carousel - Auto slideshow every 3 seconds
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    // Start slideshow if slides exist
    if (slides.length > 0) {
        setInterval(showNextSlide, 3000); // Change slide every 3 seconds
    }

    // Navigation link smooth scroll
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

    // Header background on scroll
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Cinematic Reveals
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements for reveal animation
    const revealElements = document.querySelectorAll('.section-title, .section-subtitle, .message-text, .couple-card, .info-card, .rsvp-intro, .form-group');
    revealElements.forEach((el) => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });
});


// ===========================
// RSVP Form Submission
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvpForm');
    const thankYouMessage = document.getElementById('thankYou');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(rsvpForm);
            const name = formData.get('name');
            const reception = formData.get('reception');
            const party = formData.get('party');
            const allergy = formData.get('allergy') || '';
            const address = formData.get('address') || '';

            // Validate required fields
            if (!name || !reception || !party) {
                alert('お名前と出欠のご回答は必須項目です。');
                return;
            }

            // Prepare data for Google Form
            const googleFormData = new FormData();
            googleFormData.append(GOOGLE_FORM_CONFIG.entryIds.name, name);
            googleFormData.append(GOOGLE_FORM_CONFIG.entryIds.reception, reception);
            googleFormData.append(GOOGLE_FORM_CONFIG.entryIds.party, party);
            googleFormData.append(GOOGLE_FORM_CONFIG.entryIds.allergy, allergy);
            googleFormData.append(GOOGLE_FORM_CONFIG.entryIds.address, address);

            try {
                // Submit to Google Form
                await fetch(GOOGLE_FORM_CONFIG.formActionUrl, {
                    method: 'POST',
                    body: googleFormData,
                    mode: 'no-cors'
                });

                // Hide form and show thank you message
                rsvpForm.style.display = 'none';
                thankYouMessage.style.display = 'block';

                // Scroll to thank you message
                thankYouMessage.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

            } catch (error) {
                console.error('Error submitting form:', error);
                alert('送信中にエラーが発生しました。しばらくしてから再度お試しください。');
            }
        });
    }
});
