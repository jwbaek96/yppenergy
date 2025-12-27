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
    const menuLinks = document.querySelectorAll('.menu-link, .menu-link-grid');

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

    // Search Modal Logic
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

    // Load Fuse.js and Search Data
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
            const response = await fetch('data/search-index.json');
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
            // Show default quick links if query is empty
            renderResults(searchData.slice(0, 3), true);
            return;
        }

        const results = fuse.search(query);
        renderResults(results.map(r => r.item), false);
    };

    const renderResults = (items, isDefault) => {
        searchResultsContainer.innerHTML = '';
        
        if (items.length === 0) {
            noResults.classList.remove('hidden');
            searchResultsInfo.classList.add('hidden');
            return;
        }

        noResults.classList.add('hidden');
        searchResultsInfo.classList.remove('hidden');
        searchResultsInfo.innerHTML = `<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">${isDefault ? 'Quick Links' : `Search Results (${items.length})`}</span>`;

        items.forEach(item => {
            const icon = getCategoryIcon(item.category);
            const resultItem = document.createElement('a');
            resultItem.href = item.url;
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

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scroll-to-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            } else {
                scrollTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
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
