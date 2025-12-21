/**
 * Component Loader
 * Loads HTML components into placeholders and initializes UI
 */

async function loadComponent(id, path) {
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

async function initApp() {
    // Load all components in parallel
    await Promise.all([
        loadComponent('cursor-placeholder', 'components/cursor.html'),
        loadComponent('menu-placeholder', 'components/menu.html'),
        loadComponent('nav-placeholder', 'components/nav.html'),
        loadComponent('footer-placeholder', 'components/footer.html')
    ]);

    // Initialize UI logic after components are loaded
    if (typeof initUI === 'function') {
        initUI();
    }
}

// Start loading when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
