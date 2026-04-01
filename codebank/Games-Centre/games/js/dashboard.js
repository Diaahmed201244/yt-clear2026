document.addEventListener('DOMContentLoaded', async () => {
  const gamesGrid = document.getElementById('gamesGrid');
  const gameContainer = document.getElementById('gameContainer');
  const gameFrame = document.getElementById('gameFrame');
  const backToGames = document.getElementById('backToGames');
  const searchInput = document.getElementById('searchGames');
  const filters = document.querySelectorAll('.filters button');
  const template = document.getElementById('gameCardTemplate');
  let games = [];
  let filteredGames = [];

  // Load games manifest dynamically
  try { 
    const response = await fetch('../dashboard-manifest.json');
    if (!response.ok) throw new Error('Failed to fetch manifest');
    const manifest = await response.json();
    
    games = [];
    [...manifest.vanilla, ...manifest.react].forEach(item => {
      games.push({
        name: item.name,
        path: item.path,
        category: item.category || "classic",
        description: item.description || "Game description.",
        thumbnail: item.thumbnail || ''
      });
    });
    
    console.log('Manifest loaded successfully:', games.length, 'games');
  } catch (error) {
    console.error('Failed to load manifest:', error);
    // Fallback to hardcoded (original arrays here if needed, but for now log error)
    games = [];
  }
  
  filteredGames = [...games];
  renderGames();

  // Render games
  function renderGames() {
    gamesGrid.innerHTML = '';
    filteredGames.forEach(game => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector('.game-card');
      const img = clone.querySelector('img');
      const title = clone.querySelector('.game-title');
      const category = clone.querySelector('.game-category');
      const description = clone.querySelector('.game-description');
      const playBtn = clone.querySelector('.play-btn');

      img.src = game.thumbnail || ''; // No thumbnail for now, can add later
      title.textContent = game.name.replace(/-/g, ' ').toUpperCase();
      category.textContent = game.category;
      description.textContent = game.description;
      playBtn.onclick = () => loadGame(game.path);

      card.appendChild(playBtn);
      gamesGrid.appendChild(clone);
    });
  }

  // Load game in iframe
  function loadGame(path) {
    // For React, attempt fallback if client/index.html not working, but for now use direct path
    // Assume server serves static, for dev React may need vite -- but static serve client/index.html
    gameFrame.src = `./${path}`;
    gameContainer.style.display = 'flex';
    gamesGrid.style.display = 'none';
  }

  // Close game
  backToGames.onclick = () => {
    gameContainer.style.display = 'none';
    gameFrame.src = '';
    gamesGrid.style.display = 'grid';
  };

  // Search
  searchInput.oninput = (e) => {
    const query = e.target.value.toLowerCase();
    filteredGames = games.filter(game => 
      game.name.toLowerCase().includes(query) || game.description.toLowerCase().includes(query)
    );
    renderGames();
  };

  // Filters
  filters.forEach(btn => {
    btn.onclick = () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;
      if (category === 'all') {
        filteredGames = [...games];
      } else {
        filteredGames = games.filter(game => game.category === category);
      }
      renderGames();
    };
  });

  // Sound toggle (post message if embedded)
  const soundToggle = document.getElementById('ytSoundToggle');
  soundToggle.onclick = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'toggleSound' }, '*');
      window.parent.postMessage({ type: 'toggleSound' }, window.location.origin);
    }
    soundToggle.textContent = soundToggle.textContent === '🔊' ? '🔇' : '🔊';
  };
});
