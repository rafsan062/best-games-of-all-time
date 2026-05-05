// Filter bar: genre / decade / sort dropdowns + search

function decadeStart(year) {
    return Math.floor(year / 10) * 10;
}

function decadeFilterOptions() {
    const decades = new Set();
    window.gameData.forEach((d) => {
        if (d.release_year != null) decades.add(decadeStart(d.release_year));
    });
    return ["All Decades", ...Array.from(decades).sort((a, b) => a - b)];
}

function initFilterBar() {
    const genrePill = document.getElementById('genre-pill');
    const genrePanel = document.getElementById('genre-panel');
    const decadePill = document.getElementById('decade-pill');
    const decadePanel = document.getElementById('decade-panel');
    const sortPill = document.getElementById('sort-pill');
    const sortPanel = document.getElementById('sort-panel');
    const gameSearch = document.getElementById('game-search');

    // Genre Options
    const genres = ["All Genres", ...Object.keys(GENRE_COLORS)];
    genrePanel.innerHTML = genres.map(g => `
        <div class="dropdown-option ${g === (window.activeGenre || 'All Genres') ? 'selected' : ''}" data-value="${g}">
            <div class="option-left">
                ${g !== 'All Genres' ? `<div class="genre-circle" style="background: ${GENRE_COLORS[g]}"></div>` : ''}
                <span>${g}</span>
            </div>
            <svg class="checkmark" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
        </div>
    `).join('');

    // Decade Options
    const decadeChoices = decadeFilterOptions();
    decadePanel.innerHTML = decadeChoices.map((dec) => {
        const selected =
            dec === 'All Decades'
                ? window.activeDecade == null
                : window.activeDecade === dec;
        const label = dec === 'All Decades' ? 'All Decades' : `${dec}s`;
        const dataVal = dec === 'All Decades' ? 'All Decades' : String(dec);
        return `
        <div class="dropdown-option ${selected ? 'selected' : ''}" data-value="${dataVal}">
            <div class="option-left"><span>${label}</span></div>
            <svg class="checkmark" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
        </div>
    `;
    }).join('');

    // Sort Options
    const sorts = [
        { id: "score-desc", label: "Highest Score" },
        { id: "score-asc", label: "Lowest Score" },
        { id: "year-desc", label: "Newest First" },
        { id: "year-asc", label: "Oldest First" }
    ];
    sortPanel.innerHTML = sorts.map(s => `
        <div class="dropdown-option ${s.id === window.activeSort ? 'selected' : ''}" data-value="${s.id}">
            <div class="option-left"><span>${s.label}</span></div>
            <svg class="checkmark" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>
        </div>
    `).join('');

    // Toggles
    genrePill.onclick = (e) => {
        e.stopPropagation();
        decadePanel.classList.remove('visible');
        sortPanel.classList.remove('visible');
        genrePanel.classList.toggle('visible');
    };
    decadePill.onclick = (e) => {
        e.stopPropagation();
        genrePanel.classList.remove('visible');
        sortPanel.classList.remove('visible');
        decadePanel.classList.toggle('visible');
    };
    sortPill.onclick = (e) => {
        e.stopPropagation();
        genrePanel.classList.remove('visible');
        decadePanel.classList.remove('visible');
        sortPanel.classList.toggle('visible');
    };
    document.onclick = () => {
        genrePanel.classList.remove('visible');
        decadePanel.classList.remove('visible');
        sortPanel.classList.remove('visible');
    };

    // Selection logic
    genrePanel.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.onclick = () => {
            const val = opt.getAttribute('data-value');
            window.activeGenre = (val === "All Genres") ? null : val;
            
            // Update UI
            const label = genrePill.querySelector('.pill-label');
            label.innerHTML = val === "All Genres" ? "All Genres" : `<div class="genre-circle" style="background: ${GENRE_COLORS[val]}; display: inline-block; margin-right: 8px;"></div>${val}`;
            genrePanel.querySelectorAll('.dropdown-option').forEach(o => o.classList.toggle('selected', o.getAttribute('data-value') === val));
            
            if (window.renderCards) window.renderCards();
        };
    });

    decadePanel.querySelectorAll('.dropdown-option').forEach((opt) => {
        opt.onclick = () => {
            const val = opt.getAttribute('data-value');
            window.activeDecade = val === 'All Decades' ? null : parseInt(val, 10);

            const label = decadePill.querySelector('.pill-label');
            label.textContent =
                val === 'All Decades' ? 'All Decades' : `${window.activeDecade}s`;

            decadePanel.querySelectorAll('.dropdown-option').forEach((o) =>
                o.classList.toggle(
                    'selected',
                    o.getAttribute('data-value') === val
                )
            );

            if (window.renderCards) window.renderCards();
        };
    });

    sortPanel.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.onclick = () => {
            const val = opt.getAttribute('data-value');
            window.activeSort = val;
            const sortObj = sorts.find(s => s.id === val);
            
            sortPill.querySelector('.pill-label').innerText = sortObj.label;
            sortPanel.querySelectorAll('.dropdown-option').forEach(o => o.classList.toggle('selected', o.getAttribute('data-value') === val));
            
            if (window.renderCards) window.renderCards();
        };
    });

    // Search input
    gameSearch.oninput = (e) => {
        window.activeSearch = e.target.value.toLowerCase();
        if (window.renderCards) window.renderCards();
    };
}
