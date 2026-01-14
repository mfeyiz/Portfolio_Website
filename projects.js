// ===== Projects page - Fetch and display GitHub repos with detail view =====

async function fetchProjects() {
    const username = 'mfeyiz';
    const container = document.getElementById('projects-container');
    
    if (!container) return;

    try {
        // Fetch repos from GitHub API
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`);
        
        if (!response.ok) throw new Error('API error');
        
        const repos = await response.json();
        container.innerHTML = '';
        
        if (repos.length === 0) {
            container.innerHTML = '<p class="col-12 text-center text-muted py-5">No projects found.</p>';
            return;
        }

        // Create card for each project
        repos.forEach(repo => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 project-item'; // Responsive: 1 col mobile, 2 tablet, 3 desktop
            col.dataset.language = repo.language || 'Other';
            
            // Generate project image (placeholder with repo color)
            const imageUrl = getProjectImage(repo);
            
            col.innerHTML = `
                <div class="card project-card shadow-sm border-0 h-100">
                    <!-- Project Image -->
                    <div class="project-image-container">
                        <img src="${imageUrl}" class="card-img-top" alt="${repo.name}">
                        <div class="language-badge">${repo.language || 'Unknown'}</div>
                    </div>
                    
                    <div class="card-body p-4 d-flex flex-column">
                        <!-- Project title -->
                        <h5 class="card-title fw-bold mb-2">${repo.name}</h5>
                        
                        <!-- Project description -->
                        <p class="card-text text-muted mb-3 flex-grow-1">
                            ${repo.description || 'No description available.'}
                        </p>
                        
                        <!-- Project stats -->
                        <div class="d-flex gap-3 mb-3 text-muted small">
                            <span><i class="fas fa-star text-warning"></i> ${repo.stargazers_count}</span>
                            <span><i class="fas fa-code-branch text-info"></i> ${repo.forks_count}</span>
                            <span><i class="fas fa-clock"></i> ${getTimeAgo(repo.updated_at)}</span>
                        </div>
                        
                        <!-- Action buttons -->
                        <div class="d-flex gap-2">
                            <button onclick='showProjectDetail(${JSON.stringify(repo).replace(/'/g, "\\'")})' 
                                    class="btn btn-primary btn-sm flex-grow-1">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                            <a href="${repo.html_url}" target="_blank" 
                               class="btn btn-outline-primary btn-sm">
                                <i class="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
        
        // Setup filter functionality
        setupFilters();
    } catch (error) {
        container.innerHTML = '<p class="col-12 text-center text-danger py-5">Error loading projects. Please try again later.</p>';
    }
}

// ===== Helper function: Generate project image =====
function getProjectImage(repo) {
    // Create a deterministic color based on repo name
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '43e97b', 'fa709a', 'fee140', '30cfd0'];
    const colorIndex = repo.name.length % colors.length;
    const color1 = colors[colorIndex];
    const color2 = colors[(colorIndex + 1) % colors.length];
    
    // Return a gradient placeholder
    return `https://via.placeholder.com/400x250/${color1}/${color2}?text=${encodeURIComponent(repo.name)}`;
}

// ===== Helper function: Get time ago =====
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

// ===== Setup filter functionality =====
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filter projects
            projectItems.forEach(item => {
                if (filter === 'all' || item.dataset.language === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ===== Show project detail modal =====
function showProjectDetail(repo) {
    const imageUrl = getProjectImage(repo);
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="projectModal" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <!-- Modal header with image -->
                    <div class="modal-header border-0 p-0">
                        <img src="${imageUrl}" class="w-100" style="max-height: 300px; object-fit: cover;" alt="${repo.name}">
                        <button type="button" class="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2" 
                                data-bs-dismiss="modal" style="opacity: 1;"></button>
                    </div>
                    
                    <!-- Modal body -->
                    <div class="modal-body p-4">
                        <!-- Project title and language -->
                        <div class="mb-4">
                            <h3 class="fw-bold mb-2">${repo.name}</h3>
                            <div class="d-flex align-items-center gap-3">
                                <span class="badge bg-primary">${repo.language || 'Unknown'}</span>
                                <span class="text-muted">Updated ${getTimeAgo(repo.updated_at)}</span>
                            </div>
                        </div>
                        <!-- Project description -->
                        <div class="mb-4">
                            <h5 class="fw-semibold mb-2">Description</h5>
                            <p class="text-muted">${repo.description || 'No description available for this project.'}</p>
                        </div>
                        
                        <!-- Project stats -->
                        <div class="row g-3 mb-4">
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-star text-warning fs-4 mb-2"></i>
                                    <h4 class="mb-0">${repo.stargazers_count}</h4>
                                    <small class="text-muted">Stars</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-code-branch text-info fs-4 mb-2"></i>
                                    <h4 class="mb-0">${repo.forks_count}</h4>
                                    <small class="text-muted">Forks</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-eye text-primary fs-4 mb-2"></i>
                                    <h4 class="mb-0">${repo.watchers_count}</h4>
                                    <small class="text-muted">Watchers</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-exclamation-circle text-danger fs-4 mb-2"></i>
                                    <h4 class="mb-0">${repo.open_issues_count}</h4>
                                    <small class="text-muted">Issues</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Project details -->
                        <div class="mb-4">
                            <h5 class="fw-semibold mb-3">Project Details</h5>
                            <ul class="list-unstyled">
                                <li class="mb-2"><strong>Created:</strong> ${new Date(repo.created_at).toLocaleDateString()}</li>
                                <li class="mb-2"><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</li>
                                <li class="mb-2"><strong>Size:</strong> ${Math.round(repo.size / 1024)} MB</li>
                                <li class="mb-2"><strong>Default Branch:</strong> ${repo.default_branch}</li>
                                <li class="mb-2"><strong>License:</strong> ${repo.license?.name || 'No license'}</li>
                            </ul>
                        </div>
                        
                        <!-- Topics/Tags -->
                        ${repo.topics && repo.topics.length > 0 ? `
                        <div class="mb-4">
                            <h5 class="fw-semibold mb-3">Topics</h5>
                            <div class="d-flex flex-wrap gap-2">
                                ${repo.topics.map(topic => `
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2">${topic}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <!-- Modal footer -->
                    <div class="modal-footer border-0">
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary">
                            <i class="fab fa-github me-2"></i>View on GitHub
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="btn btn-outline-primary">
                                <i class="fas fa-external-link-alt me-2"></i>Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('projectModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('projectModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// ===== Initialize: Load projects when page loads =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
    fetchProjects();
}
