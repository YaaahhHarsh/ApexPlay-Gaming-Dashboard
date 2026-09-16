/**
 * APEXPLAY PUBLIC GAMES API CLIENT
 * Integrates FreeToGame Public Games API with fallback offline catalog and search.
 */

const FREE_TO_GAME_BASE = 'https://www.freetogame.com/api';

const FALLBACK_PUBLIC_GAMES = [
  {
    id: 540,
    title: 'Overwatch 2',
    thumbnail: 'https://www.freetogame.com/g/540/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/overwatch-2',
    short_description: 'A hero-focused first-person team shooter from Blizzard Entertainment.',
    genre: 'Shooter',
    platform: 'PC (Windows)',
    publisher: 'Activision Blizzard',
    developer: 'Blizzard Entertainment',
    release_date: '2022-10-04'
  },
  {
    id: 516,
    title: 'PUBG: BATTLEGROUNDS',
    thumbnail: 'https://www.freetogame.com/g/516/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/pubg',
    short_description: 'Get into the action in one of the longest running Battle Royale games available on Steam.',
    genre: 'Shooter',
    platform: 'PC (Windows)',
    publisher: 'KRAFTON, Inc.',
    developer: 'KRAFTON, Inc.',
    release_date: '2022-01-12'
  },
  {
    id: 475,
    title: 'Genshin Impact',
    thumbnail: 'https://www.freetogame.com/g/475/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/genshin-impact',
    short_description: 'If you’ve been looking for a game to scratch that Breath of the Wild itch, check out this open-world anime RPG.',
    genre: 'Action RPG',
    platform: 'PC (Windows)',
    publisher: 'miHoYo',
    developer: 'miHoYo',
    release_date: '2020-09-28'
  },
  {
    id: 11,
    title: 'Apex Legends',
    thumbnail: 'https://www.freetogame.com/g/11/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/apex-legends',
    short_description: 'A free-to-play strategic battle royale game featuring 60-player matches and unique abilities.',
    genre: 'Battle Royale',
    platform: 'PC (Windows)',
    publisher: 'Electronic Arts',
    developer: 'Respawn Entertainment',
    release_date: '2019-02-04'
  },
  {
    id: 23,
    title: 'Warframe',
    thumbnail: 'https://www.freetogame.com/g/23/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/warframe',
    short_description: 'A cooperative free-to-play third person online action shooter set in an evolving sci-fi world.',
    genre: 'Shooter / Sci-Fi',
    platform: 'PC (Windows)',
    publisher: 'Digital Extremes',
    developer: 'Digital Extremes',
    release_date: '2013-03-25'
  },
  {
    id: 1,
    title: 'Dauntless',
    thumbnail: 'https://www.freetogame.com/g/1/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/dauntless',
    short_description: 'A free-to-play, co-op action RPG with gameplay similar to Monster Hunter.',
    genre: 'Action RPG',
    platform: 'PC (Windows)',
    publisher: 'Phoenix Labs',
    developer: 'Phoenix Labs',
    release_date: '2019-05-21'
  },
  {
    id: 340,
    title: 'World of Tanks',
    thumbnail: 'https://www.freetogame.com/g/340/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/world-of-tanks',
    short_description: 'A team-based free-to-play 3D action vehicular combat game developed by Wargaming.',
    genre: 'Shooter / Tactical',
    platform: 'PC (Windows)',
    publisher: 'Wargaming',
    developer: 'Wargaming',
    release_date: '2011-04-12'
  },
  {
    id: 217,
    title: 'Smite',
    thumbnail: 'https://www.freetogame.com/g/217/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/smite',
    short_description: 'A 3D third-person free-to-play multiplayer online battle arena developed by Hi-Rez Studios.',
    genre: 'MOBA',
    platform: 'PC (Windows)',
    publisher: 'Hi-Rez Studios',
    developer: 'Hi-Rez Studios',
    release_date: '2014-03-25'
  },
  {
    id: 380,
    title: 'Dark Orbit Reloaded',
    thumbnail: 'https://www.freetogame.com/g/380/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/dark-orbit',
    short_description: 'A free-to-play 3D space combat MMO where players explore alien galaxies.',
    genre: 'MMORPG / Space',
    platform: 'Web Browser',
    publisher: 'Bigpoint',
    developer: 'Bigpoint',
    release_date: '2006-12-11'
  },
  {
    id: 28,
    title: 'Spacelords',
    thumbnail: 'https://www.freetogame.com/g/28/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/spacelords',
    short_description: 'A free-to-play 4v1 sci-fi shooter combining intense cooperative battles with competitive PvP.',
    genre: 'Shooter',
    platform: 'PC (Windows)',
    publisher: 'MercurySteam',
    developer: 'MercurySteam',
    release_date: '2017-09-22'
  },
  {
    id: 452,
    title: 'Call of Duty: Warzone',
    thumbnail: 'https://www.freetogame.com/g/452/thumbnail.jpg',
    game_url: 'https://www.freetogame.com/open/call-of-duty-warzone',
    short_description: 'A massive free-to-play combat arena battle royale experience from the world of Modern Warfare.',
    genre: 'Battle Royale',
    platform: 'PC (Windows)',
    publisher: 'Activision',
    developer: 'Infinity Ward',
    release_date: '2020-03-10'
  },
  {
    id: 466,
    title: 'Valorant Protocol',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    game_url: 'https://playvalorant.com',
    short_description: 'Character-based 5v5 tactical shooter where sharp gunplay meets supernatural agent tactical prowess.',
    genre: 'Tactical Shooter',
    platform: 'PC (Windows)',
    publisher: 'Riot Games',
    developer: 'Riot Games',
    release_date: '2020-06-02'
  }
];

