/* ===========================
   Photo Library - JavaScript
   Password authentication, lightbox, lazy loading, particles
   =========================== */

// ── 【重要】Google Apps ScriptのWebアプリURL ──
// TODO: 発行したご自身のGAS Web API URLを以下に貼り付けてください
const GAS_APP_URL = "https://script.google.com/macros/s/AKfycbwWJuImD7iDXG7_ruSZsCnRIb5pSVxYTbU4ix1-iI37jc-JvOFh-rOFomKBDE3mtGoS_A/exec";



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
        // [01 涼]の既存分と追加分
        'hatsukari': 'kawagoe.html',
        'gatecity': 'junior.html',
        'darkness': 'highschool.html',
        'kondo': 'university.html',
        'niji': 'niji.html',
        'taisou daisuki': 'company.html',
        'ryobirth': 'ryo-birth.html',
        'ryolast': 'ryo-last.html',
        
        // [02 美洋] パスワード変更対応
        'kawaii': 'mihiro-child.html',
        'akb48': 'mihiro-junior.html',
        'hotcake': 'mihiro-highschool.html',
        'variety': 'mihiro-univ.html',
        'gorigori': 'mihiro-king.html',
        'atami': 'mihiro-purin.html',
        'duck': 'mihiro-aflac.html',
        'mihiroextra': 'mihiro-extra.html',
        
        // 新規作成
        'ryo&mihiro': 'ryoandmihiro.html'
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
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    // もしページがGoogle Driveからの動的読み込み用 (data-albumあり) なら
    const albumName = grid.dataset.album;
    if (albumName) {
        fetchDynamicGallery(grid, albumName);
    } else {
        // 既存の静的ギャラリー動作（念のため残す）
        setupStaticGalleryItems(grid);
    }
}

function fetchDynamicGallery(grid, albumName) {
    if (GAS_APP_URL === "YOUR_GAS_WEB_APP_URL") {
        grid.innerHTML = '<div class="error-message">Error: GAS_APP_URLが設定されていません。<br>photo-script.js を開いて正しいURLを入力してください。</div>';
        return;
    }

    const url = `${GAS_APP_URL}?folderName=${encodeURIComponent(albumName)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            if (data.length === 0) {
                grid.innerHTML = '<div class="error-message">写真が見つかりません。</div>';
                return;
            }

            // HTML生成
            let html = '';
            data.forEach((item, index) => {
                // サムネイル用は短辺クロップなど最適化された thumbnail API を使用 (安定して高速)
                const thumbnailUrl = `https://drive.google.com/thumbnail?id=${item.id}&sz=w800`;
                // Lightbox拡大用は lh3 形式か元画像を指定
                const fullUrl = `https://lh3.googleusercontent.com/d/${item.id}`;
                
                // 動的ロード時はLazy Loadingを使わず直接 src を指定し、visible クラスとディレイ付与
                const delay = index * 30; // 順番にフェードイン

                if (item.type === 'video') {
                    html += `
                    <div class="gallery-item is-video visible" style="transition-delay: ${delay}ms" data-id="${item.id}" data-type="video" data-mime="${item.mimeType}" data-src="${item.src}">
                        <div class="item-overlay"></div>
                        <div class="video-indicator"></div>
                        <img src="${thumbnailUrl}" alt="${item.name}">
                    </div>`;
                } else {
                    html += `
                    <div class="gallery-item visible" style="transition-delay: ${delay}ms" data-id="${item.id}" data-type="image" data-src="${fullUrl}">
                        <div class="item-overlay"></div>
                        <img src="${thumbnailUrl}" alt="${item.name}">
                    </div>`;
                }
            });

            grid.innerHTML = html;
            
            // Generate count
            const countEl = document.querySelector('.gallery-count');
            if (countEl) countEl.textContent = `${data.length} photos`;

            setupStaticGalleryItems(grid);
        })
        .catch(err => {
            console.error(err);
            grid.innerHTML = `<div class="error-message">Failed to load gallery: ${err.message}</div>`;
        });
}

function setupStaticGalleryItems(grid) {
    const items = grid.querySelectorAll('.gallery-item');
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
    
    // Lightboxの再初期化
    initLightbox();
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

    // Collect all media sources dynamically
    const mediaSources = [];
    items.forEach((item, idx) => {
        // The item could be static (has img/video) or dynamic (has data-type/data-src)
        if (item.dataset.type) {
            mediaSources.push({
                type: item.dataset.type,
                src: item.dataset.src,
                id: item.dataset.id,
                mime: item.dataset.mime,
                index: idx
            });
        } else {
            // Fallback for purely static HTML elements
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
        }
    });

    // Remove existing listeners to avoid duplicates if re-initialized
    const newItems = [];
    items.forEach(item => {
        const clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
        newItems.push(clone);
    });

    // Open lightbox
    newItems.forEach((item, idx) => {
        item.addEventListener('click', () => {
            currentIndex = idx;
            showMedia(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Reset lightbox event listeners cleanly
    const safeNext = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % mediaSources.length;
        showMedia(currentIndex);
    };
    const safePrev = (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + mediaSources.length) % mediaSources.length;
        showMedia(currentIndex);
    };

    lightboxNext.onclick = safeNext;
    lightboxPrev.onclick = safePrev;
    lightboxClose.onclick = closeLightbox;
    lightbox.onclick = (e) => {
        if (e.target === lightbox) closeLightbox();
    };

    // Keyboard navigation
    document.onkeydown = (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') safePrev(e);
        if (e.key === 'ArrowRight') safeNext(e);
    };

    // Touch swipe support (simplified for rebinds)
    let touchStartX = 0;
    lightbox.ontouchstart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
    };

    lightbox.ontouchend = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) safeNext(e);
            else safePrev(e);
        }
    };

    function showMedia(idx) {
        if (mediaSources.length === 0) return;
        const media = mediaSources[idx];
        lightboxContent.innerHTML = '';

        if (media.type === 'video') {
            // For Google Drive videos
            if (media.id && media.src.includes('drive.google.com')) {
                // To play Google Drive videos, embedding the preview iframe is most reliable
                const iframe = document.createElement('iframe');
                iframe.src = `https://drive.google.com/file/d/${media.id}/preview`;
                iframe.style.width = '80vw';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                lightboxContent.appendChild(iframe);
            } else {
                const video = document.createElement('video');
                video.controls = true;
                video.autoplay = true;
                video.style.maxWidth = '90vw';
                video.style.maxHeight = '85vh';
                const source = document.createElement('source');
                source.src = media.src;
                source.type = media.mime || getVideoMimeType(media.src);
                video.appendChild(source);
                lightboxContent.appendChild(video);
            }
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

