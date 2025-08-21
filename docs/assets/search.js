
// Search and filter functionality
function initializeSearch(datasets) {
    const searchInput = document.getElementById('search-input');
    const domainFilter = document.getElementById('domain-filter');
    const geographyFilter = document.getElementById('geography-filter');
    const raceEthFilter = document.getElementById('race-eth-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const resetButton = document.getElementById('reset-filters');
    const resultsCount = document.getElementById('results-count');
    const cards = document.querySelectorAll('.dataset-card');
    const listItems = document.querySelectorAll('.dataset-list-item');
    const listViewBtn = document.getElementById('list-view-btn');
    const tileViewBtn = document.getElementById('tile-view-btn');
    const listView = document.getElementById('list-view');
    const tileView = document.getElementById('tile-view');
    
    // View toggle functionality
    function setView(viewType) {
        if (viewType === 'list') {
            listView.style.display = 'block';
            tileView.style.display = 'none';
            listViewBtn.classList.add('active');
            tileViewBtn.classList.remove('active');
        } else {
            listView.style.display = 'none';
            tileView.style.display = 'block';
            listViewBtn.classList.remove('active');
            tileViewBtn.classList.add('active');
        }
        localStorage.setItem('preferredView', viewType);
    }
    
    // Load preferred view from localStorage, default to list
    const preferredView = localStorage.getItem('preferredView') || 'list';
    setView(preferredView);
    
    // View toggle event listeners
    listViewBtn.addEventListener('click', () => setView('list'));
    tileViewBtn.addEventListener('click', () => setView('tile'));
    
    function filterDatasets() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedDomain = domainFilter.value;
        const selectedGeography = geographyFilter.value;
        const selectedRaceEth = raceEthFilter.value;
        const selectedAvailability = availabilityFilter.value;
        
        let visibleCount = 0;
        
        // Filter both cards and rows
        datasets.forEach((dataset, index) => {
            const matchesSearch = !searchTerm || 
                dataset.name.toLowerCase().includes(searchTerm) ||
                dataset.description.toLowerCase().includes(searchTerm) ||
                dataset.indicator.toLowerCase().includes(searchTerm);
            
            const matchesDomain = !selectedDomain || dataset.domain === selectedDomain;
            const matchesGeography = !selectedGeography || dataset.geography === selectedGeography;
            const matchesRaceEth = !selectedRaceEth || 
                (selectedRaceEth === 'none' && (!dataset.race_eth_coverage || dataset.race_eth_coverage.length === 0)) ||
                (selectedRaceEth !== 'none' && dataset.race_eth_coverage && dataset.race_eth_coverage.includes(selectedRaceEth));
            const matchesAvailability = !selectedAvailability || dataset.availability === selectedAvailability;
            
            const isVisible = matchesSearch && matchesDomain && matchesGeography && matchesRaceEth && matchesAvailability;
            
            // Update card visibility
            if (cards[index]) {
                cards[index].style.display = isVisible ? 'block' : 'none';
            }
            
            // Update list item visibility
            if (listItems[index]) {
                listItems[index].style.display = isVisible ? 'block' : 'none';
            }
            
            if (isVisible) visibleCount++;
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
    raceEthFilter.addEventListener('change', filterDatasets);
    availabilityFilter.addEventListener('change', filterDatasets);
    
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        domainFilter.value = '';
        geographyFilter.value = '';
        raceEthFilter.value = '';
        availabilityFilter.value = '';
        filterDatasets();
    });
    
    // Initial filter
    filterDatasets();
}

// Data Files drawer functionality
function initializeDataFilesDrawer(datasets) {
    const drawer = document.getElementById('datafiles-drawer');
    const closeButton = document.getElementById('close-datafiles-drawer');
    const backdrop = drawer?.querySelector('.drawer-backdrop');
    const filterInput = document.getElementById('datafiles-filter');
    const datafilesList = document.getElementById('datafiles-list');
    const datafilesCount = document.getElementById('datafiles-count');
    
    if (!drawer) return;
    
    // Function to open drawer
    const openDrawer = () => {
        drawer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };
    
    // Function to close drawer
    const closeDrawer = () => {
        drawer.classList.add('hidden');
        document.body.style.overflow = '';
    };
    
    // Open drawer from sidebar button or toggle sidebar
    document.addEventListener('click', (e) => {
        // Check if clicked element or its parent is the open button
        const openButton = e.target.closest('#open-datafiles-drawer');
        if (openButton) {
            e.preventDefault();
            openDrawer();
        }
        
        // Also check for sidebar toggle button
        const toggleSidebarBtn = e.target.closest('#toggle-sidebar-btn');
        if (toggleSidebarBtn) {
            e.preventDefault();
            const sidebar = document.querySelector('.sidebar');
            const body = document.querySelector('body');
            if (sidebar && body) {
                sidebar.classList.toggle('sidebar-collapsed');
                body.classList.toggle('sidebar-collapsed');
            }
        }
    });
    
    // Close drawer
    if (closeButton) {
        closeButton.addEventListener('click', closeDrawer);
    }
    
    // Close on backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !drawer.classList.contains('hidden')) {
            closeDrawer();
        }
    });
    
    // Group datasets by domain
    const domainGroups = {};
    datasets.forEach(dataset => {
        const domain = dataset.domain || 'unknown';
        if (!domainGroups[domain]) {
            domainGroups[domain] = [];
        }
        domainGroups[domain].push(dataset);
    });
    
    // Sort domains and datasets
    const sortedDomains = Object.keys(domainGroups).sort();
    sortedDomains.forEach(domain => {
        domainGroups[domain].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    // Domain labels
    const domainLabels = {
        'healthcare': 'Healthcare',
        'environment': 'Environment', 
        'income_credit_wealth': 'Income, Credit & Wealth',
        'education': 'Education',
        'policing_justice': 'Policing & Justice',
        'housing': 'Housing',
        'political': 'Political',
        'employment': 'Employment'
    };
    
    // Render datasets list
    function renderDatasets() {
        let html = '';
        sortedDomains.forEach(domain => {
            const domainLabel = domainLabels[domain] || domain.replace('_', ' ').charAt(0).toUpperCase() + domain.slice(1);
            html += `<div class="domain-group">`;
            html += `<h4 class="domain-group-title">${domainLabel}</h4>`;
            html += `<div class="domain-datasets">`;
            
            domainGroups[domain].forEach(dataset => {
                html += `
                    <a href="../datasets/${dataset.id}.html" class="dataset-link" data-domain="${domain}" data-name="${dataset.name.toLowerCase()}">
                        <div class="dataset-link-name">${dataset.name}</div>
                        <div class="dataset-link-meta">
                            <span class="dataset-variables">${dataset.variables} vars</span>
                            <span class="dataset-years">${Array.isArray(dataset.years) ? 
                                (dataset.years.length === 1 ? dataset.years[0] : 
                                 dataset.years.length === 2 ? `${dataset.years[0]}-${dataset.years[1]}` :
                                 `${Math.min(...dataset.years)}-${Math.max(...dataset.years)}`) : 'N/A'}</span>
                        </div>
                    </a>
                `;
            });
            
            html += `</div></div>`;
        });
        
        datafilesList.innerHTML = html;
    }
    
    // Filter datasets
    function filterDatasets() {
        const searchTerm = filterInput.value.toLowerCase().trim();
        const allLinks = datafilesList.querySelectorAll('.dataset-link');
        const domainGroups = datafilesList.querySelectorAll('.domain-group');
        
        let visibleCount = 0;
        let totalCount = allLinks.length;
        
        domainGroups.forEach(group => {
            const links = group.querySelectorAll('.dataset-link');
            let groupVisible = false;
            
            links.forEach(link => {
                const name = link.dataset.name || '';
                const matches = !searchTerm || name.includes(searchTerm);
                
                if (matches) {
                    link.style.display = 'block';
                    visibleCount++;
                    groupVisible = true;
                } else {
                    link.style.display = 'none';
                }
            });
            
            // Hide domain group if no datasets match
            group.style.display = groupVisible ? 'block' : 'none';
        });
        
        // Update count
        if (visibleCount === totalCount) {
            datafilesCount.textContent = `Showing all ${totalCount} datasets`;
        } else {
            datafilesCount.textContent = `Showing ${visibleCount} of ${totalCount} datasets`;
        }
    }
    
    // Initialize
    renderDatasets();
    datafilesCount.textContent = `Showing all ${datasets.length} datasets`;
    
    // Add filter event listener
    if (filterInput) {
        filterInput.addEventListener('input', filterDatasets);
    }
}

// Variable filtering functionality
function initializeVariableFilter() {
    const filterInput = document.getElementById('variable-filter');
    const variableGrid = document.getElementById('variables-grid');
    const variableCount = document.getElementById('variable-count');
    
    if (!filterInput || !variableGrid || !variableCount) {
        return; // Not on a page with variable filtering
    }
    
    const allVariables = variableGrid.querySelectorAll('.variable-card');
    const totalCount = allVariables.length;
    
    function filterVariables() {
        const searchTerm = filterInput.value.toLowerCase().trim();
        let visibleCount = 0;
        
        allVariables.forEach(card => {
            const varName = card.querySelector('.var-detail-value.var-code code')?.textContent.toLowerCase() || '';
            const displayName = card.querySelector('.var-display-name')?.textContent.toLowerCase() || '';
            
            // Get all detail values and search through them
            const detailValues = Array.from(card.querySelectorAll('.var-detail-value')).map(el => el.textContent.toLowerCase()).join(' ');
            
            const matches = !searchTerm || 
                varName.includes(searchTerm) ||
                displayName.includes(searchTerm) ||
                detailValues.includes(searchTerm);
            
            if (matches) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update count display
        if (visibleCount === totalCount) {
            variableCount.textContent = `Showing all ${totalCount} variables`;
        } else {
            variableCount.textContent = `Showing ${visibleCount} of ${totalCount} variables`;
        }
    }
    
    // Add event listener for real-time filtering
    filterInput.addEventListener('input', filterVariables);
    
    // Initialize count
    variableCount.textContent = `Showing all ${totalCount} variables`;
}

// Make tables sortable (optional enhancement)
document.addEventListener('DOMContentLoaded', () => {
    // Initialize variable filtering
    initializeVariableFilter();
    
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
