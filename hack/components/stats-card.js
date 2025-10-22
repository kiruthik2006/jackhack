class StatsCard extends HTMLElement {
    constructor() {
        super();
        const icon = this.getAttribute('icon') || 'activity';
        const title = this.getAttribute('title') || 'Title';
        const value = this.getAttribute('value') || '0';
        const trend = this.getAttribute('trend') || '0%';
        const color = this.getAttribute('color') || 'primary';
        
        this.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <div class="p-2 rounded-lg bg-${color} bg-opacity-10">
                        <i data-feather="${icon}" class="w-6 h-6 text-${color}"></i>
                    </div>
                    <span class="text-sm font-medium text-green-500">${trend}</span>
                </div>
                <h3 class="text-gray-500 text-sm font-medium">${title}</h3>
                <p class="text-2xl font-semibold text-gray-900 mt-1">${value}</p>
            </div>
        `;
    }

    connectedCallback() {
        feather.replace();
    }
}

customElements.define('stats-card', StatsCard);