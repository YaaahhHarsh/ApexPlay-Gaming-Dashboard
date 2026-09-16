

document.addEventListener('DOMContentLoaded', () => {
  const state = window.gameState;
  const api = window.gamesApi;
  const sound = window.soundFx;
  const charts = window.DashboardCharts;

  let currentTab = 'dashboard';
  let libraryViewMode = state.state.settings?.defaultLibraryView || 'grid'; 
  let libraryStatusFilter = 'all';
  let libraryGenreFilter = 'all';
  let libraryPlatformFilter = 'all';
  let librarySortFilter = 'recent';
  let librarySearchQuery = '';

  let discoverCuratedFilter = 'all';
  let discoverGenreFilter = 'all';
  let publicGamesList = [];
  let currentModalGame = null;
  let activeSessionInterval = null;

  function applyInitialSettings() {
    const s = state.state.settings || {};

    if (s.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    if (s.accentColor && s.accentColor !== '#4F8CFF') {
      document.documentElement.style.setProperty('--color-primary', s.accentColor);
      document.documentElement.style.setProperty('--color-primary-hover', s.accentColor);
    }

    if (s.reduceMotion) {
      document.body.classList.add('reduce-motion');
      const toggle = document.getElementById('toggle-reduce-motion');
      if (toggle) toggle.checked = true;
    }

    updateSoundButtonIcon(sound.muted);
    const toggle = document.getElementById('toggle-sound-effects');
    if (toggle) toggle.checked = !sound.muted;

    if (s.defaultLibraryView) {
      libraryViewMode = s.defaultLibraryView;
      const select = document.getElementById('settings-default-view');
      if (select) select.value = s.defaultLibraryView;
    }
  }

  function updateSoundButtonIcon(muted) {
    const btn = document.getElementById('btn-toggle-sound');
    if (!btn) return;
    btn.classList.toggle('active', !muted);
    btn.title = muted ? 'Audio Muted' : 'Audio Enabled';
    if (window.ApexIcons) {
      btn.innerHTML = ApexIcons.get(muted ? 'volume-x' : 'volume-2', { size: 16, className: 'nav-icon' });
    }
  }

  function renderProfile() {
    const p = state.state.profile;
    const auth = state.state.auth;
    const library = state.state.library;

    document.querySelectorAll('.profile-gamertag').forEach(el => el.textContent = p.gamertag);
    document.querySelectorAll('.profile-avatar-img, .mini-avatar').forEach(el => el.src = p.avatar);
    
    const emailEl = document.getElementById('profile-email-text');
    if (emailEl) {
      emailEl.textContent = auth?.user?.email || p.email || 'Sign in with Gmail';
    }

    const rankEl = document.getElementById('profile-rank-text');
    if (rankEl) rankEl.textContent = p.rank;

    const pct = Math.min(100, Math.round((p.xp / p.nextLevelXp) * 100));
    const sidebarXp = document.getElementById('sidebar-xp-bar');
    if (sidebarXp) sidebarXp.style.width = `${pct}%`;

    const totalPlaytime = library.reduce((acc, g) => acc + g.playtimeHours, 0);
    const completedGames = library.filter(g => g.status === 'Completed').length;
    const playingCount = library.filter(g => g.status === 'Playing').length;

    const statTotalHours = document.getElementById('stat-total-hours');
    if (statTotalHours) statTotalHours.textContent = `${totalPlaytime.toFixed(0)}h`;

    const statGamesOwned = document.getElementById('stat-games-owned');
    if (statGamesOwned) statGamesOwned.textContent = library.length;

    const statCompletionRate = document.getElementById('stat-completion-rate');
    if (statCompletionRate) {
      const rate = library.length > 0 ? Math.round((completedGames / library.length) * 100) : 0;
      statCompletionRate.textContent = `${rate}%`;
    }

    const statusText = document.getElementById('dashboard-status-text');
    if (statusText) {
      statusText.textContent = `Ready for your next session • ${playingCount} active title${playingCount === 1 ? '' : 's'} in progress`;
    }

    const totalAchUnlocked = state.state.achievements.filter(a => a.unlocked).length;
    const badgeAch = document.getElementById('badge-ach-count');
    if (badgeAch) badgeAch.textContent = totalAchUnlocked;

    const badgeLib = document.getElementById('badge-library-count');
    if (badgeLib) badgeLib.textContent = library.length;

    const badgeWish = document.getElementById('badge-wishlist-count');
    if (badgeWish) badgeWish.textContent = state.state.wishlist.length;

    const badgeShelves = document.getElementById('badge-shelves-count');
    if (badgeShelves) badgeShelves.textContent = state.state.shelves?.length || 0;

    const badgeLists = document.getElementById('badge-lists-count');
    if (badgeLists) badgeLists.textContent = state.state.lists?.length || 0;
  }

  function renderContinuePlaying() {
    const container = document.getElementById('continue-playing-widget');
    if (!container) return;

    const library = state.state.library;
    if (!library || library.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg></div>
          <h3>No active games to continue</h3>
          <p>Add a game to your library or start playing from your backlog.</p>
          <button class="btn-primary btn-sm" data-tab="discover">Explore Games</button>
        </div>
      `;
      return;
    }

    let game = library.find(g => g.title === state.state.profile.currentPlaying) ||
               library.find(g => g.status === 'Playing') ||
               library[0];

    const achPct = game.achievementsTotal > 0 
      ? Math.round((game.achievementsUnlocked / game.achievementsTotal) * 100) 
      : 0;

    container.innerHTML = `
      <div class="continue-playing-card">
        <div class="continue-playing-media">
          <img src="${game.banner}" alt="${game.title}" class="continue-playing-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
        </div>
        <div class="continue-playing-content">
          <div>
            <div class="continue-header-tag">
              <span class="continue-pulse-dot"></span>
              <span>Currently In Rotation • ${game.genre}</span>
            </div>
            <h3 class="continue-title">${game.title}</h3>
          </div>

          <div class="continue-stats-row">
            <span><strong>${game.playtimeHours}</strong> hours played</span>
            <span><strong>${game.achievementsUnlocked}/${game.achievementsTotal}</strong> achievements</span>
            <span><strong>${achPct}%</strong> complete</span>
            <span style="color: var(--text-muted);">Last played: ${game.lastPlayed}</span>
          </div>

          <div class="continue-progress-wrap">
            <div class="continue-progress-meta">
              <span>Achievement Progress</span>
              <span>${achPct}%</span>
            </div>
            <div class="progress-track-subtle">
              <div class="progress-bar-subtle" style="width: ${achPct}%;"></div>
            </div>
          </div>

          <div class="continue-actions">
            <button class="btn-play-game" data-launch-id="${game.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Continue Playing
            </button>
            <button class="btn-secondary" data-details-id="${game.id}">
              View Game Details
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderRecentlyPlayed() {
    const container = document.getElementById('recently-played-container');
    if (!container) return;

    const library = state.state.library;
    const recent = [...library].slice(0, 3);

    if (recent.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>No recent sessions logged yet.</p></div>`;
      return;
    }

    container.innerHTML = recent.map(game => `
      <div class="recent-game-card">
        <div class="recent-game-media">
          <img src="${game.banner}" alt="${game.title}" class="recent-game-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <div class="recent-game-overlay">
            <span class="platform-pill">${game.platform}</span>
            <span class="last-played-pill">${game.lastPlayed}</span>
          </div>
        </div>
        <div class="recent-game-info">
          <div class="recent-title" title="${game.title}">${game.title}</div>
          <div class="recent-meta-stats">
            <span><strong>${game.playtimeHours}h</strong> logged</span>
            <span><strong>${game.achievementsUnlocked}/${game.achievementsTotal}</strong> ach</span>
            <span class="status-pill ${game.status.toLowerCase()}">${game.status}</span>
          </div>
          <div class="recent-card-actions">
            <button class="btn-play-game btn-sm" data-launch-id="${game.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Launch</button>
            <button class="btn-secondary btn-sm" data-details-id="${game.id}">Details</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderDashboardSnapshots() {
    
    const achContainer = document.getElementById('dashboard-recent-achievements');
    if (achContainer) {
      const unlockedAch = state.state.achievements.filter(a => a.unlocked).slice(0, 3);
      if (unlockedAch.length === 0) {
        achContainer.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 8px;">No achievements unlocked yet. Earn your first achievement by playing!</div>`;
      } else {
        achContainer.innerHTML = unlockedAch.map(a => {
          const iconSvg = window.ApexIcons ? ApexIcons.get(a.icon || 'trophy', { size: 16, color: 'primary' }) : '';
          return `
            <div class="top-game-row" style="padding: 6px 8px;">
              <span class="ach-snapshot-icon" style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: var(--bg-elevated); border-radius: 6px; border: 1px solid var(--border-color); flex-shrink: 0;">
                ${iconSvg}
              </span>
              <div class="top-game-text">
                <div class="top-game-name">${a.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${a.gameTitle} • +${a.xp} XP</div>
              </div>
              <span class="rarity-pill ${a.rarity.toLowerCase()}">${a.rarity}</span>
            </div>
          `;
        }).join('');
      }
    }

    const backlogContainer = document.getElementById('dashboard-backlog-preview');
    if (backlogContainer) {
      const backlogGames = state.state.library.filter(g => g.status === 'Backlog').slice(0, 3);
      if (backlogGames.length === 0) {
        backlogContainer.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-muted); padding: 8px;">No games currently in backlog.</div>`;
      } else {
        backlogContainer.innerHTML = backlogGames.map(g => `
          <div class="top-game-row" style="padding: 6px 8px;">
            <img src="${g.banner}" alt="${g.title}" class="top-game-thumb" style="width: 34px; height: 34px;">
            <div class="top-game-text">
              <div class="top-game-name">${g.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${g.genre}</div>
            </div>
            <button class="btn-secondary btn-sm" data-details-id="${g.id}">View</button>
          </div>
        `).join('');
      }
    }
  }

  function populateLibraryDropdowns() {
    const library = state.state.library;
    const genreSelect = document.getElementById('library-genre-select');
    const platformSelect = document.getElementById('library-platform-select');

    if (genreSelect) {
      const genres = Array.from(new Set(library.map(g => g.genre.split('/')[0].trim()))).sort();
      genreSelect.innerHTML = `<option value="all">All Genres</option>` + 
        genres.map(g => `<option value="${g}">${g}</option>`).join('');
      genreSelect.value = libraryGenreFilter;
    }

    if (platformSelect) {
      const platforms = Array.from(new Set(library.map(g => g.platform.trim()))).sort();
      platformSelect.innerHTML = `<option value="all">All Platforms</option>` + 
        platforms.map(p => `<option value="${p}">${p}</option>`).join('');
      platformSelect.value = libraryPlatformFilter;
    }
  }

  function updateLibraryStatusCounts() {
    const library = state.state.library;
    const wishlist = state.state.wishlist;

    const countAll = library.length;
    const countPlaying = library.filter(g => g.status === 'Playing').length;
    const countCompleted = library.filter(g => g.status === 'Completed').length;
    const countBacklog = library.filter(g => g.status === 'Backlog').length;
    const countWishlist = wishlist.length;
    const countDropped = library.filter(g => g.status === 'Dropped').length;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('count-status-all', countAll);
    setVal('count-status-playing', countPlaying);
    setVal('count-status-completed', countCompleted);
    setVal('count-status-backlog', countBacklog);
    setVal('count-status-wishlist', countWishlist);
    setVal('count-status-dropped', countDropped);

    const totalCountEl = document.getElementById('library-total-count');
    if (totalCountEl) totalCountEl.textContent = `${countAll} Games`;
  }

  function renderLibrary() {
    const container = document.getElementById('library-catalog-container');
    if (!container) return;

    updateLibraryStatusCounts();
    let list = [...state.state.library];

    if (libraryStatusFilter === 'Wishlist') {
      
      renderLibraryWishlistProxy(container);
      return;
    } else if (libraryStatusFilter !== 'all') {
      list = list.filter(g => g.status.toLowerCase() === libraryStatusFilter.toLowerCase());
    }

    if (librarySearchQuery) {
      const q = librarySearchQuery.toLowerCase();
      list = list.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.genre.toLowerCase().includes(q) ||
        (g.developer && g.developer.toLowerCase().includes(q))
      );
    }

    if (libraryGenreFilter !== 'all') {
      list = list.filter(g => g.genre.toLowerCase().includes(libraryGenreFilter.toLowerCase()));
    }

    if (libraryPlatformFilter !== 'all') {
      list = list.filter(g => g.platform.toLowerCase().includes(libraryPlatformFilter.toLowerCase()));
    }

    if (librarySortFilter === 'playtime') {
      list.sort((a, b) => b.playtimeHours - a.playtimeHours);
    } else if (librarySortFilter === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (librarySortFilter === 'rating') {
      list.sort((a, b) => (b.userRating || b.rating) - (a.userRating || a.rating));
    } else if (librarySortFilter === 'completion') {
      list.sort((a, b) => {
        const pctA = a.achievementsTotal > 0 ? a.achievementsUnlocked / a.achievementsTotal : 0;
        const pctB = b.achievementsTotal > 0 ? b.achievementsUnlocked / b.achievementsTotal : 0;
        return pctB - pctA;
      });
    } else if (librarySortFilter === 'added') {
      list.reverse();
    } 

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; width: 100%;">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
          <h3>No games match your criteria</h3>
          <p>Try clearing filters or search query to see your games.</p>
          <button class="btn-secondary btn-sm" id="btn-clear-lib-filters">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-clear-lib-filters');
      if (resetBtn) {
        resetBtn.onclick = () => {
          libraryStatusFilter = 'all';
          libraryGenreFilter = 'all';
          libraryPlatformFilter = 'all';
          librarySearchQuery = '';
          const searchInput = document.getElementById('library-search-input');
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('.library-status-tab-btn').forEach(b => b.classList.remove('active'));
          const allBtn = document.querySelector('.library-status-tab-btn[data-status-filter="all"]');
          if (allBtn) allBtn.classList.add('active');
          renderLibrary();
        };
      }
      return;
    }

    if (libraryViewMode === 'grid') {
      container.className = 'games-catalog-grid';
      container.innerHTML = list.map(game => {
        const ratingVal = game.userRating ? `${game.userRating} / 5` : `${game.rating}`;
        return `
          <div class="game-card-grid" data-card-id="${game.id}">
            <div class="game-card-cover">
              <img src="${game.banner}" alt="${game.title}" class="game-cover-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
              <div class="game-cover-badges">
                <span class="status-pill ${game.status.toLowerCase()}">${game.status}</span>
                <button class="fav-btn ${game.favorite ? 'active' : ''}" data-fav-id="${game.id}" title="Favorite" aria-label="Favorite"><svg width="13" height="13" viewBox="0 0 24 24" fill="${game.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>
              </div>
            </div>
            <div class="game-card-content">
              <div class="game-card-title" title="${game.title}">${game.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${game.genre} • ${game.platform}</div>
              <div class="game-card-meta">
                <span><strong>${game.playtimeHours}h</strong> logged</span>
                <span class="game-rating-star"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" style="display:inline-block; vertical-align:-1px; margin-right:2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> ${ratingVal}</span>
              </div>
              <div class="game-card-actions">
                <button class="btn-play-game btn-sm" data-launch-id="${game.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Play</button>
                <button class="btn-secondary btn-sm" data-details-id="${game.id}">Details</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      
      container.className = 'games-catalog-list';
      container.innerHTML = `
        <div class="game-row-header">
          <span>Game Title</span>
          <span>Playtime</span>
          <span>Progress</span>
          <span>Status</span>
          <span>Last Played</span>
          <span>Actions</span>
        </div>
      ` + list.map(game => {
        const achPct = game.achievementsTotal > 0 ? Math.round((game.achievementsUnlocked / game.achievementsTotal) * 100) : 0;
        return `
          <div class="game-row-item" data-card-id="${game.id}">
            <div class="game-row-title-cell">
              <img src="${game.banner}" alt="${game.title}" class="game-row-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80'">
              <div style="min-width: 0;">
                <div class="game-row-title-text" title="${game.title}">${game.title}</div>
                <div class="game-row-subtext">${game.genre} • ${game.platform}</div>
              </div>
            </div>
            <div class="game-row-hours">
              <strong>${game.playtimeHours} hrs</strong>
            </div>
            <div class="game-row-progress-cell">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                <span>${game.achievementsUnlocked}/${game.achievementsTotal}</span>
                <span>${achPct}%</span>
              </div>
              <div class="progress-track-subtle">
                <div class="progress-bar-subtle" style="width: ${achPct}%;"></div>
              </div>
            </div>
            <div>
              <span class="status-pill ${game.status.toLowerCase()}">${game.status}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              ${game.lastPlayed}
            </div>
            <div class="game-row-actions">
              <button class="btn-play-game btn-sm" data-launch-id="${game.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Play</button>
              <button class="btn-secondary btn-sm" data-details-id="${game.id}">Details</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function renderLibraryWishlistProxy(container) {
    const wishlist = state.state.wishlist;
    if (wishlist.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; width: 100%;">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div>
          <h3>No games in your wishlist</h3>
          <p>Explore titles from the Discover tab to build your wishlist.</p>
          <button class="btn-primary btn-sm" data-tab="discover">Discover Games</button>
        </div>
      `;
      return;
    }

    container.className = 'games-catalog-grid';
    container.innerHTML = wishlist.map(item => `
      <div class="game-card-grid">
        <div class="game-card-cover">
          <img src="${item.image}" alt="${item.title}" class="game-cover-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <div class="game-cover-badges">
            <span class="status-pill wishlist">Wishlist</span>
            <span class="platform-pill">${item.priority} Priority</span>
          </div>
        </div>
        <div class="game-card-content">
          <div class="game-card-title">${item.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${item.genre} • Release: ${item.releaseDate}</div>
          <div class="game-card-meta">
            <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-white);">${item.price}</span>
            <span style="font-size: 0.78rem; color: var(--color-primary);">${item.discount || 'Anticipated'}</span>
          </div>
          <div class="game-card-actions">
            <button class="btn-primary btn-sm" style="flex: 1;" data-move-to-lib="${item.title}">+ Add to Library</button>
            <button class="btn-secondary btn-sm" data-remove-wishlist="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async function openGameDetails(gameOrId, isPublicApi = false) {
    sound.click();
    const modal = document.getElementById('game-details-modal');
    if (!modal) return;

    let game = null;
    if (isPublicApi) {
      const found = publicGamesList.find(g => g.id === Number(gameOrId));
      const fullDetails = await api.fetchGameDetails(gameOrId);
      game = fullDetails || found;
      if (game && !game.game_url && found && found.game_url) {
        game.game_url = found.game_url;
      }
    } else {
      game = state.state.library.find(g => g.id === gameOrId);
    }

    if (!game) return;

    if (!game.game_url) {
      if (game.gameUrl) game.game_url = game.gameUrl;
      else if (game.apiId) game.game_url = `https://www.freetogame.com/open/${game.apiId}`;
      else if (typeof game.id === 'number') game.game_url = `https://www.freetogame.com/open/${game.id}`;
    }
    currentModalGame = game;

    const heroImg = document.getElementById('modal-game-hero');
    if (heroImg) heroImg.src = game.banner || game.thumbnail;

    const titleEl = document.getElementById('modal-game-title');
    if (titleEl) titleEl.textContent = game.title;

    const genreEl = document.getElementById('modal-game-genre');
    if (genreEl) genreEl.textContent = game.genre;

    const devEl = document.getElementById('modal-game-dev');
    if (devEl) devEl.textContent = `${game.developer || game.publisher || 'Independent Studio'} • Released ${game.releaseDate || game.release_date || '2024'}`;

    const descEl = document.getElementById('modal-game-desc');
    if (descEl) descEl.textContent = game.description || game.short_description || 'No description available.';

    const hoursEl = document.getElementById('modal-progress-hours');
    if (hoursEl) hoursEl.textContent = `${game.playtimeHours || 0}h`;

    const achCount = game.achievementsUnlocked || 0;
    const achTotal = game.achievementsTotal || 20;
    const achPct = achTotal > 0 ? Math.round((achCount / achTotal) * 100) : 0;

    const compEl = document.getElementById('modal-progress-completion');
    if (compEl) compEl.textContent = `${achPct}%`;

    const achEl = document.getElementById('modal-progress-ach');
    if (achEl) achEl.textContent = `${achCount} / ${achTotal}`;

    const lastEl = document.getElementById('modal-progress-last');
    if (lastEl) lastEl.textContent = game.lastPlayed || 'Never played';

    const statusSelect = document.getElementById('modal-status-select');
    if (statusSelect) {
      statusSelect.value = game.status || 'Backlog';
      statusSelect.onchange = (e) => {
        sound.click();
        const newStatus = e.target.value;
        state.updateGameStatus(game.id, newStatus);
        showToast(`Status updated to ${newStatus}`, 'success');
        renderLibrary();
        renderProfile();
      };
    }

    const inLibrary = state.state.library.some(g => g.id === game.id || (game.id && g.apiId === game.id));
    const addLibBtn = document.getElementById('modal-btn-add-library');
    const playBtn = document.getElementById('modal-btn-play');
    const trackBtn = document.getElementById('modal-btn-track-session');
    const wishBtn = document.getElementById('modal-btn-wishlist-toggle');

    const hasPlayUrl = Boolean(game.game_url && (game.game_url.startsWith('http://') || game.game_url.startsWith('https://')));

    if (addLibBtn) {
      addLibBtn.style.display = inLibrary ? 'none' : 'inline-flex';
      addLibBtn.onclick = () => {
        state.addToLibrary({
          title: game.title,
          genre: game.genre,
          apiId: game.id || game.apiId || null,
          game_url: game.game_url || null,
          banner: game.thumbnail || game.banner,
          description: game.short_description || game.description,
          platform: game.platform || 'PC'
        }, 'Backlog');
        showToast(`Added ${game.title} to your library!`, 'success');
        sound.achievement();
        renderProfile();
        renderLibrary();
        openGameDetails(game.id, false);
      };
    }

    if (playBtn) {
      playBtn.style.display = 'inline-flex';
      if (hasPlayUrl) {
        playBtn.disabled = false;
        playBtn.classList.remove('disabled');
        playBtn.title = `Open official play page for ${game.title} in a new tab`;
        playBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Play Now</span>
        `;
        playBtn.onclick = () => {
          handlePlayNow(game);
        };
      } else {
        playBtn.disabled = true;
        playBtn.classList.add('disabled');
        playBtn.title = 'Play link unavailable for this title';
        playBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          <span>Play Link Unavailable</span>
        `;
        playBtn.onclick = () => {
          showToast(`Play link unavailable for "${game.title}"`, 'warning');
        };
      }
    }

    if (trackBtn) {
      trackBtn.style.display = inLibrary ? 'inline-flex' : 'none';
      trackBtn.onclick = () => {
        closeModal();
        handleLaunchGame(game.id);
      };
    }

    if (wishBtn) {
      const inWish = state.state.wishlist.some(w => w.title.toLowerCase() === game.title.toLowerCase());
      wishBtn.textContent = inWish ? 'In Wishlist' : 'Add to Wishlist';
      wishBtn.onclick = () => {
        sound.click();
        if (inWish) {
          state.removeFromWishlist(game.title);
          showToast('Removed from Wishlist', 'info');
        } else {
          state.addToWishlist(game);
          showToast('Added to Wishlist', 'success');
        }
        renderProfile();
        openGameDetails(game.id, isPublicApi);
      };
    }

    const hltbContainer = document.getElementById('modal-hltb-content');
    if (hltbContainer) {
      if (game.hltb) {
        const played = game.playtimeHours || 0;
        const estRemaining = Math.max(0, Math.round(game.hltb.mainStory - played));
        hltbContainer.innerHTML = `
          <div class="hltb-benchmark-grid">
            <div class="hltb-box">
              <div class="hltb-hours">~${game.hltb.mainStory}h</div>
              <div class="hltb-label">Main Story</div>
            </div>
            <div class="hltb-box">
              <div class="hltb-hours">~${game.hltb.mainExtra}h</div>
              <div class="hltb-label">Main + Extras</div>
            </div>
            <div class="hltb-box">
              <div class="hltb-hours">~${game.hltb.completionist}h</div>
              <div class="hltb-label">Completionist</div>
            </div>
          </div>
          <div class="hltb-remaining-badge">
            <span>Your Progress: <strong>${played}h</strong> played</span>
            <span>• Estimated Story Remaining: <strong>~${estRemaining}h</strong></span>
          </div>
        `;
      } else {
        hltbContainer.innerHTML = `
          <div style="font-size: 0.85rem; color: var(--text-muted); padding: 6px 0;">
            No verified completion time benchmarks tracked for this title (endless/multiplayer or untracked).
          </div>
        `;
      }
    }

    const currentRating = game.userRating || 0;
    const ratingDisplay = document.getElementById('modal-rating-val');
    if (ratingDisplay) ratingDisplay.textContent = currentRating > 0 ? `${currentRating} / 5` : 'Not rated yet';

    const starButtons = document.querySelectorAll('#modal-star-rating-widget .star-btn');
    starButtons.forEach(btn => {
      const starNum = Number(btn.dataset.star);
      if (starNum <= Math.round(currentRating)) {
        btn.classList.add('filled');
      } else {
        btn.classList.remove('filled');
      }
      btn.onclick = () => {
        sound.click();
        let newRating = starNum;
        if (currentRating === starNum) {
          newRating = starNum - 0.5; 
        }
        state.setGameRating(game.id, newRating);
        game.userRating = newRating;
        showToast(`Rated ${newRating} / 5 stars`, 'success');
        openGameDetails(game.id, isPublicApi);
        renderLibrary();
      };
    });

    const commBox = document.getElementById('modal-community-rating-box');
    const commVal = document.getElementById('modal-community-rating-val');
    if (commBox && commVal) {
      if (game.rating) {
        commBox.style.display = 'block';
        commVal.textContent = `${(game.rating / 2).toFixed(1)} / 5`;
      } else {
        commBox.style.display = 'none';
      }
    }

    const reviewInput = document.getElementById('modal-review-input');
    if (reviewInput) {
      reviewInput.value = game.userReview || '';
      const saveReviewBtn = document.getElementById('btn-save-modal-review');
      if (saveReviewBtn) {
        saveReviewBtn.onclick = () => {
          sound.click();
          state.setGameReview(game.id, reviewInput.value.trim());
          game.userReview = reviewInput.value.trim();
          showToast('Personal review saved!', 'success');
        };
      }
    }

    const historyContainer = document.getElementById('modal-session-history-container');
    if (historyContainer) {
      const sessions = (state.state.playHistory || []).filter(s => s.gameId === game.id);
      if (sessions.length === 0) {
        historyContainer.innerHTML = `<div style="font-size: 0.82rem; color: var(--text-muted); padding: 4px 0;">No sessions recorded for this game yet. Launch a session to start tracking!</div>`;
      } else {
        historyContainer.innerHTML = sessions.map(s => `
          <div class="play-history-item">
            <span>${s.date} (${s.rawDate || ''})</span>
            <span><strong>${s.durationHours} hrs</strong></span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">${s.note || 'Regular play session'}</span>
          </div>
        `).join('');
      }
    }

    const specsContainer = document.getElementById('modal-specs-container');
    if (specsContainer) {
      const specs = game.minSpecs || game.minimum_system_requirements || {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i5',
        ram: '8 GB RAM',
        gpu: 'GTX 1060',
        storage: '50 GB'
      };
      specsContainer.innerHTML = `
        <div class="detail-progress-cell"><div class="detail-progress-label">OS</div><div style="font-size: 0.85rem; color: #fff;">${specs.os || 'Windows 10'}</div></div>
        <div class="detail-progress-cell"><div class="detail-progress-label">CPU</div><div style="font-size: 0.85rem; color: #fff;">${specs.cpu || specs.processor || 'Core i5'}</div></div>
        <div class="detail-progress-cell"><div class="detail-progress-label">Memory</div><div style="font-size: 0.85rem; color: #fff;">${specs.ram || specs.memory || '8 GB'}</div></div>
        <div class="detail-progress-cell"><div class="detail-progress-label">Storage</div><div style="font-size: 0.85rem; color: #fff;">${specs.storage || '50 GB'}</div></div>
      `;
    }

    const gallery = document.getElementById('modal-screenshots-gallery');
    if (gallery) {
      let shots = [];
      if (game.screenshots && game.screenshots.length > 0) {
        shots = game.screenshots.map(s => typeof s === 'string' ? s : s.image);
      } else {
        shots = [game.banner || game.thumbnail];
      }
      gallery.innerHTML = shots.map(url => `
        <img src="${url}" alt="Screenshot" style="height: 100px; width: 160px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" loading="lazy">
      `).join('');
    }

    modal.classList.add('open');
  }

  function closeModal() {
    const modal = document.getElementById('game-details-modal');
    if (modal) modal.classList.remove('open');
  }

  function renderGamingJournal() {
    const container = document.getElementById('journal-timeline-container');
    if (!container) return;

    const history = state.state.playHistory || [];
    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
          <h3>No activity recorded yet</h3>
          <p>Launch your games from ApexPlay or log a reflection to start your personal diary.</p>
          <button class="btn-primary btn-sm" id="btn-empty-log-note">+ Add First Note</button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-log-note');
      if (btn) btn.onclick = openManualJournalPrompt;
      return;
    }

    const groups = {};
    history.forEach(entry => {
      const groupKey = entry.date || entry.rawDate || 'Recent';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(entry);
    });

    container.innerHTML = Object.keys(groups).map(dateKey => {
      const entries = groups[dateKey];
      return `
        <div class="journal-group">
          <div class="journal-date-header">
            <span>${dateKey}</span>
          </div>
          ${entries.map(e => `
            <div class="journal-entry-card" data-journal-id="${e.id}">
              <div class="journal-entry-top">
                <div class="journal-game-title">${e.gameTitle}</div>
                ${e.durationHours > 0 ? `
                  <span class="journal-duration-badge">Logged ${e.durationHours}h</span>
                ` : `
                  <span class="journal-duration-badge" style="color: var(--color-warning); background: rgba(232, 184, 74, 0.12);">Milestone</span>
                `}
              </div>
              <div class="journal-note-text">
                "${e.note || 'Regular gaming session recorded.'}"
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;">
                <button class="btn-secondary btn-sm" data-edit-journal="${e.id}" style="padding: 2px 8px; font-size: 0.75rem;">Edit Note</button>
                <button class="btn-secondary btn-sm" data-delete-journal="${e.id}" style="padding: 2px 8px; font-size: 0.75rem; color: var(--color-danger);">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  }

  function openManualJournalPrompt() {
    const library = state.state.library;
    const gameTitles = library.map((g, i) => `${i + 1}. ${g.title}`).join('\n');
    const pick = prompt(`Select game for session note:\n${gameTitles}\n\nEnter number:`, '1');
    if (!pick) return;

    const gameIndex = parseInt(pick, 10) - 1;
    const game = library[gameIndex];
    if (!game) {
      alert('Invalid selection.');
      return;
    }

    const note = prompt(`Enter personal note for ${game.title}:`, 'Completed major milestone.');
    if (!note) return;

    state.logPlaytime(game.id, 1.0, note);
    sound.achievement();
    showToast('Session note added to Gaming Journal!', 'success');
    renderGamingJournal();
    renderProfile();
    renderRecentlyPlayed();
  }

  let selectedMood = 'short';
  let selectedTime = '1';

  function initRecommendationEngine() {
    const modal = document.getElementById('recommendation-modal');
    const btnOpen = document.getElementById('btn-open-recommendation');
    const btnGenerate = document.getElementById('btn-generate-recommendation');

    if (btnOpen && modal) {
      btnOpen.onclick = () => {
        sound.tab();
        modal.classList.add('open');
      };
    }

    document.querySelectorAll('#rec-mood-group .choice-pill-btn').forEach(btn => {
      btn.onclick = () => {
        sound.click();
        document.querySelectorAll('#rec-mood-group .choice-pill-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.dataset.mood;
      };
    });

    document.querySelectorAll('#rec-time-group .choice-pill-btn').forEach(btn => {
      btn.onclick = () => {
        sound.click();
        document.querySelectorAll('#rec-time-group .choice-pill-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTime = btn.dataset.time;
      };
    });

    if (btnGenerate) {
      btnGenerate.onclick = () => {
        sound.click();
        generateRecommendation(selectedMood, parseFloat(selectedTime));
      };
    }
  }

  function generateRecommendation(mood, maxHours) {
    const library = state.state.library;
    if (library.length === 0) return;

    const candidates = library.map(game => {
      let score = 10;
      const reasons = [];

      if (mood === 'story') {
        if (game.genre.toLowerCase().includes('rpg') || game.genre.toLowerCase().includes('adventure')) {
          score += 25;
          reasons.push('Deep, story-driven RPG world you can immerse yourself in');
        }
      } else if (mood === 'short') {
        if (game.playtimeHours < 50 || (game.hltb && game.hltb.mainStory < 30)) {
          score += 25;
          reasons.push('Compact campaign you can make tangible progress in');
        }
      } else if (mood === 'challenging') {
        if (game.genre.toLowerCase().includes('soulslike') || game.genre.toLowerCase().includes('tactical')) {
          score += 25;
          reasons.push('Demanding skill-ceiling matching your appetite for a challenge');
        }
      } else if (mood === 'relaxing') {
        if (game.genre.toLowerCase().includes('roguelike') || game.genre.toLowerCase().includes('rpg')) {
          score += 20;
          reasons.push('Satisfying gameplay loop for unwinding');
        }
      } else if (mood === 'multiplayer') {
        if (game.genre.toLowerCase().includes('shooter') || game.genre.toLowerCase().includes('mmo') || game.genre.toLowerCase().includes('royale')) {
          score += 25;
          reasons.push('Responsive online multiplayer action');
        }
      } else if (mood === 'unplayed') {
        if (game.status === 'Backlog' || game.lastPlayed.includes('week') || game.lastPlayed.includes('month')) {
          score += 30;
          reasons.push('Sitting in your backlog waiting for you');
        }
      }

      if (maxHours <= 1) {
        if (game.genre.toLowerCase().includes('shooter') || game.genre.toLowerCase().includes('roguelike')) {
          score += 15;
          reasons.push('Fits comfortably into a quick under-1-hour session');
        }
      } else if (maxHours >= 2) {
        if (game.genre.toLowerCase().includes('rpg')) {
          score += 15;
          reasons.push('Great for a dedicated 2+ hour marathon session');
        }
      }

      if (game.status === 'Backlog') {
        score += 10;
        reasons.push('Already in your backlog collection');
      }

      if (game.userRating >= 4.5) {
        score += 8;
        reasons.push(`Highly rated by you (${game.userRating} / 5 stars)`);
      }

      if (reasons.length === 0) {
        reasons.push('A reliable standout from your personal library');
      }

      return { game, score, reasons };
    });

    candidates.sort((a, b) => b.score - a.score);
    const pick = candidates[0];
    renderRecommendationResult(pick);
  }

  function renderRecommendationResult(pick) {
    const container = document.getElementById('recommendation-result-container');
    if (!container || !pick) return;

    const game = pick.game;
    container.style.display = 'block';
    container.innerHTML = `
      <div class="recommendation-result-box">
        <div class="recommend-result-hero">
          <img src="${game.banner}" alt="${game.title}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
        </div>
        <div class="recommend-result-body">
          <div style="font-size: 0.75rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase;">Your Pick</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; color: #fff; margin: 2px 0 8px;">${game.title}</h3>
          
          <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-white); margin-top: 6px;">Why this game?</div>
          <div class="recommend-reasons-list">
            ${pick.reasons.slice(0, 4).map(r => `<div class="reason-item"><span>${r}</span></div>`).join('')}
          </div>

          <div style="display: flex; gap: 10px; margin-top: 1rem;">
            <button class="btn-play-game" style="flex: 1;" data-launch-id="${game.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 6px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Start Playing
            </button>
            <button id="btn-rec-pick-another" class="btn-secondary">
              Pick Another
            </button>
          </div>
        </div>
      </div>
    `;

    const pickAnother = document.getElementById('btn-rec-pick-another');
    if (pickAnother) {
      pickAnother.onclick = () => {
        sound.click();
        const remaining = state.state.library.filter(g => g.id !== game.id);
        if (remaining.length > 0) {
          const rand = remaining[Math.floor(Math.random() * remaining.length)];
          renderRecommendationResult({
            game: rand,
            score: 10,
            reasons: [
              'Alternative pick from your library',
              `Current status: ${rand.status}`,
              `Playtime logged: ${rand.playtimeHours} hrs`
            ]
          });
        }
      };
    }
  }

  function renderShelves() {
    const container = document.getElementById('shelves-cards-container');
    if (!container) return;

    const shelves = state.state.shelves || [];
    const countLabel = document.getElementById('shelves-count-label');
    if (countLabel) countLabel.textContent = `${shelves.length} Shelves`;

    if (shelves.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></div>
          <h3>No custom shelves yet</h3>
          <p>Organize your games into collections like "Weekend Raids", "Favorites", or "100% Completed".</p>
          <button class="btn-primary btn-sm" id="btn-empty-shelf">+ Create First Shelf</button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-shelf');
      if (btn) btn.onclick = openCreateShelfModal;
      return;
    }

    container.innerHTML = shelves.map(shelf => {
      const games = state.state.library.filter(g => shelf.gameIds.includes(g.id));
      return `
        <div class="shelf-card" data-shelf-id="${shelf.id}">
          <div class="shelf-header">
            <div>
              <div class="shelf-title">${shelf.name}</div>
              <div class="shelf-desc">${shelf.description || 'Custom collection'}</div>
            </div>
            <span class="section-count-badge">${games.length} games</span>
          </div>

          <div class="shelf-covers-row">
            ${games.slice(0, 5).map(g => `
              <img src="${g.banner}" alt="${g.title}" class="shelf-mini-thumb" title="${g.title}" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80'">
            `).join('')}
            ${games.length === 0 ? '<span style="font-size: 0.8rem; color: var(--text-muted);">No games assigned</span>' : ''}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 8px;">
            <button class="btn-secondary btn-sm" data-view-shelf="${shelf.id}">View Shelf</button>
            <button class="btn-secondary btn-sm" data-delete-shelf="${shelf.id}" style="color: var(--color-danger);">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openCreateShelfModal() {
    sound.click();
    const modal = document.getElementById('create-shelf-modal');
    const picker = document.getElementById('shelf-games-picker');
    if (!modal || !picker) return;

    picker.innerHTML = state.state.library.map(g => `
      <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-white); cursor: pointer;">
        <input type="checkbox" value="${g.id}">
        <span>${g.title}</span>
      </label>
    `).join('');

    modal.classList.add('open');
  }

  function renderLists() {
    const container = document.getElementById('lists-cards-container');
    if (!container) return;

    const lists = state.state.lists || [];
    const countLabel = document.getElementById('lists-count-label');
    if (countLabel) countLabel.textContent = `${lists.length} Lists`;

    if (lists.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></div>
          <h3>No game lists yet</h3>
          <p>Create ranked or unranked lists such as "Best RPGs I've Played" or "Games Everyone Should Try".</p>
          <button class="btn-primary btn-sm" id="btn-empty-list">+ Create First List</button>
        </div>
      `;
      const btn = document.getElementById('btn-empty-list');
      if (btn) btn.onclick = openCreateListModal;
      return;
    }

    container.innerHTML = lists.map(list => {
      const games = list.gameIds.map(id => state.state.library.find(g => g.id === id)).filter(Boolean);
      return `
        <div class="list-card" data-list-id="${list.id}">
          <div class="list-header">
            <div>
              <div class="list-title">${list.title}</div>
              <div class="list-desc">${list.description || ''}</div>
            </div>
            <span class="section-count-badge">${list.ranked ? 'Ranked' : 'Unranked'} • ${games.length} titles</span>
          </div>

          <div class="list-ranked-entries">
            ${games.slice(0, 5).map((g, idx) => `
              <div class="list-entry-row">
                ${list.ranked ? `<span class="list-rank-num">${idx + 1}.</span>` : '<span style="color: var(--color-primary);">•</span>'}
                <span style="font-weight: 600; color: #fff;">${g.title}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: auto;">${g.genre}</span>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: auto; padding-top: 8px;">
            <button class="btn-secondary btn-sm" data-delete-list="${list.id}" style="color: var(--color-danger);">Delete List</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openCreateListModal() {
    sound.click();
    const modal = document.getElementById('create-list-modal');
    const picker = document.getElementById('list-games-picker');
    if (!modal || !picker) return;

    picker.innerHTML = state.state.library.map(g => `
      <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-white); cursor: pointer;">
        <input type="checkbox" value="${g.id}">
        <span>${g.title}</span>
      </label>
    `).join('');

    modal.classList.add('open');
  }

  function renderAchievements(section = 'all') {
    const container = document.getElementById('achievements-list-container');
    if (!container) return;

    const achs = state.state.achievements;
    const unlocked = achs.filter(a => a.unlocked).length;
    const total = achs.length;
    const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const summaryPill = document.getElementById('ach-summary-pill');
    if (summaryPill) summaryPill.textContent = `${unlocked} / ${total} Unlocked`;

    const summaryPct = document.getElementById('ach-summary-pct');
    if (summaryPct) summaryPct.textContent = `${pct}%`;

    const overallBar = document.getElementById('ach-overall-bar');
    if (overallBar) overallBar.style.width = `${pct}%`;

    let list = [...achs];
    if (section === 'unlocked') {
      list = list.filter(a => a.unlocked);
    } else if (section === 'locked') {
      list = list.filter(a => !a.unlocked);
    } else if (section === 'rare') {
      list = list.filter(a => a.rarity === 'Legendary' || a.rarity === 'Epic');
    }

    if (list.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>No achievements found for this section.</p></div>`;
      return;
    }

    container.innerHTML = list.map(ach => {
      const isUnlocked = Boolean(ach.unlocked);
      const isRare = ach.rarity === 'Legendary' || ach.rarity === 'Epic';
      const iconColor = isUnlocked ? (isRare ? 'warning' : 'primary') : 'muted';
      const achIconSvg = window.ApexIcons ? ApexIcons.get(ach.icon || 'trophy', { size: 22, color: iconColor }) : '';
      const checkSvg = window.ApexIcons ? ApexIcons.get('check', { size: 14, color: 'success' }) : '';
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}" data-ach-id="${ach.id}">
          <div class="ach-icon-box">${achIconSvg}</div>
          <div class="ach-content">
            <div class="ach-game-tag">${ach.gameTitle}</div>
            <div class="ach-title">${ach.title}</div>
            <div class="ach-desc">${ach.description}</div>
            <div class="ach-footer">
              <span class="rarity-pill ${ach.rarity.toLowerCase()}">${ach.rarity}</span>
              <span style="font-family: var(--font-mono); color: var(--color-primary);">+${ach.xp} XP</span>
              <button class="ach-toggle-btn" data-toggle-ach="${ach.id}">
                ${isUnlocked ? `${checkSvg} Unlocked` : 'Mark Unlocked'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAnalytics() {
    setTimeout(() => {
      charts.renderWeeklyPlaytime('chart-weekly-canvas', state.state.stats.weeklyHours);
      charts.renderGenreDonut('chart-genre-canvas', state.state.stats.genreBreakdown);
      charts.renderTopGamesBars('top-games-leaderboard', state.state.library);
    }, 50);

    const avgEl = document.getElementById('metric-avg-daily');
    if (avgEl) avgEl.textContent = `${state.state.stats.averageDaily} hrs/day`;

    const streakEl = document.getElementById('metric-longest-session');
    if (streakEl) streakEl.textContent = `${state.state.stats.longestSession} hrs`;

    const mostPlayedEl = document.getElementById('metric-most-played');
    if (mostPlayedEl) {
      const top = [...state.state.library].sort((a, b) => b.playtimeHours - a.playtimeHours)[0];
      if (top) mostPlayedEl.textContent = top.title.split(':')[0];
    }
  }

  async function loadDiscoverGames(genre = 'all') {
    const container = document.getElementById('discover-games-container');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="status-dot-pulse" style="width: 14px; height: 14px; margin-bottom: 12px;"></div>
        <p>Connecting to public games catalog...</p>
      </div>
    `;

    try {
      publicGamesList = await api.fetchGames({ category: genre });
      renderDiscoverGrid(publicGamesList);
    } catch (e) {
      container.innerHTML = `<div class="empty-state"><h3>Unable to load catalog</h3></div>`;
    }
  }

  function renderDiscoverGrid(games) {
    const container = document.getElementById('discover-games-container');
    if (!container) return;

    if (!games || games.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><h3>No titles found</h3></div>`;
      return;
    }

    let list = [...games];
    if (discoverCuratedFilter === 'trending') {
      list = list.slice(0, 16);
    } else if (discoverCuratedFilter === 'recommended') {
      list = list.slice(4, 20);
    } else if (discoverCuratedFilter === 'popular') {
      list = list.slice(8, 24);
    } else if (discoverCuratedFilter === 'new') {
      list = list.reverse().slice(0, 16);
    } else {
      list = list.slice(0, 24);
    }

    container.className = 'games-catalog-grid';
    container.innerHTML = list.map(game => {
      const inLibrary = state.state.library.some(g => (g.apiId && g.apiId === game.id) || g.title === game.title);
      const inWishlist = state.state.wishlist.some(w => w.title.toLowerCase() === game.title.toLowerCase());

      return `
        <div class="game-card-grid" data-api-game-id="${game.id}">
          <div class="game-card-cover">
            <img src="${game.thumbnail}" alt="${game.title}" class="game-cover-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
            <div class="game-cover-badges">
              <span class="genre-tag">${game.genre}</span>
              <span class="platform-pill">${game.platform}</span>
            </div>
          </div>
          <div class="game-card-content">
            <div class="game-card-title" title="${game.title}">${game.title}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${game.developer || game.publisher}</div>
            <div class="game-card-actions">
              ${inLibrary ? `
                <button class="btn-secondary btn-sm" style="flex: 1; color: var(--color-success);" disabled>In Library</button>
              ` : `
                <button class="btn-primary btn-sm" style="flex: 1;" data-add-library-api="${game.id}">+ Add</button>
              `}
              <button class="btn-play-game btn-sm" data-discover-play-id="${game.id}" title="Play Now">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align: middle; margin-right: 2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Play
              </button>
              <button class="btn-secondary btn-sm" data-public-details-id="${game.id}">Details</button>
              <button class="fav-btn ${inWishlist ? 'active' : ''}" data-wishlist-toggle="${game.id}" title="Wishlist" aria-label="Wishlist"><svg width="13" height="13" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderWishlist() {
    const container = document.getElementById('wishlist-container');
    if (!container) return;

    const list = state.state.wishlist;
    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div>
          <h3>Your wishlist is empty</h3>
          <p>Explore titles from the Discover tab to bookmark games you want to play.</p>
          <button class="btn-primary btn-sm" data-tab="discover">Explore Titles</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="wishlist-card">
        <div class="wishlist-media">
          <img src="${item.image}" alt="${item.title}" class="wishlist-img" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'">
          <span class="wishlist-badge">${item.priority} Priority</span>
        </div>
        <div class="wishlist-content">
          <div class="game-card-title">${item.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${item.platform} • Release: ${item.releaseDate}</div>
          <div class="wishlist-price-row">
            <span class="wishlist-price">${item.price}</span>
            <div style="display: flex; gap: 6px;">
              <button class="btn-primary btn-sm" data-move-to-lib="${item.title}">+ Add to Library</button>
              <button class="btn-secondary btn-sm" data-remove-wishlist="${item.id}">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderNews() {
    const newsContainer = document.getElementById('news-cards-container');
    if (newsContainer) {
      newsContainer.innerHTML = state.state.news.map(article => `
        <div class="news-card">
          <div class="news-card-media">
            <img src="${article.image}" alt="${article.title}" class="news-card-img" loading="lazy">
          </div>
          <div class="news-card-body">
            <span class="news-category-chip">${article.category}</span>
            <div class="news-title">${article.title}</div>
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
            <div class="giveaway-title" title="${gv.title}">${gv.title}</div>
            <span class="giveaway-worth">Free (${gv.worth})</span>
          </div>
          <a href="${gv.claimUrl}" target="_blank" class="btn-primary btn-sm" style="text-decoration: none;">Claim</a>
        </div>
      `).join('');
    }
  }

  function handlePlayNow(gameOrUrl, title) {
    let url = null;
    let gameTitle = title || 'Game';

    if (typeof gameOrUrl === 'string') {
      url = gameOrUrl;
    } else if (gameOrUrl && typeof gameOrUrl === 'object') {
      url = gameOrUrl.game_url || gameOrUrl.gameUrl;
      gameTitle = gameOrUrl.title || title || 'Game';

      if (!url && gameOrUrl.apiId) {
        url = `https://www.freetogame.com/open/${gameOrUrl.apiId}`;
      } else if (!url && typeof gameOrUrl.id === 'number') {
        url = `https://www.freetogame.com/open/${gameOrUrl.id}`;
      }
    }

    if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      sound.click();
      showToast(`Play link unavailable for "${gameTitle}"`, 'warning');
      return false;
    }

    sound.launch();
    showToast(`Opening ${gameTitle}...`, 'info');

    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      return true;
    } catch (err) {
      console.error('Failed to open play URL:', err);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    }
  }

  function handleLaunchGame(gameId, playSound = true) {
    if (playSound) sound.launch();
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

    showToast(`Session started: ${session.gameTitle}`, 'info');
    renderProfile();
    renderContinuePlaying();
    renderRecentlyPlayed();
  }

  function handleEndSession() {
    sound.click();
    if (activeSessionInterval) {
      clearInterval(activeSessionInterval);
      activeSessionInterval = null;
    }
    const note = prompt('Add an optional diary reflection note for this session:', '');
    const result = state.endSession(note);
    const banner = document.getElementById('active-session-bar');
    if (banner) banner.classList.remove('visible');

    if (result) {
      showToast(`Session ended for ${result.gameTitle}. Logged ${result.durationHours} hrs!`, 'success');
      renderProfile();
      renderContinuePlaying();
      renderRecentlyPlayed();
      renderLibrary();
      renderGamingJournal();
      renderAnalytics();
    }
  }

  function switchTab(tabId) {
    sound.tab();
    currentTab = tabId;

    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    const activePanel = document.getElementById(`tab-${tabId}`);
    if (activePanel) activePanel.classList.add('active');

    document.querySelectorAll('.nav-tab-btn, .mobile-dock-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (tabId === 'dashboard') {
      renderProfile();
      renderContinuePlaying();
      renderRecentlyPlayed();
      renderDashboardSnapshots();
      renderAnalytics();
    } else if (tabId === 'library') {
      populateLibraryDropdowns();
      renderLibrary();
    } else if (tabId === 'discover') {
      if (publicGamesList.length === 0) loadDiscoverGames();
    } else if (tabId === 'achievements') {
      renderAchievements();
    } else if (tabId === 'activity') {
      renderGamingJournal();
    } else if (tabId === 'analytics') {
      renderAnalytics();
    } else if (tabId === 'shelves') {
      renderShelves();
    } else if (tabId === 'lists') {
      renderLists();
    } else if (tabId === 'wishlist') {
      renderWishlist();
    } else if (tabId === 'news') {
      renderNews();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
        const localMatches = state.state.library.filter(g => 
          g.title.toLowerCase().includes(q.toLowerCase()) ||
          g.genre.toLowerCase().includes(q.toLowerCase())
        );

        let publicMatches = [];
        if (publicGamesList.length > 0) {
          publicMatches = api.searchCatalog(q, publicGamesList).slice(0, 5);
        }

        const combined = [
          ...localMatches.map(m => ({ ...m, source: 'Library' })),
          ...publicMatches.map(p => ({ ...p, banner: p.thumbnail, source: 'Discover' }))
        ];

        if (combined.length === 0) {
          searchDropdown.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">No matching games found</div>`;
        } else {
          searchDropdown.innerHTML = combined.slice(0, 6).map(g => `
            <div class="search-result-item" data-search-id="${g.id}" data-is-public="${g.source === 'Discover'}">
              <img src="${g.banner || g.thumbnail}" class="search-result-thumb" onerror="this.src='https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'">
              <div class="search-result-info">
                <div class="search-result-title">${g.title}</div>
                <div class="search-result-meta">${g.genre} • <span style="color: var(--color-primary);">${g.source}</span></div>
              </div>
            </div>
          `).join('');
        }
        searchDropdown.style.display = 'block';
      }, 200);
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

  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    let iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    if (type === 'success') {
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'warn' || type === 'danger') {
      iconSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }

    toast.innerHTML = `
      <span class="toast-icon-wrap">${iconSvg}</span>
      <span>${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  document.body.addEventListener('click', (e) => {
    
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      e.preventDefault();
      switchTab(tabBtn.dataset.tab);
      return;
    }

    const launchBtn = e.target.closest('[data-launch-id]');
    if (launchBtn) {
      e.preventDefault();
      const gameId = launchBtn.dataset.launchId;
      const game = state.state.library.find(g => g.id === gameId);
      if (game) {
        handlePlayNow(game);
      }
      handleLaunchGame(gameId, false);
      return;
    }

    const discoverPlayBtn = e.target.closest('[data-discover-play-id]');
    if (discoverPlayBtn) {
      e.preventDefault();
      const pubId = Number(discoverPlayBtn.dataset.discoverPlayId);
      const pubGame = publicGamesList.find(g => g.id === pubId);
      if (pubGame) {
        handlePlayNow(pubGame);
      } else {
        handlePlayNow(null, 'Game');
      }
      return;
    }

    const detailsBtn = e.target.closest('[data-details-id]');
    if (detailsBtn) {
      e.preventDefault();
      openGameDetails(detailsBtn.dataset.detailsId, false);
      return;
    }

    const pubDetailsBtn = e.target.closest('[data-public-details-id]');
    if (pubDetailsBtn) {
      e.preventDefault();
      openGameDetails(pubDetailsBtn.dataset.publicDetailsId, true);
      return;
    }

    const addLibBtn = e.target.closest('[data-add-library-api]');
    if (addLibBtn) {
      e.preventDefault();
      const apiId = Number(addLibBtn.dataset.addLibraryApi);
      const publicGame = publicGamesList.find(g => g.id === apiId);
      if (publicGame) {
        state.addToLibrary({
          title: publicGame.title,
          apiId: publicGame.id,
          game_url: publicGame.game_url,
          genre: publicGame.genre,
          banner: publicGame.thumbnail,
          description: publicGame.short_description,
          platform: publicGame.platform
        }, 'Backlog');
        sound.achievement();
        showToast(`Added ${publicGame.title} to your library!`, 'success');
        renderProfile();
        renderLibrary();
        renderDiscoverGrid(publicGamesList);
      }
      return;
    }

    const favBtn = e.target.closest('[data-fav-id]');
    if (favBtn) {
      e.preventDefault();
      sound.click();
      state.toggleFavorite(favBtn.dataset.favId);
      renderLibrary();
      renderShelves();
      return;
    }

    const moveToLibBtn = e.target.closest('[data-move-to-lib]');
    if (moveToLibBtn) {
      e.preventDefault();
      const title = moveToLibBtn.dataset.moveToLib;
      const wishItem = state.state.wishlist.find(w => w.title.toLowerCase() === title.toLowerCase());
      state.addToLibrary({
        title,
        genre: wishItem?.genre,
        banner: wishItem?.image,
        platform: wishItem?.platform,
        game_url: wishItem?.game_url
      }, 'Backlog');
      sound.achievement();
      showToast(`Moved ${title} to Library Backlog!`, 'success');
      renderProfile();
      renderLibrary();
      renderWishlist();
      return;
    }

    const removeWishBtn = e.target.closest('[data-remove-wishlist]');
    if (removeWishBtn) {
      e.preventDefault();
      sound.click();
      state.removeFromWishlist(removeWishBtn.dataset.removeWishlist);
      showToast('Removed from Wishlist', 'info');
      renderWishlist();
      renderProfile();
      renderLibrary();
      return;
    }

    const achBtn = e.target.closest('[data-toggle-ach]');
    if (achBtn) {
      e.preventDefault();
      const res = state.toggleAchievement(achBtn.dataset.toggleAch);
      if (res) {
        if (res.unlocked) {
          sound.achievement();
          showToast(`Milestone unlocked: +${res.xp} XP`, 'success');
        } else {
          sound.click();
          showToast('Milestone reset to locked', 'info');
        }
        renderProfile();
        renderAchievements();
        renderGamingJournal();
      }
      return;
    }

    const viewShelfBtn = e.target.closest('[data-view-shelf]');
    if (viewShelfBtn) {
      e.preventDefault();
      const shelfId = viewShelfBtn.dataset.viewShelf;
      const shelf = (state.state.shelves || []).find(s => s.id === shelfId);
      if (shelf) {
        switchTab('library');
        showToast('Viewing shelf: ' + shelf.name, 'info');
      }
      return;
    }

    const deleteShelfBtn = e.target.closest('[data-delete-shelf]');
    if (deleteShelfBtn) {
      e.preventDefault();
      sound.click();
      state.deleteShelf(deleteShelfBtn.dataset.deleteShelf);
      showToast('Shelf removed', 'info');
      renderShelves();
      renderProfile();
      return;
    }

    const deleteListBtn = e.target.closest('[data-delete-list]');
    if (deleteListBtn) {
      e.preventDefault();
      sound.click();
      state.deleteList(deleteListBtn.dataset.deleteList);
      showToast('List removed', 'info');
      renderLists();
      renderProfile();
      return;
    }

    const editJournalBtn = e.target.closest('[data-edit-journal]');
    if (editJournalBtn) {
      e.preventDefault();
      const id = editJournalBtn.dataset.editJournal;
      const entry = (state.state.playHistory || []).find(e => e.id === id);
      if (entry) {
        const newNote = prompt('Edit your personal reflection note:', entry.note);
        if (newNote !== null) {
          state.updateJournalNote(id, newNote);
          showToast('Diary note updated!', 'success');
          renderGamingJournal();
        }
      }
      return;
    }

    const deleteJournalBtn = e.target.closest('[data-delete-journal]');
    if (deleteJournalBtn) {
      e.preventDefault();
      sound.click();
      state.deleteJournalEntry(deleteJournalBtn.dataset.deleteJournal);
      showToast('Journal entry deleted', 'info');
      renderGamingJournal();
      return;
    }

    if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-backdrop')) {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      return;
    }
  });

  const btnEndSession = document.getElementById('btn-end-session');
  if (btnEndSession) {
    btnEndSession.onclick = handleEndSession;
  }

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

  document.querySelectorAll('.library-status-tab-btn').forEach(btn => {
    btn.onclick = () => {
      sound.click();
      document.querySelectorAll('.library-status-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      libraryStatusFilter = btn.dataset.statusFilter;
      renderLibrary();
    };
  });

  const libSearchInput = document.getElementById('library-search-input');
  if (libSearchInput) {
    libSearchInput.addEventListener('input', (e) => {
      librarySearchQuery = e.target.value.trim();
      renderLibrary();
    });
  }

  const libGenreSelect = document.getElementById('library-genre-select');
  if (libGenreSelect) {
    libGenreSelect.onchange = (e) => {
      libraryGenreFilter = e.target.value;
      renderLibrary();
    };
  }

  const libPlatformSelect = document.getElementById('library-platform-select');
  if (libPlatformSelect) {
    libPlatformSelect.onchange = (e) => {
      libraryPlatformFilter = e.target.value;
      renderLibrary();
    };
  }

  const libSortSelect = document.getElementById('library-sort-select');
  if (libSortSelect) {
    libSortSelect.onchange = (e) => {
      librarySortFilter = e.target.value;
      renderLibrary();
    };
  }

  document.querySelectorAll('.filter-tag-chip[data-discover-curation]').forEach(btn => {
    btn.onclick = () => {
      sound.click();
      document.querySelectorAll('.filter-tag-chip[data-discover-curation]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      discoverCuratedFilter = btn.dataset.discoverCuration;
      renderDiscoverGrid(publicGamesList);
    };
  });

  const discoverGenreSelect = document.getElementById('discover-genre-filter');
  if (discoverGenreSelect) {
    discoverGenreSelect.onchange = (e) => {
      discoverGenreFilter = e.target.value;
      loadDiscoverGames(discoverGenreFilter);
    };
  }

  const btnDiscoverRandom = document.getElementById('btn-discover-random');
  if (btnDiscoverRandom) {
    btnDiscoverRandom.onclick = () => {
      sound.click();
      if (publicGamesList.length > 0) {
        const rand = publicGamesList[Math.floor(Math.random() * publicGamesList.length)];
        openGameDetails(rand.id, true);
      }
    };
  }

  document.querySelectorAll('.choice-pill-btn[data-ach-section]').forEach(btn => {
    btn.onclick = () => {
      sound.click();
      document.querySelectorAll('.choice-pill-btn[data-ach-section]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      renderAchievements(btn.dataset.achSection);
    };
  });

  const btnAddManualJournal = document.getElementById('btn-add-manual-journal');
  if (btnAddManualJournal) {
    btnAddManualJournal.onclick = openManualJournalPrompt;
  }

  const btnCreateShelf = document.getElementById('btn-create-shelf');
  if (btnCreateShelf) {
    btnCreateShelf.onclick = openCreateShelfModal;
  }

  const btnSaveShelf = document.getElementById('btn-save-shelf');
  if (btnSaveShelf) {
    btnSaveShelf.onclick = () => {
      const name = document.getElementById('input-shelf-name')?.value;
      const desc = document.getElementById('input-shelf-desc')?.value;
      const checkedBoxes = document.querySelectorAll('#shelf-games-picker input:checked');
      const gameIds = Array.from(checkedBoxes).map(cb => cb.value);

      if (!name || !name.trim()) {
        alert('Please specify a shelf name.');
        return;
      }

      state.createShelf(name, desc, gameIds);
      sound.achievement();
      showToast(`Created "${name}" shelf!`, 'success');
      document.getElementById('create-shelf-modal')?.classList.remove('open');
      renderShelves();
      renderProfile();
    };
  }

  const btnCreateList = document.getElementById('btn-create-list');
  if (btnCreateList) {
    btnCreateList.onclick = openCreateListModal;
  }

  const btnSaveList = document.getElementById('btn-save-list');
  if (btnSaveList) {
    btnSaveList.onclick = () => {
      const title = document.getElementById('input-list-title')?.value;
      const desc = document.getElementById('input-list-desc')?.value;
      const ranked = document.getElementById('input-list-ranked')?.checked;
      const checkedBoxes = document.querySelectorAll('#list-games-picker input:checked');
      const gameIds = Array.from(checkedBoxes).map(cb => cb.value);

      if (!title || !title.trim()) {
        alert('Please specify a list title.');
        return;
      }

      state.createList(title, desc, ranked, gameIds);
      sound.achievement();
      showToast(`Created "${title}" list!`, 'success');
      document.getElementById('create-list-modal')?.classList.remove('open');
      renderLists();
      renderProfile();
    };
  }

  const btnThemeDark = document.getElementById('btn-theme-dark');
  const btnThemeLight = document.getElementById('btn-theme-light');
  if (btnThemeDark && btnThemeLight) {
    btnThemeDark.onclick = () => {
      sound.click();
      document.body.classList.remove('light-theme');
      state.updateSettings({ theme: 'dark' });
      showToast('Dark theme applied', 'info');
    };
    btnThemeLight.onclick = () => {
      sound.click();
      document.body.classList.add('light-theme');
      state.updateSettings({ theme: 'light' });
      showToast('Light theme applied', 'info');
    };
  }

  document.querySelectorAll('.color-dot-choice').forEach(dot => {
    dot.onclick = () => {
      sound.click();
      document.querySelectorAll('.color-dot-choice').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      const color = dot.dataset.color;
      document.documentElement.style.setProperty('--color-primary', color);
      document.documentElement.style.setProperty('--color-primary-hover', color);
      state.updateSettings({ accentColor: color });
      showToast('Accent color updated', 'success');
    };
  });

  const toggleReduceMotion = document.getElementById('toggle-reduce-motion');
  if (toggleReduceMotion) {
    toggleReduceMotion.onchange = (e) => {
      sound.click();
      document.body.classList.toggle('reduce-motion', e.target.checked);
      state.updateSettings({ reduceMotion: e.target.checked });
      showToast(e.target.checked ? 'Motion reduced' : 'Full motion restored', 'info');
    };
  }

  const toggleSound = document.getElementById('toggle-sound-effects');
  if (toggleSound) {
    toggleSound.onchange = () => {
      const isMuted = sound.toggleMute();
      toggleSound.checked = !isMuted;
      updateSoundButtonIcon(isMuted);
      showToast(isMuted ? 'Audio muted' : 'Audio enabled', 'info');
    };
  }

  const btnNavSound = document.getElementById('btn-toggle-sound');
  if (btnNavSound) {
    btnNavSound.onclick = () => {
      const isMuted = sound.toggleMute();
      updateSoundButtonIcon(isMuted);
      if (toggleSound) toggleSound.checked = !isMuted;
      showToast(isMuted ? 'Audio muted' : 'Audio enabled', 'info');
      if (!isMuted) sound.click();
    };
  }

  const settingsDefaultView = document.getElementById('settings-default-view');
  if (settingsDefaultView) {
    settingsDefaultView.onchange = (e) => {
      sound.click();
      libraryViewMode = e.target.value;
      state.updateSettings({ defaultLibraryView: e.target.value });
      showToast(`Default library view: ${e.target.value}`, 'info');
      renderLibrary();
    };
  }

  const btnExportData = document.getElementById('btn-export-data');
  if (btnExportData) {
    btnExportData.onclick = () => {
      sound.achievement();
      const json = state.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apexplay_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported platform JSON backup!', 'success');
    };
  }

  const btnSettingsReset = document.getElementById('btn-settings-reset');
  if (btnSettingsReset) {
    btnSettingsReset.onclick = () => {
      if (confirm('Reset ApexPlay to factory default state and sample library?')) {
        state.reset();
        sound.click();
        showToast('Dashboard reset to factory settings', 'info');
        applyInitialSettings();
        renderProfile();
        renderContinuePlaying();
        renderRecentlyPlayed();
        renderLibrary();
        renderAchievements();
        renderGamingJournal();
        renderShelves();
        renderLists();
        renderAnalytics();
        renderWishlist();
      }
    };
  }

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

  const btnCloseLevelup = document.getElementById('btn-close-levelup');
  if (btnCloseLevelup) {
    btnCloseLevelup.onclick = () => {
      sound.click();
      document.getElementById('level-up-modal')?.classList.remove('active');
    };
  }

  function initAuthGate() {
    const gate = document.getElementById('gmail-login-gate');
    const btnGoogle = document.getElementById('btn-google-signin');
    const formGmail = document.getElementById('form-gmail-login');
    const inputEmail = document.getElementById('gmail-input-email');
    const inputName = document.getElementById('gmail-input-name');
    const btnSignout = document.getElementById('btn-user-signout');

    function updateGateVisibility() {
      const isAuth = Boolean(state.state.auth && state.state.auth.isAuthenticated);
      if (gate) {
        if (isAuth) {
          gate.classList.add('hidden');
        } else {
          gate.classList.remove('hidden');
        }
      }
      if (btnSignout) {
        btnSignout.style.display = isAuth ? 'inline-flex' : 'none';
      }
    }

    function processLogin(email, displayName) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('.com'))) {
        showToast('Please enter a valid Gmail address (@gmail.com)', 'warn');
        sound.click();
        return false;
      }
      const user = state.loginWithGoogle(cleanEmail, displayName, photoURL);
      sound.achievement();
      showToast(`Welcome to ApexPlay, ${user.displayName}!`, 'success');
      updateGateVisibility();
      renderProfile();
      return true;
    }

    if (btnGoogle) {
      btnGoogle.onclick = () => {
        sound.click();
        if (window.firebaseSignInWithPopup && window.firebaseAuth && window.googleAuthProvider) {
          window.firebaseSignInWithPopup(window.firebaseAuth, window.googleAuthProvider)
            .then((result) => {
              const u = result.user;
              processLogin(u.email, u.displayName, u.photoURL);
            })
            .catch((err) => {
              console.warn('Firebase Google sign-in fallback:', err);
              const demoGmail = inputEmail && inputEmail.value ? inputEmail.value.trim() : 'gamer@gmail.com';
              const entered = prompt('Sign in with your Google account (Gmail):', demoGmail);
              if (entered) {
                processLogin(entered, entered.split('@')[0]);
              }
            });
        } else {
          const demoGmail = inputEmail && inputEmail.value ? inputEmail.value.trim() : 'gamer@gmail.com';
          const entered = prompt('Sign in with your Google account (Gmail):', demoGmail);
          if (entered) {
            processLogin(entered, entered.split('@')[0]);
          }
        }
      };
    }

    if (formGmail) {
      formGmail.onsubmit = (e) => {
        e.preventDefault();
        const email = inputEmail ? inputEmail.value : '';
        const name = inputName ? inputName.value : '';
        processLogin(email, name);
      };
    }

    if (btnSignout) {
      btnSignout.onclick = () => {
        sound.click();
        if (window.firebaseSignOut && window.firebaseAuth) {
          window.firebaseSignOut(window.firebaseAuth).catch(() => {});
        }
        state.logout();
        showToast('Signed out of Gmail session', 'info');
        updateGateVisibility();
        renderProfile();
      };
    }

    updateGateVisibility();
  }

  initAuthGate();
  applyInitialSettings();
  initRecommendationEngine();

  renderProfile();
  renderContinuePlaying();
  renderRecentlyPlayed();
  renderDashboardSnapshots();
  populateLibraryDropdowns();
  renderLibrary();
  renderAchievements();
  renderGamingJournal();
  renderShelves();
  renderLists();
  renderAnalytics();
  renderWishlist();
  renderNews();

  loadDiscoverGames('all');
});