class GamesApiClient {
  constructor() {
    this.cache = new Map();
    this.status = { connected: false, message: 'Connecting to Public Games API...' };
  }

  async fetchGames({ category = 'all', platform = 'all', sortBy = 'popularity' } = {}) {
    let url = `${FREE_TO_GAME_BASE}/games?`;
    const params = [];
    if (category && category !== 'all') params.push(`category=${encodeURIComponent(category.toLowerCase())}`);
    if (platform && platform !== 'all') params.push(`platform=${encodeURIComponent(platform.toLowerCase())}`);
    if (sortBy) params.push(`sort-by=${encodeURIComponent(sortBy.toLowerCase())}`);

    url += params.join('&');
    const cacheKey = url;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.status = { connected: true, message: `Connected: FreeToGame API (${data.length} games)` };
      this.cache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.warn('Live API fetch failed, using rich fallback catalog:', err.message);
      this.status = { connected: false, message: 'Offline Mode (Catalog Cached)' };
      
      let filtered = [...FALLBACK_PUBLIC_GAMES];
      if (category && category !== 'all') {
        filtered = filtered.filter(g => g.genre.toLowerCase().includes(category.toLowerCase()));
      }
      return filtered;
    }
  }

  async fetchGameDetails(apiId) {
    if (!apiId) return null;
    const cacheKey = `game_${apiId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${FREE_TO_GAME_BASE}/game?id=${apiId}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.warn(`Game details API error for id ${apiId}:`, err.message);
      // Construct fallback from fallback list
      const fallback = FALLBACK_PUBLIC_GAMES.find(g => g.id === Number(apiId));
      if (fallback) {
        return {
          ...fallback,
          description: fallback.short_description + ' Join millions of active players worldwide in thrilling matches and immersive seasonal updates.',
          screenshots: [
            { id: 1, image: fallback.thumbnail }
          ],
          minimum_system_requirements: {
            os: 'Windows 10 64-bit',
            processor: 'Intel Core i5-6600K or AMD Ryzen 5 1600',
            memory: '8 GB RAM',
            graphics: 'NVIDIA GeForce GTX 1060 or AMD Radeon RX 580',
            storage: '40 GB available space'
          }
        };
      }
      return null;
    }
  }

  searchCatalog(query, catalog) {
    if (!query || !query.trim()) return catalog;
    const q = query.toLowerCase().trim();
    return catalog.filter(game => {
      return (
        game.title.toLowerCase().includes(q) ||
        (game.genre && game.genre.toLowerCase().includes(q)) ||
        (game.publisher && game.publisher.toLowerCase().includes(q)) ||
        (game.developer && game.developer.toLowerCase().includes(q))
      );
    });
  }
}

window.gamesApi = new GamesApiClient();
