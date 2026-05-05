// Game card grid: filtering, sorting, pagination, flip/back panel

const CARDS_GRID_CARD_WIDTH = 280;
const CARDS_GRID_GAP = 32;
const CARDS_ROWS_PER_PAGE = 5;

function cardsGridColumnCount(gridEl) {
    const section = document.getElementById('section-cards');
    const w = (gridEl && gridEl.clientWidth) || section?.clientWidth || document.documentElement.clientWidth || 1200;
    return Math.max(1, Math.floor((w + CARDS_GRID_GAP) / (CARDS_GRID_CARD_WIDTH + CARDS_GRID_GAP)));
}

/** Compact page list with ellipses (1 … 4 5 6 … 20). */
function cardsPaginationPageItems(current, total) {
    const delta = 2;
    const range = [];
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }
    const out = [];
    let l = 0;
    for (const i of range) {
        if (l) {
            if (i - l === 2) out.push(l + 1);
            else if (i - l > 1) out.push('…');
        }
        out.push(i);
        l = i;
    }
    return out;
}

function cardsPaginationHtml(current, totalPages, totalGames) {
    if (totalPages <= 1) return '';
    const items = cardsPaginationPageItems(current, totalPages);
    let html = '<div class="cards-pagination-inner">';
    html += `<button type="button" class="cards-page-btn cards-page-prev"${current <= 1 ? ' disabled' : ''} data-cards-page="${current - 1}" aria-label="Previous page">Previous</button>`;
    html += '<div class="cards-page-numbers" role="group" aria-label="Pages">';
    for (const it of items) {
        if (it === '…') {
            html += '<span class="cards-page-ellipsis" aria-hidden="true">…</span>';
        } else {
            const cur = it === current;
            html += `<button type="button" class="cards-page-btn${cur ? ' is-current' : ''}" data-cards-page="${it}"${cur ? ' aria-current="page"' : ''} aria-label="Page ${it}">${it}</button>`;
        }
    }
    html += '</div>';
    html += `<button type="button" class="cards-page-btn cards-page-next"${current >= totalPages ? ' disabled' : ''} data-cards-page="${current + 1}" aria-label="Next page">Next</button>`;
    html += `<span class="cards-pagination-meta">${totalGames} games</span>`;
    html += '</div>';
    return html;
}

/** Long titles use smaller type so rank, year, score, platform bar, and footer stay visible. */
function cardTitleSizeClass(title) {
    const len = String(title ?? '').length;
    if (len > 88) return 'card-title--extreme';
    if (len > 52) return 'card-title--longer';
    if (len > 34) return 'card-title--long';
    return '';
}

