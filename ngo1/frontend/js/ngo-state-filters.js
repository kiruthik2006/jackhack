// NGO data cache
let ngoData = null;
let filteredNGOs = [];
const itemsPerPage = 6;
let currentPage = 1;

// Utility function to flatten state-based NGO data into array
function flattenNGOData(data) {
    const flattened = [];
    for (const state in data.ngos) {
        flattened.push(...data.ngos[state]);
    }
    return flattened;
}

// Load NGO data
async function loadNGOData() {
    try {
        const response = await fetch('data/ngos_by_state_2023.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        ngoData = await response.json();
        console.log('NGO data loaded:', ngoData);
        filteredNGOs = flattenNGOData(ngoData);
        updateResults();
        populateStateSelect();
        updateServiceFilters();
        updateCategoryTabs();
    } catch (error) {
        console.error('Error loading NGO data:', error);
        document.getElementById('resultsCount').textContent = 'Error loading NGOs: ' + error.message;
    }
}

// Populate state select with available states
function populateStateSelect() {
    const stateSelect = document.querySelector('.filter-content select');
    const states = Object.keys(ngoData.ngos).sort();
    
    // Clear existing options except "All States"
    stateSelect.innerHTML = '<option value="">All States</option>';
    
    // Add states from the data
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

// Update service filter checkboxes based on available services
function updateServiceFilters() {
    const services = ngoData.metadata.serviceTypes;
    const filterGroup = document.getElementById('services-options');
    filterGroup.innerHTML = '';

    services.forEach(service => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        const serviceId = service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        div.innerHTML = `
            <input type="checkbox" id="filter-${serviceId}" checked>
            <label for="filter-${serviceId}">${service}</label>
        `;
        filterGroup.appendChild(div);
    });
}

// Filter NGOs based on current filters
function filterNGOs() {
    if (!ngoData) return [];

    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const selectedState = document.querySelector('.filter-content select').value;
    const selectedGenders = Array.from(document.querySelectorAll('.filter-group:nth-of-type(2) input[type="checkbox"]:checked'))
        .map(cb => cb.id.replace('filter-', ''));
    const selectedServices = Array.from(document.getElementById('services-options').querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.id.replace('filter-', ''));
    const safeSpaceOnly = document.getElementById('filter-safespace').checked;
    const activeCategory = document.querySelector('.category-tab.active').dataset.category;

    let filtered = flattenNGOData(ngoData);

    // Filter by state
    if (selectedState) {
        filtered = filtered.filter(ngo => ngo.state === selectedState);
    }

    // Filter by search text
    if (searchText) {
        filtered = filtered.filter(ngo => 
            ngo.name.toLowerCase().includes(searchText) ||
            ngo.description.toLowerCase().includes(searchText) ||
            ngo.location.toLowerCase().includes(searchText) ||
            ngo.services.some(service => service.toLowerCase().includes(searchText))
        );
    }

    // Filter by gender focus
    if (selectedGenders.length) {
        filtered = filtered.filter(ngo =>
            ngo.genderFocus.some(gender =>
                selectedGenders.some(selected =>
                    gender.toLowerCase().includes(selected)
                )
            )
        );
    }

    // Filter by services and category
    if (activeCategory !== 'all') {
        const categoryMapping = {
            'housing': ['shelter', 'housing'],
            'healthcare': ['healthcare', 'health'],
            'legal': ['legal']
        };
        
        filtered = filtered.filter(ngo =>
            ngo.services.some(service =>
                categoryMapping[activeCategory].some(cat =>
                    service.toLowerCase().includes(cat)
                )
            )
        );
    }

    // Filter by safe space
    if (safeSpaceOnly) {
        filtered = filtered.filter(ngo => ngo.safeSpace);
    }

    return filtered;
}

// Render NGO card
function renderNGOCard(ngo) {
    const card = document.createElement('div');
    card.className = 'ngo-card';
    
    // Create purple background div for organization icon
    const imgDiv = document.createElement('div');
    imgDiv.style.backgroundColor = '#f3e8ff';
    imgDiv.style.height = '160px';
    imgDiv.style.display = 'flex';
    imgDiv.style.alignItems = 'center';
    imgDiv.style.justifyContent = 'center';
    imgDiv.style.borderRadius = '8px 8px 0 0';
    
    // Add heart icon
    const icon = document.createElement('i');
    icon.className = 'fas fa-hands-helping';
    icon.style.fontSize = '48px';
    icon.style.color = '#9333ea';
    imgDiv.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'ngo-content';
    
    content.innerHTML = `
        <h3>${ngo.name}</h3>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${ngo.location}</p>
        <p class="description">${ngo.description}</p>
        <div class="services">
            ${ngo.services.map(service => `<span class="service-tag">${service}</span>`).join('')}
        </div>
        <div class="gender-focus">
            ${ngo.genderFocus.map(gender => `<span class="gender-tag">${gender}</span>`).join('')}
        </div>
        <div class="contact-info">
            ${ngo.phone ? `<p><i class="fas fa-phone"></i> ${ngo.phone}</p>` : ''}
            ${ngo.email ? `<p><i class="fas fa-envelope"></i> ${ngo.email}</p>` : ''}
        </div>
        ${ngo.safeSpace ? '<div class="safe-space"><i class="fas fa-shield-alt"></i> Safe Space</div>' : ''}
    `;

    card.appendChild(imgDiv);
    card.appendChild(content);
    return card;
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredNGOs.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateResults();
        }
    });
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            updateResults();
        });
        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateResults();
        }
    });
    pagination.appendChild(nextButton);
}

// Update results display
function updateResults() {
    filteredNGOs = filterNGOs();
    const ngoGrid = document.getElementById('ngoGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update results count
    resultsCount.textContent = `${filteredNGOs.length} NGOs found`;
    
    // Clear existing cards
    ngoGrid.innerHTML = '';
    
    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageNGOs = filteredNGOs.slice(start, end);
    
    // Render NGO cards
    pageNGOs.forEach(ngo => {
        ngoGrid.appendChild(renderNGOCard(ngo));
    });
    
    // Update pagination controls
    updatePagination();
}

// Initialize category tabs
function updateCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentPage = 1;
            updateResults();
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing NGO directory...');
    
    // Load initial data
    loadNGOData();
    
    // Search input with debounce
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage = 1;
            updateResults();
        }, 300);
    });
    
    // State select
    document.querySelector('.filter-content select').addEventListener('change', () => {
        currentPage = 1;
        updateResults();
    });
    
    // Gender and service filters
    document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentPage = 1;
            updateResults();
        });
    });
    
    // Sort options
    document.getElementById('sortBy').addEventListener('change', (e) => {
        const sortBy = e.target.value;
        filteredNGOs.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'location':
                    return a.location.localeCompare(b.location);
                case 'state':
                    return a.state.localeCompare(b.state);
                case 'services':
                    return a.services[0].localeCompare(b.services[0]);
                default:
                    return 0;
            }
        });
        currentPage = 1;
        updateResults();
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        // Reset all filters
        document.getElementById('searchInput').value = '';
        document.querySelector('.filter-content select').value = '';
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => cb.checked = true);
        document.getElementById('sortBy').value = 'name';
        document.querySelector('.category-tab[data-category="all"]').click();
        currentPage = 1;
        updateResults();
    });
});