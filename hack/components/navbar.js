class Navbar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <header class="bg-white border-b border-gray-200">
                <div class="flex items-center justify-between h-16 px-6">
                    <div class="flex items-center">
                        <button id="mobile-menu-button" class="md:hidden text-gray-500 hover:text-gray-700">
                            <i data-feather="menu" class="w-6 h-6"></i>
                        </button>
                        <div class="ml-4">
                            <input type="text" placeholder="Search..." class="w-64 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary">
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <button class="text-gray-500 hover:text-gray-700">
                            <i data-feather="bell" class="w-6 h-6"></i>
                        </button>
                        <button class="flex items-center text-gray-700 hover:text-gray-900">
                            <img src="https://ui-avatars.com/api/?name=User&background=FF6B8B&color=fff" alt="User avatar" class="w-8 h-8 rounded-full">
                            <span class="ml-2 text-sm font-medium">Guest User</span>
                        </button>
                    </div>
                </div>
            </header>
        `;
    }

    connectedCallback() {
        feather.replace();
        
        const mobileMenuButton = this.querySelector('#mobile-menu-button');
        const sidebar = document.querySelector('custom-sidebar');
        
        mobileMenuButton?.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
        });
    }
}

customElements.define('custom-navbar', Navbar);