window.renderCards = function() {
    const grid = document.getElementById('cards-grid');
    const pag = document.getElementById('cards-pagination');
    if (!grid) return;

    let filtered = window.gameData;

    // 1. Filter by Genre
    if (window.activeGenre) {
        filtered = filtered.filter(d => d.Broad_Genre === window.activeGenre);
    }

    // 2. Filter by Decade (release year)
    if (window.activeDecade != null) {
        filtered = filtered.filter(
            (d) => Math.floor(d.release_year / 10) * 10 === window.activeDecade
        );
    }

    // 3. Filter by Platform
    if (window.activePlatform) {
        filtered = filtered.filter(d => d.Platforms && d.Platforms.includes(window.activePlatform));
    }

    // 4. Filter by Search
    if (window.activeSearch) {
        filtered = filtered.filter(d => d.Title.toLowerCase().includes(window.activeSearch));
    }

    // 5. Sort
    filtered.sort((a, b) => {
        if (window.activeSort === 'score-desc') return b.Metascore - a.Metascore;
        if (window.activeSort === 'score-asc') return a.Metascore - b.Metascore;
        if (window.activeSort === 'year-desc') return (b.release_year || 0) - (a.release_year || 0);
        if (window.activeSort === 'year-asc') return (a.release_year || 0) - (b.release_year || 0);
        return 0;
    });

    const filterKey = [
        window.activeGenre || '',
        window.activeDecade != null ? String(window.activeDecade) : '',
        window.activePlatform || '',
        window.activeSort || '',
        window.activeSearch || '',
    ].join('\0');
    if (window._cardsFilterKey !== filterKey) {
        window._cardsFilterKey = filterKey;
        window.cardsPage = 1;
    }

    if (!window.cardsPage || window.cardsPage < 1) window.cardsPage = 1;

    const cols = cardsGridColumnCount(grid);
    const perPage = cols * CARDS_ROWS_PER_PAGE;
    const totalPages = filtered.length === 0 ? 0 : Math.max(1, Math.ceil(filtered.length / perPage));
    if (totalPages === 0) {
        window.cardsPage = 1;
    } else if (window.cardsPage > totalPages) {
        window.cardsPage = totalPages;
    }
    if (window.cardsPage < 1) window.cardsPage = 1;

    const start = (window.cardsPage - 1) * perPage;
    const pageGames = filtered.slice(start, start + perPage);

    if (pag) {
        pag.innerHTML = cardsPaginationHtml(window.cardsPage, totalPages, filtered.length);
        if (!pag.dataset.cardsPagerBound) {
            pag.dataset.cardsPagerBound = '1';
            pag.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-cards-page]');
                if (!btn || btn.disabled) return;
                const p = parseInt(btn.getAttribute('data-cards-page'), 10);
                if (!Number.isFinite(p) || p < 1) return;
                window.cardsPage = p;
                if (window.renderCards) window.renderCards();
                document.getElementById('section-cards')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    const escapeAttr = (v) => String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/\r?\n/g, ' ');

    const escapeHtml = (v) => {
        const d = document.createElement('div');
        d.textContent = String(v ?? '');
        return d.innerHTML;
    };

    const formatPlatformsColored = (platformsCsv) => {
        if (!platformsCsv || !String(platformsCsv).trim()) return '';
        const parts = String(platformsCsv)
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        if (parts.length === 0) return '';
        return parts
            .map((name) => {
                const pd = PLATFORM_DATA.find((x) => x.name === name);
                const color = pd ? pd.color : 'rgba(255, 255, 255, 0.92)';
                return `<span class="card-back-platform-name" style="color: ${escapeAttr(color)}">${escapeHtml(name)}</span>`;
            })
            .join('<span class="card-back-platform-sep" aria-hidden="true">, </span>');
    };

    // Render HTML (one page of cards; rank is global within current filters)
    grid.innerHTML = pageGames.map((game, index) => {
        const globalRank = start + index + 1;
        const genreColor = GENRE_COLORS[game.Broad_Genre] || '#999';
        const genreRgb = hexToRgb(genreColor);
        const slugMatch = String(game.Link || '').match(/metacritic\.com\/game\/([^/]+)\/?/i);
        const slug = slugMatch ? slugMatch[1].toLowerCase() : '';
        const posterUrl = (window.gamePostersBySlug && window.gamePostersBySlug[slug])
            || (game.Poster && String(game.Poster).trim())
            || '';
        const posterHtml = posterUrl
            ? `<div class="card-front-poster" style="--poster-img: url(&quot;${escapeAttr(posterUrl)}&quot;);" aria-hidden="true"></div>`
            : '';

        // HP Bar Platform Logic: Exactly 10 slots, filled from the left
        const supportedPlatforms = game.Platforms.split(',').map(p => p.trim());
        let platformHtml = '';
        
        for (let i = 0; i < 10; i++) {
            if (i < supportedPlatforms.length) {
                const pName = supportedPlatforms[i];
                const pData = PLATFORM_DATA.find(pd => pd.name === pName);
                const color = pData ? pData.color : '#444';
                platformHtml += `<div class="platform-segment" style="background: ${color}; width: 22px; height: 10px; border-radius: 5px; flex-shrink: 0;"></div>`;
            } else {
                // Empty slots
                platformHtml += `<div class="platform-segment" style="background: rgba(255,255,255,0.12); width: 22px; height: 10px; border-radius: 5px; flex-shrink: 0;"></div>`;
            }
        }

        return `
            <div class="game-card" style="--genre-color: ${genreColor}; --genre-color-rgb: ${genreRgb}"
                data-description="${escapeAttr(game.Description)}"
                data-link="${escapeAttr(game.Link)}"
                data-platforms="${escapeAttr(game.Platforms)}"
                data-genre="${escapeAttr(game.Broad_Genre)}">
                <div class="card-inner">
                    <div class="card-front">
                        ${posterHtml}
                        <div class="card-rank">#${globalRank}</div>
                        <div class="card-year-tab">${game.release_year || ''}</div>
                        <div class="card-body">
                            <h3 class="card-title ${cardTitleSizeClass(game.Title)}">${escapeHtml(game.Title)}</h3>
                            <div class="card-score">${game.Metascore}</div>
                        </div>
                        <div class="card-platform-bar">${platformHtml}</div>
                        <div class="card-footer">
                            <span class="card-genre-tag">${game.Broad_Genre}</span>
                            <span class="card-publisher">${game.Publisher || ''}</span>
                        </div>
                    </div>
                    <div class="card-back"></div>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.game-card').forEach(card => {
        const back = card.querySelector('.card-back');
        const title = card.querySelector('.card-title')?.textContent ?? '';
        const desc = card.getAttribute('data-description') || '';
        const link = card.getAttribute('data-link') || '#';
        const platforms = card.getAttribute('data-platforms') || '';
        const genre = card.getAttribute('data-genre') || '';

        back.innerHTML = `
            <div class="card-back-content">
                <span class="card-genre-tag">${escapeHtml(genre)}</span>
                <h3 class="card-title ${cardTitleSizeClass(title)}">${escapeHtml(title)}</h3>
                <p class="card-back-platforms-text">${formatPlatformsColored(platforms)}</p>
                <div class="card-back-description">${escapeHtml(desc)}</div>
                <a class="card-back-link" href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">View on Metacritic ↗</a>
            </div>
        `;

        const syncDescScrollHint = () => {
            const d = back.querySelector('.card-back-description');
            if (!d) return;
            d.classList.toggle('card-back-description--scrollable', d.scrollHeight > d.clientHeight + 1);
        };
        syncDescScrollHint();
        requestAnimationFrame(syncDescScrollHint);
        if (typeof ResizeObserver !== 'undefined') {
            const d = back.querySelector('.card-back-description');
            if (d) new ResizeObserver(syncDescScrollHint).observe(d);
        }

        card.addEventListener('click', (e) => {
            const t = e.target;
            const el = t.nodeType === Node.ELEMENT_NODE ? t : t.parentElement;
            if (el && el.closest('.card-back-link')) return;
            card.classList.toggle('flipped');
            requestAnimationFrame(syncDescScrollHint);
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('flipped');
        });
    });
};
