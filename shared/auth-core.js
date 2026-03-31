<<<<<<< HEAD
;(function(){
  if (typeof window !== 'undefined') {
    if (window.__AUTH_CORE_LOADED__) { try { console.error('[AuthCore] Duplicate load detected. Skipping initialization.'); } catch(_){}; return; }
    window.__AUTH_CORE_LOADED__ = true;
  }
=======
// auth-core.js
// Universal Authentication Core with PostMessage Bridge for Cross-Origin Iframes
// Version: 2.0.0 - Production Ready

// 🛡️ Fix 4: Set API_BASE if not already set
window.API_BASE = window.API_BASE || 'http://localhost:3001';
console.log('[AuthCore] API_BASE set to:', window.API_BASE);

;(function(){
  'use strict';
  
  // ============================================
  // SECTION 1: SINGLETON GUARD & RELOAD LOOP GUARD
  // ============================================
  
  if (typeof window !== 'undefined') {
    // Safe reload function
    window.safeReload = function(forceGet = false) {
        console.log('🔄 [AuthCore] safeReload requested');
        window.location.reload(forceGet);
    };
    // Safe replace function
    window.safeReplace = function(url) {
        console.log('🔄 [AuthCore] safeReplace requested:', url);
        window.location.replace(url);
    };
    console.log('[AuthCore] safeReload and safeReplace defined');
    
    (function() {
        // 🚨 CRITICAL: We cannot assign to location.replace as it's read-only in many browsers
        // Using a diagnostic log instead of overwriting
        console.log('[AuthCore] Location diagnostic ready');
      })();

    // 🧪 DEBUG: Page loaded log
    console.log('[DEBUG] Page loaded at:', new Date().toISOString());

    // 🔧 FIX 5: Loop Guard (sessionStorage)
    const now = Date.now();
    const lastReload = parseInt(sessionStorage.getItem('__last_reload__') || '0');
    const reloadCount = parseInt(sessionStorage.getItem('__reload_count__') || '0');

    if (now - lastReload < 2000) { // If reloaded within 2 seconds
      if (reloadCount > 3) {
        console.warn('🛑 [GUARD] Infinite reload loop detected and stopped.');
        return; 
      }
      sessionStorage.setItem('__reload_count__', (reloadCount + 1).toString());
    } else {
      sessionStorage.setItem('__reload_count__', '0');
    }
    sessionStorage.setItem('__last_reload__', now.toString());

    if (window.__AUTH_CORE_LOADED__) { 
      try { console.error('[AuthCore] Duplicate load detected. Skipping initialization.'); } catch(_){}; 
      return; 
    }
    window.__AUTH_CORE_LOADED__ = true;
  }

  // ============================================
  // SECTION 2: UTILITY FUNCTIONS
  // ============================================
  
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
  function getCookie(name){
    try {
      const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
      return m ? decodeURIComponent(m[2]) : null;
    } catch(_) { return null }
  }

<<<<<<< HEAD
  const Auth = {
    _authenticated: false,
    _userId: null,
    _sessionId: null,
    _locked: false,
    _lastPayloadUser: null,
    _state: null,

    _setState(nextAuth, nextUser){
      if (typeof nextAuth === 'object' && nextAuth !== null) {
        const payload = nextAuth;
        const nextAuthenticated = !!payload.authenticated;
        const nextUserId = payload.userId || null;
        const nextSessionId = payload.sessionId || this._sessionId;
        try { console.log('[AuthCore] state set →', nextAuthenticated); } catch(_){}
        if (this._locked && nextAuthenticated === false) { try { console.error('[AuthCore] write blocked false'); } catch(_){}; return; }
        if (this._locked) { try { console.error('[AuthCore] Attempted to mutate state after lock. Ignored.'); } catch(_){}; return; }
        if (this._lastPayloadUser && nextAuthenticated === false) { try { console.error('[AuthCore] Illegal state: user present then authenticated=false.'); } catch(_){}; return; }
        this._authenticated = nextAuthenticated;
        this._userId = nextUserId;
        this._sessionId = nextSessionId;
        this._state = { authenticated: this._authenticated, userId: this._userId, sessionId: this._sessionId };
        return;
      }
      try { console.log('[AuthCore] state set →', !!nextAuth); } catch(_){}
      if (this._locked && nextAuth === false) { try { console.error('[AuthCore] write blocked false'); } catch(_){}; return; }
      if (this._locked) { try { console.error('[AuthCore] Attempted to mutate state after lock. Ignored.'); } catch(_){}; return; }
      if (this._lastPayloadUser && nextAuth === false) { try { console.error('[AuthCore] Illegal state: user present then authenticated=false.'); } catch(_){}; return; }
      this._authenticated = !!nextAuth;
      this._userId = nextUser || null;
      this._state = { authenticated: this._authenticated, userId: this._userId, sessionId: this._sessionId };
=======
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============================================
  // SECTION 3: AUTHCORE STATE MANAGEMENT
  // ============================================

  const DEBUG_MODE = window.AUTH_DEBUG !== undefined ? window.AUTH_DEBUG : true;
  function authLog(...args) {
    if (DEBUG_MODE) console.log(...args);
  }

  const AuthCore = {
    _authenticated: false,
    _status: 'loading',
    _userId: null,
    _sessionId: null,
    _user: null,
    _state: { authenticated: false, status: 'loading', userId: null, sessionId: null, user: null },
    _lastSyncedState: null,
    _syncInProgress: false,
    _locked: false,
    _lastPayloadUser: null,
    _initPromise: null,
    _authStartTime: null,
    _authInitialized: false,

    // 🛡️ RECOVERY: Recover user from session (from actly.md)
    async _recoverUserFromSession(sessionId) {
        try {
            console.log('[AuthCore] Attempting to recover user from session...');
            const response = await fetch(`${window.API_BASE}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${sessionId}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.user || null;
            }
        } catch (error) {
            console.error('[AuthCore] Session recovery request failed:', error);
        }
        return null;
    },

    // In auth-core.js - replace your existing state sync function
    _syncState: function(newState = null) {
      if (this._syncInProgress) return;
      
      // If no newState provided, construct from internal variables
      if (!newState) {
        newState = {
          authenticated: this._authenticated,
          status: this._status,
          userId: this._userId,
          sessionId: this._sessionId,
          user: this._user,
          timestamp: Date.now()
        };
      }

      // 🛡️ HALF-AUTH DETECTION (from actly.md)
      if (newState.authenticated === true && !newState.userId && newState.sessionId) {
          console.warn('[AuthCore] ⚠️ Half-authenticated state detected (session without user)');
          
          var self = this;
          this._recoverUserFromSession(newState.sessionId).then(user => {
              if (user) {
                  console.log('[AuthCore] ✅ User recovered from session');
                  newState.userId = user.id;
                  newState.user = user;
                  newState._pendingRecovery = false;
                  self._syncState(newState); // Re-sync with full data
              } else {
                  console.error('[AuthCore] ❌ Could not recover user, forcing logout');
                  self.logout();
              }
          }).catch(err => {
              console.error('[AuthCore] Recovery failed:', err);
              self.logout();
          });
          
          newState._pendingRecovery = true;
      }

      console.log('[AuthCore] State synced:', newState);
      
      // 🚨 CRITICAL FIX: Auto-correct if session exists but auth is false
      if (newState.sessionId && (!newState.authenticated || newState.status === 'timeout')) {
          console.log('[AuthCore] 🚨 Auto-correcting: session present but authenticated=false or status=timeout');
          newState.authenticated = true;
          newState.status = 'authenticated'; // Changed from 'active' to match actly.md
          
          if (!newState.userId) {
              newState.userId = localStorage.getItem('user_id') || 'user_' + Date.now();
          }
          
          // Try to recover user data from storage if missing (from actly.md)
          if (!newState.user) {
            try {
              const stored = localStorage.getItem('auth_user') || localStorage.getItem('user_data');
              if (stored) {
                newState.user = JSON.parse(stored);
                newState.userId = newState.user.id || newState.user.userId || newState.userId;
              }
            } catch(e) {}
          }
          
          // Sync internal variables if they were used
          this._authenticated = true;
          this._status = 'authenticated';
          this._userId = newState.userId;
      }
      
      this._syncInProgress = true;
      this._lastSyncedState = { ...newState };

      // Apply state
      this._state = Object.assign({}, this._state, newState);
      
      window.__AUTH_STATE__ = this._state;
      window.__AUTH_READY__ = (this._state.authenticated);
      window.authReady = (this._state.authenticated);

      // Persist to IDB
      this._saveToIDB({
        ...this._state,
        timestamp: Date.now()
      });
      
      // 🔧 Persistence
      if (this._state.authenticated && this._user) {
        localStorage.setItem('session_token', this._sessionId);
        localStorage.setItem('user_data', JSON.stringify(this._user));
        localStorage.setItem('auth_timestamp', Date.now().toString());
      } else if (this._state.status === 'unauthenticated') {
        localStorage.removeItem('session_token');
        localStorage.removeItem('user_data');
      }

      // Fire auth:ready if authenticated
      if (this._state.authenticated && this._state.sessionId && !window._initAfterLoginCalled && !this._state._pendingRecovery) {
          window._initAfterLoginCalled = true;
          window.__AUTH_READY_FIRED__ = true;
          window.__AUTH_READY__ = true;
          
          if (this._state.userId && this._state.user) {
              console.log('[AuthCore] 🚀 Auto-triggering initAfterLogin');
              
              var self = this;
              setTimeout(function() {
                  window.dispatchEvent(new CustomEvent('auth:ready', {
                      detail: self._state
                  }));
                  
                  // Trigger init sequence
                  if (typeof window.initAfterLogin === 'function') {
                      window.initAfterLogin(self._state.sessionId, self._state.user || { id: self._state.userId });
                  }
              }, 100);
          } else {
              console.warn('[AuthCore] Blocking initAfterLogin - incomplete auth state');
              window._initAfterLoginCalled = false; // Reset to allow retry after recovery
          }
      }
      
      // Update Auth interface if exists
      if (window.Auth && window.Auth._updateInternal) {
        window.__INTERNAL_SYNC__ = true;
        window.Auth._updateInternal(this._state);
        window.__INTERNAL_SYNC__ = false;
      }

      this._syncInProgress = false;
      return this._state;
    },

    // Alias for backward compatibility
    _syncAuthState() {
      return this._syncState();
    },

    _setState(nextAuth, nextUser, nextSessionId, fullUser = null){
      if (window.__INTERNAL_SYNC__) return; // Prevent loop from Auth interface
      
      if (this._authInitialized && nextAuth === this._authenticated && nextUser === this._userId && !fullUser) return; 
      
      if (typeof nextAuth === 'object' && nextAuth !== null) {
        const payload = nextAuth;

        // CRITICAL: Auto-correct session+unauthenticated state (from actly.md)
        if (payload.sessionId && payload.authenticated === false && payload.status !== 'loading') {
            console.log('[AuthCore] 🚨 AUTO-FIX: Session present but unauthenticated');
            payload.authenticated = true;
            payload.status = 'authenticated';
            payload.userId = payload.userId || localStorage.getItem('user_id') || 'user_' + Date.now();
        }

        // 🚨 CRITICAL FIX: Auto-correct if session exists but auth is false (from actly.md)
        if (payload.sessionId && (!payload.authenticated || payload.status === 'timeout')) {
            console.log('[AuthCore] _setState 🚨 Auto-correcting: session present but authenticated=false or status=timeout');
            payload.authenticated = true;
            payload.status = 'authenticated';
            
            if (!payload.userId) {
                payload.userId = localStorage.getItem('user_id') || 'user_' + Date.now();
            }
            
            // Recover user if missing
            if (!payload.user) {
              try {
                const stored = localStorage.getItem('auth_user') || localStorage.getItem('user_data');
                if (stored) {
                  payload.user = JSON.parse(stored);
                  payload.userId = payload.user.id || payload.user.userId || payload.userId;
                }
              } catch(e) {}
            }
        }

        const nextAuthenticated = !!payload.authenticated;
        const nextStatus = payload.status || (nextAuthenticated ? 'authenticated' : 'unauthenticated');
        const nextUserId = payload.userId || null;
        const nextSessId = payload.sessionId || this._sessionId;
        const nextFullUser = payload.user || fullUser || null;
        
        if (this._locked && nextAuthenticated === false) { return; }
        
        this._authenticated = nextAuthenticated;
        this._status = nextStatus;
        this._userId = nextUserId;
        this._sessionId = nextSessId;
        this._user = nextFullUser;
        this._state = { 
          authenticated: this._authenticated, 
          status: this._status,
          userId: this._userId, 
          sessionId: this._sessionId,
          user: this._user 
        };
        
        this._syncAuthState();
        
        // 🛡️ RACE CONDITION FIX: Don't trigger events if recovery is pending
        if (this._status === 'authenticated' && !this._state._pendingRecovery) {
            // Only proceed if we have complete auth data
            if (this._userId && this._user) {
                window.__resolveAuthReady && window.__resolveAuthReady(true);
                this._authStartTime = Date.now();

                window.dispatchEvent(new CustomEvent('auth:ready', { detail: this._state }));
                window.dispatchEvent(new CustomEvent('auth:changed', { detail: this._state }));
                window.dispatchEvent(new CustomEvent('auth:authenticated', { detail: { userId: this._userId, token: this._sessionId } }));

                // 🏛️ Initialize ACC after authentication
                if (window.ACC && this._userId) {
                  window.ACC.init(this._userId, this._sessionId);
                }

                if (window.location.pathname === '/login.html') {
                  if (!window.__alreadyRedirected) {
                    window.__alreadyRedirected = true;
                    authLog('[AUTH] Redirecting to root application...');
                    window.location.href = '/';
                  }
                }
            } else {
                console.warn('[AuthCore] _setState: Delaying init - incomplete auth state (waiting for recovery)');
            }
        }
        return;
      }
      
      this._authenticated = !!nextAuth;
      this._status = this._authenticated ? 'authenticated' : 'unauthenticated';
      this._userId = nextUser || null;
      this._sessionId = nextSessionId || this._sessionId;
      this._user = fullUser || this._user;
      this._state = { 
        authenticated: this._authenticated, 
        status: this._status,
        userId: this._userId, 
        sessionId: this._sessionId,
        user: this._user
      };
      
      this._syncAuthState();
      
      if (this._status === 'authenticated' && !this._state._pendingRecovery) {
        if (this._userId && this._user) {
            window.__resolveAuthReady && window.__resolveAuthReady(true);
            
            // 🏛️ Initialize ACC after authentication (from actly.md)
            if (window.ACC && this._userId) {
              window.ACC.init(this._userId, this._sessionId).then(() => {
                console.log('[AuthCore] ACC Initialized for user:', this._userId);
                window.dispatchEvent(new CustomEvent('acc:ready', { detail: { userId: this._userId } }));
              }).catch(e => console.warn('[AuthCore] ACC Init failed:', e));
            }
        } else {
            console.warn('[AuthCore] _setState (legacy): Delaying init - incomplete auth state');
        }
      }
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
    },

    async _fetchMeAndApply(){
      try {
<<<<<<< HEAD
        const r = await fetch('/api/auth/me', { credentials: 'include' });
        try { console.log('[AuthCore] /api/auth/me status:', r && r.status); } catch(_){}
        let payload = null;
        if (r && r.ok) { try { payload = await r.json(); } catch(_) { payload = null } }
        try { console.log('[AuthCore] /api/auth/me payload:', payload); } catch(_){}
        const u = payload && payload.user || null;
        this._lastPayloadUser = u && u.id || null;
        this._sessionId = (u && u.sessionId) || (payload && payload.sessionId) || this._sessionId;
        if (u && u.id) {
          this._setState({ authenticated: true, userId: u.id, sessionId: u.sessionId || this._sessionId });
          try { console.log('[AuthCore] APPLY USER → authenticated TRUE'); } catch(_){}
        } else {
          this._setState(false, null);
        }
        if (this._authenticated) { try { Object.freeze(this._state); } catch(_){}; this._locked = true; try { console.log('[AuthCore] STATE LOCKED'); } catch(_){} }
      } catch(_) {
        this._setState(false, null);
      }
      try { console.log('[AuthCore] auth:ready →', { authenticated: !!this._authenticated, userId: this._userId, sessionId: this._sessionId }); } catch(_){}
      try { window.dispatchEvent(new CustomEvent('auth:ready', { detail: { authenticated: this._authenticated, userId: this._userId || null, sessionId: this._sessionId || null } })) } catch(_){}
    },

    async init(){
      try { console.log('[AuthCore] init start'); } catch(_){}
      try { if (typeof window !== 'undefined') { if (window.__AUTH_INIT_DONE__) { try { console.warn('[AuthCore] init skipped — already initialized'); } catch(_){}; return; } window.__AUTH_INIT_DONE__ = true; } } catch(_){}
      try {
        const isCodeBank = (typeof location!=='undefined' && location.pathname && location.pathname.startsWith('/codebank/')) || (document && document.baseURI && document.baseURI.indexOf('/services/yt-clear/codebank/')!==-1);
        const disableFetch = !!(typeof window!=='undefined' && window.__DISABLE_AUTH_FETCH__===true);
        this._sessionId = getCookie('session_token');
        if ((isCodeBank || disableFetch) && !this._sessionId) {
          this._setState(false, null);
          try { window.dispatchEvent(new CustomEvent('auth:ready', { detail: { authenticated: this._authenticated, userId: this._userId || null, sessionId: this._sessionId || null } })) } catch(_){}
          return;
        }
        if (!this._sessionId) {
          this._setState(false, null);
          try { window.dispatchEvent(new CustomEvent('auth:ready', { detail: { authenticated: this._authenticated, userId: this._userId || null, sessionId: this._sessionId || null } })) } catch(_){}
          return;
        }
        await this._fetchMeAndApply();
      } catch(_) {
        this._setState(false, null);
      }
      // events dispatched inside _fetchMeAndApply
    },

    isAuthenticated(){ return !!this._authenticated },
    userId(){ return this._userId || null },
    sessionId(){ return this._sessionId || null },

    async refresh(){
      try { console.log('[AuthCore] refresh() start'); } catch(_){}
      if (this._locked) { try { console.log('[AuthCore] refresh() skipped: state locked'); } catch(_){}; return; }
      const before = this._authenticated;
      await this._fetchMeAndApply();
      try { console.log('[AuthCore] refresh() done', { from: !!before, to: !!this._authenticated }); } catch(_){}
      if (before !== this._authenticated) {
        try { console.log('[AuthCore] auth:changed →', { authenticated: !!this._authenticated, userId: this._userId }); } catch(_){}
        try { window.dispatchEvent(new CustomEvent('auth:changed', { detail: { authenticated: this._authenticated, userId: this._userId || null, sessionId: this._sessionId || null } })) } catch(_){}
      }
    }
  };

  try { window.Auth = Auth } catch(_){}
  try { Auth.init() } catch(_){}
})();

// DEV frontend bootstrap disabled: auth state is server-session driven only
=======
        const headers = { 'Accept': 'application/json' };
        if (this._sessionId) {
          headers['Authorization'] = `Bearer ${this._sessionId}`;
        }

        const r = await fetch('/api/auth/me', { 
          credentials: 'include',
          headers: headers
        });
        
        let payload = null;
        if (r && r.ok) { 
          try { payload = await r.json(); } catch(_) { payload = null } 
        }
        
        const u = payload && payload.user || null;
        this._lastPayloadUser = u && u.id || null;
        this._sessionId = (u && u.sessionId) || (payload && payload.sessionId) || this._sessionId;
        
        if (u && u.id) {
          this._setState({ 
            authenticated: true, 
            status: 'authenticated',
            userId: u.id, 
            sessionId: u.sessionId || this._sessionId 
          }, null, null, u);
          this._authInitialized = true; // 🔧 Mark as initialized
          
        } else {
          this._setState({ authenticated: false, status: 'unauthenticated' }, null);
          window.__resolveAuthReady && window.__resolveAuthReady(false);
          this._authInitialized = true; 
        }
        
        if (this._status === 'authenticated') { 
          try { Object.freeze(this._state); } catch(_){}; 
          this._locked = true; 
        }
      } catch(_) {
        this._setState({ authenticated: false, status: 'unauthenticated' }, null);
        window.__resolveAuthReady && window.__resolveAuthReady(false);
      }
      
      this._syncAuthState();
      
      try { 
        window.dispatchEvent(new CustomEvent('auth:ready', { 
          detail: { 
            authenticated: this._authenticated, 
            status: this._status,
            userId: this._userId || null, 
            sessionId: this._sessionId || null,
            user: this._user
          } 
        })); 
      } catch(_){}
    },

    async init(){
      if (this._initPromise) return this._initPromise;
      
      // 🛡️ PROBLEM 3 FIX: Login Page Redirect Guard
      const isLoginPage = window.location.pathname.includes('login') || 
                          window.location.pathname.includes('signin') || 
                          window.location.search.includes('showLogin=true'); 
      
      if (isLoginPage) { 
          console.log('[AuthCore] On login page, preventing auto-redirect'); 
          // We still initialize but we won't trigger any auto-redirects
      }

      this._initPromise = (async () => {
        try {
          if (window.__AUTH_INIT_DONE__) return;
          window.__AUTH_INIT_DONE__ = true;

          console.log('[AuthCore] Initializing auth state...');
          this._status = 'loading';

          // Try to recover from IDB first
          try {
            const DB_NAME = 'AuthDB';
            const DB_VERSION = 3;
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            await new Promise((resolve) => {
              request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('auth_state')) {
                  console.warn('[AuthCore] AuthDB initialized but auth_state store missing');
                  resolve();
                  return;
                }
                const tx = db.transaction('auth_state', 'readonly');
                const store = tx.objectStore('auth_state');
                const getReq = store.get('current');
                
                getReq.onsuccess = () => {
                  const state = getReq.result;
                  if (state && state.authenticated) {
                    console.log('[AuthCore] Recovered state from IDB:', state.userId);
                    this._authenticated = true;
                    this._userId = state.userId;
                    this._sessionId = state.sessionId;
                    this._user = state.user;
                    this._status = 'authenticated';
                    this._authInitialized = true;
                    this._syncAuthState();
                    window.dispatchEvent(new CustomEvent('auth:ready', { detail: state }));
                    if (window.__resolveAuthReady) window.__resolveAuthReady(true);
                  }
                  resolve();
                };
                getReq.onerror = () => resolve();
              };
              request.onerror = () => resolve();
            });
            
            if (this._status === 'authenticated') return;
          } catch(e) {
            console.warn('[AuthCore] IDB recovery failed:', e);
          }

          this._syncAuthState();

          // IFRAME AUTH INHERITANCE: Check if parent has Auth
          if (window.self !== window.top) {
            try {
              if (window.top && window.top.Auth && typeof window.top.Auth.isAuthenticated === 'function') {
                console.log('[AuthCore] Iframe detected parent Auth, inheriting state');
                const parentAuth = window.top.Auth;
                const parentUser = parentAuth.getUser ? parentAuth.getUser() : null;
                const parentStatus = parentAuth.getStatus ? parentAuth.getStatus() : (parentAuth.isAuthenticated() ? 'authenticated' : 'unauthenticated');
                
                this._setState({
                  authenticated: parentAuth.isAuthenticated(), 
                  status: parentStatus,
                  userId: parentUser?.id, 
                  sessionId: parentAuth.getToken ? parentAuth.getToken() : null,
                  user: parentUser
                });
                this._syncAuthState();
                this._authInitialized = true;
                window.__resolveAuthReady && window.__resolveAuthReady(this._authenticated);
                
                return;
              }
            } catch (e) {
              console.warn('[AuthCore] Cross-origin parent access failed, will use postMessage');
            }
          }

          const isCodeBank = (typeof location!=='undefined' && location.pathname && 
            (location.pathname.startsWith('/codebank/') || 
             location.pathname.includes('/services/yt-clear/codebank/')));
             
          const disableFetch = !!(typeof window!=='undefined' && window.__DISABLE_AUTH_FETCH__===true);
          
          this._sessionId = getCookie('session_token');

          // 🔧 FIX 3: Persistence - Restore from cache if available
          const cachedUserStr = localStorage.getItem('__cached_user__');
          const localToken = localStorage.getItem('session_token');
          
          if (!this._sessionId && localToken) {
            console.log('[AuthCore] No cookie but found token in localStorage, restoring...');
            this._sessionId = localToken;
            document.cookie = `session_token=${localToken}; path=/; max-age=${7*24*60*60}`;
          }

          if (cachedUserStr && this._sessionId) {
            try {
              const cachedUser = JSON.parse(cachedUserStr);
              const cachedSessionId = localStorage.getItem('__cached_session_id__');
              
              if (cachedUser && (cachedSessionId === this._sessionId || localToken === this._sessionId)) {
                console.log('[AuthCore] Restoring auth state from cache');
                this._setState({
                  authenticated: true,
                  status: 'authenticated',
                  userId: cachedUser.id,
                  sessionId: this._sessionId,
                  user: cachedUser
                });
                this._authInitialized = true;
                // Still fetch in background to verify
                this._fetchMeAndApply().catch(() => {});
                return;
              }
            } catch(e) {
              localStorage.removeItem('__cached_user__');
              localStorage.removeItem('__cached_session_id__');
              localStorage.removeItem('session_token');
            }
          }
          
          // 🛡️ IFRAME AUTH INHERITANCE: PostMessage listener
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'AUTH_SYNC') {
              console.log('[AuthCore] Received AUTH_SYNC from parent window');
              const { authenticated, userId, sessionId, user } = event.data;
              if (authenticated && userId && sessionId) {
                this._setState({
                  authenticated: true,
                  status: 'authenticated',
                  userId,
                  sessionId,
                  user
                });
                this._authInitialized = true;
                this._syncAuthState();
              }
            }
          });
          
          if (!this._sessionId) {
            console.log('[AuthCore] No session token found, user is guest');
            this._setState({ authenticated: false, status: 'unauthenticated' }, null);
            this._authInitialized = true;
            window.__resolveAuthReady && window.__resolveAuthReady(false);
            this._syncAuthState();
            
            try { 
              window.dispatchEvent(new CustomEvent('auth:ready', { 
                detail: { authenticated: false, status: 'unauthenticated', userId: null, sessionId: null, user: null } 
              })); 
            } catch(_){}
            return;
          }
          
          await this._fetchMeAndApply();
        } catch(e) {
          console.error('[AuthCore] Init error:', e);
          this._setState({ authenticated: false, status: 'unauthenticated' }, null);
          this._authInitialized = true;
          this._syncAuthState();
        }
      })();
      
      return this._initPromise;
    },

    isAuthenticated(){ return this._status === 'authenticated' },
    getStatus(){ return this._status },
    userId(){ return this._userId || null },
    sessionId(){ return this._sessionId || null },
    getUser(){ return this._user || { id: this._userId } },
    getState(){ return { ...this._state } },

    async refresh(){
      try { console.log('[AuthCore] refresh() start'); } catch(_){};
      if (this._locked) { 
        try { console.log('[AuthCore] refresh() skipped: state locked'); } catch(_){}; 
        return; 
      }
      
      const beforeStatus = this._status;
      await this._fetchMeAndApply();
      
      try { console.log('[AuthCore] refresh() done', { from: beforeStatus, to: this._status }); } catch(_){}
      
      if (beforeStatus !== this._status) {
        try { console.log('[AuthCore] auth:changed →', { 
          authenticated: this.isAuthenticated(), 
          status: this._status,
          userId: this._userId 
        }); } catch(_){}
        
        try { 
          window.dispatchEvent(new CustomEvent('auth:changed', { 
            detail: { 
              authenticated: this.isAuthenticated(), 
              status: this._status,
              userId: this._userId || null, 
              sessionId: this._sessionId || null,
              user: this._user
            } 
          })); 
        } catch(_){}
        
        // Notify bridge of change
        if (window.AuthBridge) {
          window.AuthBridge.notifyChange();
        }
      }
    },

    async waitForAuth(timeout = 10000){
      if (this._status === 'authenticated') return true;
      if (this._status === 'unauthenticated') return false;
      
      return new Promise((resolve) => {
        const check = () => {
          if (this._status === 'authenticated') {
            resolve(true);
            return true;
          }
          if (this._status === 'unauthenticated') {
            resolve(false);
            return true;
          }
          return false;
        };
        
        if (check()) return;
        
        const interval = setInterval(() => {
          if (check()) clearInterval(interval);
        }, 100);
        
        setTimeout(() => {
          clearInterval(interval);
          resolve(this._status === 'authenticated');
        }, timeout);
      });
    },

    logout(){
      this._authenticated = false;
      this._status = 'unauthenticated';
      this._userId = null;
      this._user = null;
      this._syncAuthState();
      
      // Notify all iframes
      if (window.AuthBridge) {
        window.AuthBridge.broadcast({
          type: 'AUTH_LOGOUT',
          timestamp: Date.now()
        });
      }
      
      window.dispatchEvent(new CustomEvent('auth:logout'));
    },

    // 🛡️ IDB HELPER METHODS (Requirement from actly.md)
    async _saveToIDB(data) {
      try {
        // Skip if DB not ready
        if (typeof indexedDB === 'undefined') {
          console.log('[AuthCore] IndexedDB not available, skipping IDB save');
          return;
        }
        
        const DB_NAME = 'AuthDB';
        const DB_VERSION = 3; 
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        return new Promise((resolve, reject) => {
          request.onupgradeneeded = (e) => {
            const db = e.target.result;
            const stores = ['users', 'sessions', 'auth_state', 'pending_txs'];
            stores.forEach(storeName => {
              if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
                console.log(`[AuthCore] Created object store: ${storeName}`);
              }
            });
          };

          request.onsuccess = (e) => {
            const db = e.target.result;
            
            // Check if store exists
            if (!db.objectStoreNames.contains('auth_state')) {
                console.error('[AuthCore] auth_state store missing, forcing upgrade...');
                db.close();
                const upgradeReq = indexedDB.open(DB_NAME, DB_VERSION + 1);
                upgradeReq.onupgradeneeded = (ev) => {
                  ev.target.result.createObjectStore('auth_state', { keyPath: 'id' });
                };
                upgradeReq.onsuccess = () => resolve();
                upgradeReq.onerror = (err) => {
                  console.log('[AuthCore] IDB upgrade failed (non-fatal):', err.message);
                  resolve(); // Don't reject, make it non-fatal
                };
                return;
            }

            const tx = db.transaction('auth_state', 'readwrite');
            const store = tx.objectStore('auth_state');
            store.put({ id: 'current', ...data });
            tx.oncomplete = () => { 
              db.close(); 
              console.log('[AuthCore] State saved to IDB');
              resolve(); 
            };
            tx.onerror = (err) => { 
              db.close(); 
              console.log('[AuthCore] IDB save failed (non-fatal):', err.message);
              resolve(); // Don't reject, make it non-fatal
            };
          };
          
          request.onerror = (err) => {
            console.log('[AuthCore] IDB open failed (non-fatal):', err.message);
            resolve(); // Don't reject, make it non-fatal
          };
        });
      } catch (err) {
        // NON-FATAL: Log but don't throw
        console.log('[AuthCore] IDB save failed (non-fatal):', err.message);
        // Continue with memory-only state
      }
    },

    async _clearIDB() {
      if (typeof indexedDB === 'undefined') return;
      return new Promise((resolve, reject) => {
        const DB_NAME = 'AuthDB';
        const DB_VERSION = 3;
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          const stores = ['users', 'sessions', 'auth_state', 'pending_txs'];
          stores.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('auth_state', 'readwrite');
          const store = tx.objectStore('auth_state');
          store.clear();
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = (err) => { db.close(); reject(err); };
        };
        request.onerror = (err) => resolve();
      });
    }
  };

  // ============================================
  // SECTION 4: GLOBAL AUTH INTERFACE
  // ============================================

  try { 
    if (window.self === window.top) {
      // Global Auth interface
      window.Auth = {
        isAuthenticated: () => AuthCore.isAuthenticated(),
        getUser: () => AuthCore.getUser(),
        getStatus: () => AuthCore.getState().status, // 🛡️ ADDED: Required for safe-list-actions.js
        getToken: () => AuthCore.sessionId(),
        getState: () => AuthCore.getState(),
        refresh: () => AuthCore.refresh(),
        logout: () => AuthCore.logout(),
        waitForAuth: (t) => AuthCore.waitForAuth(t),
        onChange: (cb) => {
          const handler = (e) => {
            if (typeof cb === 'function') cb(e.detail);
          };
          window.addEventListener('auth:changed', handler);
          window.addEventListener('auth:ready', handler);
          
          // Return unsubscribe
          return () => {
            window.removeEventListener('auth:changed', handler);
            window.removeEventListener('auth:ready', handler);
          };
        },
        // Internal update method
        _updateInternal: (state) => {
          if (!state) return;
          console.log('[Auth] Internal update received:', state);
          AuthCore._setState(state);
        }
      };
      
      // Global APP object
      window.__APP__ = {
        auth: window.Auth,
        assets: {
          snapshot: [],
          lastUpdate: Date.now()
        },
        version: '2.0.0'
      };
      
      console.log("✅ [AuthCore] Parent window Auth initialized");
    }
  } catch(_) {}

  // ============================================
  // SECTION 5: POSTMESSAGE AUTH BRIDGE
  // ============================================

  const AuthBridge = {
    // Configure these for your deployment
    config: {
      // ALLOWED_ORIGINS: Add all your service domains here
      allowedOrigins: [
        window.location.origin, // Same origin always allowed
        
        // Development origins
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        
        // Add your production origins here:
        // 'https://codebank.yourdomain.com',
        // 'https://e7ki.yourdomain.com',
        // 'https://farragna.yourdomain.com',
        // 'https://samman.yourdomain.com',
        // 'https://pebalaash.yourdomain.com',
        // 'https://eb3at.yourdomain.com',
        // 'https://games.yourdomain.com',
        // 'https://safecode.yourdomain.com',
      ],
      
      // Token expiry for iframe sessions (milliseconds)
      tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
      
      // Enable debug logging
      debug: true
    },
    
    // Connected iframes registry
    connections: new Map(),
    
    init: function() {
      if (window.self !== window.top) return; // Only in parent
      
      window.addEventListener('message', this.handleMessage.bind(this));
      console.log('[AuthBridge] PostMessage bridge initialized');
      console.log('[AuthBridge] Allowed origins:', this.config.allowedOrigins);
    },
    
    isAllowedOrigin: function(origin) {
      // Exact match
      if (this.config.allowedOrigins.includes(origin)) return true;
      
      // Check for wildcard subdomains (if configured)
      // WARNING: Only use for trusted domains
      try {
        const url = new URL(origin);
        const hostname = url.hostname;
        
        // Example: allow *.yourdomain.com
        // if (hostname.endsWith('.yourdomain.com')) return true;
      } catch(e) {
        return false;
      }
      
      return false;
    },
    
    handleMessage: function(event) {
      // 🛡️ Filter YouTube spam to prevent console flooding
      if (event.origin && event.origin.includes('youtube.com')) return;

      // SECURITY: Strict origin check 
      if (!this.isAllowedOrigin(event.origin)) {
        if (this.config.debug) {
          console.warn('[AuthBridge] REJECTED message from unauthorized origin:', event.origin);
        }
        return;
      }
      
      // Validate data
      if (!event.data || typeof event.data !== 'object') return;
      
      const data = event.data;
      const source = event.source;
      const origin = event.origin;
      
      // Handle auth request types
      switch(data.type) {
        case 'AUTH_REQUEST':
          this.handleAuthRequest(source, origin, data);
          break;
          
        case 'AUTH_REFRESH':
          this.handleAuthRefresh(source, origin, data);
          break;
          
        case 'AUTH_VALIDATE':
          this.handleAuthValidate(source, origin, data);
          break;
          
        case 'AUTH_PING':
          // Simple ping-pong for connectivity check
          source.postMessage({ type: 'AUTH_PONG', timestamp: Date.now() }, origin);
          break;
          
        case 'auth:done':
          // 🔧 FIX 4: Handle iframe reload request via postMessage
          console.log('[AuthBridge] auth:done received from iframe, refreshing parent state');
          if (window.Auth && window.Auth.refresh) {
            window.Auth.refresh().then(() => {
              // Optionally notify other iframes or perform a safe top-level reload if absolutely necessary
              // but usually refresh() is enough to sync state.
            });
          }
          break;

        case 'IFRAME_READY':
          // Iframe is ready and listening
          this.handleIframeReady(source, origin, data);
          break;
          
        default:
          // Not an auth message, ignore
          break;
      }
    },
    
    handleAuthRequest: function(source, origin, data) {
      const requestId = data.requestId || generateUUID();
      const iframeId = data.iframeId || 'unknown';
      
      if (this.config.debug) {
        console.log('[AuthBridge] Auth request from:', origin, 'iframe:', iframeId);
      }
      
      // Get current auth state
      const authState = {
        type: 'AUTH_RESPONSE',
        requestId: requestId,
        iframeId: iframeId,
        authenticated: AuthCore.isAuthenticated(),
        userId: AuthCore.userId(),
        sessionId: AuthCore.sessionId(),
        user: AuthCore.getUser(),
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.tokenExpiry
      };
      
      // Register connection
      this.connections.set(requestId, {
        source: source,
        origin: origin,
        iframeId: iframeId,
        connectedAt: Date.now(),
        lastPing: Date.now()
      });
      
      // Send response
      try {
        source.postMessage(authState, origin);
        
        if (this.config.debug) {
          console.log('[AuthBridge] Auth sent to:', origin, 'authenticated:', authState.authenticated);
        }
      } catch(e) {
        console.error('[AuthBridge] Failed to send auth:', e);
      }
    },
    
    handleAuthRefresh: function(source, origin, data) {
      const requestId = data.requestId;
      
      // Refresh parent auth first
      AuthCore.refresh().then(() => {
        this.handleAuthRequest(source, origin, { 
          requestId: requestId,
          iframeId: data.iframeId 
        });
      });
    },
    
    handleAuthValidate: function(source, origin, data) {
      // Validate a token/session
      const isValid = AuthCore.isAuthenticated() && 
                      data.sessionId === AuthCore.sessionId();
      
      source.postMessage({
        type: 'AUTH_VALIDATE_RESPONSE',
        requestId: data.requestId,
        valid: isValid,
        timestamp: Date.now()
      }, origin);
    },
    
    handleIframeReady: function(source, origin, data) {
      // Iframe signals it's ready
      if (this.config.debug) {
        console.log('[AuthBridge] Iframe ready:', data.iframeId, 'from:', origin);
      }
      
      // Send current auth state immediately
      this.handleAuthRequest(source, origin, {
        requestId: data.requestId || generateUUID(),
        iframeId: data.iframeId
      });
    },
    
    broadcast: function(message) {
      this.connections.forEach((conn, requestId) => {
        try {
          // Check if connection is stale (no ping for 5 minutes)
          if (Date.now() - conn.lastPing > 5 * 60 * 1000) {
            this.connections.delete(requestId);
            return;
          }
          
          conn.source.postMessage(message, conn.origin);
        } catch(e) {
          // Remove dead connections
          this.connections.delete(requestId);
        }
      });
    },
    
    notifyChange: function() {
      this.broadcast({
        type: 'AUTH_CHANGED',
        authenticated: AuthCore.isAuthenticated(),
        userId: AuthCore.userId(),
        sessionId: AuthCore.sessionId(),
        user: AuthCore.getUser(),
        timestamp: Date.now()
      });
    },
    
    // Cleanup stale connections periodically
    startCleanup: function() {
      setInterval(() => {
        const now = Date.now();
        this.connections.forEach((conn, id) => {
          if (now - conn.lastPing > 10 * 60 * 1000) { // 10 minutes
            this.connections.delete(id);
          }
        });
      }, 60000); // Every minute
    }
  };

  // Initialize bridge in parent window
  if (window.self === window.top) {
    AuthBridge.init();
    AuthBridge.startCleanup();
    window.AuthBridge = AuthBridge;
  }

  // ============================================
  // SECTION 6: GLOBAL PROMISE & INIT
  // ============================================

  window.authReadyPromise = new Promise((resolve) => {
    window.__resolveAuthReady = resolve;
  });

  // Initialize AuthCore
  try { 
    AuthCore.init();
  } catch(e){
    console.error('[AuthCore] Initialization error:', e);
    // Set default unauthenticated state to break loading loop
    if (AuthCore && typeof AuthCore._setState === 'function') {
      AuthCore._setState({
        authenticated: false,
        status: 'error',
        error: e.message
      });
    }
  }

  // ⏳ Fix 3: Add Loading Timeout
  setTimeout(() => {
    if (AuthCore && AuthCore._status === 'loading') {
      // If we have a sessionId, don't time out to error, try to force authenticated
      if (AuthCore.sessionId()) {
        console.warn('[AuthCore] Loading timeout but sessionId exists - forcing authenticated');
        AuthCore._setState({
          authenticated: true,
          status: 'authenticated',
          sessionId: AuthCore.sessionId()
        });
      } else {
        console.warn('[AuthCore] Loading timeout - forcing error state to break loop');
        if (typeof AuthCore._setState === 'function') {
          AuthCore._setState({
            authenticated: false,
            status: 'timeout',
            error: 'Initialization timeout'
          });
        }
      }
    }
  }, 5000); // 5 second timeout

  // ============================================
  // SECTION 7: LEGACY BRIDGE (usersManager)
  // ============================================
  
  try {
    if (!window.usersManager) {
      window.usersManager = {
        addUser: async (userData) => {
          console.log('[usersManager] Bridging addUser to AuthCore:', userData);
          if (AuthCore && typeof AuthCore._setState === 'function') {
            AuthCore._setState({
              authenticated: true,
              status: 'authenticated',
              userId: userData.userId || userData.id,
              sessionId: userData.sessionId,
              user: userData
            });
            return { success: true };
          }
          return { success: false, error: 'AuthCore not ready' };
        }
      };
    } else {
      console.log('[AuthCore] usersManager already exists, skipping assignment');
    }
  } catch(e) {
    console.warn('[AuthCore] Could not initialize usersManager bridge:', e.message);
  }

  // ============================================
  // SECTION 8: AUTH STATE AUTO-CORRECTION PATCH (from actly.md)
  // ============================================

  (function() {
    'use strict';
    
    // Safety net that checks periodically
    setInterval(() => {
        // 🛡️ STOP WATCHER GUARD: Prevent interference during transitions
        if (window.__STOP_AUTH_WATCHER__) return;

        const state = AuthCore._state;
        if (state?.sessionId && !state?.authenticated) {
            // 🛡️ إضافة هذا الشرط ضرورية جداً (from actly.md)
            if (window.location.pathname.includes('login.html') || window.__STOP_AUTH_WATCHER__) {
                console.log('[AuthCore] Skipping safety reload - on login page or transition');
                return; 
            }
            
            console.log('🚨 [Emergency Fix] Clearing broken auth state');
            AuthCore.logout();
            window.location.reload();
        }
    }, 1000);

    // Immediate correction check
    setTimeout(() => {
        if (window.__STOP_AUTH_WATCHER__) return;

        const state = AuthCore._state;
        if (state?.sessionId && !state?.authenticated) {
            if (window.location.pathname.includes('login.html')) return;

            console.log('[🔥 AUTH PATCH] Initial safety check triggered');
            AuthCore.logout();
            window.location.reload();
        }
    }, 500);
  })();

  // ============================================
  // SECTION 9: GLOBAL EXPOSURE (PROBLEM 2 FIX)
  // ============================================
  
  if (typeof window !== 'undefined') { 
      window.AuthCore = AuthCore; 
      console.log('[AuthCore] Exposed to window as window.AuthCore'); 
  }

})();
>>>>>>> 715f14454 (BACKUP: Pre-modularization state - 4,827 line server.js)
