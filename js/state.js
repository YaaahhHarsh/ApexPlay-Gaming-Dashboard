/**
 * APEXPLAY STATE MANAGEMENT
 * Handles reactive profile, library, achievements, wishlist, and statistics with localStorage persistence.
 */

const STORAGE_KEY = 'apexplay_gaming_state_v1';

const DEFAULT_STATE = {
  profile: {
    gamertag: 'V0RT3X_KNIGHT',
    title: 'Cyber Vanguard',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    level: 47,
    xp: 6850,
    nextLevelXp: 8500,
    rank: 'Grandmaster Tier II',
    status: 'online', // 'online' | 'in-game' | 'away' | 'offline'
    currentPlaying: 'Cyberpunk 2077',
    bio: 'Competitive FPS & immersive RPG enthusiast. Building the ultimate sci-fi backcatalog. Always down for co-op raids!',
    badges: [
      { id: 'b1', name: 'Aim God', icon: '🎯', desc: 'Maintained 60%+ headshot accuracy in 50 matches' },
      { id: 'b2', name: 'Platinum Collector', icon: '🏆', desc: '100% completed 12 AAA titles' },
      { id: 'b3', name: 'Night Owl', icon: '🌙', desc: 'Over 500 hours logged between midnight and 5 AM' },
      { id: 'b4', name: 'Speedrunner', icon: '⚡', desc: 'Top 5% completion speed in Elden Ring' }
    ]
  },
  activeSession: null, // { gameId, gameTitle, startTime }
  library: [
    {
      id: 'g-cyberpunk',
      apiId: null,
      title: 'Cyberpunk 2077: Phantom Liberty',
      genre: 'RPG / Action',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'An open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.',
      playtimeHours: 194.5,
      lastPlayed: '2 hours ago',
      rating: 9.4,
      status: 'Playing', // 'Playing' | 'Completed' | 'Backlog' | 'Installed'
      favorite: true,
      developer: 'CD PROJEKT RED',
      releaseDate: '2023-09-26',
      achievementsTotal: 48,
      achievementsUnlocked: 41,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Core i7-6700 or Ryzen 5 1600',
        ram: '12 GB RAM',
        gpu: 'GeForce GTX 1060 6GB or Radeon RX 580',
        storage: '70 GB SSD'
      }
    },
    {
      id: 'g-eldenring',
      apiId: null,
      title: 'Elden Ring: Shadow of the Erdtree',
      genre: 'Soulslike / Action RPG',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
      playtimeHours: 242.0,
      lastPlayed: 'Yesterday',
      rating: 9.8,
      status: 'Completed',
      favorite: true,
      developer: 'FromSoftware',
      releaseDate: '2024-06-21',
      achievementsTotal: 42,
      achievementsUnlocked: 42,
      minSpecs: {
        os: 'Windows 10',
        cpu: 'Intel Core i5-8400 | AMD Ryzen 3 3300X',
        ram: '12 GB RAM',
        gpu: 'NVIDIA GeForce GTX 1060 3 GB',
        storage: '60 GB'
      }
    },
    {
      id: 'g-valorant',
      apiId: null,
      title: 'Valorant',
      genre: 'Tactical Shooter',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'A 5v5 character-based tactical FPS where precise gunplay meets unique agent abilities.',
      playtimeHours: 388.2,
      lastPlayed: '3 days ago',
      rating: 8.9,
      status: 'Playing',
      favorite: true,
      developer: 'Riot Games',
      releaseDate: '2020-06-02',
      achievementsTotal: 30,
      achievementsUnlocked: 24,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core 2 Duo E8400',
        ram: '4 GB RAM',
        gpu: 'Intel HD 4000',
        storage: '20 GB'
      }
    },
    {
      id: 'g-overwatch',
      apiId: 540,
      title: 'Overwatch 2',
      genre: 'Shooter / Hero',
      platform: 'PC',
      banner: 'https://www.freetogame.com/g/540/thumbnail.jpg',
      screenshots: [
        'https://www.freetogame.com/g/540/overwatch-2-1.jpg',
        'https://www.freetogame.com/g/540/overwatch-2-2.jpg'
      ],
      description: 'A hero-focused first-person team shooter from Blizzard Entertainment with always-on and ever-evolving live competition.',
      playtimeHours: 165.4,
      lastPlayed: '5 days ago',
      rating: 8.3,
      status: 'Installed',
      favorite: false,
      developer: 'Blizzard Entertainment',
      releaseDate: '2022-10-04',
      achievementsTotal: 35,
      achievementsUnlocked: 19,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i3 or AMD Phenom X3 8650',
        ram: '6 GB RAM',
        gpu: 'GeForce GTX 600 series',
        storage: '50 GB'
      }
    },
    {
      id: 'g-destiny2',
      apiId: 475,
      title: 'Destiny 2: The Final Shape',
      genre: 'MMO / Sci-Fi Shooter',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Dive into the world of Destiny 2 to explore the mysteries of the solar system and experience responsive first-person shooter combat.',
      playtimeHours: 412.0,
      lastPlayed: '1 week ago',
      rating: 9.1,
      status: 'Backlog',
      favorite: false,
      developer: 'Bungie',
      releaseDate: '2019-10-01',
      achievementsTotal: 50,
      achievementsUnlocked: 38,
      minSpecs: {
        os: 'Windows 10',
        cpu: 'Intel Core i3 3250',
        ram: '6 GB RAM',
        gpu: 'NVIDIA GeForce GTX 660',
        storage: '105 GB'
      }
    },
    {
      id: 'g-apex',
      apiId: 11,
      title: 'Apex Legends',
      genre: 'Battle Royale',
      platform: 'PC',
      banner: 'https://www.freetogame.com/g/11/thumbnail.jpg',
      screenshots: [
        'https://www.freetogame.com/g/11/apex-legends-1.jpg'
      ],
      description: 'Master an expanding roster of legendary characters with powerful abilities in a strategic team-based battle royale.',
      playtimeHours: 218.7,
      lastPlayed: '2 weeks ago',
      rating: 8.8,
      status: 'Installed',
      favorite: false,
      developer: 'Respawn Entertainment',
      releaseDate: '2019-02-04',
      achievementsTotal: 25,
      achievementsUnlocked: 18,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i3-6300',
        ram: '6 GB RAM',
        gpu: 'NVIDIA GeForce GT 640',
        storage: '56 GB'
      }
    }
  ],
  wishlist: [
    {
      id: 'w1',
      title: 'Grand Theft Auto VI',
      genre: 'Open World / Action',
      price: '$69.99',
      discount: 'Pre-order 10% off',
      releaseDate: 'Fall 2025',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      priority: 'High',
      platform: 'PS5 / Xbox Series / PC'
    },
    {
      id: 'w2',
      title: 'Death Stranding 2: On The Beach',
      genre: 'Sci-Fi Adventure',
      price: '$69.99',
      discount: null,
      releaseDate: '2025',
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      priority: 'Medium',
      platform: 'PS5'
    },
    {
      id: 'w3',
      title: 'Ghost of Yōtei',
      genre: 'Action / Samurai',
      price: '$69.99',
      discount: 'Wishlisted',
      releaseDate: '2025',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      priority: 'High',
      platform: 'PS5 / PC'
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      gameTitle: 'Cyberpunk 2077',
      title: 'The Sun Rises Over Pacifica',
      description: 'Complete Phantom Liberty storyline with secret infiltration pathway.',
      rarity: 'Legendary',
      xp: 250,
      unlocked: true,
      unlockedDate: '2026-09-10',
      icon: '🌅'
    },
    {
      id: 'ach-2',
      gameTitle: 'Cyberpunk 2077',
      title: 'Relic Overload',
      description: 'Unlock all perks in the new Relic attribute tree.',
      rarity: 'Epic',
      xp: 150,
      unlocked: true,
      unlockedDate: '2026-09-08',
      icon: '🧠'
    },
    {
      id: 'ach-3',
      gameTitle: 'Elden Ring',
      title: 'Lord of Frenzied Flame',
      description: 'Succumb to the frenzied flame and achieve the apocalyptic ending.',
      rarity: 'Legendary',
      xp: 300,
      unlocked: true,
      unlockedDate: '2026-08-28',
      icon: '🔥'
    },
    {
      id: 'ach-4',
      gameTitle: 'Elden Ring',
      title: 'Shadow Realm Vanquisher',
      description: 'Defeat Promised Consort Radahn in the Realm of Shadow.',
      rarity: 'Legendary',
      xp: 350,
      unlocked: true,
      unlockedDate: '2026-08-20',
      icon: '⚔️'
    },
    {
      id: 'ach-5',
      gameTitle: 'Valorant',
      title: 'Ace Machine',
      description: 'Score an Ace in competitive overtime match.',
      rarity: 'Epic',
      xp: 200,
      unlocked: true,
      unlockedDate: '2026-09-05',
      icon: '👑'
    },
    {
      id: 'ach-6',
      gameTitle: 'Valorant',
      title: 'Clutch Master 1v4',
      description: 'Defuse the Spike while surviving against 4 enemy agents.',
      rarity: 'Rare',
      xp: 100,
      unlocked: false,
      unlockedDate: null,
      icon: '💣'
    },
    {
      id: 'ach-7',
      gameTitle: 'Destiny 2',
      title: 'Raid World First Contender',
      description: 'Clear Salvation’s Edge Raid within Contest Mode week.',
      rarity: 'Legendary',
      xp: 400,
      unlocked: true,
      unlockedDate: '2026-07-14',
      icon: '🌌'
    },
    {
      id: 'ach-8',
      gameTitle: 'Overwatch 2',
      title: 'Team Wipe Solo Q',
      description: 'Deliver final blows to 5 opponents within 10 seconds in competitive queue.',
      rarity: 'Rare',
      xp: 120,
      unlocked: false,
      unlockedDate: null,
      icon: '💥'
    },
    {
      id: 'ach-9',
      gameTitle: 'Apex Legends',
      title: '20 Bomb Predator',
      description: 'Eliminate at least 20 enemies in a single Battle Royale match.',
      rarity: 'Legendary',
      xp: 500,
      unlocked: false,
      unlockedDate: null,
      icon: '☠️'
    }
  ],
  stats: {
    weeklyHours: [
      { day: 'Mon', hours: 3.5 },
      { day: 'Tue', hours: 4.2 },
      { day: 'Wed', hours: 2.8 },
      { day: 'Thu', hours: 5.0 },
      { day: 'Fri', hours: 6.8 },
      { day: 'Sat', hours: 8.4 },
      { day: 'Sun', hours: 7.1 }
    ],
    genreBreakdown: [
      { genre: 'Action RPG', hours: 536.5, color: '#8b5cf6' },
      { genre: 'Tactical Shooter', hours: 388.2, color: '#06b6d4' },
      { genre: 'MMO / Sci-Fi', hours: 412.0, color: '#10b981' },
      { genre: 'Battle Royale', hours: 218.7, color: '#f59e0b' },
      { genre: 'Hero Shooter', hours: 165.4, color: '#ec4899' }
    ],
    longestSession: 8.4,
    averageDaily: 5.4,
    completionRate: 82,
    totalHours: 1720.8
  },
  news: [
    {
      id: 'n1',
      title: 'Next-Gen Unreal Engine 5.5 Revealed With Megalights Raytracing',
      category: 'Tech & Hardware',
      source: 'TechForge Gaming',
      time: '3 hours ago',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      summary: 'Epic Games showcases revolutionary Megalights tech, rendering thousands of dynamic movable lights in real-time on desktop and consoles with zero shadow bake lag.'
    },
    {
      id: 'n2',
      title: 'Valorant Champions Tour 2026 World Finals Head to Tokyo Dome',
      category: 'Esports',
      source: 'VLR Arena',
      time: '6 hours ago',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      summary: 'The top 16 teams from EMEA, Americas, Pacific, and China will collide in front of 50,000 spectators for the biggest esports tournament in tactical FPS history.'
    },
    {
      id: 'n3',
      title: 'Cyberpunk Project Orion Enters Full Production With Boston Studio',
      category: 'Industry',
      source: 'Night City Wire',
      time: '12 hours ago',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
      summary: 'CD Projekt Red confirms core staff expansion and motion capture setup for the Cyberpunk sequel, exploring multi-district expanded vertical gameplay.'
    },
    {
      id: 'n4',
      title: 'Steam Summer Next-Fest Sets New Record With Over 2,000 Demos',
      category: 'Releases',
      source: 'Valve Bulletin',
      time: '1 day ago',
      readTime: '2 min read',
      image: 'https://images.unsplash.com/photo-1612287233207-63a5f8e6c764?w=600&auto=format&fit=crop&q=80',
      summary: 'Indie devs celebrated record-shattering download volumes as playable sci-fi, survival, and roguelike deckbuilders topped community wishlist charts.'
    }
  ],
  giveaways: [
    {
      id: 'gv1',
      title: 'Warframe: Tenno Reinforcements Cyber Bundle',
      platform: 'PC / Steam',
      worth: '$29.99',
      status: 'Active',
      claimUrl: 'https://www.warframe.com',
      image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'gv2',
      title: 'Guild Wars 2: Heroic Edition Key',
      platform: 'PC',
      worth: '$19.99',
      status: 'Active',
      claimUrl: 'https://www.guildwars2.com',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80'
    }
  ]
};

