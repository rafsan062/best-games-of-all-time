// Side panel: chart drill-down list + About content + open/close wiring

function handleCategoryClick(value, type) {
    let filteredGames = (type === 'genre') ? window.gameData.filter(g => g.Broad_Genre === value) : window.gameData.filter(g => Math.floor(g.release_year / 10) * 10 === value);
    const top20 = filteredGames.sort((a, b) => b.Metascore - a.Metascore).slice(0, 20);
    showDetailsPanel(type === 'genre' ? `Top ${value} Games` : `Top Games from the ${value}s`, top20);
}

function showDetailsPanel(title, games) {
    const panel = document.getElementById('details-panel'), overlay = document.getElementById('panel-overlay'), titleEl = document.getElementById('panel-title'), listEl = document.getElementById('panel-list');
    if (!panel || !overlay || !titleEl || !listEl) return;
    titleEl.innerText = title;
    listEl.className = 'games-list';
    listEl.innerHTML = '';
    games.forEach(game => {
        let scoreColor = game.Metascore >= 90 ? '#66cc33' : (game.Metascore >= 75 ? '#ffcc33' : '#ff0000');
        const item = document.createElement('div');
        item.className = 'game-detail-item';
        item.innerHTML = `<div class="game-detail-score" style="background: ${scoreColor}">${game.Metascore}</div><div class="game-detail-info"><span class="game-detail-title">${game.Title}</span><span class="game-detail-meta">${game.Platforms} • ${game.ReleaseDate}</span></div>`;
        listEl.appendChild(item);
    });
    panel.classList.add('visible'); overlay.classList.add('visible');
}

function showProjectAboutPanel() {
    const panel = document.getElementById('details-panel'), overlay = document.getElementById('panel-overlay'), titleEl = document.getElementById('panel-title'), listEl = document.getElementById('panel-list');
    if (!panel || !overlay || !titleEl || !listEl) return;
    titleEl.textContent = 'About This Project';
    listEl.className = 'games-list panel-about';
    listEl.innerHTML = `
        <div class="panel-about-section">
            <div class="panel-about-label">DATASET</div>
            <p class="panel-about-body">Makeover Monday (Data World, 2025 W21): 384 games with Metascore ≥ 90—title, score, release date, genre, platform, publisher, developer, description. <a href="https://data.world/makeovermonday/2025w21-metacritic-best-games-of-all-time" target="_blank" rel="noopener">Source</a></p>
        </div>
        <div class="panel-about-divider" aria-hidden="true"></div>
        <div class="panel-about-section">
            <div class="panel-about-label">ORIGINAL VIZ</div>
            <p class="panel-about-body">Metacritic’s <a href="https://www.metacritic.com/browse/game/" target="_blank" rel="noopener">ranked list</a>: score-sorted cards; genre, year, and platform are mostly text or hidden in cover art—little structure for comparison or filtering.</p>
        </div>
        <div class="panel-about-divider" aria-hidden="true"></div>
        <div class="panel-about-section">
            <div class="panel-about-label">CREDITS</div>
            <p class="panel-about-body">Posters via <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a> API (illustration only; scores &amp; metadata from the dataset). Google Fonts; D3 v7.</p>
        </div>
        <div class="panel-about-divider" aria-hidden="true"></div>
        <div class="panel-about-section">
            <div class="panel-about-label">COURSE &amp; AI</div>
            <p class="panel-about-body">VA5 · Makeover Monday · SeattleU CSPC 5320 Visual Analytics. All design and analysis by the author; Claude and Cursor were used for JavaScript/CSS implementation only, with manual review. <a href="https://d3js.org" target="_blank" rel="noopener">d3js.org</a></p>
        </div>`;
    panel.classList.add('visible');
    overlay.classList.add('visible');
}

function closeDetailsPanel() {
    const panel = document.getElementById('details-panel'), overlay = document.getElementById('panel-overlay');
    if (panel) panel.classList.remove('visible'); if (overlay) overlay.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.panel-close'), overlay = document.getElementById('panel-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeDetailsPanel);
    if (overlay) overlay.addEventListener('click', closeDetailsPanel);
    const infoBtn = document.getElementById('floating-info-btn');
    if (infoBtn) infoBtn.addEventListener('click', showProjectAboutPanel);
});
