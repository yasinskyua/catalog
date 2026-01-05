// Level Selector
document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active from all
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const level = this.dataset.level;
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            if (level === 'all') {
                row.style.display = '';
            } else {
                const rowLevel = row.dataset.level;
                row.style.display = (rowLevel === level) ? '' : 'none';
            }
        });
        
        console.log('Level filter:', level); // Debug
    });
});

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
    });
});

// Search with debounce
const searchInput = document.getElementById('mainSearch');
let searchTimeout;

searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const filter = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll('tbody tr');
        
        if (filter === '') {
            rows.forEach(row => row.style.display = '');
            return;
        }
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    }, 300);
});

// Filter Chips - ВИПРАВЛЕНА ЛОГІКА
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function() {
        this.classList.toggle('active');
        applyFilters();
    });
});

function applyFilters() {
    const activeChips = document.querySelectorAll('.chip.active');
    const rows = document.querySelectorAll('tbody tr');
    
    // Якщо немає активних фільтрів - показати все
    if (activeChips.length === 0) {
        rows.forEach(row => row.style.display = '');
        return;
    }
    
    // Збираємо всі активні фільтри
    const activeFilters = Array.from(activeChips).map(chip => chip.dataset.filter);
    
    console.log('Active filters:', activeFilters); // Debug
    
    rows.forEach(row => {
        let shouldShow = false;
        
        // Перевіряємо кожен фільтр
        activeFilters.forEach(filter => {
            if (filter === 'free') {
                // Фільтр "Безкоштовні"
                if (row.dataset.cost === 'free') {
                    shouldShow = true;
                }
            } else if (filter === 'cert') {
                // Фільтр "Сертифікації"
                const categories = row.dataset.category || '';
                if (categories.includes('cert')) {
                    shouldShow = true;
                }
            } else {
                // Фільтри: compliance, vendor, sales
                const categories = row.dataset.category || '';
                if (categories.includes(filter)) {
                    shouldShow = true;
                }
            }
        });
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Track Progress
document.querySelectorAll('.step-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
        this.classList.toggle('checked');
        
        const trackCard = this.closest('.track-card');
        const total = trackCard.querySelectorAll('.step-checkbox').length;
        const checked = trackCard.querySelectorAll('.step-checkbox.checked').length;
        const percentage = (checked / total) * 100;
        
        trackCard.querySelector('.progress-fill').style.width = percentage + '%';
        trackCard.querySelector('.progress-text').textContent = `${checked} з ${total} завершено`;
        
        // Save to localStorage
        saveProgress(trackCard);
    });
});

// Save/Load Progress
function saveProgress(trackCard) {
    const trackTitle = trackCard.querySelector('h3').textContent;
    const checkboxes = trackCard.querySelectorAll('.step-checkbox');
    const progress = Array.from(checkboxes).map(cb => cb.classList.contains('checked'));
    
    localStorage.setItem(`track-${trackTitle}`, JSON.stringify(progress));
}

function loadProgress() {
    document.querySelectorAll('.track-card').forEach(card => {
        const trackTitle = card.querySelector('h3').textContent;
        const saved = localStorage.getItem(`track-${trackTitle}`);
        
        if (saved) {
            const progress = JSON.parse(saved);
            const checkboxes = card.querySelectorAll('.step-checkbox');
            
            progress.forEach((checked, index) => {
                if (checked && checkboxes[index]) {
                    checkboxes[index].classList.add('checked');
                }
            });
            
            // Update progress bar
            const total = checkboxes.length;
            const checkedCount = progress.filter(p => p).length;
            const percentage = (checkedCount / total) * 100;
            
            card.querySelector('.progress-fill').style.width = percentage + '%';
            card.querySelector('.progress-text').textContent = `${checkedCount} з ${total} завершено`;
        }
    });
}

// Init on load
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    console.log('Script loaded successfully'); // Debug
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        searchInput.focus();
    }
    
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
        searchInput.value = '';
        document.querySelectorAll('tbody tr').forEach(row => row.style.display = '');
    }
});
