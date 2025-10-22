// NGO Directory Application
class NGODirectory {
    constructor() {
        this.ngos = [];
        this.filteredNGOs = [];
        this.currentPage = 1;
        this.ngosPerPage = 6;
        this.currentCategory = 'all';

        // DOM Elements
        this.elements = {
            ngoGrid: document.getElementById('ngoGrid'),
            resultsCount: document.getElementById('resultsCount'),
            pagination: document.getElementById('pagination'),
            searchInput: document.getElementById('searchInput'),
            sortBy: document.getElementById('sortBy'),
            resetBtn: document.getElementById('resetBtn'),
            statesFilter: document.getElementById('statesFilter')
        };
        
        this.init();
    }
    
    async init() {
        await this.loadNGOs();
        this.setupEventListeners();
        this.populateStatesFilter();
        this.renderNGOs();
    }

    // NEW METHOD: Populate States Filter
    populateStatesFilter() {
        // Get all unique states from NGOs
        const states = [...new Set(this.ngos.map(ngo => ngo.state).filter(Boolean))];
        
        // Sort states alphabetically
        states.sort();
        
        // Create state checkboxes
        if (states.length > 0) {
            this.elements.statesFilter.innerHTML = states.map(state => `
                <div class="filter-option">
                    <input type="checkbox" id="state-${state.replace(/\s+/g, '-').toLowerCase()}" value="${state}" checked>
                    <label for="state-${state.replace(/\s+/g, '-').toLowerCase()}">${state}</label>
                </div>
            `).join('');
            
            // Add event listeners to state checkboxes
            this.elements.statesFilter.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.filterNGOs();
                });
            });
        } else {
            this.elements.statesFilter.innerHTML = '<div class="filter-option"><span style="color: #666; font-style: italic;">No state data available</span></div>';
        }
    }
    
    async loadNGOs() {
        try {
            // Try to load from ngos.json file
            console.log('Loading NGOs from JSON file...');
            
            const response = await fetch('data/ngos.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle both {ngos: [...]} and direct array formats
            this.ngos = data.ngos || data;
            this.filteredNGOs = [...this.ngos];
            
            console.log(`Successfully loaded ${this.ngos.length} NGOs from JSON file`);
            
        } catch (error) {
            console.error('Error loading NGOs from JSON:', error);
            console.log('Falling back to sample data...');
            
            // Fallback to sample data if JSON file fails
            this.ngos = await this.getSampleNGOs();
            this.filteredNGOs = [...this.ngos];
            
            this.showError('Failed to load NGO data from file. Using sample data instead.');
        }
    }
    
    async getSampleNGOs() {
        // Sample NGO data with states
        return [
            {
                id: 1,
                name: "Women Empowerment Alliance",
                description: "Providing safe housing, skill development programs, legal assistance, and career guidance for women from marginalized communities.",
                location: "123 Empowerment Street, Mumbai",
                state: "Maharashtra",
                phone: "+1 (555) 123-4567",
                email: "contact@womenempower.org",
                services: ["Housing", "Employment", "Legal Support"],
                genderFocus: ["women"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1551833996-2c1d6cfc437d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 2,
                name: "Trans Rights Foundation",
                description: "Supporting transgender individuals with healthcare access, legal rights awareness, safe housing, and community building initiatives.",
                location: "456 Equality Avenue, Delhi",
                state: "Delhi",
                phone: "+1 (555) 234-5678",
                email: "help@transrights.org",
                services: ["Healthcare", "Legal Support", "Housing"],
                genderFocus: ["transgender"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 3,
                name: "Safe Space Collective",
                description: "Offering safe shelters, counseling services, and emergency support for women and transgender people in crisis situations.",
                location: "789 Safety Lane, Bangalore",
                state: "Karnataka",
                phone: "+1 (555) 345-6789 (24/7)",
                email: "safety@safespace.org",
                services: ["Emergency Housing", "Mental Health", "Crisis Support"],
                genderFocus: ["women", "transgender"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 4,
                name: "Healthcare Access Initiative",
                description: "Providing gender-affirming healthcare, mental health services, and specialized medical care for women and transgender individuals.",
                location: "321 Wellness Road, Chennai",
                state: "Tamil Nadu",
                phone: "+1 (555) 456-7890",
                email: "care@healthaccess.org",
                services: ["Healthcare", "Trans Health", "Counseling"],
                genderFocus: ["women", "transgender"],
                safeSpace: false,
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 5,
                name: "Legal Aid for Women & Trans",
                description: "Offering free legal assistance, documentation support, and rights advocacy for women and transgender individuals facing discrimination.",
                location: "654 Justice Boulevard, Hyderabad",
                state: "Telangana",
                phone: "+1 (555) 567-8901",
                email: "legal@rightsdefenders.org",
                services: ["Legal Support", "Rights Advocacy", "Documentation"],
                genderFocus: ["women", "transgender"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 6,
                name: "Community Haven Project",
                description: "Providing transitional housing, community support, and skill-building programs for women and transgender individuals rebuilding their lives.",
                location: "987 Community Circle, Kolkata",
                state: "West Bengal",
                phone: "+1 (555) 678-9012",
                email: "community@havenproject.org",
                services: ["Transitional Housing", "Skill Development", "Community"],
                genderFocus: ["women", "transgender"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 7,
                name: "Women's Education Foundation",
                description: "Promoting education and literacy among women through scholarships, vocational training, and adult education programs.",
                location: "555 Learning Lane, Pune",
                state: "Maharashtra",
                phone: "+1 (555) 789-0123",
                email: "info@womensedu.org",
                services: ["Education", "Scholarships", "Vocational Training"],
                genderFocus: ["women"],
                safeSpace: false,
                image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 8,
                name: "Trans Employment Network",
                description: "Connecting transgender individuals with employment opportunities, career counseling, and workplace inclusion training for employers.",
                location: "777 Career Avenue, Ahmedabad",
                state: "Gujarat",
                phone: "+1 (555) 890-1234",
                email: "jobs@transemployment.org",
                services: ["Employment", "Career Counseling", "Workplace Training"],
                genderFocus: ["transgender"],
                safeSpace: false,
                image: "https://images.unsplash.com/photo-1551836026-d5c8cbf7e737?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 9,
                name: "Women's Health Initiative",
                description: "Providing comprehensive healthcare services for women including reproductive health, maternal care, and preventive screenings.",
                location: "222 Wellness Street, Jaipur",
                state: "Rajasthan",
                phone: "+1 (555) 901-2345",
                email: "health@womensinitiative.org",
                services: ["Healthcare", "Reproductive Health", "Maternal Care"],
                genderFocus: ["women"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 10,
                name: "Transgender Support Alliance",
                description: "Offering holistic support for transgender individuals including housing assistance, healthcare navigation, and community events.",
                location: "444 Support Boulevard, Lucknow",
                state: "Uttar Pradesh",
                phone: "+1 (555) 012-3456",
                email: "support@transalliance.org",
                services: ["Housing", "Healthcare", "Community Building"],
                genderFocus: ["transgender"],
                safeSpace: true,
                image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            }
        ];
    }
    
    setupEventListeners() {
        // Search input
        this.elements.searchInput.addEventListener('input', this.debounce(() => {
            this.filterNGOs();
        }, 300));
        
        // Sort dropdown
        this.elements.sortBy.addEventListener('change', () => {
            this.filterNGOs();
        });
        
        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = tab.getAttribute('data-category');
                this.filterNGOs();
            });
        });
        
        // Filter checkboxes (including states)
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filterNGOs();
            });
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // UPDATED filterNGOs method with state filtering
    filterNGOs() {
        const searchValue = this.elements.searchInput.value.toLowerCase();
        const sortValue = this.elements.sortBy.value;
        
        // Get filter values
        const filterWomen = document.getElementById('filter-women').checked;
        const filterTransgender = document.getElementById('filter-transgender').checked;
        const filterHousing = document.getElementById('filter-housing').checked;
        const filterHealthcare = document.getElementById('filter-healthcare').checked;
        const filterLegal = document.getElementById('filter-legal').checked;
        const filterEducation = document.getElementById('filter-education').checked;
        const filterEmployment = document.getElementById('filter-employment').checked;
        const filterCounseling = document.getElementById('filter-counseling').checked;
        const filterSafeSpace = document.getElementById('filter-safespace').checked;
        
        // Get selected states
        const selectedStates = new Set();
        if (this.elements.statesFilter) {
            this.elements.statesFilter.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                selectedStates.add(checkbox.value);
            });
        }
        
        // Apply filters
        this.filteredNGOs = this.ngos.filter(ngo => {
            // Search filter
            const searchMatch = 
                ngo.name.toLowerCase().includes(searchValue) ||
                ngo.description.toLowerCase().includes(searchValue) ||
                ngo.location.toLowerCase().includes(searchValue) ||
                ngo.services.some(service => service.toLowerCase().includes(searchValue));
            
            if (!searchMatch) return false;
            
            // State filter (only apply if states are selected)
            if (selectedStates.size > 0 && ngo.state) {
                if (!selectedStates.has(ngo.state)) return false;
            }
            
            // Gender focus filter
            const genderMatch = 
                (filterWomen && ngo.genderFocus.includes('women')) ||
                (filterTransgender && ngo.genderFocus.includes('transgender'));
            
            if (!genderMatch) return false;
            
            // Services filter
            const servicesMatch = 
                (filterHousing && ngo.services.includes('Housing')) ||
                (filterHealthcare && ngo.services.includes('Healthcare')) ||
                (filterLegal && ngo.services.includes('Legal Support')) ||
                (filterEducation && ngo.services.includes('Education')) ||
                (filterEmployment && ngo.services.includes('Employment')) ||
                (filterCounseling && ngo.services.includes('Counseling'));
            
            if (!servicesMatch) return false;
            
            // Safe space filter
            if (filterSafeSpace && !ngo.safeSpace) return false;
            
            // Category filter
            if (this.currentCategory !== 'all') {
                if (this.currentCategory === 'women' && !ngo.genderFocus.includes('women')) return false;
                if (this.currentCategory === 'transgender' && !ngo.genderFocus.includes('transgender')) return false;
                if (this.currentCategory === 'housing' && !ngo.services.includes('Housing')) return false;
                if (this.currentCategory === 'healthcare' && !ngo.services.includes('Healthcare')) return false;
                if (this.currentCategory === 'legal' && !ngo.services.includes('Legal Support')) return false;
            }
            
            return true;
        });
        
        // Sort NGOs
        if (sortValue === 'name') {
            this.filteredNGOs.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === 'location') {
            this.filteredNGOs.sort((a, b) => a.location.localeCompare(b.location));
        } else if (sortValue === 'state') {
            this.filteredNGOs.sort((a, b) => (a.state || '').localeCompare(b.state || ''));
        } else if (sortValue === 'services') {
            this.filteredNGOs.sort((a, b) => b.services.length - a.services.length);
        }
        
        this.currentPage = 1;
        this.renderNGOs();
    }
    
    // UPDATED resetFilters method
    resetFilters() {
        this.elements.searchInput.value = '';
        this.elements.sortBy.value = 'name';
        
        // Reset all checkboxes (including states)
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('.category-tab[data-category="all"]').classList.add('active');
        this.currentCategory = 'all';
        
        this.filterNGOs();
    }
    
    renderNGOs() {
        if (this.filteredNGOs.length === 0) {
            this.elements.ngoGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No NGOs Found</h3>
                    <p>Try adjusting your search or filters to find more results.</p>
                </div>
            `;
            this.elements.resultsCount.textContent = `Total 0 NGOs available`;
            this.elements.pagination.innerHTML = '';
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredNGOs.length / this.ngosPerPage);
        const startIndex = (this.currentPage - 1) * this.ngosPerPage;
        const endIndex = Math.min(startIndex + this.ngosPerPage, this.filteredNGOs.length);
        const paginatedNGOs = this.filteredNGOs.slice(startIndex, endIndex);
        
        // Render NGO cards
        this.elements.ngoGrid.innerHTML = '';
        paginatedNGOs.forEach(ngo => {
            const ngoCard = this.createNGOCard(ngo);
            this.elements.ngoGrid.appendChild(ngoCard);
        });
        
        // Update results count
        this.elements.resultsCount.textContent = `Total ${this.filteredNGOs.length} NGOs available`;
        
        // Render pagination
        this.renderPagination(totalPages);
    }
    
    createNGOCard(ngo) {
        const card = document.createElement('div');
        card.className = 'ngo-card';
        
        // Safe space badge
        if (ngo.safeSpace) {
            const badge = document.createElement('div');
            badge.className = 'safe-space-badge';
            badge.innerHTML = '<i class="fas fa-shield-alt"></i> Safe Space';
            card.appendChild(badge);
        }
        
        // NGO image
        const imgDiv = document.createElement('div');
        imgDiv.className = 'ngo-img';
        imgDiv.style.backgroundImage = `url('${ngo.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}')`;
        card.appendChild(imgDiv);
        
        // NGO content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ngo-content';
        
        // NGO name
        const name = document.createElement('h3');
        name.textContent = ngo.name;
        contentDiv.appendChild(name);
        
        // Services tags
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'tags';
        ngo.services.forEach(service => {
            const tag = document.createElement('span');
            tag.className = `tag ${service.toLowerCase().replace(' ', '-')}`;
            tag.textContent = service;
            tagsDiv.appendChild(tag);
        });
        contentDiv.appendChild(tagsDiv);
        
        // Description
        const desc = document.createElement('p');
        desc.textContent = ngo.description;
        contentDiv.appendChild(desc);
        
        // Contact info
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-info';
        
        const location = document.createElement('div');
        location.className = 'contact-item';
        location.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${ngo.location}</span>`;
        contactDiv.appendChild(location);
        
        // Add state information
        if (ngo.state) {
            const state = document.createElement('div');
            state.className = 'contact-item';
            state.innerHTML = `<i class="fas fa-globe-asia"></i><span>${ngo.state}</span>`;
            contactDiv.appendChild(state);
        }
        
        if (ngo.phone) {
            const phone = document.createElement('div');
            phone.className = 'contact-item';
            phone.innerHTML = `<i class="fas fa-phone"></i><span>${ngo.phone}</span>`;
            contactDiv.appendChild(phone);
        }
        
        if (ngo.email) {
            const email = document.createElement('div');
            email.className = 'contact-item';
            email.innerHTML = `<i class="fas fa-envelope"></i><span>${ngo.email}</span>`;
            contactDiv.appendChild(email);
        }
        
        contentDiv.appendChild(contactDiv);
        
        // Action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';
        
        // View Details Button
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'btn btn-primary';
        detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i> View Details';
        detailsBtn.addEventListener('click', () => this.showNGODetails(ngo));
        actionsDiv.appendChild(detailsBtn);
        
        // Get Directions Button
        const directionsBtn = document.createElement('button');
        directionsBtn.className = ngo.safeSpace ? 'btn btn-safe' : 'btn';
        directionsBtn.innerHTML = '<i class="fas fa-map-marked-alt"></i> Get Directions';
        directionsBtn.addEventListener('click', () => this.showDirections(ngo));
        actionsDiv.appendChild(directionsBtn);
        
        contentDiv.appendChild(actionsDiv);
        
        card.appendChild(contentDiv);
        return card;
    }

    // NGO Details Modal
    showNGODetails(ngo) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="ngoModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${ngo.name}</h2>
                        <button class="close-btn" id="closeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${ngo.image}" alt="${ngo.name}">
                        </div>
                        <div class="modal-details">
                            <h3>About</h3>
                            <p>${ngo.description}</p>
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                                <p>${ngo.location}</p>
                            </div>
                            
                            ${ngo.state ? `
                            <div class="detail-section">
                                <h4><i class="fas fa-globe-asia"></i> State</h4>
                                <p>${ngo.state}</p>
                            </div>
                            ` : ''}
                            
                            ${ngo.phone ? `
                            <div class="detail-section">
                                <h4><i class="fas fa-phone"></i> Contact</h4>
                                <p>${ngo.phone}</p>
                            </div>
                            ` : ''}
                            
                            ${ngo.email ? `
                            <div class="detail-section">
                                <h4><i class="fas fa-envelope"></i> Email</h4>
                                <p><a href="mailto:${ngo.email}">${ngo.email}</a></p>
                            </div>
                            ` : ''}
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-hands-helping"></i> Services</h4>
                                <div class="service-tags">
                                    ${ngo.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-users"></i> Focus Group</h4>
                                <p>${ngo.genderFocus.join(', ')}</p>
                            </div>
                            
                            ${ngo.safeSpace ? `
                            <div class="detail-section">
                                <div class="safe-space-indicator">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Verified Safe Space</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="ngodirectory.showDirections(${JSON.stringify(ngo).replace(/"/g, '&quot;')})">
                            <i class="fas fa-map-marked-alt"></i> Get Directions
                        </button>
                        ${ngo.phone ? `
                        <button class="btn btn-safe" onclick="window.open('tel:${ngo.phone}')">
                            <i class="fas fa-phone"></i> Call Now
                        </button>
                        ` : ''}
                        <button class="btn" onclick="ngodirectory.closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        document.getElementById('closeModal').addEventListener('click', this.closeModal);
        document.getElementById('ngoModal').addEventListener('click', (e) => {
            if (e.target.id === 'ngoModal') this.closeModal();
        });
        
        // Store reference for global access
        window.ngodirectory = this;
    }

    // Show Directions (Google Maps)
    showDirections(ngo) {
        // Encode the location for Google Maps
        const encodedLocation = encodeURIComponent(ngo.location);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        
        // Open in new tab
        window.open(mapsUrl, '_blank');
        
        // Optional: Close modal if open
        this.closeModal();
    }

    // Close Modal
    closeModal() {
        const modal = document.getElementById('ngoModal');
        if (modal) {
            modal.remove();
        }
    }
    
    renderPagination(totalPages) {
        if (totalPages <= 1) {
            this.elements.pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<a href="#" class="page-btn" data-page="${this.currentPage - 1}">Previous</a>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<a href="#" class="page-btn active" data-page="${i}">${i}</a>`;
            } else {
                paginationHTML += `<a href="#" class="page-btn" data-page="${i}">${i}</a>`;
            }
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<a href="#" class="page-btn" data-page="${this.currentPage + 1}">Next</a>`;
        }
        
        this.elements.pagination.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        this.elements.pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = parseInt(btn.getAttribute('data-page'));
                this.renderNGOs();
            });
        });
    }
    
    showError(message) {
        this.elements.ngoGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Data</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NGODirectory();
});