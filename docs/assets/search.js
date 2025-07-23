
// Search and filter functionality
function initializeSearch(datasets) {
    const searchInput = document.getElementById('search-input');
    const domainFilter = document.getElementById('domain-filter');
    const geographyFilter = document.getElementById('geography-filter');
    const resetButton = document.getElementById('reset-filters');
    const resultsCount = document.getElementById('results-count');
    const cards = document.querySelectorAll('.dataset-card');
    
    function filterDatasets() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDomain = domainFilter.value;
        const selectedGeography = geographyFilter.value;
        
        let visibleCount = 0;
        
        cards.forEach((card, index) => {
            const dataset = datasets[index];
            const matchesSearch = !searchTerm || 
                dataset.name.toLowerCase().includes(searchTerm) ||
                dataset.description.toLowerCase().includes(searchTerm) ||
                dataset.indicator.toLowerCase().includes(searchTerm);
            
            const matchesDomain = !selectedDomain || dataset.domain === selectedDomain;
            const matchesGeography = !selectedGeography || dataset.geography === selectedGeography;
            
            if (matchesSearch && matchesDomain && matchesGeography) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update results count
        if (visibleCount === datasets.length) {
            resultsCount.textContent = `Showing all ${datasets.length} datasets`;
        } else {
            resultsCount.textContent = `Showing ${visibleCount} of ${datasets.length} datasets`;
        }
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterDatasets);
    domainFilter.addEventListener('change', filterDatasets);
    geographyFilter.addEventListener('change', filterDatasets);
    
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        domainFilter.value = '';
        geographyFilter.value = '';
        filterDatasets();
    });
    
    // Initial filter
    filterDatasets();
}

// Make tables sortable (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
    const tables = document.querySelectorAll('.variable-table');
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.title = 'Click to sort';
            header.addEventListener('click', () => {
                sortTable(table, index);
            });
        });
    });
});

function sortTable(table, column) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const sorted = rows.sort((a, b) => {
        const aText = a.cells[column].textContent.trim();
        const bText = b.cells[column].textContent.trim();
        
        // Try to parse as numbers first
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }
        
        return aText.localeCompare(bText);
    });
    
    // Check if already sorted in this direction
    if (table.dataset.sortColumn == column && table.dataset.sortDir == 'asc') {
        sorted.reverse();
        table.dataset.sortDir = 'desc';
    } else {
        table.dataset.sortDir = 'asc';
    }
    table.dataset.sortColumn = column;
    
    // Re-append rows
    sorted.forEach(row => tbody.appendChild(row));
}
