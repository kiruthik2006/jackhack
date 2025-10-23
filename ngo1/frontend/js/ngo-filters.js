// NGO Directory View Management
document.addEventListener('DOMContentLoaded', function() {
    // Current view state
    let currentView = 'all';
    const stateSelect = document.querySelector('.filter-content select');
    const viewTitle = document.getElementById('viewTitle');

    // View buttons click handlers
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => setView(btn.getAttribute('data-view')));
    });

    function setView(view) {
        currentView = view;
        
        // Update button styles
        document.querySelectorAll('[data-view]').forEach(btn => {
            if (btn.getAttribute('data-view') === view) {
                btn.classList.add('text-primary', 'border-b-2', 'border-primary');
                btn.classList.remove('text-gray-600');
            } else {
                btn.classList.remove('text-primary', 'border-b-2', 'border-primary');
                btn.classList.add('text-gray-600');
            }
        });

        // Update view title
        updateViewTitle();
        
        // Trigger NGO list update
        updateNGOList();
    }

    // State selection handler
    stateSelect.addEventListener('change', function() {
        updateViewTitle();
        updateNGOList();
    });

    function updateViewTitle() {
        let titleText = '';
        const selectedState = stateSelect.value;

        if (currentView === 'central') {
            titleText = 'Showing central NGOs';
        } else if (currentView === 'state') {
            titleText = selectedState 
                ? `Showing state NGOs — ${selectedState}`
                : 'Showing state NGOs — All states';
        } else {
            titleText = selectedState 
                ? `Showing central + ${selectedState} NGOs`
                : 'Showing central + all state NGOs';
        }

        viewTitle.textContent = titleText;
    }

    function updateNGOList() {
        // This function will be implemented in your existing NGO listing logic
        // It should filter NGOs based on currentView and selected state
        console.log('Update NGO list:', { view: currentView, state: stateSelect.value });
        
        // Trigger your existing NGO filtering/rendering logic here
        if (typeof renderNGOs === 'function') {
            renderNGOs();
        }
    }

    // Initial setup
    setView('all');
});