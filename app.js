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
        this.updateRecommendations();
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
        this.updateRecommendations();
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

    // Update recommendations based on user's ratings
    updateRecommendations() {
        this.updateMovieRecommendations();
        this.updateSpotifyRecommendation();
    }

    // Generate movie recommendations
    updateMovieRecommendations() {
        const container = document.getElementById('movieRecommendations');

        // Get rated movies
        const ratedMovies = Object.entries(this.userProgress)
            .filter(([id, progress]) => progress.rating > 0)
            .map(([id, progress]) => ({
                id: parseInt(id),
                ...progress,
                movie: this.movies.find(m => m.id === parseInt(id))
            }));

        if (ratedMovies.length === 0) {
            container.innerHTML = '<p class="placeholder-text">Start rating movies to get personalized recommendations!</p>';
            return;
        }

        // Analyze user preferences
        const preferences = this.analyzePreferences(ratedMovies);

        // Get unwatched movies
        const unwatchedMovies = this.movies.filter(movie =>
            !this.userProgress[movie.id]?.watched
        );

        // Score and rank unwatched movies
        const recommendations = unwatchedMovies
            .map(movie => ({
                movie,
                score: this.calculateRecommendationScore(movie, preferences)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Top 5 recommendations

        // Render recommendations
        if (recommendations.length === 0) {
            container.innerHTML = '<p class="placeholder-text">You\'ve watched all movies! Amazing! 🎉</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommended-movie-item" onclick="window.movieTracker.scrollToMovie(${rec.movie.id})">
                <div class="movie-description-tooltip">
                    <div class="tooltip-description">${rec.movie.description}</div>
                </div>
                <div class="recommended-movie-info">
                    <div class="recommended-movie-title">${rec.movie.title}</div>
                    <div class="recommended-movie-meta">
                        ${rec.movie.year} • ${rec.movie.type} • ${rec.movie.song}
                    </div>
                </div>
                <div class="recommendation-score">${rec.score}%</div>
            </div>
        `).join('');
    }

    // Analyze user preferences
    analyzePreferences(ratedMovies) {
        const totalRatings = ratedMovies.length;

        // Calculate average rating by type
        const animationRatings = ratedMovies.filter(r => r.movie.type === 'animation');
        const liveActionRatings = ratedMovies.filter(r => r.movie.type === 'live-action');

        const avgAnimationRating = animationRatings.length > 0
            ? animationRatings.reduce((sum, r) => sum + r.rating, 0) / animationRatings.length
            : 0;

        const avgLiveActionRating = liveActionRatings.length > 0
            ? liveActionRatings.reduce((sum, r) => sum + r.rating, 0) / liveActionRatings.length
            : 0;

        // Calculate average rating by era
        const eras = {
            classic: ratedMovies.filter(r => r.movie.year < 1990),
            renaissance: ratedMovies.filter(r => r.movie.year >= 1990 && r.movie.year < 2010),
            modern: ratedMovies.filter(r => r.movie.year >= 2010)
        };

        const avgEraRatings = {};
        for (const [era, movies] of Object.entries(eras)) {
            avgEraRatings[era] = movies.length > 0
                ? movies.reduce((sum, r) => sum + r.rating, 0) / movies.length
                : 0;
        }

        // Find highest rated movies
        const highlyRated = ratedMovies.filter(r => r.rating >= 4);

        return {
            avgAnimationRating,
            avgLiveActionRating,
            avgEraRatings,
            highlyRated,
            preferredType: avgAnimationRating > avgLiveActionRating ? 'animation' : 'live-action',
            preferredEra: Object.entries(avgEraRatings).sort((a, b) => b[1] - a[1])[0]?.[0]
        };
    }

    // Calculate recommendation score for a movie
    calculateRecommendationScore(movie, preferences) {
        let score = 50; // Base score

        // Type preference (0-30 points)
        if (movie.type === preferences.preferredType) {
            const typeAvg = movie.type === 'animation'
                ? preferences.avgAnimationRating
                : preferences.avgLiveActionRating;
            score += (typeAvg / 5) * 30;
        }

        // Era preference (0-20 points)
        let era = 'classic';
        if (movie.year >= 2010) era = 'modern';
        else if (movie.year >= 1990) era = 'renaissance';

        if (preferences.avgEraRatings[era] > 0) {
            score += (preferences.avgEraRatings[era] / 5) * 20;
        }

        return Math.round(score);
    }

    // Scroll to a specific movie in the grid
    scrollToMovie(movieId) {
        // Clear filters to show all movies
        document.getElementById('search').value = '';
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('statusFilter').value = 'all';
        this.applyFilters();

        // Wait for render, then scroll
        setTimeout(() => {
            const movieCard = document.querySelector(`[data-movie-id="${movieId}"]`);
            if (movieCard) {
                movieCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                movieCard.style.animation = 'pulse 1s';
                setTimeout(() => {
                    movieCard.style.animation = '';
                }, 1000);
            }
        }, 100);
    }

    // Update Spotify recommendation
    updateSpotifyRecommendation() {
        const container = document.getElementById('spotifyRecommendation');

        // Get rated movies
        const ratedMovies = Object.entries(this.userProgress)
            .filter(([id, progress]) => progress.rating > 0)
            .map(([id, progress]) => ({
                id: parseInt(id),
                ...progress,
                movie: this.movies.find(m => m.id === parseInt(id))
            }))
            .sort((a, b) => b.rating - a.rating); // Sort by rating

        if (ratedMovies.length === 0) {
            container.innerHTML = '<p class="placeholder-text">Rate some movies to create your personalized playlist!</p>';
            return;
        }

        // Get songs from rated movies
        const songs = ratedMovies.map(r => r.movie.song);

        // Create Spotify search query
        const playlistName = `My Disney Soundtrack (${ratedMovies.length} songs)`;
        const searchQuery = songs.slice(0, 10).join(' OR '); // Limit to top 10 for URL length
        const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}`;

        // Show song list and Spotify button
        const songListHtml = ratedMovies.slice(0, 10).map(r => `
            <div class="song-item">
                <strong>${r.movie.song}</strong>
                <span>from ${r.movie.title} (${r.movie.year}) - ⭐ ${r.rating}/5</span>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="song-list">
                ${songListHtml}
                ${ratedMovies.length > 10 ? `<p class="text-secondary" style="font-size: 0.85rem; margin-top: 0.5rem;">...and ${ratedMovies.length - 10} more songs</p>` : ''}
            </div>
            <a href="${spotifySearchUrl}" target="_blank" rel="noopener noreferrer" class="spotify-button">
                <span class="spotify-icon">🎵</span>
                Open in Spotify
            </a>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.75rem;">
                Search for these ${ratedMovies.length} Disney songs on Spotify and create your playlist!
            </p>
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
