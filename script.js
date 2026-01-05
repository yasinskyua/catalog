// State
let activeFilters = {
    level: 'all',
    cost: 'all',
    categories: []
};

// Elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearch');
const resourcesGrid = document.getElementById('resourcesGrid');
const emptyState = document.getElementById('emptyState');
const resourceCount = document.getElementById('resourceCount');
const activeFiltersContainer = document.getElementById('activeFilters');
const resetBtn = document.getElementById('resetBtn');

// Get all cards
const allCards = document.querySelectorAll('.resource-card');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateResourceCount();
    setupEventListeners();
    console.log('PAM Hub initialized with', allCards.length, 'resources');
});

// Setup Event Listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Clear button
    clearBtn.addEventListener('click', clearSearch);
    
    // Filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', handleFilterClick);
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetAllFilters);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle Filter Click
function handleFilterClick(e) {
    const chip = e.currentTarget;
    const filterType = chip.dataset.filter;
    const filterValue = chip.dataset.value;
    
    if (filterType === 'level' || filterType === 'cost') {
        // Single selection filters
        const siblings = chip.parentElement.querySelectorAll('.filter-chip');
        siblings.forEach(s => s.classList.remove('active'));
        chip.classList.add('active');
        
        activeFilters[filterType] = filterValue;
    } else if (filterType === 'category') {
        // Multiple selection filter
        chip.classList.toggle('active');
        
        if (chip.classList.contains('active')) {
            if (!activeFilters.categories.includes(filterValue)) {
                activeFilters.categories.push(filterValue);
            }
        } else {
            activeFilters.categories = activeFilters.categories.filter(v => v !== filterValue);
        }
    }
    
    applyFilters();
}

// Apply All Filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;
    
    allCards.forEach(card => {
        let shouldShow = true;
        
        // Level filter
        if (activeFilters.level !== 'all') {
            const cardLevel = card.dataset.level;
            if (cardLevel !== activeFilters.level) {
                shouldShow = false;
            }
        }
        
        // Cost filter
        if (activeFilters.cost !== 'all') {
            const cardCost = card.dataset.cost;
            if (cardCost !== activeFilters.cost) {
                shouldShow = false;
            }
        }
        
        // Category filter (multiple selection - OR logic)
        if (activeFilters.categories.length > 0) {
            const cardCategories = card.dataset.category.split(' ');
            const hasMatch = activeFilters.categories.some(cat => 
                cardCategories.includes(cat)
            );
            if (!hasMatch) {
                shouldShow = false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const searchData = card.dataset.search.toLowerCase();
            const cardText = card.textContent.toLowerCase();
            if (!searchData.includes(searchTerm) && !cardText.includes(searchTerm)) {
                shouldShow = false;
            }
        }
        
        // Show/hide card
        if (shouldShow) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update UI
    updateResourceCount(visibleCount);
    updateActiveFiltersDisplay();
    toggleEmptyState(visibleCount === 0);
    
    console.log('Filters applied:', activeFilters, 'Visible:', visibleCount);
}

// Handle Search
function handleSearch(e) {
    const value = e.target.value;
    clearBtn.classList.toggle('visible', value.length > 0);
    applyFilters();
}

// Clear Search
function clearSearch() {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    searchInput.focus();
    applyFilters();
}

// Reset All Filters
function resetAllFilters() {
    // Reset state
    activeFilters = {
        level: 'all',
        cost: 'all',
        categories: []
    };
    
    // Reset UI
    document.querySelectorAll('.filter-chip').forEach(chip => {
        if (chip.dataset.value === 'all') {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    
    applyFilters();
}

// Update Active Filters Display
function updateActiveFiltersDisplay() {
    activeFiltersContainer.innerHTML = '';
    
    // Level
    if (activeFilters.level !== 'all') {
        addActiveFilterTag('Рівень: ' + activeFilters.level, 'level');
    }
    
    // Cost
    if (activeFilters.cost !== 'all') {
        const costLabel = activeFilters.cost === 'free' ? 'Безкоштовні' : 'Платні';
        addActiveFilterTag(costLabel, 'cost');
    }
    
    // Categories
    activeFilters.categories.forEach(cat => {
        const labels = {
            'basics': 'Основи',
            'compliance': 'Compliance',
            'vendor': 'Вендори',
            'sales': 'Продажі',
            'soft': 'Soft Skills',
            'cert': 'Сертифікації'
        };
        addActiveFilterTag(labels[cat] || cat, 'category', cat);
    });
}

// Add Active Filter Tag
function addActiveFilterTag(label, type, value = null) {
    const tag = document.createElement('div');
    tag.className = 'active-filter-tag';
    tag.innerHTML = `
        <span>${label}</span>
        <span class="remove">✕</span>
    `;
    
    tag.querySelector('.remove').addEventListener('click', () => {
        removeFilter(type, value);
    });
    
    activeFiltersContainer.appendChild(tag);
}

// Remove Filter
function removeFilter(type, value) {
    if (type === 'level') {
        activeFilters.level = 'all';
        document.querySelector('[data-filter="level"][data-value="all"]').classList.add('active');
        document.querySelectorAll('[data-filter="level"]:not([data-value="all"])').forEach(c => c.classList.remove('active'));
    } else if (type === 'cost') {
        activeFilters.cost = 'all';
        document.querySelector('[data-filter="cost"][data-value="all"]').classList.add('active');
        document.querySelectorAll('[data-filter="cost"]:not([data-value="all"])').forEach(c => c.classList.remove('active'));
    } else if (type === 'category') {
        activeFilters.categories = activeFilters.categories.filter(v => v !== value);
        document.querySelector(`[data-filter="category"][data-value="${value}"]`).classList.remove('active');
    }
    
    applyFilters();
}

// Update Resource Count
function updateResourceCount(count = null) {
    if (count === null) {
        count = allCards.length;
    }
    resourceCount.textContent = `Показано: ${count} з ${allCards.length} ресурсів`;
}

// Toggle Empty State
function toggleEmptyState(show) {
    if (show) {
        resourcesGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        resourcesGrid.style.display = 'grid';
        emptyState.style.display = 'none';
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // "/" to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // "Escape" to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        if (searchInput.value) {
            clearSearch();
        } else {
            searchInput.blur();
        }
    }
}

// Debounce utility
function debounce(func, wait) {
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

// Export for inline use
window.resetAllFilters = resetAllFilters;

console.log('PAM Hub script loaded successfully');
