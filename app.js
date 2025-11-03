// Disney Movie Tracker App
class DisneyMovieTracker {
    constructor() {
        this.movies = [];
        this.userProgress = this.loadProgress();
        this.filteredMovies = [];
        this.init();
    }

    async init() {
        await this.loadMovies();
        this.setupEventListeners();
        this.renderMovies();
        this.updateStats();
    }

    // Load movies from JSON file
    async loadMovies() {
        try {
            const response = await fetch('movies.json');
            this.movies = await response.json();
            this.filteredMovies = [...this.movies];
        } catch (error) {
            console.error('Error loading movies:', error);
            this.showError();
        }
    }

    // Load user progress from localStorage
    loadProgress() {
        const saved = localStorage.getItem('disneyMovieProgress');
        return saved ? JSON.parse(saved) : {};
    }

    // Save user progress to localStorage
    saveProgress() {
        localStorage.setItem('disneyMovieProgress', JSON.stringify(this.userProgress));
        this.updateStats();
    }

    // Setup event listeners
    setupEventListeners() {
        // Search
        document.getElementById('search').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Type filter
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.applyFilters();
        });

        // Sort
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.handleSort(e.target.value);
        });

        // Modal close
        const modal = document.getElementById('movieModal');
        const closeBtn = document.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Handle search
    handleSearch(query) {
        this.applyFilters();
    }

    // Apply all filters
    applyFilters() {
        const searchQuery = document.getElementById('search').value.toLowerCase();
        const typeFilter = document.getElementById('typeFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredMovies = this.movies.filter(movie => {
            // Search filter
            const matchesSearch =
                movie.title.toLowerCase().includes(searchQuery) ||
                movie.song.toLowerCase().includes(searchQuery) ||
                movie.year.toString().includes(searchQuery);

            // Type filter
            const matchesType = typeFilter === 'all' || movie.type === typeFilter;

            // Status filter
            let matchesStatus = true;
            if (statusFilter === 'watched') {
                matchesStatus = this.userProgress[movie.id]?.watched === true;
            } else if (statusFilter === 'unwatched') {
                matchesStatus = !this.userProgress[movie.id]?.watched;
            } else if (statusFilter === 'rated') {
                matchesStatus = this.userProgress[movie.id]?.rating > 0;
            }

            return matchesSearch && matchesType && matchesStatus;
        });

        this.handleSort(document.getElementById('sortBy').value);
    }

    // Handle sorting
    handleSort(sortBy) {
        switch(sortBy) {
            case 'title':
                this.filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'year-asc':
                this.filteredMovies.sort((a, b) => a.year - b.year);
                break;
            case 'year-desc':
                this.filteredMovies.sort((a, b) => b.year - a.year);
                break;
            case 'rating':
                this.filteredMovies.sort((a, b) => {
                    const ratingA = this.userProgress[a.id]?.rating || 0;
                    const ratingB = this.userProgress[b.id]?.rating || 0;
                    return ratingB - ratingA;
                });
                break;
        }
        this.renderMovies();
    }

    // Render movies to the grid
    renderMovies() {
        const grid = document.getElementById('movieGrid');

        if (this.filteredMovies.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>No movies found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredMovies.map(movie => {
            const progress = this.userProgress[movie.id] || { watched: false, rating: 0 };
            return this.createMovieCard(movie, progress);
        }).join('');

        // Add event listeners to all movie cards
        this.attachCardListeners();
    }

    // Create movie card HTML
    createMovieCard(movie, progress) {
        const stars = this.createStarRating(movie.id, progress.rating);
        const watchedClass = progress.watched ? 'watched' : 'not-watched';
        const watchedText = progress.watched ? '✓ Watched' : 'Not Watched';

        return `
            <div class="movie-card" data-movie-id="${movie.id}">
                <div class="movie-header">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-year">${movie.year}</div>
                </div>
                <div class="movie-body">
                    <span class="movie-type ${movie.type}">${movie.type}</span>
                    <div class="movie-song">${movie.song}</div>

                    <div class="movie-rating">
                        <div class="rating-display">
                            <div class="stars" data-movie-id="${movie.id}">
                                ${stars}
                            </div>
                            ${progress.rating > 0 ? `<span class="rating-text">${progress.rating}/5</span>` : ''}
                        </div>
                    </div>

                    <div class="watch-status">
                        <button class="watch-toggle ${watchedClass}" data-movie-id="${movie.id}">
                            ${watchedText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Create star rating HTML
    createStarRating(movieId, rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating ? 'filled' : 'empty';
            stars += `<span class="star ${filled}" data-rating="${i}">★</span>`;
        }
        return stars;
    }

    // Attach event listeners to movie cards
    attachCardListeners() {
        // Watch toggle buttons
        document.querySelectorAll('.watch-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieId = parseInt(btn.dataset.movieId);
                this.toggleWatched(movieId);
            });
        });

        // Star ratings
        document.querySelectorAll('.stars').forEach(starsContainer => {
            const movieId = parseInt(starsContainer.dataset.movieId);
            const stars = starsContainer.querySelectorAll('.star');

            stars.forEach(star => {
                star.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rating = parseInt(star.dataset.rating);
                    this.setRating(movieId, rating);
                });

                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, parseInt(star.dataset.rating));
                });
            });

            starsContainer.addEventListener('mouseleave', () => {
                const currentRating = this.userProgress[movieId]?.rating || 0;
                this.highlightStars(stars, currentRating);
            });
        });
    }

    // Highlight stars on hover
    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('empty');
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
                star.classList.add('empty');
            }
        });
    }

    // Toggle watched status
    toggleWatched(movieId) {
        if (!this.userProgress[movieId]) {
            this.userProgress[movieId] = { watched: false, rating: 0 };
        }
        this.userProgress[movieId].watched = !this.userProgress[movieId].watched;
        this.saveProgress();
        this.renderMovies();
    }

    // Set rating for a movie
    setRating(movieId, rating) {
        if (!this.userProgress[movieId]) {
            this.userProgress[movieId] = { watched: false, rating: 0 };
        }

        // If clicking the same rating, remove it
        if (this.userProgress[movieId].rating === rating) {
            this.userProgress[movieId].rating = 0;
        } else {
            this.userProgress[movieId].rating = rating;
            // Automatically mark as watched when rated
            this.userProgress[movieId].watched = true;
        }

        this.saveProgress();
        this.renderMovies();
    }

    // Update statistics
    updateStats() {
        const totalMovies = this.movies.length;
        const watchedMovies = Object.values(this.userProgress).filter(p => p.watched).length;
        const unwatchedMovies = totalMovies - watchedMovies;

        // Calculate average rating
        const ratings = Object.values(this.userProgress)
            .map(p => p.rating)
            .filter(r => r > 0);
        const avgRating = ratings.length > 0
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : '-';

        document.getElementById('totalMovies').textContent = totalMovies;
        document.getElementById('watchedCount').textContent = watchedMovies;
        document.getElementById('unwatchedCount').textContent = unwatchedMovies;
        document.getElementById('avgRating').textContent = avgRating;
    }

    // Show error message
    showError() {
        const grid = document.getElementById('movieGrid');
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Error loading movies</h3>
                <p>Please refresh the page to try again</p>
            </div>
        `;
    }

    // Export progress (bonus feature)
    exportProgress() {
        const dataStr = JSON.stringify(this.userProgress, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'disney-movie-progress.json';
        link.click();
    }

    // Import progress (bonus feature)
    importProgress(jsonData) {
        try {
            this.userProgress = JSON.parse(jsonData);
            this.saveProgress();
            this.renderMovies();
            alert('Progress imported successfully!');
        } catch (error) {
            alert('Error importing progress. Please check the file format.');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.movieTracker = new DisneyMovieTracker();
});
