class Sidebar extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div class="flex items-center justify-center h-16 border-b border-gray-200">
                    <h1 class="text-xl font-semibold text-primary">EmpowerHer TransCare</h1>
                </div>
                
                <nav class="flex-1 overflow-y-auto">
                    <ul class="p-4 space-y-2">
                        <li>
                            <a href="dash.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="home" class="w-5 h-5 mr-3"></i>
                                <span>Home</span>
                            </a>
                        </li>
                        <li>
                            <a href="schemes.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="gift" class="w-5 h-5 mr-3"></i>
                                <span>Schemes</span>
                            </a>
                        </li>
                        <li>
                            <a href="ngos.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="users" class="w-5 h-5 mr-3"></i>
                                <span>NGOs</span>
                            </a>
                        </li>
                        <li>
                            <a href="sos.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                                <i data-feather="alert-circle" class="w-5 h-5 mr-3"></i>
                                <span>SOS</span>
                            </a>
                        </li>
                        <li>
                            <a href="legal.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="book" class="w-5 h-5 mr-3"></i>
                                <span>Legal Acts</span>
                            </a>
                        </li>
                        <li>
                            <a href="education.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="edit" class="w-5 h-5 mr-3"></i>
                                <span>Education</span>
                            </a>
                        </li>
                        <li>
                            <a href="women-health.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="heart" class="w-5 h-5 mr-3"></i>
                                <span>Women Health Care</span>
                            </a>
                        </li>
                        <li>
                            <a href="trans-health.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="activity" class="w-5 h-5 mr-3"></i>
                                <span>Transgender Health Care</span>
                            </a>
                        </li>
                        <li>
                            <a href="success.html" class="flex items-center px-4 py-2 text-gray-700 hover:bg-secondary hover:text-white rounded-lg transition-colors">
                                <i data-feather="star" class="w-5 h-5 mr-3"></i>
                                <span>Success Stories</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>
        `;
    }

    connectedCallback() {
        feather.replace();
    }
}

customElements.define('custom-sidebar', Sidebar);