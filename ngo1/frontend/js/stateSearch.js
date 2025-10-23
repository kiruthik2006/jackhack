// State Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const stateSearch = document.getElementById('stateSearch');
    const stateFilters = document.getElementById('statesFilter');
    const stateOptions = stateFilters.querySelectorAll('.filter-option');

    stateSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        stateOptions.forEach(option => {
            const stateName = option.textContent.toLowerCase();
            if (stateName.includes(searchTerm)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });

    // Clear search when clicking the reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        stateSearch.value = '';
        stateOptions.forEach(option => {
            option.style.display = '';
        });
    });
});