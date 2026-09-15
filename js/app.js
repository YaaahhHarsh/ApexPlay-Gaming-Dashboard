/**
 * APEXPLAY GAMING DASHBOARD - MAIN CONTROLLER
 * Coordinates UI views, API requests, events, sound effects, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = window.gameState;
  const api = window.gamesApi;
  const sound = window.soundFx;
  const charts = window.DashboardCharts;

  // View state
  let currentTab = 'dashboard';
  let libraryViewMode = 'grid'; // 'grid' | 'list'
  let libraryFilter = 'all';
  let libraryGenre = 'all';
  let librarySort = 'playtime';
  let publicGamesList = [];
  let currentModalGame = null;
  let activeSessionInterval = null;

  /* ==========================================================================
     1. INITIALIZATION & BACKGROUND PARTICLES
     ========================================================================== */
  function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.5 + 0.2
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ==========================================================================
     2. PROFILE & HEADER RENDERING
     ========================================================================== */
  function renderProfile() {
    const p = state.state.profile;
    const library = state.state.library;

    // Gamertag and Bio
    document.querySelectorAll('.profile-gamertag').forEach(el => el.textContent = p.gamertag);
    document.querySelectorAll('.profile-avatar-img, .mini-avatar').forEach(el => el.src = p.avatar);
    const bioEl = document.getElementById('profile-bio-text');
    if (bioEl) bioEl.textContent = `${p.title} • ${p.bio}`;
    const rankEl = document.getElementById('profile-rank-text');
    if (rankEl) rankEl.textContent = p.rank;

    // Level & XP
    const pct = Math.min(100, Math.round((p.xp / p.nextLevelXp) * 100));
    document.querySelectorAll('.level-number-pill').forEach(el => el.textContent = p.level);
    const xpProgress = document.getElementById('profile-xp-bar');
    if (xpProgress) xpProgress.style.width = `${pct}%`;
    const xpCounter = document.getElementById('profile-xp-counter');
    if (xpCounter) xpCounter.innerHTML = `<span>${p.xp.toLocaleString()}</span> / ${p.nextLevelXp.toLocaleString()} XP (${pct}%)`;

    // Status Indicator
    const statusDots = document.querySelectorAll('.avatar-status-indicator');
    statusDots.forEach(dot => {
      dot.className = `avatar-status-indicator ${p.status === 'in-game' ? 'in-game' : ''}`;
    });

    // Overview Stats
    const totalPlaytime = library.reduce((acc, g) => acc + g.playtimeHours, 0);
    const totalAchUnlocked = state.state.achievements.filter(a => a.unlocked).length;
    const completedGames = library.filter(g => g.status === 'Completed').length;

    const statTotalHours = document.getElementById('stat-total-hours');
    if (statTotalHours) statTotalHours.textContent = `${totalPlaytime.toFixed(0)}h`;

    const statGamesOwned = document.getElementById('stat-games-owned');
    if (statGamesOwned) statGamesOwned.textContent = library.length;

    const statAchUnlocked = document.getElementById('stat-ach-unlocked');
    if (statAchUnlocked) statAchUnlocked.textContent = totalAchUnlocked;

    const statCompletionRate = document.getElementById('stat-completion-rate');
    if (statCompletionRate) {
      const rate = library.length > 0 ? Math.round((completedGames / library.length) * 100) : 0;
      statCompletionRate.textContent = `${rate}%`;
    }

    // Update Badges count in tab
    const achTabBadge = document.getElementById('badge-ach-count');
    if (achTabBadge) achTabBadge.textContent = totalAchUnlocked;
    const wishTabBadge = document.getElementById('badge-wishlist-count');
    if (wishTabBadge) wishTabBadge.textContent = state.state.wishlist.length;
    const libTabBadge = document.getElementById('badge-library-count');
    if (libTabBadge) libTabBadge.textContent = library.length;
  }

  /* ==========================================================================
     3. RECENTLY PLAYED SECTION
     ========================================================================== */
  function renderRecentlyPlayed() {
    const container = document.getElementById('recently-played-container');
    if (!container) return;

    const recent = [...state.state.library].slice(0, 3);
    container.innerHTML = recent.map(game => `
      <div class="recent-game-card stagger-in">
        <div class="recent-game-media">
          <img src="${game.banner}" alt="${game.title}" class="recent-game-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <div class="recent-game-overlay">
            <div class="recent-badges-top">
              <span class="platform-pill">${game.platform}</span>
              <span class="last-played-pill">🕒 ${game.lastPlayed}</span>
            </div>
          </div>
        </div>
        <div class="recent-game-info">
          <div class="recent-title-row">
            <h3 class="recent-title" title="${game.title}">${game.title}</h3>
          </div>
          <div class="recent-meta-stats">
            <span class="recent-playtime">Playtime: <strong>${game.playtimeHours} hrs</strong></span>
            <span class="recent-ach-progress">🏆 ${game.achievementsUnlocked}/${game.achievementsTotal}</span>
          </div>
          <div class="recent-card-actions">
            <button class="btn-play-game" data-launch-id="${game.id}">
              ▶ Launch
            </button>
            <button class="btn-secondary btn-sm" data-details-id="${game.id}">
              Details
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     4. GAME LIBRARY
     ========================================================================== */
  function renderLibrary() {
    const gridContainer = document.getElementById('library-catalog-container');
    if (!gridContainer) return;

    let list = [...state.state.library];

    // Filter by Status
    if (libraryFilter !== 'all') {
      if (libraryFilter === 'Favorites') {
        list = list.filter(g => g.favorite);
      } else {
        list = list.filter(g => g.status.toLowerCase() === libraryFilter.toLowerCase());
      }
    }

    // Filter by Genre
    if (libraryGenre !== 'all') {
      list = list.filter(g => g.genre.toLowerCase().includes(libraryGenre.toLowerCase()));
    }

    // Sort
    if (librarySort === 'playtime') {
      list.sort((a, b) => b.playtimeHours - a.playtimeHours);
    } else if (librarySort === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (librarySort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    if (list.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🎮</div>
          <h3>No games found</h3>
          <p>Try clearing filters or add games from the Discover tab!</p>
          <button class="btn-primary btn-sm" id="btn-goto-discover">Browse Public Games</button>
        </div>
      `;
      const gotoBtn = document.getElementById('btn-goto-discover');
      if (gotoBtn) gotoBtn.onclick = () => switchTab('discover');
      return;
    }

    if (libraryViewMode === 'grid') {
      gridContainer.className = 'games-catalog-grid';
      gridContainer.innerHTML = list.map(game => `
        <div class="game-card-grid stagger-in" data-card-id="${game.id}">
          <div class="game-card-cover">
            <img src="${game.banner}" alt="${game.title}" class="game-cover-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
            <div class="game-cover-badges">
              <span class="genre-tag">${game.genre.split('/')[0]}</span>
              <button class="fav-btn ${game.favorite ? 'active' : ''}" data-fav-id="${game.id}" title="Toggle Favorite">
                ★
              </button>
            </div>
          </div>
          <div class="game-card-content">
            <h4 class="game-card-title" title="${game.title}">${game.title}</h4>
            <p class="game-card-desc">${game.description}</p>
            <div class="game-card-meta">
              <span>⏱ ${game.playtimeHours}h logged</span>
              <span class="game-rating-star">★ ${game.rating}</span>
            </div>
            <div class="game-card-actions">
              <button class="btn-play-game" data-launch-id="${game.id}">▶ Play</button>
              <button class="btn-secondary btn-sm" data-details-id="${game.id}">Details</button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      gridContainer.className = 'games-catalog-list';
      gridContainer.innerHTML = list.map(game => `
        <div class="game-card-list stagger-in" data-card-id="${game.id}">
          <img src="${game.banner}" alt="${game.title}" class="game-list-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <div class="game-list-info">
            <h4 class="game-list-title">${game.title}</h4>
            <div class="game-list-details">
              <span>Genre: <strong>${game.genre}</strong></span>
              <span>Playtime: <strong>${game.playtimeHours} hrs</strong></span>
              <span>Rating: <strong>★ ${game.rating}</strong></span>
              <span>Status: <strong>${game.status}</strong></span>
            </div>
          </div>
          <div class="game-card-actions">
            <button class="btn-play-game" data-launch-id="${game.id}">▶ Play</button>
            <button class="btn-secondary btn-sm" data-details-id="${game.id}">Details</button>
          </div>
        </div>
      `).join('');
    }
  }

  /* ==========================================================================
     5. DISCOVER SECTION (PUBLIC GAMES API)
     ========================================================================== */
  async function loadDiscoverGames(genre = 'all', platform = 'all') {
    const container = document.getElementById('discover-games-container');
    const statusChip = document.getElementById('api-status-chip');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="status-dot-pulse" style="width: 14px; height: 14px; margin-bottom: 12px;"></div>
        <p>Connecting to FreeToGame Public Games API & loading titles...</p>
      </div>
    `;

    try {
      publicGamesList = await api.fetchGames({ category: genre, platform: platform });
      if (statusChip) {
        statusChip.innerHTML = `<span class="status-dot-pulse"></span> FreeToGame API Online (${publicGamesList.length} titles)`;
      }
      renderDiscoverGrid(publicGamesList);
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><h3>Unable to load public API catalog</h3></div>`;
    }
  }

  function renderDiscoverGrid(games) {
    const container = document.getElementById('discover-games-container');
    if (!container) return;

    if (!games || games.length === 0) {
      container.innerHTML = `<div class="empty-state"><h3>No titles found for this filter</h3></div>`;
      return;
    }

    // Display first 24 items with pagination or scroll
    const displayed = games.slice(0, 28);

    container.className = 'games-catalog-grid';
    container.innerHTML = displayed.map(game => {
      const inLibrary = state.state.library.some(g => (g.apiId && g.apiId === game.id) || g.title === game.title);
      const inWishlist = state.state.wishlist.some(w => w.title.toLowerCase() === game.title.toLowerCase());

      return `
        <div class="game-card-grid stagger-in" data-api-game-id="${game.id}">
          <div class="game-card-cover">
            <img src="${game.thumbnail}" alt="${game.title}" class="game-cover-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
            <div class="game-cover-badges">
              <span class="genre-tag">${game.genre}</span>
              <span class="platform-pill">${game.platform}</span>
            </div>
          </div>
          <div class="game-card-content">
            <h4 class="game-card-title" title="${game.title}">${game.title}</h4>
            <p class="game-card-desc">${game.short_description}</p>
            <div class="game-card-meta">
              <span>🏢 ${game.developer || game.publisher}</span>
              <span>📅 ${game.release_date || '2023'}</span>
            </div>
            <div class="game-card-actions">
              ${inLibrary ? `
                <button class="btn-secondary btn-sm" style="flex: 1; color: var(--neon-emerald);" disabled>✓ In Library</button>
              ` : `
                <button class="btn-primary btn-sm" style="flex: 1;" data-add-library-api="${game.id}">+ Add to Library</button>
              `}
              <button class="btn-secondary btn-sm" data-public-details-id="${game.id}">Details</button>
              <button class="fav-btn ${inWishlist ? 'active' : ''}" data-wishlist-toggle="${game.id}" title="Add to Wishlist">
                ♡
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     6. GAME DETAILS MODAL & SCREENSHOT LIGHTBOX
     ========================================================================== */
  async function openGameDetails(gameOrId, isPublicApi = false) {
    sound.click();
    const modal = document.getElementById('game-details-modal');
    if (!modal) return;

    let game = null;
    if (isPublicApi) {
      // Find from public list or fetch
      const found = publicGamesList.find(g => g.id === Number(gameOrId));
      const fullDetails = await api.fetchGameDetails(gameOrId);
      game = fullDetails || found;
    } else {
      game = state.state.library.find(g => g.id === gameOrId);
    }

    if (!game) return;
    currentModalGame = game;

    // Populate Modal Content
    const heroImg = document.getElementById('modal-game-hero');
    if (heroImg) heroImg.src = game.banner || game.thumbnail;

    const titleEl = document.getElementById('modal-game-title');
    if (titleEl) titleEl.textContent = game.title;

    const genreEl = document.getElementById('modal-game-genre');
    if (genreEl) genreEl.textContent = game.genre;

    const devEl = document.getElementById('modal-game-dev');
    if (devEl) devEl.textContent = game.developer || game.publisher || 'Independent Studio';

    const descEl = document.getElementById('modal-game-desc');
    if (descEl) descEl.textContent = game.description || game.short_description;

    // Specs
    const specs = game.minSpecs || game.minimum_system_requirements || {
      os: 'Windows 10 64-bit',
      processor: 'Intel Core i5 or AMD Ryzen 5',
      memory: '8 GB RAM',
      graphics: 'NVIDIA GTX 1060 or AMD Radeon RX 580',
      storage: '50 GB available space'
    };

    const specsContainer = document.getElementById('modal-specs-container');
    if (specsContainer) {
      specsContainer.innerHTML = `
        <div class="spec-cell"><span class="spec-label">Operating System</span><span class="spec-value">${specs.os || 'Windows 10'}</span></div>
        <div class="spec-cell"><span class="spec-label">Processor</span><span class="spec-value">${specs.processor || specs.cpu || 'Intel Core i5'}</span></div>
        <div class="spec-cell"><span class="spec-label">Memory</span><span class="spec-value">${specs.memory || specs.ram || '8 GB RAM'}</span></div>
        <div class="spec-cell"><span class="spec-label">Graphics</span><span class="spec-value">${specs.graphics || specs.gpu || 'NVIDIA GTX 1060'}</span></div>
        <div class="spec-cell"><span class="spec-label">Storage</span><span class="spec-value">${specs.storage || '40 GB'}</span></div>
      `;
    }

    // Screenshots
    const gallery = document.getElementById('modal-screenshots-gallery');
    if (gallery) {
      let shots = [];
      if (game.screenshots && game.screenshots.length > 0) {
        shots = game.screenshots.map(s => typeof s === 'string' ? s : s.image);
      } else {
        shots = [game.banner || game.thumbnail];
      }
      gallery.innerHTML = shots.map(url => `
        <div class="screenshot-item" data-full-shot="${url}">
          <img src="${url}" alt="${game.title} screenshot" loading="lazy">
        </div>
      `).join('');
    }

    // Action button states
    const inLibrary = state.state.library.some(g => g.id === game.id || (game.id && g.apiId === game.id));
    const modalAddLibBtn = document.getElementById('modal-btn-add-library');
    if (modalAddLibBtn) {
      modalAddLibBtn.style.display = inLibrary ? 'none' : 'inline-flex';
      modalAddLibBtn.onclick = () => {
        state.addToLibrary({
          title: game.title,
          genre: game.genre,
          apiId: game.id || null,
          banner: game.thumbnail || game.banner,
          description: game.short_description || game.description,
          platform: game.platform || 'PC'
        });
        showToast('🎮 Added to your personal library!', 'success');
        sound.achievement();
        renderProfile();
        renderLibrary();
        openGameDetails(game.id, false);
      };
    }

    const modalPlayBtn = document.getElementById('modal-btn-play');
    if (modalPlayBtn) {
      modalPlayBtn.style.display = inLibrary ? 'inline-flex' : 'none';
      modalPlayBtn.onclick = () => {
        closeModal();
        handleLaunchGame(game.id);
      };
    }

    modal.classList.add('open');
  }

  function closeModal() {
    const modal = document.getElementById('game-details-modal');
    if (modal) modal.classList.remove('open');
  }

  /* ==========================================================================
     7. ACHIEVEMENT TRACKER
     ========================================================================== */
  function renderAchievements(filter = 'all') {
    const container = document.getElementById('achievements-list-container');
    if (!container) return;

    let list = [...state.state.achievements];
    if (filter === 'unlocked') {
      list = list.filter(a => a.unlocked);
    } else if (filter === 'locked') {
      list = list.filter(a => !a.unlocked);
    } else if (filter !== 'all') {
      list = list.filter(a => a.rarity.toLowerCase() === filter.toLowerCase());
    }

    container.innerHTML = list.map(ach => `
      <div class="achievement-card ${ach.unlocked ? 'unlocked' : ''} stagger-in" data-ach-id="${ach.id}">
        <div class="ach-icon-box">${ach.icon}</div>
        <div class="ach-content">
          <div class="ach-game-tag">${ach.gameTitle}</div>
          <h4 class="ach-title">${ach.title}</h4>
          <p class="ach-desc">${ach.description}</p>
          <div class="ach-footer">
            <span class="rarity-pill ${ach.rarity.toLowerCase()}">${ach.rarity}</span>
            <span class="ach-xp-reward">+${ach.xp} XP</span>
            <button class="ach-toggle-btn" data-toggle-ach="${ach.id}">
              ${ach.unlocked ? '✓ Unlocked' : 'Mark Unlocked'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     8. PLAYTIME ANALYTICS & CHARTS
     ========================================================================== */
  function renderAnalytics() {
    // Render Canvas Charts
    setTimeout(() => {
      charts.renderWeeklyPlaytime('chart-weekly-canvas', state.state.stats.weeklyHours);
      charts.renderGenreDonut('chart-genre-canvas', state.state.stats.genreBreakdown);
      charts.renderTopGamesBars('top-games-leaderboard', state.state.library);
    }, 50);

    // Render Metric Cards
    const avgEl = document.getElementById('metric-avg-daily');
    if (avgEl) avgEl.textContent = `${state.state.stats.averageDaily} hrs/day`;

    const streakEl = document.getElementById('metric-longest-session');
    if (streakEl) streakEl.textContent = `${state.state.stats.longestSession} hrs session`;
  }

  /* ==========================================================================
     9. WISHLIST SECTION
     ========================================================================== */
  function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    if (!container) return;

    const list = state.state.wishlist;
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Explore titles from the Discover tab and click the heart icon to save them!</p>
          <button class="btn-primary btn-sm" id="btn-wishlist-explore">Explore Titles</button>
        </div>
      `;
      const btn = document.getElementById('btn-wishlist-explore');
      if (btn) btn.onclick = () => switchTab('discover');
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="wishlist-card stagger-in">
        <div class="wishlist-media">
          <img src="${item.image}" alt="${item.title}" class="wishlist-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <span class="wishlist-badge">${item.priority} Priority</span>
        </div>
        <div class="wishlist-content">
          <h4 class="game-card-title">${item.title}</h4>
          <span style="font-size: 0.8rem; color: var(--text-dim);">${item.platform} • Release: ${item.releaseDate}</span>
          <div class="wishlist-price-row">
            <span class="wishlist-price">${item.price}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn-primary btn-sm" data-move-to-lib="${item.title}">+ Add to Library</button>
              <button class="btn-secondary btn-sm" data-remove-wishlist="${item.id}">✕</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     10. GAMING NEWS & GIVEAWAYS
     ========================================================================== */
  function renderNews() {
    const newsContainer = document.getElementById('news-cards-container');
    if (newsContainer) {
      newsContainer.innerHTML = state.state.news.map(article => `
        <div class="news-card stagger-in" data-article-id="${article.id}">
          <div class="news-card-media">
            <img src="${article.image}" alt="${article.title}" class="news-card-img" loading="lazy">
          </div>
          <div class="news-card-body">
            <span class="news-category-chip">${article.category}</span>
            <h4 class="news-title">${article.title}</h4>
            <div class="news-footer">
              <span>${article.source}</span>
              <span>${article.time} • ${article.readTime}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    const giveawaysContainer = document.getElementById('giveaways-container');
    if (giveawaysContainer) {
      giveawaysContainer.innerHTML = state.state.giveaways.map(gv => `
        <div class="giveaway-item">
          <img src="${gv.image}" alt="${gv.title}" class="giveaway-thumb">
          <div class="giveaway-info">
            <h5 class="giveaway-title" title="${gv.title}">${gv.title}</h5>
            <span class="giveaway-worth">Free (Valued at ${gv.worth})</span>
          </div>
          <a href="${gv.claimUrl}" target="_blank" class="btn-primary btn-sm" style="text-decoration: none;">Claim</a>
        </div>
      `).join('');
    }
  }

  /* ==========================================================================
     11. ACTIVE PLAYING SESSION SIMULATION
     ========================================================================== */
  function handleLaunchGame(gameId) {
    sound.launch();
    const session = state.startSession(gameId);
    if (!session) return;

    const banner = document.getElementById('active-session-bar');
    const title = document.getElementById('active-session-title');
    const timer = document.getElementById('active-session-timer');

    if (banner) banner.classList.add('visible');
    if (title) title.textContent = `In-Game: ${session.gameTitle}`;

    if (activeSessionInterval) clearInterval(activeSessionInterval);
    let seconds = 0;
    activeSessionInterval = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      if (timer) timer.textContent = `${m}:${s}`;
    }, 1000);

    showToast(`🚀 Launched ${session.gameTitle}! Session active.`, 'info');
    renderProfile();
    renderRecentlyPlayed();
  }

  function handleEndSession() {
    sound.click();
    if (activeSessionInterval) {
      clearInterval(activeSessionInterval);
      activeSessionInterval = null;
    }
    const result = state.endSession();
    const banner = document.getElementById('active-session-bar');
    if (banner) banner.classList.remove('visible');

    if (result) {
      showToast(`Session ended for ${result.gameTitle}. Logged ${result.durationHours} hrs!`, 'success');
      renderProfile();
      renderRecentlyPlayed();
      renderLibrary();
      renderAnalytics();
    }
  }

  /* ==========================================================================
     12. TAB SWITCHING
     ========================================================================== */
  function switchTab(tabId) {
    sound.tab();
    currentTab = tabId;

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`tab-${tabId}`);
    if (activePanel) activePanel.classList.add('active');

    // Update Sidebar & Mobile Dock Active State
    document.querySelectorAll('.nav-tab-btn, .mobile-dock-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Tab-specific refreshes
    if (tabId === 'dashboard') {
      renderProfile();
      renderRecentlyPlayed();
      renderAnalytics();
    } else if (tabId === 'library') {
      renderLibrary();
    } else if (tabId === 'discover') {
      if (publicGamesList.length === 0) {
        loadDiscoverGames();
      }
    } else if (tabId === 'achievements') {
      renderAchievements();
    } else if (tabId === 'analytics') {
      renderAnalytics();
    } else if (tabId === 'wishlist') {
      renderWishlist();
    } else if (tabId === 'news') {
      renderNews();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     13. SEARCH (GLOBAL NAV BAR)
     ========================================================================== */
  const searchInput = document.getElementById('nav-search-input');
  const searchDropdown = document.getElementById('nav-search-dropdown');
  let searchTimeout = null;

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(searchTimeout);

      if (!q) {
        searchDropdown.style.display = 'none';
        return;
      }

      searchTimeout = setTimeout(async () => {
        // Search in local library
        const localMatches = state.state.library.filter(g => 
          g.title.toLowerCase().includes(q.toLowerCase()) ||
          g.genre.toLowerCase().includes(q.toLowerCase())
        );

        // Search in public catalog
        let publicMatches = [];
        if (publicGamesList.length > 0) {
          publicMatches = api.searchCatalog(q, publicGamesList).slice(0, 5);
        }

        const combined = [...localMatches.map(m => ({ ...m, source: 'Library' })), ...publicMatches.map(p => ({ ...p, banner: p.thumbnail, source: 'Public API' }))];

        if (combined.length === 0) {
          searchDropdown.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--text-dim);">No matching games found</div>`;
        } else {
          searchDropdown.innerHTML = combined.slice(0, 6).map(g => `
            <div class="search-result-item" data-search-id="${g.id}" data-is-public="${g.source === 'Public API'}">
              <img src="${g.banner || g.thumbnail}" class="search-result-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'">
              <div class="search-result-info">
                <div class="search-result-title">${g.title}</div>
                <div class="search-result-meta">${g.genre} • <span style="color: var(--neon-cyan);">${g.source}</span></div>
              </div>
            </div>
          `).join('');
        }
        searchDropdown.style.display = 'block';
      }, 250);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.style.display = 'none';
      }
    });

    searchDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.search-result-item');
      if (item) {
        const id = item.dataset.searchId;
        const isPublic = item.dataset.isPublic === 'true';
        searchDropdown.style.display = 'none';
        openGameDetails(id, isPublic);
      }
    });
  }

  /* ==========================================================================
     14. TOAST NOTIFICATIONS & LEVEL UP OVERLAY
     ========================================================================== */
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✨' : type === 'warn' ? '⚠️' : '🔔'}</span>
      <span>${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function triggerLevelUpCelebration(newLevel) {
    sound.levelUp();
    const overlay = document.getElementById('level-up-modal');
    const badge = document.getElementById('level-up-badge-val');
    if (overlay && badge) {
      badge.textContent = newLevel;
      overlay.classList.add('active');
    }
  }

  const closeLevelUpBtn = document.getElementById('btn-close-levelup');
  if (closeLevelUpBtn) {
    closeLevelUpBtn.onclick = () => {
      sound.click();
      document.getElementById('level-up-modal').classList.remove('active');
    };
  }

  /* ==========================================================================
     15. GLOBAL EVENT DELEGATION
     ========================================================================== */
  document.body.addEventListener('click', (e) => {
    // Navigation Tabs
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      e.preventDefault();
      switchTab(tabBtn.dataset.tab);
      return;
    }

    // Launch Game
    const launchBtn = e.target.closest('[data-launch-id]');
    if (launchBtn) {
      e.preventDefault();
      handleLaunchGame(launchBtn.dataset.launchId);
      return;
    }

    // Details Modal
    const detailsBtn = e.target.closest('[data-details-id]');
    if (detailsBtn) {
      e.preventDefault();
      openGameDetails(detailsBtn.dataset.detailsId, false);
      return;
    }

    // Public Details Modal
    const pubDetailsBtn = e.target.closest('[data-public-details-id]');
    if (pubDetailsBtn) {
      e.preventDefault();
      openGameDetails(pubDetailsBtn.dataset.publicDetailsId, true);
      return;
    }

    // Add API game to library
    const addLibBtn = e.target.closest('[data-add-library-api]');
    if (addLibBtn) {
      e.preventDefault();
      const apiId = Number(addLibBtn.dataset.addLibraryApi);
      const publicGame = publicGamesList.find(g => g.id === apiId);
      if (publicGame) {
        state.addToLibrary({
          title: publicGame.title,
          apiId: publicGame.id,
          genre: publicGame.genre,
          banner: publicGame.thumbnail,
          description: publicGame.short_description,
          platform: publicGame.platform
        });
        sound.achievement();
        showToast(`🎮 Added ${publicGame.title} to your library!`, 'success');
        renderProfile();
        renderLibrary();
        renderDiscoverGrid(publicGamesList);
      }
      return;
    }

    // Toggle Favorite
    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn) {
      e.preventDefault();
      sound.click();
      state.toggleFavorite(favBtn.dataset.favId);
      renderLibrary();
      return;
    }

    // Toggle Wishlist from Discover
    const wishToggleBtn = e.target.closest('[data-wishlist-toggle]');
    if (wishToggleBtn) {
      e.preventDefault();
      sound.click();
      const apiId = Number(wishToggleBtn.dataset.wishlistToggle);
      const publicGame = publicGamesList.find(g => g.id === apiId);
      if (publicGame) {
        const added = state.addToWishlist({
          title: publicGame.title,
          genre: publicGame.genre,
          image: publicGame.thumbnail,
          platform: publicGame.platform,
          price: 'Free to Play',
          discount: 'Live Title'
        });
        if (added) {
          showToast(`♡ Added ${publicGame.title} to Wishlist!`, 'success');
        } else {
          state.removeFromWishlist(publicGame.title);
          showToast(`Removed from Wishlist`, 'info');
        }
        renderWishlist();
        renderDiscoverGrid(publicGamesList);
      }
      return;
    }

    // Wishlist: Move to Library
    const moveToLibBtn = e.target.closest('[data-move-to-lib]');
    if (moveToLibBtn) {
      e.preventDefault();
      const title = moveToLibBtn.dataset.moveToLib;
      state.addToLibrary({ title });
      sound.achievement();
      showToast(`Moved ${title} to Library!`, 'success');
      renderProfile();
      renderLibrary();
      renderWishlist();
      return;
    }

    // Wishlist: Remove
    const removeWishBtn = e.target.closest('[data-remove-wishlist]');
    if (removeWishBtn) {
      e.preventDefault();
      sound.click();
      state.removeFromWishlist(removeWishBtn.dataset.removeWishlist);
      showToast('Removed from Wishlist', 'info');
      renderWishlist();
      return;
    }

    // Toggle Achievement
    const achBtn = e.target.closest('[data-toggle-ach]');
    if (achBtn) {
      e.preventDefault();
      const res = state.toggleAchievement(achBtn.dataset.toggleAch);
      if (res) {
        if (res.unlocked) {
          sound.achievement();
          showToast(`🏆 Achievement unlocked! +${res.xp} XP`, 'success');
          if (res.leveledUp) {
            triggerLevelUpCelebration(res.newLevel);
          }
        } else {
          sound.click();
          showToast('Achievement marked locked', 'info');
        }
        renderProfile();
        renderAchievements();
      }
      return;
    }

    // Close Modal
    if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-backdrop')) {
      closeModal();
      return;
    }
  });

  // End Session Button
  const btnEndSession = document.getElementById('btn-end-session');
  if (btnEndSession) {
    btnEndSession.onclick = handleEndSession;
  }

  // View Mode Toggles (Grid vs List)
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnViewList = document.getElementById('btn-view-list');
  if (btnViewGrid && btnViewList) {
    btnViewGrid.onclick = () => {
      sound.click();
      libraryViewMode = 'grid';
      btnViewGrid.classList.add('active');
      btnViewList.classList.remove('active');
      renderLibrary();
    };
    btnViewList.onclick = () => {
      sound.click();
      libraryViewMode = 'list';
      btnViewList.classList.add('active');
      btnViewGrid.classList.remove('active');
      renderLibrary();
    };
  }

  // Library Toolbar Filters
  document.querySelectorAll('.filter-tag-chip[data-lib-filter]').forEach(chip => {
    chip.onclick = () => {
      sound.click();
      document.querySelectorAll('.filter-tag-chip[data-lib-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      libraryFilter = chip.dataset.libFilter;
      renderLibrary();
    };
  });

  // Discover Genre Filter Chips
  document.querySelectorAll('.filter-tag-chip[data-discover-genre]').forEach(chip => {
    chip.onclick = () => {
      sound.click();
      document.querySelectorAll('.filter-tag-chip[data-discover-genre]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadDiscoverGames(chip.dataset.discoverGenre);
    };
  });

  // Library Sort Selector
  const sortSelect = document.getElementById('library-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      sound.click();
      librarySort = e.target.value;
      renderLibrary();
    };
  }

  // Achievement Rarity Filter Chips
  document.querySelectorAll('.filter-tag-chip[data-ach-filter]').forEach(chip => {
    chip.onclick = () => {
      sound.click();
      document.querySelectorAll('.filter-tag-chip[data-ach-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderAchievements(chip.dataset.achFilter);
    };
  });

  // Edit Profile Modal
  const editProfileModal = document.getElementById('edit-profile-modal');
  const btnOpenEditProfile = document.getElementById('btn-open-edit-profile');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const inputGamertag = document.getElementById('input-edit-gamertag');
  const inputBio = document.getElementById('input-edit-bio');
  let selectedAvatar = state.state.profile.avatar;

  if (btnOpenEditProfile && editProfileModal) {
    btnOpenEditProfile.onclick = () => {
      sound.click();
      inputGamertag.value = state.state.profile.gamertag;
      inputBio.value = state.state.profile.bio;
      editProfileModal.classList.add('open');
    };

    document.querySelectorAll('.avatar-choice').forEach(img => {
      img.onclick = () => {
        sound.click();
        document.querySelectorAll('.avatar-choice').forEach(i => i.classList.remove('selected'));
        img.classList.add('selected');
        selectedAvatar = img.src;
      };
    });

    if (btnSaveProfile) {
      btnSaveProfile.onclick = () => {
        sound.achievement();
        state.updateProfile({
          gamertag: inputGamertag.value.trim() || 'V0RT3X_KNIGHT',
          bio: inputBio.value.trim() || state.state.profile.bio,
          avatar: selectedAvatar
        });
        editProfileModal.classList.remove('open');
        showToast('Profile updated successfully!', 'success');
        renderProfile();
      };
    }
  }

  // Sound Mute Toggle
  const btnSoundToggle = document.getElementById('btn-toggle-sound');
  if (btnSoundToggle) {
    if (sound.muted) btnSoundToggle.classList.remove('active');
    else btnSoundToggle.classList.add('active');

    btnSoundToggle.onclick = () => {
      const isMuted = sound.toggleMute();
      btnSoundToggle.classList.toggle('active', !isMuted);
      showToast(isMuted ? '🔇 Audio muted' : '🔊 Audio enabled', 'info');
      if (!isMuted) sound.click();
    };
  }

  // Reset Demo Data
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.onclick = () => {
      if (confirm('Reset dashboard to default profile and sample data?')) {
        state.reset();
        sound.click();
        showToast('Dashboard reset to factory settings', 'info');
        renderProfile();
        renderRecentlyPlayed();
        renderLibrary();
        renderAchievements();
        renderAnalytics();
        renderWishlist();
      }
    };
  }

  // Initial Run
  initBackgroundCanvas();
  renderProfile();
  renderRecentlyPlayed();
  renderLibrary();
  renderAchievements();
  renderAnalytics();
  renderWishlist();
  renderNews();

  // Preload Discover API in background
  loadDiscoverGames('all');
});
