class QuickAccess extends HTMLElement {
    constructor() {
        super();
        const icon = this.getAttribute('icon') || 'box';
        const title = this.getAttribute('title') || 'Quick Link';
        const link = this.getAttribute('link') || '#';
        
        this.innerHTML = `
            <a href="${link}" class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-secondary hover:text-white transition-colors group">
                <i data-feather="${icon}" class="w-6 h-6 mb-2 group-hover:text-white"></i>
                <span class="text-sm font-medium group-hover:text-white">${title}</span>
            </a>
        `;
    }

    connectedCallback() {
        feather.replace();
    }
}

customElements.define('quick-access', QuickAccess);