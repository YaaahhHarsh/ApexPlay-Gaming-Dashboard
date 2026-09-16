/**
 * APEXPLAY STATE MANAGEMENT
 * Handles reactive profile, library, shelves, lists, journal, achievements, wishlist, and statistics with localStorage persistence.
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
      { id: 'b1', name: 'Aim God', icon: 'target', desc: 'Maintained 60%+ headshot accuracy in 50 matches' },
      { id: 'b2', name: 'Platinum Collector', icon: 'trophy', desc: '100% completed 12 AAA titles' },
      { id: 'b3', name: 'Night Owl', icon: 'moon', desc: 'Over 500 hours logged between midnight and 5 AM' },
      { id: 'b4', name: 'Speedrunner', icon: 'zap', desc: 'Top 5% completion speed in Elden Ring' }
    ]
  },
  settings: {
    theme: 'dark', // 'dark' | 'light'
    accentColor: '#4F8CFF',
    reduceMotion: false,
    soundFx: true,
    notifications: true,
    defaultLibraryView: 'grid'
  },
  activeSession: null, // { gameId, gameTitle, startTime }
  playHistory: [
    {
      id: 'sess-1',
      gameId: 'g-cyberpunk',
      gameTitle: 'Cyberpunk 2077: Phantom Liberty',
      date: 'Today',
      rawDate: '2026-09-16',
      durationHours: 2.5,
      note: 'Completed the infiltration mission in Dogtown. Night City looks staggering with path tracing.'
    },
    {
      id: 'sess-2',
      gameId: 'g-eldenring',
      gameTitle: 'Elden Ring: Shadow of the Erdtree',
      date: 'Yesterday',
      rawDate: '2026-09-15',
      durationHours: 1.8,
      note: 'Explored Scaduview and defeated the black knight garrison.'
    },
    {
      id: 'sess-3',
      gameId: 'g-cyberpunk',
      gameTitle: 'Cyberpunk 2077: Phantom Liberty',
      date: 'Sep 13',
      rawDate: '2026-09-13',
      durationHours: 3.2,
      note: 'Unlocked all Relic attribute perks. Fast-paced katana build feels fluid.'
    },
    {
      id: 'sess-4',
      gameId: 'g-valorant',
      gameTitle: 'Valorant',
      date: 'Sep 11',
      rawDate: '2026-09-11',
      durationHours: 1.5,
      note: 'Scored an Ace in overtime match on Ascent. Ranked up.'
    }
  ],
  shelves: [
    {
      id: 'shelf-favs',
      name: 'Favorites',
      description: 'Games that define my taste and that I return to consistently.',
      gameIds: ['g-cyberpunk', 'g-eldenring', 'g-witcher3']
    },
    {
      id: 'shelf-100',
      name: '100% Completed',
      description: 'Games where every achievement and milestone was conquered.',
      gameIds: ['g-eldenring']
    },
    {
      id: 'shelf-weekend',
      name: 'Weekend Games',
      description: 'Jump-in titles perfect for quick casual sessions or raid nights.',
      gameIds: ['g-valorant', 'g-hades2']
    },
    {
      id: 'shelf-finish',
      name: 'Games I Want To Finish',
      description: 'Priority backlog candidates to complete before new releases.',
      gameIds: ['g-destiny2', 'g-hades2']
    }
  ],
  lists: [
    {
      id: 'list-rpgs',
      title: "Best RPGs I've Played",
      description: 'A personal ranking of the most immersive role-playing experiences.',
      ranked: true,
      gameIds: ['g-eldenring', 'g-cyberpunk', 'g-witcher3', 'g-baldursgate']
    },
    {
      id: 'list-backlog',
      title: 'Games I Want To Finish',
      description: 'Curated priority backlog titles with standout stories.',
      ranked: false,
      gameIds: ['g-destiny2', 'g-hades2']
    }
  ],
  library: [
    {
      id: 'g-cyberpunk',
      game_url: 'https://www.cyberpunk.net',
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
      userRating: 4.5,
      userReview: 'Phantom Liberty fixes everything that was missing at launch. Dogtown is dense, gritty, and the espionage narrative keeps you hooked from start to finish.',
      status: 'Playing', // 'Playing' | 'Completed' | 'Backlog' | 'Wishlist' | 'Dropped'
      favorite: true,
      developer: 'CD PROJEKT RED',
      releaseDate: '2023-09-26',
      achievementsTotal: 48,
      achievementsUnlocked: 41,
      hltb: {
        mainStory: 25,
        mainExtra: 60,
        completionist: 100
      },
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
      game_url: 'https://www.bandainamcoent.com/games/elden-ring',
      apiId: null,
      title: 'Elden Ring: Shadow of the Erdtree',
      genre: 'Action RPG / Soulslike',
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
      userRating: 5.0,
      userReview: 'Masterpiece world design and boss encounters. The Land of Shadow sets a new standard for DLC scale and atmosphere.',
      status: 'Completed',
      favorite: true,
      developer: 'FromSoftware',
      releaseDate: '2024-06-21',
      achievementsTotal: 42,
      achievementsUnlocked: 42,
      hltb: {
        mainStory: 58,
        mainExtra: 102,
        completionist: 135
      },
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
      game_url: 'https://playvalorant.com',
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
      userRating: 4.0,
      userReview: 'Crisp gunplay and highly competitive ranked ladder. Best experienced with a coordinated five-stack.',
      status: 'Playing',
      favorite: true,
      developer: 'Riot Games',
      releaseDate: '2020-06-02',
      achievementsTotal: 30,
      achievementsUnlocked: 24,
      hltb: null,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core 2 Duo E8400',
        ram: '4 GB RAM',
        gpu: 'Intel HD 4000',
        storage: '20 GB'
      }
    },
    {
      id: 'g-destiny2',
      game_url: 'https://www.freetogame.com/open/destiny-2',
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
      userRating: 4.5,
      userReview: 'The narrative conclusion to the Light and Darkness saga delivered on every emotional beat. Salvation’s Edge is one of the best raids in the franchise.',
      status: 'Backlog',
      favorite: false,
      developer: 'Bungie',
      releaseDate: '2019-10-01',
      achievementsTotal: 50,
      achievementsUnlocked: 38,
      hltb: {
        mainStory: 18,
        mainExtra: 55,
        completionist: 120
      },
      minSpecs: {
        os: 'Windows 10',
        cpu: 'Intel Core i3 3250',
        ram: '6 GB RAM',
        gpu: 'NVIDIA GeForce GTX 660',
        storage: '105 GB'
      }
    },
    {
      id: 'g-hades2',
      game_url: 'https://www.supergiantgames.com/games/hades-ii',
      apiId: null,
      title: 'Hades II',
      genre: 'Action / Roguelike',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Battle beyond the Underworld using dark sorcery to take on the Titan of Time in this bewitching sequel to the award-winning rogue-like dungeon crawler.',
      playtimeHours: 34.5,
      lastPlayed: '2 weeks ago',
      rating: 9.6,
      userRating: 4.5,
      userReview: 'Melinoë feels completely distinct from Zagreus. Witchcraft mechanics add great depth to builds.',
      status: 'Backlog',
      favorite: true,
      developer: 'Supergiant Games',
      releaseDate: '2024-05-06',
      achievementsTotal: 36,
      achievementsUnlocked: 18,
      hltb: {
        mainStory: 22,
        mainExtra: 50,
        completionist: 95
      },
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Dual Core 2.4 GHz',
        ram: '8 GB RAM',
        gpu: 'GeForce GTX 950 / Radeon HD 7870',
        storage: '10 GB'
      }
    },
    {
      id: 'g-witcher3',
      game_url: 'https://www.thewitcher.com',
      apiId: null,
      title: 'The Witcher 3: Wild Hunt',
      genre: 'RPG / Open World',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy.',
      playtimeHours: 186.0,
      lastPlayed: '3 weeks ago',
      rating: 9.7,
      userRating: 5.0,
      userReview: 'Peak storytelling and side quest design. Blood and Wine remains the gold standard of video game expansions.',
      status: 'Completed',
      favorite: true,
      developer: 'CD PROJEKT RED',
      releaseDate: '2015-05-18',
      achievementsTotal: 78,
      achievementsUnlocked: 78,
      hltb: {
        mainStory: 52,
        mainExtra: 104,
        completionist: 173
      },
      minSpecs: {
        os: 'Windows 10',
        cpu: 'Intel Core i5-2500K 3.3GHz',
        ram: '6 GB RAM',
        gpu: 'Nvidia GeForce GTX 660',
        storage: '50 GB'
      }
    },
    {
      id: 'g-baldursgate',
      game_url: 'https://baldursgate3.game',
      apiId: null,
      title: "Baldur's Gate 3",
      genre: 'RPG / Turn-Based',
      platform: 'PC',
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      screenshots: [
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
      ],
      description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
      playtimeHours: 160.0,
      lastPlayed: 'Last month',
      rating: 9.9,
      userRating: 5.0,
      userReview: 'Unmatched player freedom and branching quest consequences. A generational RPG landmark.',
      status: 'Completed',
      favorite: true,
      developer: 'Larian Studios',
      releaseDate: '2023-08-03',
      achievementsTotal: 54,
      achievementsUnlocked: 48,
      hltb: {
        mainStory: 68,
        mainExtra: 110,
        completionist: 156
      },
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel I5 4690 / AMD FX 8350',
        ram: '8 GB RAM',
        gpu: 'Nvidia GTX 970 / RX 480 (4GB+ of VRAM)',
        storage: '150 GB'
      }
    },
    {
      id: 'g-overwatch',
      game_url: 'https://www.freetogame.com/open/overwatch-2',
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
      lastPlayed: '1 month ago',
      rating: 8.3,
      userRating: 3.5,
      userReview: 'Good core hero design, but matchmaking balance and battle pass focus diminished long-term enthusiasm.',
      status: 'Dropped',
      favorite: false,
      developer: 'Blizzard Entertainment',
      releaseDate: '2022-10-04',
      achievementsTotal: 35,
      achievementsUnlocked: 19,
      hltb: null,
      minSpecs: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i3 or AMD Phenom X3 8650',
        ram: '6 GB RAM',
        gpu: 'GeForce GTX 600 series',
        storage: '50 GB'
      }
    },
    {
      id: 'g-apex',
      game_url: 'https://www.freetogame.com/open/apex-legends',
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
      lastPlayed: '2 months ago',
      rating: 8.8,
      userRating: 3.5,
      userReview: 'Superb movement mechanics and sliding velocity, though ranked solo-queue can be exhausting.',
      status: 'Dropped',
      favorite: false,
      developer: 'Respawn Entertainment',
      releaseDate: '2019-02-04',
      achievementsTotal: 25,
      achievementsUnlocked: 18,
      hltb: null,
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
      icon: 'sunrise'
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
      icon: 'brain'
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
      icon: 'flame'
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
      icon: 'swords'
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
      icon: 'crown'
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
      icon: 'bomb'
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
      icon: 'sparkles'
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
      icon: 'zap'
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
      icon: 'skull'
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
      { genre: 'Action RPG', hours: 536.5, color: '#4F8CFF' },
      { genre: 'Tactical Shooter', hours: 388.2, color: '#39C98A' },
      { genre: 'MMO / Sci-Fi', hours: 412.0, color: '#E8B84A' },
      { genre: 'Battle Royale', hours: 218.7, color: '#EF6262' },
      { genre: 'Hero Shooter', hours: 165.4, color: '#9AA4B2' }
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
        const parsed = JSON.parse(stored);
        // Seamless backward-compatible migration
        if (!parsed.shelves) parsed.shelves = JSON.parse(JSON.stringify(DEFAULT_STATE.shelves));
        if (!parsed.lists) parsed.lists = JSON.parse(JSON.stringify(DEFAULT_STATE.lists));
        if (!parsed.playHistory) parsed.playHistory = JSON.parse(JSON.stringify(DEFAULT_STATE.playHistory));
        if (!parsed.settings) parsed.settings = JSON.parse(JSON.stringify(DEFAULT_STATE.settings));
        
        // Migrate legacy emoji icons in badges and achievements to Lucide icon keys
        const EMOJI_TO_ICON_MAP = {
          '\u{1F3AF}': 'target',
          '\u{1F3C6}': 'trophy',
          '\u{1F319}': 'moon',
          '\u{26A1}': 'zap',
          '\u{1F305}': 'sunrise',
          '\u{1F9E0}': 'brain',
          '\u{1F525}': 'flame',
          '\u{2694}': 'swords',
          '\u{2694}\u{FE0F}': 'swords',
          '\u{1F451}': 'crown',
          '\u{1F4A3}': 'bomb',
          '\u{1F30C}': 'sparkles',
          '\u{1F4A5}': 'zap',
          '\u{2620}': 'skull',
          '\u{2620}\u{FE0F}': 'skull'
        };

        if (parsed.profile && Array.isArray(parsed.profile.badges)) {
          parsed.profile.badges.forEach(b => {
            if (EMOJI_TO_ICON_MAP[b.icon]) b.icon = EMOJI_TO_ICON_MAP[b.icon];
          });
        }
        if (Array.isArray(parsed.achievements)) {
          parsed.achievements.forEach(a => {
            if (EMOJI_TO_ICON_MAP[a.icon]) a.icon = EMOJI_TO_ICON_MAP[a.icon];
          });
        }

        // Migrate library game statuses and attributes if missing
        if (Array.isArray(parsed.library)) {
          parsed.library.forEach(g => {
            if (g.status === 'Installed') g.status = 'Playing';
            const URL_MAP = {
              'g-cyberpunk': 'https://www.cyberpunk.net',
              'g-eldenring': 'https://www.bandainamcoent.com/games/elden-ring',
              'g-valorant': 'https://playvalorant.com',
              'g-destiny2': 'https://www.freetogame.com/open/destiny-2',
              'g-hades2': 'https://www.supergiantgames.com/games/hades-ii',
              'g-witcher3': 'https://www.thewitcher.com',
              'g-baldursgate': 'https://baldursgate3.game',
              'g-overwatch': 'https://www.freetogame.com/open/overwatch-2',
              'g-apex': 'https://www.freetogame.com/open/apex-legends'
            };
            if (!g.game_url) {
              if (URL_MAP[g.id]) g.game_url = URL_MAP[g.id];
              else if (g.apiId) g.game_url = 'https://www.freetogame.com/open/' + g.apiId;
            }
            if (typeof g.userRating === 'undefined') {
              g.userRating = g.rating ? Math.min(5, parseFloat((g.rating / 2).toFixed(1))) : 4.0;
            }
            if (typeof g.userReview === 'undefined') g.userReview = '';
          });
        }
        return parsed;
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
  addToLibrary(game, initialStatus = 'Backlog') {
    const existing = this.state.library.find(g => g.id === game.id || (game.apiId && g.apiId === game.apiId));
    if (existing) {
      if (initialStatus && existing.status !== initialStatus) {
        existing.status = initialStatus;
        this.save();
      }
      return false;
    }

    const newGame = {
      id: game.id || `g-api-${game.apiId || Date.now()}`,
      apiId: game.apiId || null,
      title: game.title,
      game_url: game.game_url || game.gameUrl || (game.apiId ? `https://www.freetogame.com/open/${game.apiId}` : null),
      genre: game.genre || 'Action',
      platform: game.platform || 'PC',
      banner: game.banner || game.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      screenshots: game.screenshots && game.screenshots.length > 0 ? game.screenshots : [game.banner || game.thumbnail],
      description: game.description || game.short_description || 'No description available.',
      playtimeHours: 0,
      lastPlayed: 'Never played',
      rating: game.rating || (Math.random() * 2 + 7.5).toFixed(1),
      userRating: 0,
      userReview: '',
      status: initialStatus, // 'Playing' | 'Completed' | 'Backlog' | 'Wishlist' | 'Dropped'
      favorite: false,
      developer: game.developer || 'Unknown Studio',
      releaseDate: game.releaseDate || game.release_date || '2024',
      achievementsTotal: 20,
      achievementsUnlocked: 0,
      hltb: null,
      minSpecs: game.minSpecs || game.minimum_system_requirements || {
        os: 'Windows 10',
        cpu: 'Intel i5 or AMD Ryzen',
        ram: '8 GB RAM',
        gpu: 'GTX 1050 or RX 560',
        storage: '30 GB'
      }
    };

    this.state.library.unshift(newGame);
    this.removeFromWishlist(newGame.title);
    this.save();
    return true;
  }

  removeFromLibrary(gameId) {
    this.state.library = this.state.library.filter(g => g.id !== gameId);
    // Also remove from shelves and lists
    if (this.state.shelves) {
      this.state.shelves.forEach(s => {
        s.gameIds = s.gameIds.filter(id => id !== gameId);
      });
    }
    if (this.state.lists) {
      this.state.lists.forEach(l => {
        l.gameIds = l.gameIds.filter(id => id !== gameId);
      });
    }
    this.save();
  }

  toggleFavorite(gameId) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.favorite = !game.favorite;
      // Sync with 'Favorites' shelf if exists
      const favShelf = this.state.shelves ? this.state.shelves.find(s => s.id === 'shelf-favs') : null;
      if (favShelf) {
        if (game.favorite && !favShelf.gameIds.includes(gameId)) {
          favShelf.gameIds.push(gameId);
        } else if (!game.favorite) {
          favShelf.gameIds = favShelf.gameIds.filter(id => id !== gameId);
        }
      }
      this.save();
    }
  }

  updateGameStatus(gameId, status) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.status = status;
      // If status is 'Completed' and has 100% achievements, sync with 100% shelf
      const compShelf = this.state.shelves ? this.state.shelves.find(s => s.id === 'shelf-100') : null;
      if (compShelf) {
        if (status === 'Completed' && game.achievementsUnlocked >= game.achievementsTotal && !compShelf.gameIds.includes(gameId)) {
          compShelf.gameIds.push(gameId);
        } else if (status !== 'Completed') {
          compShelf.gameIds = compShelf.gameIds.filter(id => id !== gameId);
        }
      }
      this.save();
    }
  }

  setGameRating(gameId, rating) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.userRating = parseFloat(rating);
      this.save();
    }
  }

  setGameReview(gameId, reviewText) {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.userReview = reviewText;
      this.save();
    }
  }

  logPlaytime(gameId, additionalHours, optionalNote = '') {
    const game = this.state.library.find(g => g.id === gameId);
    if (game) {
      game.playtimeHours = parseFloat((game.playtimeHours + additionalHours).toFixed(1));
      game.lastPlayed = 'Today';
      this.state.stats.totalHours = parseFloat((this.state.stats.totalHours + additionalHours).toFixed(1));
      
      if (this.state.stats.weeklyHours && this.state.stats.weeklyHours.length > 0) {
        const lastDay = this.state.stats.weeklyHours[this.state.stats.weeklyHours.length - 1];
        lastDay.hours = parseFloat((lastDay.hours + additionalHours).toFixed(1));
      }

      // Add to gaming journal playHistory
      if (!this.state.playHistory) this.state.playHistory = [];
      this.state.playHistory.unshift({
        id: `sess-${Date.now()}`,
        gameId: game.id,
        gameTitle: game.title,
        date: 'Today',
        rawDate: new Date().toISOString().split('T')[0],
        durationHours: additionalHours,
        note: optionalNote || ''
      });

      this.addXP(Math.round(additionalHours * 100));
      this.save();
    }
  }

  // Journal note action
  updateJournalNote(entryId, note) {
    if (!this.state.playHistory) return;
    const entry = this.state.playHistory.find(e => e.id === entryId);
    if (entry) {
      entry.note = note;
      this.save();
    }
  }

  deleteJournalEntry(entryId) {
    if (!this.state.playHistory) return;
    this.state.playHistory = this.state.playHistory.filter(e => e.id !== entryId);
    this.save();
  }

  // Custom Shelves actions
  createShelf(name, description = '', gameIds = []) {
    if (!this.state.shelves) this.state.shelves = [];
    const newShelf = {
      id: `shelf-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      gameIds: gameIds
    };
    this.state.shelves.push(newShelf);
    this.save();
    return newShelf;
  }

  deleteShelf(shelfId) {
    if (!this.state.shelves) return;
    this.state.shelves = this.state.shelves.filter(s => s.id !== shelfId);
    this.save();
  }

  toggleGameInShelf(shelfId, gameId) {
    if (!this.state.shelves) return;
    const shelf = this.state.shelves.find(s => s.id === shelfId);
    if (shelf) {
      const idx = shelf.gameIds.indexOf(gameId);
      if (idx > -1) {
        shelf.gameIds.splice(idx, 1);
      } else {
        shelf.gameIds.push(gameId);
      }
      this.save();
    }
  }

  // Custom Lists actions
  createList(title, description = '', ranked = false, gameIds = []) {
    if (!this.state.lists) this.state.lists = [];
    const newList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      ranked: !!ranked,
      gameIds: gameIds
    };
    this.state.lists.push(newList);
    this.save();
    return newList;
  }

  deleteList(listId) {
    if (!this.state.lists) return;
    this.state.lists = this.state.lists.filter(l => l.id !== listId);
    this.save();
  }

  toggleGameInList(listId, gameId) {
    if (!this.state.lists) return;
    const list = this.state.lists.find(l => l.id === listId);
    if (list) {
      const idx = list.gameIds.indexOf(gameId);
      if (idx > -1) {
        list.gameIds.splice(idx, 1);
      } else {
        list.gameIds.push(gameId);
      }
      this.save();
    }
  }

  // Settings actions
  updateSettings(updates) {
    if (!this.state.settings) this.state.settings = { ...DEFAULT_STATE.settings };
    this.state.settings = { ...this.state.settings, ...updates };
    this.save();
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.library && parsed.profile) {
        this.state = parsed;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  }

  // Wishlist actions
  addToWishlist(item) {
    const exists = this.state.wishlist.some(w => w.title.toLowerCase() === item.title.toLowerCase());
    if (exists) return false;

    this.state.wishlist.push({
      id: `w-${Date.now()}`,
      title: item.title,
      game_url: item.game_url || item.gameUrl || (item.apiId ? `https://www.freetogame.com/open/${item.apiId}` : null),
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

      // Add achievement unlock entry to gaming journal
      if (!this.state.playHistory) this.state.playHistory = [];
      this.state.playHistory.unshift({
        id: `ach-sess-${Date.now()}`,
        gameId: null,
        gameTitle: ach.gameTitle,
        date: 'Today',
        rawDate: new Date().toISOString().split('T')[0],
        durationHours: 0,
        isAchievement: true,
        note: `Unlocked achievement: "${ach.title}" (+${ach.xp} XP)`
      });

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

  endSession(optionalNote = '') {
    if (!this.state.activeSession) return null;

    const { gameId, startTime, gameTitle } = this.state.activeSession;
    const durationMs = Date.now() - startTime;
    const durationHours = Math.max(0.1, parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)));

    this.logPlaytime(gameId, durationHours, optionalNote);
    this.state.activeSession = null;
    this.state.profile.status = 'online';
    this.save();

    return { gameTitle, durationHours };
  }
}

window.gameState = new GameState();
