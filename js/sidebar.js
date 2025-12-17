// Detection Engineering Mastery - Sidebar & Navigation
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initCodeBlocks();
    initExpandables();
    initTabs();
    initSearch();
    setActiveNavItem();
});

// Sidebar Toggle & Navigation
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const navSections = document.querySelectorAll('.nav-section');
    
    // Toggle sidebar collapse
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
    
    // Restore sidebar state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar?.classList.add('collapsed');
    }
    
    // Handle nav section expansion
    navSections.forEach(section => {
        const header = section.querySelector('.nav-section-header');
        header?.addEventListener('click', (e) => {
            e.preventDefault();
            
            // If sidebar is collapsed, expand it first
            if (sidebar?.classList.contains('collapsed')) {
                sidebar.classList.remove('collapsed');
                localStorage.setItem('sidebarCollapsed', 'false');
            }
            
            // Toggle current section
            section.classList.toggle('expanded');
            
            // Save expanded state
            saveExpandedSections();
        });
    });
    
    // Restore expanded sections
    restoreExpandedSections();
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    mobileMenuBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('mobile-open');
    });
    
    // Close mobile menu on click outside
    document.addEventListener('click', (e) => {
        if (sidebar?.classList.contains('mobile-open') && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn?.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

function saveExpandedSections() {
    const expandedSections = [];
    document.querySelectorAll('.nav-section.expanded').forEach(section => {
        const sectionId = section.dataset.section;
        if (sectionId) expandedSections.push(sectionId);
    });
    localStorage.setItem('expandedNavSections', JSON.stringify(expandedSections));
}

function restoreExpandedSections() {
    const saved = localStorage.getItem('expandedNavSections');
    if (saved) {
        try {
            const expandedSections = JSON.parse(saved);
            expandedSections.forEach(sectionId => {
                const section = document.querySelector(`.nav-section[data-section="${sectionId}"]`);
                section?.classList.add('expanded');
            });
        } catch (e) {
            console.error('Error restoring nav sections:', e);
        }
    }
}

function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
            item.classList.add('active');
            // Expand parent section
            const parentSection = item.closest('.nav-section');
            parentSection?.classList.add('expanded', 'active');
        }
    });
}

// Code Blocks - Copy functionality
function initCodeBlocks() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const codeBlock = btn.closest('.code-block');
            const code = codeBlock?.querySelector('code')?.textContent;
            
            if (code) {
                try {
                    await navigator.clipboard.writeText(code);
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = 'var(--accent-green)';
                    btn.style.borderColor = 'var(--accent-green)';
                    
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.style.borderColor = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    btn.textContent = 'Error';
                }
            }
        });
    });
}

// Expandable Sections
function initExpandables() {
    document.querySelectorAll('.expandable').forEach(expandable => {
        const header = expandable.querySelector('.expandable-header');
        header?.addEventListener('click', () => {
            expandable.classList.toggle('open');
        });
    });
}

// Tabs
function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(container => {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked
                btn.classList.add('active');
                container.querySelector(`.tab-content[data-tab="${targetTab}"]`)?.classList.add('active');
            });
        });
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const navItems = document.querySelectorAll('.nav-item');
    const navSections = document.querySelectorAll('.nav-section');
    
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            // Show all items
            navSections.forEach(section => {
                section.style.display = '';
                section.querySelectorAll('.nav-item').forEach(item => {
                    item.style.display = '';
                });
            });
            return;
        }
        
        navSections.forEach(section => {
            const sectionTitle = section.querySelector('.nav-section-title span')?.textContent.toLowerCase() || '';
            const items = section.querySelectorAll('.nav-item');
            let hasVisibleItems = false;
            
            items.forEach(item => {
                const itemText = item.textContent.toLowerCase();
                if (itemText.includes(query) || sectionTitle.includes(query)) {
                    item.style.display = '';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide section based on matches
            if (hasVisibleItems || sectionTitle.includes(query)) {
                section.style.display = '';
                section.classList.add('expanded');
            } else {
                section.style.display = 'none';
            }
        });
    });
}

// Utility: Generate Table of Contents
function generateTOC(containerSelector, headingSelector = 'h2, h3') {
    const container = document.querySelector(containerSelector);
    const headings = document.querySelectorAll(headingSelector);
    
    if (!container || headings.length === 0) return;
    
    const toc = document.createElement('nav');
    toc.className = 'toc';
    toc.innerHTML = '<h4>On This Page</h4>';
    
    const list = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Add ID if not present
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const li = document.createElement('li');
        li.className = heading.tagName.toLowerCase();
        
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        
        li.appendChild(a);
        list.appendChild(li);
    });
    
    toc.appendChild(list);
    container.appendChild(toc);
}

// Utility: Smooth scroll to anchor
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Progress tracking (optional enhancement)
function updateProgress(moduleId, completed, total) {
    const progressFill = document.querySelector('.progress-fill');
    const progressValue = document.querySelector('.progress-value');
    
    if (progressFill && progressValue) {
        const percentage = Math.round((completed / total) * 100);
        progressFill.style.width = `${percentage}%`;
        progressValue.textContent = `${percentage}%`;
    }
}

// Export for use in other scripts
window.DetectionEngineering = {
    initSidebar,
    initCodeBlocks,
    initExpandables,
    initTabs,
    generateTOC,
    updateProgress
};
