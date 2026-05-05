// D3 decade bar chart (right)

function renderBarChart() {
    const container = d3.select('#chart-right');
    container.selectAll('*').remove();
    const { width, height } = container.node().getBoundingClientRect();

    container.append('div').attr('class', 'chart-title').html('Which <span class="accent-text">Era</span> Produced the Most Greats?');

    const decadeCounts = d3.rollup(window.gameData, v => v.length, d => Math.floor(d.release_year / 10) * 10);
    const barData = Array.from(decadeCounts, ([decade, count]) => ({ decade, count })).filter(d => d.decade !== null).sort((a, b) => a.decade - b.decade);

    const margin = { top: 10, right: 80, bottom: 60, left: 100 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - 160;

    const svg = container.append('svg').attr('width', width).attr('height', chartHeight + margin.top + margin.bottom).append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    const y = d3.scaleBand().domain(barData.map(d => `${d.decade}s`)).range([0, chartHeight]).padding(0.4);
    const x = d3.scaleLinear().domain([0, d3.max(barData, d => d.count)]).range([0, chartWidth]);

    const xAxis = d3.axisBottom(x).ticks(5).tickSize(-chartHeight).tickPadding(12);
    const xAxisG = svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${chartHeight})`).call(xAxis);
    xAxisG.select('.domain').remove();
    xAxisG.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.15)').attr('stroke-dasharray', '4,4');
    xAxisG.selectAll('.tick text').style('color', 'rgba(255, 255, 255, 0.4)').style('font-size', '12px').style('font-family', 'var(--font-body)');

    svg.append('text').attr('x', chartWidth / 2).attr('y', chartHeight + 45).attr('text-anchor', 'middle').style('fill', 'rgba(255, 255, 255, 0.3)').style('font-size', '10px').style('text-transform', 'uppercase').style('letter-spacing', '2px').text('Number of Games');

    const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(20);
    svg.append('g').attr('class', 'y-axis').call(yAxis).select('.domain').remove();
    svg.selectAll('.y-axis .tick text').style('color', '#fff').style('font-size', '14px').style('font-family', 'var(--font-body)');

    const barRows = svg
        .selectAll('g.bar-row')
        .data(barData)
        .enter()
        .append('g')
        .attr('class', 'bar-row')
        .attr('transform', (d) => `translate(0,${y(`${d.decade}s`)})`)
        .style('opacity', 0)
        .style('cursor', 'pointer');

    barRows
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (y.bandwidth() - 28) / 2)
        .attr('height', 28)
        .attr('fill', '#e8c44a')
        .attr('rx', 14)
        .attr('width', 0);

    barRows
        .append('text')
        .attr('class', 'count-label')
        .attr('y', y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('x', 0)
        .attr('dx', 8)
        .style('fill', '#fff')
        .style('font-size', '14px')
        .style('opacity', 0)
        .text((d) => d.count);

    barRows
        .select('rect')
        .transition('intro')
        .duration(340)
        .delay((d, i) => i * 30)
        .ease(d3.easeCubicOut)
        .attr('width', (d) => x(d.count));

    barRows
        .transition('intro')
        .duration(340)
        .delay((d, i) => i * 30)
        .ease(d3.easeCubicOut)
        .style('opacity', 1);

    barRows
        .select('text')
        .transition('intro')
        .duration(190)
        .delay((d, i) => i * 30 + 150)
        .ease(d3.easeCubicOut)
        .attr('x', (d) => x(d.count))
        .style('opacity', 1);

    barRows
        .on('mouseenter', function () {
            d3.select(this)
                .select('rect')
                .interrupt('hover')
                .transition('hover')
                .duration(100)
                .ease(d3.easeCubicOut)
                .attr('fill', '#ebcf55')
                .style('filter', 'drop-shadow(0 0 6px rgba(240, 210, 120, 0.42)) drop-shadow(0 0 12px rgba(232, 190, 80, 0.22))');
        })
        .on('mouseleave', function () {
            d3.select(this)
                .select('rect')
                .interrupt('hover')
                .transition('hover')
                .duration(100)
                .ease(d3.easeCubicOut)
                .attr('fill', '#e8c44a')
                .style('filter', 'none');
        })
        .on('click', (event, d) => handleCategoryClick(d.decade, 'decade'));
}
