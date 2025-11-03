# Disney Movie Tracker

A beautiful, interactive web application to track your Disney movie watching journey. Rate movies, mark them as watched, and keep track of your progress through 100 classic and modern Disney films.

## Features

- **100 Disney Movies**: Comprehensive collection of both animated and live-action Disney classics
- **Rating System**: Rate each movie from 1-5 stars
- **Watch Status**: Track which movies you've watched
- **Smart Filtering**: Filter by movie type (animation/live-action) and watch status
- **Search**: Find movies by title, year, or featured song
- **Multiple Sorting Options**: Sort by title, year, or your rating
- **Statistics Dashboard**: View your watching progress at a glance
- **Local Storage**: All your data is saved locally in your browser
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **GitHub Pages Optimized**: Ready to deploy instantly

## Movie Database

The tracker includes 100 Disney movies spanning from 1937 to 2023:
- **56 Animated Films**: From Snow White to Wish
- **44 Live-Action Films**: From Mary Poppins to Haunted Mansion

Each movie includes:
- Title
- Release year
- Type (animation or live-action)
- Featured song

## How to Use

### Rating Movies
Click on the stars to rate a movie from 1-5 stars. Click the same rating again to remove it. Rating a movie automatically marks it as watched.

### Tracking Watch Status
Click the "Not Watched" button to mark a movie as watched. Click again to mark as not watched.

### Filtering Movies
- **Search**: Type in the search box to find movies by title, year, or song
- **Type Filter**: Show only animated or live-action movies
- **Status Filter**: View all movies, only watched, only unwatched, or only rated movies
- **Sort**: Organize movies by title (A-Z), year (oldest/newest first), or your ratings

### Statistics
The dashboard shows:
- Total number of movies
- How many you've watched
- How many remain unwatched
- Your average rating across all rated movies

## Local Deployment

1. Clone this repository
2. Open `index.html` in your web browser
3. Start tracking your Disney movie journey!

No build process or server required - it's a pure client-side application.

## GitHub Pages Deployment

### Option 1: Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select the branch (usually `main` or `master`)
5. Set the root directory as source
6. Save and wait a few minutes for deployment

Your site will be available at: `https://[your-username].github.io/[repository-name]/`

### Option 2: Using GitHub Actions (Automatic)

This repository is ready for automatic deployment via GitHub Actions when you push to the main branch.

## Data Storage

All your progress is stored locally in your browser using localStorage. This means:
- ✅ Your data persists between sessions
- ✅ No login required
- ✅ Complete privacy - data never leaves your browser
- ⚠️ Data is specific to each browser/device
- ⚠️ Clearing browser data will reset your progress

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript to be enabled.

## File Structure

```
disney-movie-tracker/
│
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── app.js             # Application logic and local storage management
├── movies.json        # Database of 100 Disney movies
└── README.md          # This file
```

## Technical Details

- **Pure JavaScript**: No frameworks or libraries required
- **Local Storage API**: For persistent data storage
- **Responsive Grid Layout**: CSS Grid and Flexbox
- **Modern ES6+**: Uses classes, async/await, and modern JavaScript features
- **Optimized Performance**: Minimal file sizes, efficient rendering

## Future Enhancements

Potential features for future versions:
- Export/import progress as JSON
- Share your ratings with friends
- Movie posters and images
- Filtering by decade
- Custom lists and collections
- Dark mode toggle
- Movie recommendations based on ratings

## License

This is a fan project for educational and personal use. All Disney movie titles, songs, and related content are property of The Walt Disney Company.

## Contributing

Feel free to fork this project and add your own improvements! Some ideas:
- Add more movies (Pixar, Disney+, Marvel, Star Wars)
- Implement additional filtering options
- Add movie plot summaries
- Include streaming availability information
- Create shareable movie lists

## Credits

Created as a fun way to track Disney movie watching progress. Perfect for Disney fans, families planning movie nights, or anyone working through the Disney catalog!

---

**Enjoy your magical Disney movie journey!** ✨