class GameState {
  constructor() {
    this.state = this.load();
    this.listeners = [];
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse saved state, using default:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
    this.notify();
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (e) { console.error(e); }
    });
  }

  // Profile actions
  updateProfile(updates) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.save();
  }

  addXP(amount) {
    let p = this.state.profile;
    p.xp += amount;
    let leveledUp = false;
    while (p.xp >= p.nextLevelXp) {
      p.xp -= p.nextLevelXp;
      p.level += 1;
      p.nextLevelXp = Math.floor(p.nextLevelXp * 1.25);
      leveledUp = true;
    }
    this.save();
    return { leveledUp, newLevel: p.level, currentXp: p.xp, nextLevelXp: p.nextLevelXp };
  }

  // Library actions
  addToLibrary(game) {
    const existing = this.state.library.find(g => g.id === game.id || (game.apiId && g.apiId === game.apiId));
    if (existing) return false;

    const newGame = {
      id: game.id || `g-api-${game.apiId || Date.now()}`,
      apiId: game.apiId || null,
      title: game.title,
      genre: game.genre || 'Action',
      platform: game.platform || 'PC',
      banner: game.banner || game.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      screenshots: game.screenshots && game.screenshots.length > 0 ? game.screenshots : [game.banner || game.thumbnail],
      description: game.description || game.short_description || 'No description available.',
      playtimeHours: 0,
      lastPlayed: 'Just added',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      status: 'Installed',
      favorite: false,
      developer: game.developer || 'Unknown Studio',
      releaseDate: game.releaseDate || game.release_date || '2024',
      achievementsTotal: 20,
      achievementsUnlocked: 0,
      minSpecs: game.minSpecs || game.minimum_system_requirements || {
        os: 'Windows 10',
        cpu: 'Intel i5 or AMD Ryzen',
        ram: '8 GB RAM',
        gpu: 'GTX 1050 or RX 560',
        storage: '30 GB'
      }
    };

    this.state.library.unshift(newGame);
    // Remove from wishlist if present
    this.removeFromWishlist(newGame.title);
    this.save();
    return true;
  }

  removeFromLibrary(gameId) {
    this.state.library = this.state.library.filter(g => g.id !== gameId);
    this.save();
  }

  toggleFavorite(gameId) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.favorite = !game.favorite;
      this.save();
    }
  }

  updateGameStatus(gameId, status) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.status = status;
      this.save();
    }
  }

  logPlaytime(gameId, additionalHours) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.playtimeHours = parseFloat((game.playtimeHours + additionalHours).toFixed(1));
      game.lastPlayed = 'Today';
      this.state.stats.totalHours = parseFloat((this.state.stats.totalHours + additionalHours).toFixed(1));
      
      if (this.state.stats.weeklyHours && this.state.stats.weeklyHours.length > 0) {
        const lastDay = this.state.stats.weeklyHours[this.state.stats.weeklyHours.length - 1];
        lastDay.hours = parseFloat((lastDay.hours + additionalHours).toFixed(1));
      }

      this.addXP(Math.round(additionalHours * 100));
      this.save();
    }
  }

  // Wishlist actions
  addToWishlist(item) {
    const exists = this.state.wishlist.some(w => w.title.toLowerCase() === item.title.toLowerCase());
    if (exists) return false;

    this.state.wishlist.push({
      id: `w-${Date.now()}`,
      title: item.title,
      genre: item.genre || 'Action',
      price: item.price || '$59.99',
      discount: item.discount || 'New Release',
      releaseDate: item.releaseDate || 'Upcoming',
      image: item.banner || item.thumbnail || item.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      priority: 'High',
      platform: item.platform || 'PC'
    });
    this.save();
    return true;
  }

  removeFromWishlist(titleOrId) {
    this.state.wishlist = this.state.wishlist.filter(w => 
      w.id !== titleOrId && w.title.toLowerCase() !== titleOrId.toLowerCase()
    );
    this.save();
  }

  // Achievements
  toggleAchievement(achId) {
    const ach = this.state.achievements.find(a => a.id === achId);
    if (!ach) return null;

    ach.unlocked = !ach.unlocked;
    if (ach.unlocked) {
      ach.unlockedDate = new Date().toISOString().split('T')[0];
      const xpRes = this.addXP(ach.xp);
      this.save();
      return { unlocked: true, xp: ach.xp, ...xpRes };
    } else {
      ach.unlockedDate = null;
      this.save();
      return { unlocked: false, xp: -ach.xp };
    }
  }

  // Active playing simulation session
  startSession(gameId) {
    const game = this.state.library.find(g => g.id === gameId);
    if (!game) return null;

    this.state.activeSession = {
      gameId: game.id,
      gameTitle: game.title,
      startTime: Date.now(),
      gameBanner: game.banner
    };
    this.state.profile.status = 'in-game';
    this.state.profile.currentPlaying = game.title;
    this.save();
    return this.state.activeSession;
  }

  endSession() {
    if (!this.state.activeSession) return null;

    const { gameId, startTime, gameTitle } = this.state.activeSession;
    const durationMs = Date.now() - startTime;
    const durationHours = Math.max(0.1, parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)));

    this.logPlaytime(gameId, durationHours);
    this.state.activeSession = null;
    this.state.profile.status = 'online';
    this.save();

    return { gameTitle, durationHours };
  }
}

window.gameState = new GameState();
