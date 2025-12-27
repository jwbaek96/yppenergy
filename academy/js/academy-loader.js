/**
 * Academy Component Loader & UI Logic
 */

async function loadAcademyComponent(id, path) {
    let element = document.getElementById(id);
    
    // If placeholder doesn't exist, create it and append to body
    if (!element) {
        element = document.createElement('div');
        element.id = id;
        document.body.appendChild(element);
    }

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
        loadAcademyComponent('footer-placeholder', 'components/footer.html'),
        loadAcademyComponent('scroll-top-placeholder', 'components/scroll-top.html'),
        loadAcademyComponent('search-ui-placeholder', 'components/search-ui.html')
    ]);

    // Initialize UI Logic
    initMobileMenu();
    initRevealAnimation();
    setActiveNavLink(page);
    initScrollTop();
    initSearchModal();
}

function initSearchModal() {
    const openSearchBtn = document.getElementById('open-search');
    const closeSearchBtn = document.getElementById('close-search');
    const searchModal = document.getElementById('search-modal');
    const searchBackdrop = document.getElementById('search-backdrop');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.querySelector('#search-modal .grid');
    const searchResultsInfo = document.getElementById('search-results-info');
    const noResults = document.getElementById('no-results');

    let fuse;
    let searchData = [];

    const initSearch = async () => {
        if (typeof Fuse === 'undefined') {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        try {
            const response = await fetch('../data/search-index.json');
            searchData = await response.json();
            
            fuse = new Fuse(searchData, {
                keys: ['title', 'content', 'category'],
                threshold: 0.3,
                includeMatches: true
            });
        } catch (error) {
            console.error('Error loading search data:', error);
        }
    };

    const performSearch = (query) => {
        if (!fuse) return;
        
        if (!query) {
            renderResults(searchData.filter(d => d.category === 'Academy').slice(0, 3), true);
            return;
        }

        const results = fuse.search(query);
        renderResults(results.map(r => r.item), false);
    };

    const renderResults = (items, isDefault) => {
        if (!searchResultsContainer) return;
        searchResultsContainer.innerHTML = '';
        
        if (items.length === 0) {
            noResults.classList.remove('hidden');
            searchResultsInfo.classList.add('hidden');
            return;
        }

        noResults.classList.add('hidden');
        searchResultsInfo.classList.remove('hidden');
        searchResultsInfo.innerHTML = `<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">${isDefault ? 'Academy Quick Links' : `Search Results (${items.length})`}</span>`;

        items.forEach(item => {
            const icon = getCategoryIcon(item.category);
            const resultItem = document.createElement('a');
            // Adjust URL for academy subfolder if it's a main page
            let finalUrl = item.url;
            if (!finalUrl.startsWith('academy/') && !finalUrl.startsWith('../')) {
                finalUrl = '../' + finalUrl;
            } else if (finalUrl.startsWith('academy/')) {
                finalUrl = finalUrl.replace('academy/', '');
            }

            resultItem.href = finalUrl;
            resultItem.className = 'flex items-center justify-between p-4 rounded-2xl hover:bg-blue-50 transition-all group';
            resultItem.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <i class="fa-solid ${icon} text-blue-600"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${item.title}</h4>
                        <p class="text-xs text-gray-500">${item.content}</p>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-gray-300 group-hover:text-blue-600 transition-colors"></i>
            `;
            searchResultsContainer.appendChild(resultItem);
        });
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Academy': return 'fa-graduation-cap';
            case 'Library': return 'fa-book';
            case 'Page': return 'fa-file-lines';
            default: return 'fa-magnifying-glass';
        }
    };

    if (openSearchBtn && searchModal) {
        const openSearch = () => {
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (!fuse) initSearch();
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 300);
        };

        const closeSearch = () => {
            searchModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        openSearchBtn.addEventListener('click', openSearch);
        if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
        if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                performSearch(e.target.value);
            });
        }

        // ESC key to close
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                closeSearch();
            }
        });
    }
}

function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-to-top');
    const mainContent = document.querySelector('main'); // Academy uses <main> for scrolling
    
    if (scrollTopBtn && mainContent) {
        mainContent.addEventListener('scroll', () => {
            if (mainContent.scrollTop > 300) {
                scrollTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            } else {
                scrollTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
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
