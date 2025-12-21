// UI Initialization Function
function initUI() {
    // Cursor Follow Logic
    const cursor = document.getElementById('cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    }

    // Menu Logic
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('menu-overlay');
    const bgCircle = document.getElementById('menu-bg-circle');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (openBtn && overlay && bgCircle) {
        openBtn.addEventListener('click', (e) => {
            const rect = openBtn.getBoundingClientRect();
            bgCircle.style.left = (rect.left + rect.width / 2) + 'px';
            bgCircle.style.top = (rect.top + rect.height / 2) + 'px';
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMenu = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);
        menuLinks.forEach(link => link.addEventListener('click', closeMenu));
    }

    // Horizontal Scroll
    const hs = document.getElementById('horizontal-scroll');
    const sb = document.getElementById('scroll-bar');
    if(hs) {
        hs.addEventListener('scroll', () => {
            const max = hs.scrollWidth - hs.clientWidth;
            if(max > 0) sb.style.width = ((hs.scrollLeft / max) * 100) + '%';
        });

        // Drag to scroll functionality
        let isDown = false;
        let startX;
        let scrollLeft;

        hs.addEventListener('mousedown', (e) => {
            isDown = true;
            hs.style.cursor = 'grabbing';
            startX = e.pageX - hs.offsetLeft;
            scrollLeft = hs.scrollLeft;
        });

        hs.addEventListener('mouseleave', () => {
            isDown = false;
            hs.style.cursor = 'grab';
        });

        hs.addEventListener('mouseup', () => {
            isDown = false;
            hs.style.cursor = 'grab';
        });

        hs.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - hs.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            hs.scrollLeft = scrollLeft - walk;
        });
    }

    // Reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Hover Effect on Cursor
    const hoverables = document.querySelectorAll('a, button, .menu-item, .solution-grid-item');
    hoverables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hover-active');
        });
        item.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hover-active');
        });
    });
}

// Run init if components are already there (for direct page loads if not using loader)
document.addEventListener('DOMContentLoaded', initUI);

// Language Switch Logic (Global)
function toggleLang(lang) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if(btn.textContent === lang) {
            btn.classList.add('active'); 
            btn.classList.remove('inactive');
        } else {
            btn.classList.remove('active');
            btn.classList.add('inactive');
        }
    });
    console.log("Language switched to:", lang);
}
