// D3 genre composition chart (left) + legend

function renderPieChart() {
    const container = d3.select('#chart-left');
    container.selectAll('*').remove();
    const { width, height } = container.node().getBoundingClientRect();

    container.append('div')
        .attr('class', 'chart-title')
        .html('Which <span class="accent-text">Genres</span> Rule the All-Time List?');

    const availableHeight = height - 180;
    const radius = Math.min(width / 2.2, availableHeight) - 20;
    const svgHeight = radius + 20;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${radius + 10})`);

    const genreCounts = d3.rollup(window.gameData, v => v.length, d => d.Broad_Genre);
    const pieData = Array.from(genreCounts, ([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const totalGames = d3.sum(pieData, d => d.value);
    const pie = d3.pie().value(d => d.value).startAngle(-Math.PI / 2).endAngle(Math.PI / 2).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.4).outerRadius(radius).cornerRadius(12).padAngle(0.02);

    const centerY = -radius * 0.15;
    const centerText = svg.append('g').attr('class', 'center-text-group').attr('transform', `translate(0, ${centerY})`);
    const mainValue = centerText.append('text').attr('class', 'center-value').attr('text-anchor', 'middle').attr('dy', '0em').style('font-size', '36px').style('font-weight', '900').style('fill', '#fff').text(totalGames);
    const subValue = centerText.append('text').attr('class', 'center-sub').attr('text-anchor', 'middle').attr('dy', '1.4em').style('font-size', '14px').style('fill', 'rgba(255,255,255,0.6)').text('games');

    const slicesG = svg.append('g').attr('class', 'pie-slices');
    const slices = slicesG.selectAll('path').data(pie(pieData)).enter().append('path')
        .attr('d', arc)
        .attr('fill', d => GENRE_COLORS[d.data.name] || '#ccc')
        .attr('stroke', 'none')
        .style('opacity', 0)
        .style('cursor', 'pointer');

    slices.transition('intro').duration(300).delay((d, i) => i * 20).ease(d3.easeCubicOut).style('opacity', 1);

    const total = d3.sum(pieData, d => d.value);
    const labelsG = svg.append('g').attr('class', 'pie-percent-labels').style('pointer-events', 'none');
    const pieArcData = pie(pieData);
    const labelGroups = labelsG.selectAll('g.percent-wrap')
        .data(pieArcData.filter((d) => (d.data.value / total) * 100 > 4))
        .enter()
        .append('g')
        .attr('class', 'percent-wrap')
        .attr('transform', (d) => {
            const [x, y] = arc.centroid(d);
            return `translate(${x},${y})`;
        })
        .style('opacity', 0);

    labelGroups
        .append('text')
        .attr('class', 'percent')
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#fff')
        .style('font-weight', '500')
        .text((d) => `${Math.round((d.data.value / total) * 100)}%`);

    labelGroups
        .transition('intro')
        .duration(200)
        .delay((d) => pieArcData.indexOf(d) * 20 + 100)
        .ease(d3.easeCubicOut)
        .style('opacity', 1);

    const slicePopOffset = 8;

    slices.on('mouseenter', function (event, d) {
        const path = d3.select(this);
        path.interrupt('hover');
        const [cx, cy] = arc.centroid(d);
        const len = Math.hypot(cx, cy) || 1;
        const dx = (cx / len) * slicePopOffset;
        const dy = (cy / len) * slicePopOffset;
        path.raise()
            .transition('hover')
            .duration(140)
            .ease(d3.easeCubicOut)
            .attr('transform', `translate(${dx},${dy})`)
            .style('filter', 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))');

        labelsG.selectAll('g.percent-wrap')
            .filter((fd) => fd.data.name === d.data.name)
            .interrupt('hover')
            .transition('hover')
            .duration(140)
            .ease(d3.easeCubicOut)
            .attr('transform', (fd) => {
                const [x, y] = arc.centroid(fd);
                return `translate(${x + dx},${y + dy})`;
            });

        centerText.interrupt('hover');
        centerText.transition('hover').duration(100).style('opacity', 0).attr('transform', `translate(0, ${centerY - 10})`)
            .on('end', () => {
                mainValue.text('').selectAll('*').remove();
                const genreName = d.data.name;
                if (genreName === 'Action & Adventure') {
                    mainValue.style('font-size', '18px').attr('dy', '-1.5em');
                    mainValue.append('tspan').attr('x', 0).attr('dy', '0em').text('Action &');
                    mainValue.append('tspan').attr('x', 0).attr('dy', '1.2em').text('Adventure');
                    subValue.attr('dy', '3.0em').text(`${d.data.value} games`);
                } else {
                    mainValue.style('font-size', '20px').attr('dy', '0.2em').text(genreName);
                    subValue.attr('dy', '1.6em').text(`${d.data.value} games`);
                }
                centerText.attr('transform', `translate(0, ${centerY + 15})`);
                centerText.transition('hover').duration(250).ease(d3.easeCubicOut).style('opacity', 1).attr('transform', `translate(0, ${centerY})`);
            });
    })
    .on('mouseleave', function () {
        const d = d3.select(this).datum();
        d3.select(this).interrupt('hover').transition('hover')
            .duration(140)
            .ease(d3.easeCubicOut)
            .attr('transform', 'translate(0,0)')
            .style('filter', 'none');

        if (d) {
            labelsG.selectAll('g.percent-wrap')
                .filter((fd) => fd.data.name === d.data.name)
                .interrupt('hover')
                .transition('hover')
                .duration(140)
                .ease(d3.easeCubicOut)
                .attr('transform', (fd) => {
                    const [x, y] = arc.centroid(fd);
                    return `translate(${x},${y})`;
                });
        }

        centerText.interrupt('hover');
        centerText.transition('hover').duration(100).style('opacity', 0).attr('transform', `translate(0, ${centerY - 10})`)
            .on('end', () => {
                mainValue.text('').selectAll('*').remove();
                mainValue.style('font-size', '36px').attr('dy', '0em').text(totalGames);
                subValue.attr('dy', '1.4em').text('games');
                centerText.attr('transform', `translate(0, ${centerY + 15})`);
                centerText.transition('hover').duration(250).ease(d3.easeCubicOut).style('opacity', 1).attr('transform', `translate(0, ${centerY})`);
            });
    })
    .on('click', (event, d) => handleCategoryClick(d.data.name, 'genre'));

    renderLegend(container);
}

function renderLegend(container) {
    const legendContainer = container.append('div').attr('id', 'chart-legend');
    const genres = Object.keys(GENRE_COLORS);
    const legendItems = legendContainer.selectAll('.legend-item').data(genres).enter().append('div').attr('class', 'legend-item').style('opacity', 0);
    legendItems.append('div').attr('class', 'legend-color').style('background-color', d => GENRE_COLORS[d]);
    legendItems.append('span').attr('class', 'legend-label').text(d => d);
    legendItems.transition('intro').duration(300).delay((d, i) => i * 10).ease(d3.easeCubicOut).style('opacity', 1);
}
