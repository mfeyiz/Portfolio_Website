async function fetchProjects() {
    const username = 'mfeyiz';
    const container = document.getElementById('projects-container');
    
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`);
        
        if (!response.ok) throw new Error('API error');
        
        const repos = await response.json();
        container.innerHTML = '';
        
        if (repos.length === 0) {
            container.innerHTML = '<p class="col-12 text-center text-muted py-5">No projects found.</p>';
            return;
        }

        repos.forEach(repo => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 project-item';
            col.dataset.language = repo.language || 'Other';
            
            const imageUrl = getProjectImage(repo);
            
            col.innerHTML = `
                <div class="card project-card shadow-sm border-0 h-100">
                    <div class="project-image-container">
                        <img src="${imageUrl}" class="card-img-top" alt="${repo.name}">
                        <div class="language-badge">${repo.language || 'Unknown'}</div>
                    </div>
                    
                    <div class="card-body p-4 d-flex flex-column">
                        <h5 class="card-title fw-bold mb-2">${repo.name}</h5>
                        <p class="card-text text-muted mb-3 flex-grow-1">
                            ${repo.description || 'No description available.'}
                        </p>
                        
                        <div class="d-flex gap-3 mb-3 text-muted small">
                            <span><i class="fas fa-star text-warning"></i> ${repo.stargazers_count}</span>
                            <span><i class="fas fa-code-branch text-info"></i> ${repo.forks_count}</span>
                            <span><i class="fas fa-clock"></i> ${getTimeAgo(repo.updated_at)}</span>
                        </div>
                        
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
        
        setupFilters();
    } catch (error) {
        container.innerHTML = '<p class="col-12 text-center text-danger py-5">Error loading projects. Please try again later.</p>';
    }
}

function getProjectImage(repo) {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '43e97b', 'fa709a', 'fee140', '30cfd0'];
    const colorIndex = repo.name.length % colors.length;
    const color1 = colors[colorIndex];
    const color2 = colors[(colorIndex + 1) % colors.length];
    
    return `https://via.placeholder.com/400x250/${color1}/${color2}?text=${encodeURIComponent(repo.name)}`;
}

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

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            projectItems.forEach(item => {
                const itemLanguage = item.dataset.language;
                if (filter === 'all' || itemLanguage === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

async function showProjectDetail(repo) {
    const imageUrl = getProjectImage(repo);
    
    let readmeContent = '';
    try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, {
            headers: { 'Accept': 'application/vnd.github.v3.html' }
        });
        if (readmeResponse.ok) {
            readmeContent = await readmeResponse.text();
        }
    } catch (e) {
        readmeContent = '<p class="text-muted">README not available.</p>';
    }
    
    const modalHTML = `
        <div class="modal fade" id="projectModal" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header border-0 p-4">
                        <div class="d-flex align-items-center gap-3 flex-grow-1">
                            <img src="${imageUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 10px;" alt="${repo.name}">
                            <div>
                                <h3 class="fw-bold mb-1">${repo.name}</h3>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge bg-primary">${repo.language || 'Unknown'}</span>
                                    <span class="text-muted small">Updated ${getTimeAgo(repo.updated_at)}</span>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    
                    <div class="modal-body p-4">
                        ${repo.description ? `
                        <div class="alert alert-info border-0 mb-4">
                            <i class="fas fa-info-circle me-2"></i>${repo.description}
                        </div>
                        ` : ''}
                        
                        <div class="row g-3 mb-4">
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-star text-warning fs-3 mb-2"></i>
                                    <h4 class="mb-0 fw-bold">${repo.stargazers_count}</h4>
                                    <small class="text-muted">Stars</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-code-branch text-info fs-3 mb-2"></i>
                                    <h4 class="mb-0 fw-bold">${repo.forks_count}</h4>
                                    <small class="text-muted">Forks</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-eye text-primary fs-3 mb-2"></i>
                                    <h4 class="mb-0 fw-bold">${repo.watchers_count}</h4>
                                    <small class="text-muted">Watchers</small>
                                </div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-center p-3 bg-light rounded-3">
                                    <i class="fas fa-exclamation-circle text-danger fs-3 mb-2"></i>
                                    <h4 class="mb-0 fw-bold">${repo.open_issues_count}</h4>
                                    <small class="text-muted">Issues</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row g-4 mb-4">
                            <div class="col-md-6">
                                <div class="card border-0 bg-light h-100">
                                    <div class="card-body">
                                        <h5 class="fw-semibold mb-3"><i class="fas fa-calendar-alt me-2 text-primary"></i>Timeline</h5>
                                        <ul class="list-unstyled mb-0">
                                            <li class="mb-2"><strong>Created:</strong> ${new Date(repo.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                                            <li class="mb-2"><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                                            <li class="mb-2"><strong>Last Pushed:</strong> ${new Date(repo.pushed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-0 bg-light h-100">
                                    <div class="card-body">
                                        <h5 class="fw-semibold mb-3"><i class="fas fa-cog me-2 text-primary"></i>Details</h5>
                                        <ul class="list-unstyled mb-0">
                                            <li class="mb-2"><strong>Size:</strong> ${(repo.size / 1024).toFixed(2)} MB</li>
                                            <li class="mb-2"><strong>Branch:</strong> ${repo.default_branch}</li>
                                            <li class="mb-2"><strong>License:</strong> ${repo.license?.name || 'No license'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${repo.topics && repo.topics.length > 0 ? `
                        <div class="mb-4">
                            <h5 class="fw-semibold mb-3"><i class="fas fa-tags me-2"></i>Topics</h5>
                            <div class="d-flex flex-wrap gap-2">
                                ${repo.topics.map(topic => `
                                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 fs-6">${topic}</span>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${readmeContent ? `
                        <div class="mb-4">
                            <h5 class="fw-semibold mb-3"><i class="fab fa-readme me-2"></i>README</h5>
                            <div class="readme-content p-4 rounded-3 bg-light" style="max-height: 500px; overflow-y: auto;">
                                ${readmeContent}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-footer border-0 p-4 bg-light">
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary btn-lg px-4">
                            <i class="fab fa-github me-2"></i>View on GitHub
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="btn btn-outline-primary btn-lg px-4">
                                <i class="fas fa-external-link-alt me-2"></i>Live Demo
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('projectModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
    
    document.getElementById('projectModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchProjects);
} else {
    fetchProjects();
}
