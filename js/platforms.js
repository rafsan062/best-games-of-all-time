// Platform filter pills (colored bar + selection state)

function sortedPlatformData() {
    const gr = window.PLATFORM_GROUP_RANK || {};
    return [...PLATFORM_DATA].sort((a, b) => {
        const ga = gr[a.group] ?? 99;
        const gb = gr[b.group] ?? 99;
        if (ga !== gb) return ga - gb;
        const oa = a.order ?? 999;
        const ob = b.order ?? 999;
        if (oa !== ob) return oa - ob;
        return a.name.localeCompare(b.name);
    });
}

function renderPlatforms() {
    const grid = d3.select('#platform-grid');
    grid.selectAll('*').remove();
    grid.classed('has-selection', window.activePlatform !== null);

    const pills = grid.selectAll('.platform-pill')
        .data(sortedPlatformData())
        .enter()
        .append('div')
        .attr('class', d => `platform-pill ${window.activePlatform === d.name ? 'selected' : ''}`)
        .on('click', (event, d) => {
            window.activePlatform = (window.activePlatform === d.name) ? null : d.name;
            renderPlatforms();
            if (window.renderCards) window.renderCards();
        });

    pills.append('span').text(d => d.name);
    pills.append('div')
        .attr('class', 'platform-bar')
        .style('background-color', d => d.color);
}
