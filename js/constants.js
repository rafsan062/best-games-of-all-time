// GLOBAL DESIGN SYSTEM & DATA MAPPING
window.GENRE_COLORS = {
    'Action & Adventure': '#e8604a',
    'RPG': '#8b6fc4',
    'Sports & Racing': '#5cb85c',
    'Shooter': '#b8c84a',
    'Platformer': '#4aaee8',
    'Strategy': '#5a7a9d',
    'Simulation': '#4ab8aa',
    'Fighting': '#e8904a',
    'Other': '#9a9a9a'
};

// group: display family · order: chronological (older → newer) within that family
window.PLATFORM_DATA = [
    // Nintendo — deep red (older) → light orange (newer)
    { name: 'Nintendo 64', color: '#991100', group: 'nintendo', order: 10 },
    { name: 'GameCube', color: '#bb2200', group: 'nintendo', order: 20 },
    { name: 'Game Boy Advance', color: '#cc3300', group: 'nintendo', order: 30 },
    { name: 'DS', color: '#dd4400', group: 'nintendo', order: 40 },
    { name: 'Wii', color: '#ee5500', group: 'nintendo', order: 50 },
    { name: '3DS', color: '#ff6600', group: 'nintendo', order: 60 },
    { name: 'Wii U', color: '#ff7700', group: 'nintendo', order: 70 },
    { name: 'Nintendo Switch', color: '#ff8c00', group: 'nintendo', order: 80 },
    { name: 'Nintendo Switch 2', color: '#ffaa44', group: 'nintendo', order: 90 },
    // PlayStation — navy (older) → light blue (newer)
    { name: 'PlayStation', color: '#113399', group: 'playstation', order: 10 },
    { name: 'PlayStation 2', color: '#2244aa', group: 'playstation', order: 20 },
    { name: 'PSP', color: '#3355bb', group: 'playstation', order: 30 },
    { name: 'PlayStation 3', color: '#4466cc', group: 'playstation', order: 40 },
    { name: 'PlayStation Vita', color: '#6688dd', group: 'playstation', order: 50 },
    { name: 'PlayStation 4', color: '#88aaee', group: 'playstation', order: 60 },
    { name: 'PlayStation 5', color: '#aaccff', group: 'playstation', order: 70 },
    // Xbox — deep green (older) → light green (newer)
    { name: 'Xbox', color: '#229922', group: 'xbox', order: 10 },
    { name: 'Xbox 360', color: '#44bb44', group: 'xbox', order: 20 },
    { name: 'Xbox One', color: '#66cc66', group: 'xbox', order: 30 },
    { name: 'Xbox Series X', color: '#88dd88', group: 'xbox', order: 40 },
    // Other — distinct
    { name: 'Dreamcast', color: '#ff6680', group: 'other', order: 10 },
    { name: 'PC', color: '#aaaaaa', group: 'other', order: 20 },
    { name: 'iOS (iPhone/iPad)', color: '#ccccdd', group: 'other', order: 30 },
];

window.PLATFORM_GROUP_RANK = { nintendo: 0, playstation: 1, xbox: 2, other: 3 };

// Helper: Convert Hex to RGB for CSS variables
window.hexToRgb = function(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};
