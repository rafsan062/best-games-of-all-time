// Data load + window listeners (entry point after feature modules)

Promise.all([
    d3.csv('data/metacritic_top_games.csv'),
    d3.json('data/game-posters.json').catch(() => ({})),
]).then(([data, posters]) => {
    window.gamePostersBySlug = posters && typeof posters === 'object' ? posters : {};
    data.forEach(d => {
        d.Metascore = +d.Metascore;
        const dateParts = d.ReleaseDate.split(' ');
        const year = parseInt(dateParts[dateParts.length - 1]);
        d.release_year = isNaN(year) ? null : year;
    });
    window.gameData = data.filter(d => d.release_year !== null);
    renderDashboard();
    initFilterBar();
}).catch(error => {
    console.error('Error loading CSV data:', error);
});

window.addEventListener('resize', () => {
    if (window.gameData.length > 0) renderDashboard();
});

const heroSection = document.getElementById('hero'), stickyBar = document.getElementById('sticky-bar');
window.addEventListener('scroll', () => {
    if (window.scrollY > heroSection.offsetHeight - 125) stickyBar.classList.add('visible'); else stickyBar.classList.remove('visible');
});
