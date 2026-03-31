<<<<<<< HEAD
/**
 * Core Application Module
 * Optimized for performance and maintainability
 */

export class App {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
    }

    async initialize() {
        if (this.initialized) return;

        try {
            console.log('🚀 Initializing CodeBank application...');

            // Initialize core systems in order
            await this.initializeCore();
            await this.initializeUI();
            await this.initializeModules();

            this.initialized = true;
            console.log('✅ Application initialized successfully');

            // Dispatch app ready event
            window.dispatchEvent(new CustomEvent('app:ready'));

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeCore() {
    // Initialize session management
    // Use the correct relative path from codebank/js/ to shared/auth-state-manager.js
    await this.loadModule('session', () => import('../../shared/auth-state-manager.js'));

        // Initialize asset management (ensure absolute path to avoid base href issues)
        await this.loadModule('assets', () => window.AssetStore ? Promise.resolve({}) : import('/services/yt-clear/codebank/js/asset-sync.js'));

        // Initialize error handling
        await this.loadModule('errors', () => import('./advanced-error-handler.js'));
    }

    async initializeUI() {
        // Initialize UI components
        const uiModule = await this.loadModule('ui', () => import('./ui-manager.js'));
        if (uiModule?.UIManager) {
            const uiManager = new uiModule.UIManager();
            await uiManager.initialize();
            this.modules.set('uiManager', uiManager);
        }

        // Initialize settings panel
        const settingsModule = await this.loadModule('settings', () => import('./settings-manager.js'));
        if (settingsModule?.SettingsManager) {
            const settingsManager = new settingsModule.SettingsManager();
            await settingsManager.initialize();
            this.modules.set('settingsManager', settingsManager);
        }

        // Initialize toast system
        this.initializeToastSystem();
    }

    async initializeModules() {
        // Load transaction system
        await this.loadModule('transactions', () => import('../transaction-system.js'));

        // Load premium system
        await this.loadModule('premium', () => import('../premium-manager.js'));

        // Load firebase integration
        await this.loadModule('firebase', () => import('../firebase-integration.js'));
    }

    async loadModule(name, importer) {
        try {
            console.log(`Loading module: ${name}`);
            const module = await importer();
            this.modules.set(name, module);
            return module;
        } catch (error) {
            console.warn(`Failed to load module ${name}:`, error);
            return null;
        }
    }

    initializeToastSystem() {
        // Lightweight toast system
        window.showToast = (message, type = 'info', duration = 3500) => {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                margin:8px;padding:12px 16px;border-radius:8px;color:#fff;
                position:relative;box-shadow:0 6px 18px rgba(0,0,0,0.2);
                opacity:0;transform:translateY(8px);transition:all .25s ease;
                background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'}
            `;

            container.appendChild(toast);
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            });

            const end = () => { try { container.removeChild(toast); } catch(_){} };
            toast.addEventListener('transitionend', end, { once: true });
            toast.addEventListener('animationend', end, { once: true });
        };
    }

    handleInitializationError(error) {
        // Show user-friendly error message
        const loading = document.getElementById('app-loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: white;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ffc107; margin-bottom: 16px;"></i>
                    <h3>Failed to load application</h3>
                    <p>Please refresh the page to try again</p>
                    <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh</button>
                </div>
            `;
        }

        // Log error for debugging
        console.error('Application error:', error);
    }

    // Public API for other modules
    getModule(name) {
        return this.modules.get(name);
    }

    isInitialized() {
        return this.initialized;
    }
}

// Create global app instance
window.CodeBankApp = new App();
=======
/**
 * app-core.js - Main entry point for CodeBank Modularized JS
 */
import { initLauncher, updateStats } from './app-launcher.js';
import { initTabManager, activateTab } from './tab-manager.js';
import { initChat } from './e7ky-chat.js';
import { initPrayerSystem } from './prayer-system.js';
import { check1000HoursGate } from './gate-system.js';
import { setupSafeSelect } from './safe-code-manager.js';

// 1️⃣ Enforce SINGLETON for app-core
if (window.__APP_CORE__) {
    console.log('[AppCore] Already initialized, skipping');
} else {
    window.__APP_CORE__ = true;

    // Global exports for legacy/inline compatibility
    window.activateTab = activateTab;
    window.updateStats = updateStats;
    window.__setupSafeSelect = setupSafeSelect;

    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize all modules
        initLauncher();
        initTabManager();
        initChat();
        initPrayerSystem();
        await check1000HoursGate();
        setupSafeSelect();

        // Initial tab activation
        activateTab('overview');

        console.log('💎 CodeBank Core initialized');
    });
}

// Handle bridge events
window.addEventListener('bridge:snapshot-applied', (e) => {
    const d = e.detail || {};
    const count = d.count;
    const latest = d.latestCode || d.latest;
    
    // Update legacy UI elements
    const codesCountEl = document.getElementById('codes-count');
    if (codesCountEl && typeof count === 'number') codesCountEl.textContent = String(count);
    
    const assetCodesEl = document.getElementById('asset-codes');
    if (assetCodesEl && typeof count === 'number') assetCodesEl.textContent = String(count);
    
    const latestEl = document.getElementById('latest-code');
    if (latestEl && latest) latestEl.textContent = latest;

    // Update new launcher stats
    updateStats({ codes: count });
});
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
