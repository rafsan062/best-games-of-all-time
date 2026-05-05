// Orchestrates section redraws when data or viewport changes

function renderDashboard() {
    renderPieChart();
    renderBarChart();
    renderPlatforms();
    if (window.renderCards) window.renderCards();
}
