/**
 * app-registry.js - Central registry for all CodeBank applications
 * DIAGNOSTIC VERSION - With path fallbacks and error handling
 */

// Helper to detect correct path (for diagnostic purposes)
const pathVariants = {
    safecode: [
        './safecode/index.html',      // lowercase
        './SafeCode/index.html',      // camelCase
        './safe-code/index.html',     // hyphenated
        './safe_code/index.html',     // underscore
        '/safecode/index.html',       // absolute root
        '/codebank/safecode/index.html' // full path
    ],
    pebalaash: [
        './pebalaash/index.html',
        './Pebalaash/index.html',
        './pebalaash.html',           // flat file
        '/pebalaash/index.html'
    ],
    farragna: [
        './farragna/index.html',
        './Farragna/index.html',
        './farragna.html',
        '/farragna/index.html'
    ]
};

export const AppRegistry = {
    core: [
        {
            id: 'safecode',
            name: 'SafeCode',
            category: 'core',
            icon: 'fa-shield-alt',
            color: '#10b981',
            url: './safecode.html',               // Fixed: Use correct path
            fallbackUrls: ['./safecode/index.html'],
            description: 'Secure code storage',
            status: 'online',
            badge: 'Core'
        }
    ],
    media: [
        {
            id: 'samma3ny',
            name: 'Samma3ny',
            category: 'media',
            icon: 'fa-music',
            color: '#8b5cf6',
            url: './samma3ny.html',
            fallbackUrls: ['./samma3ny/index.html'],
            description: 'Audio platform',
            status: 'online',
            badge: null
        },
        {
            id: 'battalooda',
            name: 'Battalooda (بطلودة)',
            category: 'media',
            icon: 'fa-microphone-alt',
            color: '#e74c3c',
            url: './battalooda.html',
            fallbackUrls: [],
            description: 'منصة لاكتشاف المواهب الصوتية',
            status: 'online',
            badge: 'جديد'
        },
        {
            id: 'farragna',
            name: 'Farragna',
            category: 'media',
            icon: 'fa-chart-line',
            color: '#ec4899',
            url: './farragna.html',
            fallbackUrls: ['./farragna/index.html'],
            description: 'Trading platform',
            status: 'online',
            badge: 'New'
        },
        {
            id: 'oneworld',
            name: 'OneWorld',
            icon: 'fa-globe',
            color: '#3b82f6',
            url: './oneworld/index.html',
            fallbackUrls: [],
            status: 'online',
            description: 'Global content hub',
            badge: null
        },
        {
            id: 'nostaglia',
            name: 'Nostaglia',
            icon: 'fa-compact-disc',
            color: '#8b5cf6',
            url: './nostaglia/index.html',
            fallbackUrls: [],
            status: 'online',
            description: 'Retro music collection',
            badge: null
        },
        {
            id: 'setta',
            name: 'Setta X Tes3a',
            icon: 'fa-camera',
            color: '#ec4899',
            url: './setta/index.html',
            fallbackUrls: [],
            status: 'busy',
            description: 'Photo & video gallery',
            badge: 'Beta'
        },
        {
            id: 'shots',
            name: 'Shots!',
            icon: 'fa-image',
            color: '#10b981',
            url: './shots/index.html',
            fallbackUrls: [],
            status: 'online',
            description: 'Screenshot manager',
            badge: null
        }
    ],
    finance: [
        {
            id: 'eb3at',
            name: 'Eb3at',
            category: 'finance',
            icon: 'fa-paper-plane',
            color: '#3b82f6',
            url: './eb3at.html',
            fallbackUrls: [],
            description: 'Messaging service',
            status: 'online',
            badge: null
        },
        {
            id: 'pebalaash',
            name: 'Pebalaash',
            category: 'finance',
            icon: 'fa-gamepad',
            color: '#f59e0b',
            url: './pebalaash.html',
            fallbackUrls: ['./pebalaash/index.html'],
            description: 'Gaming platform',
            status: 'online',
            badge: 'Hot'
        },
        {
            id: 'qarsan',
            name: 'Qarsan',
            icon: 'fa-shield-alt',
            color: '#10b981',
            url: './qarsan/index.html',
            fallbackUrls: [],
            status: 'online',
            description: 'Security & protection',
            badge: null
        }
    ],
    games: [
        {
            id: 'games',
            name: 'Games Centre',
            icon: 'fa-gamepad',
            color: '#f59e0b',
            url: './Games-Centre.html',
            fallbackUrls: ['./Games-Centre/index.html'],
            status: 'online',
            description: 'Gaming hub',
            badge: null
        },
        {
            id: 'yahood',
            name: 'Yahood! Mining World',
            description: '3D Mining World - Explore, Mine, Trade, Survive',
            icon: 'fa-pickaxe', 
            category: 'games',
            url: './yahood/index.html',
            fallbackUrls: [],
            basePath: './yahood/',
            preload: false,
            critical: false,
            permissions: ['microphone', 'camera', 'geolocation'],
            requiresAuth: true,
            accIntegration: true,
            minWatchHours: 0,
            allowFullscreen: true,
            customWidth: '100%',
            customHeight: '100vh',
            version: '1.0.0',
            author: 'Admin',
            status: 'online',
            badge: 'New'
        },
        {
            id: 'piston',
            name: 'Piston',
            icon: 'fa-cog',
            color: '#6b7280',
            url: './piston.html',
            fallbackUrls: [],
            status: 'offline',
            description: 'Game engine',
            badge: 'Soon'
        }
    ],
    tools: [
        {
            id: 'corsa',
            name: 'CoRsA',
            icon: 'fa-brain',
            color: '#8b5cf6',
            url: './corsa.html',
            fallbackUrls: ['./corsa/index.html'],
            status: 'online',
            description: 'AI Assistant',
            badge: 'AI'
        },
        {
            id: 'e7ki',
            name: 'E7ki',
            category: 'tools',
            icon: 'fa-comments',
            color: '#06b6d4',
            url: './e7ki.html',
            fallbackUrls: [],
            description: 'Chat platform',
            status: 'online',
            badge: null
        }
    ]
};

export const DockConfig = [
    { id: 'safecode', name: 'Safe Assets', icon: 'fa-shield-halved', color: 'finance' },
    { id: 'samma3ny', name: 'Samma3ny', icon: 'fa-music', color: 'media' },
    { id: 'eb3at', name: 'Eb3at', icon: 'fa-paper-plane', color: 'finance' },
    { id: 'games', name: 'Games', icon: 'fa-gamepad', color: 'games' },
    { id: 'corsa', name: 'CoRsA', icon: 'fa-brain', color: 'tools' }
];

// Export path variants for diagnostic use
export { pathVariants };
