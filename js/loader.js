/**
 * Component Loader
 * Loads HTML components into placeholders and initializes UI
 */

async function loadComponent(id, path) {
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

async function initApp() {
    // Load all components in parallel
    await Promise.all([
        loadComponent('cursor-placeholder', 'components/cursor.html'),
        loadComponent('menu-placeholder', 'components/menu.html'),
        loadComponent('nav-placeholder', 'components/nav.html'),
        loadComponent('footer-placeholder', 'components/footer.html'),
        loadComponent('scroll-top-placeholder', 'components/scroll-top.html'),
        loadComponent('search-ui-placeholder', 'components/search-ui.html')
    ]);

    // Initialize UI logic after components are loaded
    if (typeof initUI === 'function') {
        initUI();
    }
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
