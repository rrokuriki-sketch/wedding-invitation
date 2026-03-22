/* ===========================
   Photo Library - JavaScript
   Password authentication, lightbox, lazy loading, particles
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
    // Page fade-in
    const pageWrapper = document.querySelector('.page-wrapper');
    if (pageWrapper) {
        requestAnimationFrame(() => {
            pageWrapper.classList.add('visible');
        });
    }

    // Initialize components
    initParticles();
    initPasswordForm();
    initGallery();
    initLightbox();
});

/* ===========================
   Password Authentication
   =========================== */

function initPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (!form) return;

    const input = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('passwordError');

    /* パスワードと遷移先のマッピング
       ── カスタマイズ箇所 ── 
       新しいページを追加する場合、ここにエントリを追加してください */
    const passwordMap = {
        'hatsukari': 'kawagoe.html',
        'gatecity': 'junior.html',
        'darkness': 'highschool.html',
        'kondo': 'university.html',    // 大文字小文字を区別しない
        'niji': 'niji.html',
        'taisou daisuki': 'company.html'
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = input.value.trim().toLowerCase();

        if (passwordMap[password]) {
            // Fade out then navigate
            document.querySelector('.page-wrapper').style.opacity = '0';
            setTimeout(() => {
                window.location.href = passwordMap[password];
            }, 600);
        } else {
            // Error shake animation
            input.classList.add('shake');
            errorMsg.classList.add('visible');
            setTimeout(() => {
                input.classList.remove('shake');
            }, 600);
            setTimeout(() => {
                errorMsg.classList.remove('visible');
            }, 3000);
        }
    });
}

/* ===========================
   Gallery - Lazy Loading & Scroll Animation
   =========================== */

function initGallery() {
    const items = document.querySelectorAll('.gallery-item');
    if (items.length === 0) return;

    // Intersection Observer for lazy loading and animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const item = entry.target;
                
                // Staggered animation
                setTimeout(() => {
                    item.classList.add('visible');
                }, index * 30);

                // Lazy load images
                const img = item.querySelector('img[data-src]');
                if (img) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                // Lazy load video posters
                const video = item.querySelector('video[data-poster]');
                if (video) {
                    video.poster = video.dataset.poster;
                    video.removeAttribute('data-poster');
                }

                observer.unobserve(item);
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1
    });

    items.forEach(item => observer.observe(item));

    // Update gallery count
    const countEl = document.querySelector('.gallery-count');
    if (countEl) {
        countEl.textContent = `${items.length} photos`;
    }
}

/* ===========================
   Lightbox
   =========================== */

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxContent = lightbox.querySelector('.lightbox-content');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');

    const items = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;

    // Collect all media sources
    const mediaSources = [];
    items.forEach((item, idx) => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        if (video) {
            const source = video.querySelector('source');
            mediaSources.push({
                type: 'video',
                src: source ? source.src : video.src,
                index: idx
            });
        } else if (img) {
            mediaSources.push({
                type: 'image',
                src: img.dataset.src || img.src,
                index: idx
            });
        }
    });

    // Open lightbox
    items.forEach((item, idx) => {
        item.addEventListener('click', () => {
            currentIndex = idx;
            showMedia(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Navigation
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + mediaSources.length) % mediaSources.length;
        showMedia(currentIndex);
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % mediaSources.length;
        showMedia(currentIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + mediaSources.length) % mediaSources.length;
            showMedia(currentIndex);
        }
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % mediaSources.length;
            showMedia(currentIndex);
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                currentIndex = (currentIndex + 1) % mediaSources.length;
            } else {
                currentIndex = (currentIndex - 1 + mediaSources.length) % mediaSources.length;
            }
            showMedia(currentIndex);
        }
    }, { passive: true });

    function showMedia(idx) {
        const media = mediaSources[idx];
        lightboxContent.innerHTML = '';

        if (media.type === 'video') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.style.maxWidth = '90vw';
            video.style.maxHeight = '85vh';
            const source = document.createElement('source');
            source.src = media.src;
            source.type = getVideoMimeType(media.src);
            video.appendChild(source);
            lightboxContent.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = 'Photo';
            lightboxContent.appendChild(img);
        }

        lightboxCounter.textContent = `${idx + 1} / ${mediaSources.length}`;
    }

    function closeLightbox() {
        // Stop any playing videos
        const video = lightboxContent.querySelector('video');
        if (video) video.pause();
        
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function getVideoMimeType(src) {
        const ext = src.split('.').pop().toLowerCase();
        const mimeTypes = {
            'mp4': 'video/mp4',
            'm4v': 'video/mp4',
            'webm': 'video/webm',
            'ogg': 'video/ogg',
            'mpg': 'video/mpeg',
            'mpeg': 'video/mpeg'
        };
        return mimeTypes[ext] || 'video/mp4';
    }
}

/* ===========================
   Floating Particles (Gold)
   =========================== */

function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 15 + 15;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(230, 211, 112, 0.6), rgba(230, 211, 112, 0));
            border-radius: 50%;
            left: ${left}%;
            top: -5%;
            animation: particleFall ${duration}s linear ${delay}s infinite;
            pointer-events: none;
        `;
        container.appendChild(particle);
    }

    // Add particle fall animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFall {
            0% {
                transform: translateY(-5vh) translateX(0) rotate(0deg);
                opacity: 0;
            }
            5% {
                opacity: 0.8;
            }
            95% {
                opacity: 0.2;
            }
            100% {
                transform: translateY(105vh) translateX(30px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
