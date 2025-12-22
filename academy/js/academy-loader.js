/**
 * Academy Component Loader & UI Logic
 */

async function loadAcademyComponent(id, path) {
    const element = document.getElementById(id);
    if (!element) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const html = await response.text();
        element.outerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

async function initAcademy() {
    // Get current page name from URL
    const path = window.location.pathname;
    const page = path.split("/").pop().split(".")[0] || 'index';

    // Load all components
    await Promise.all([
        loadAcademyComponent('mobile-header-placeholder', 'components/mobile-header.html'),
        loadAcademyComponent('mobile-menu-placeholder', 'components/mobile-menu.html'),
        loadAcademyComponent('sidebar-left-placeholder', 'components/sidebar-left.html'),
        loadAcademyComponent('sidebar-right-placeholder', 'components/sidebar-right.html'),
        loadAcademyComponent('footer-placeholder', 'components/footer.html')
    ]);

    // Initialize UI Logic
    initMobileMenu();
    initRevealAnimation();
    setActiveNavLink(page);
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });
    }

    if (closeMobileMenu && mobileMenu) {
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });
    }

    // Close menu on link click
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
            });
        });
    }
}

function initRevealAnimation() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function setActiveNavLink(page) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
            item.classList.remove('text-gray-500', 'text-gray-600');
            item.classList.add('font-bold', 'text-blue-600');
        } else {
            item.classList.remove('active', 'font-bold', 'text-blue-600');
        }
    });
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', initAcademy);
