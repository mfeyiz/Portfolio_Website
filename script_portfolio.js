// ===== Smooth scroll navigation with active link highlighting =====
// querySelectorAll: Gets all nav links
// forEach: Loop through each link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            // scrollIntoView: Smooth scroll to section
            targetSection.scrollIntoView({ behavior: 'smooth' });
            
            // Update active link class
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        }
    });
});

// ===== Fetch GitHub projects via API =====
// async/await: Modern JavaScript for handling promises
async function fetchProjects() {
    const username = 'mfeyiz';
    const container = document.getElementById('projects-container');
    
    if (!container) return;

    try {
        // fetch: API call to GitHub REST API
        // sort=updated: Sort by last updated
        // per_page=6: Limit to 6 projects
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        
        if (!response.ok) throw new Error('API error');
        
        const repos = await response.json();
        container.innerHTML = '';
        
        if (repos.length === 0) {
            container.innerHTML = '<p class="col-12 text-center text-muted py-5">No projects found.</p>';
            return;
        }

        // forEach: Loop through each repository
        repos.forEach(repo => {
            // Create Bootstrap card for each project
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4'; // Responsive columns: 1 col mobile, 2 col tablet, 3 col desktop
            
            col.innerHTML = `
                <div class="card shadow-sm border-0 h-100">
                    <div class="card-body p-4">
                        <h5 class="card-title fw-bold mb-3">${repo.name}</h5>
                        <p class="card-text text-muted mb-3">${repo.description || 'No description available.'}</p>
                        <div class="d-flex gap-3 mb-3 text-muted small">
                            <span>⭐ ${repo.stargazers_count}</span>
                            <span>🔀 ${repo.forks_count}</span>
                        </div>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary btn-sm">View Code</a>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    } catch (error) {
        container.innerHTML = '<p class="col-12 text-center text-danger py-5">Error loading projects.</p>';
    }
}

// ===== Contact form submission handler =====
// querySelector: Get first matching element
// addEventListener: Listen for form submit event
document.querySelector('#contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    alert('Message sent! (This is a demo)');
    this.reset(); // Clear form fields
});

// ===== Initialize: Load projects when page is ready =====
// DOMContentLoaded: Wait for HTML to fully load before running scripts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
    fetchProjects(); // Run immediately if already loaded
}