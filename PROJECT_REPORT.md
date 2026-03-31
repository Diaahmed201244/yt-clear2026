# 🏛️ Complete Project Scaffolding & File Function Report

This report is a **truly exhaustive** breakdown of every single file and folder in the repository (excluding `node_modules`).

---

## 📂 Root Level
Entry points and system-wide configuration.

- **[index.html](file:///Users/user/Desktop/new-yt/yt-clear/index.html)**: Main landing grid for all sub-apps.
- **[login.html](file:///Users/user/Desktop/new-yt/yt-clear/login.html)**: Unified login and registration system.
- **[yt-new-clear.html](file:///Users/user/Desktop/new-yt/yt-clear/yt-new-clear.html)**: Main YouTube interaction workspace.
- **[main.js](file:///Users/user/Desktop/new-yt/yt-clear/main.js)**: Central application bootstrapper.
- **[server.js](file:///Users/user/Desktop/new-yt/yt-clear/server.js)**: Primary Express server.
- **[server-simple.js](file:///Users/user/Desktop/new-yt/yt-clear/server-simple.js)**: Dev-only lightweight server.
- **[layout-bootstrap.js](file:///Users/user/Desktop/new-yt/yt-clear/layout-bootstrap.js)**: UI initialization and responsiveness.
- **[package.json](file:///Users/user/Desktop/new-yt/yt-clear/package.json)**: Core project manifest.
- **[package-lock.json](file:///Users/user/Desktop/new-yt/yt-clear/package-lock.json)**: Locked dependency tree.
- **[.env](file:///Users/user/Desktop/new-yt/yt-clear/.env)**: System environment variables.
- **[.env.example](file:///Users/user/Desktop/new-yt/yt-clear/.env.example)**: Template for environment variables.
- **[actly .md](file:///Users/user/Desktop/new-yt/yt-clear/actly%20.md)**: Master project blueprint and roadmap.
- **[PROJECT_REPORT.md](file:///Users/user/Desktop/new-yt/yt-clear/PROJECT_REPORT.md)**: This exhaustive structural report.
- **[capacitor.config.json](file:///Users/user/Desktop/new-yt/yt-clear/capacitor.config.json)**: Cross-platform mobile config.
- **[vite.config.js](file:///Users/user/Desktop/new-yt/yt-clear/vite.config.js)**: Bundler configuration.
- **[automated-sync-test.js](file:///Users/user/Desktop/new-yt/yt-clear/automated-sync-test.js)**: Automated asset sync testing.
- **[country-data-service.js](file:///Users/user/Desktop/new-yt/yt-clear/country-data-service.js)**: Geolocation data helper.
- **[hybrid-otp-service.js](file:///Users/user/Desktop/new-yt/yt-clear/hybrid-otp-service.js)**: Multi-channel OTP logic.
- **[azan-clock.html](file:///Users/user/Desktop/new-yt/yt-clear/azan-clock.html)**: Standalone prayer time utility.
- **[data.sqlite](file:///Users/user/Desktop/new-yt/yt-clear/data.sqlite)**: Legacy/Main SQLite database file.
- **[image.png](file:///Users/user/Desktop/new-yt/yt-clear/image.png)**: Generic asset.
- **[out.log](file:///Users/user/Desktop/new-yt/yt-clear/out.log)**: Root-level execution log.
- **[output.log](file:///Users/user/Desktop/new-yt/yt-clear/output.log)**: Build/Process output log.
- **[projectPhilosophy.md](file:///Users/user/Desktop/new-yt/yt-clear/projectPhilosophy.md)**: Architectural philosophy and vision.
- **[PROJECT_SCAFFOLD.md](file:///Users/user/Desktop/new-yt/yt-clear/PROJECT_SCAFFOLD.md)**: Previous structural overview.
- **[TALENT_STUDIO_FOLDER_STRUCTURE_REPORT.md](file:///Users/user/Desktop/new-yt/yt-clear/TALENT_STUDIO_FOLDER_STRUCTURE_REPORT.md)**: Studio-specific structure report.
- **[BATTALOODA_FOLDER_STRUCTURE_REPORT.md](file:///Users/user/Desktop/new-yt/yt-clear/BATTALOODA_FOLDER_STRUCTURE_REPORT.md)**: Battalooda structure report.
- **[FARRAGNA_API_DOCS.md](file:///Users/user/Desktop/new-yt/yt-clear/FARRAGNA_API_DOCS.md)**: Documentation for Farragna APIs.

---

## 📂 /acc (Assets Central Core)
Central synchronization and management of project currencies.

- **[acc-server.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/acc-server.js)**: Main ACC backend server.
- **[acc-client.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/acc-client.js)**: Browser-side ACC communicator.
- **[asset-mirror.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/asset-mirror.js)**: UI logic for reflecting balances.
- **[transaction-gateway.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/transaction-gateway.js)**: Core transaction validation engine.
- **[service-bridge-base.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/service-bridge-base.js)**: Abstract bridge for sub-services.
- **[acc-integration.html](file:///Users/user/Desktop/new-yt/yt-clear/acc/acc-integration.html)**: ACC dashboard and log viewer.
- **[package.json](file:///Users/user/Desktop/new-yt/yt-clear/acc/package.json)**: Dependencies for the ACC server.
- **[.env](file:///Users/user/Desktop/new-yt/yt-clear/acc/.env)**: Private keys and URLs for ACC.
- **📂 /bridges/**:
  - **[pebalaash-bridge.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/bridges/pebalaash-bridge.js)**: Swapping service connection.
  - **[farragna-bridge.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/bridges/farragna-bridge.js)**: Social interactions connection.
  - **[battalooda-bridge.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/bridges/battalooda-bridge.js)**: Gaming service connection.
  - **[safecode-bridge.js](file:///Users/user/Desktop/new-yt/yt-clear/acc/bridges/safecode-bridge.js)**: Primary vault connection.

---

## 📂 /core
The brain of the unified application.

- **[app-lifecycle.js](file:///Users/user/Desktop/new-yt/yt-clear/core/app-lifecycle.js)**: Master module controller.
- **[ai-brain.js](file:///Users/user/Desktop/new-yt/yt-clear/core/ai-brain.js)**: Behavioral analysis engine.
- **[self-healing.js](file:///Users/user/Desktop/new-yt/yt-clear/core/self-healing.js)**: Fault detection and auto-repair.
- **📂 /assets/**:
  - **[assets-kernel.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/assets-kernel.js)**: Low-level balance operations.
  - **[asset-transactions.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/asset-transactions.js)**: Transaction log logic.
  - **[asset-locker.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/asset-locker.js)**: Atomic state locking.
  - **[asset-events.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/asset-events.js)**: System-wide asset triggers.
  - **[asset-readonly.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/asset-readonly.js)**: Immutable asset view.
  - **[local-assets-bus.js](file:///Users/user/Desktop/new-yt/yt-clear/core/assets/local-assets-bus.js)**: Intra-process communication bus.
- **📂 /auth/**:
  - **[auth-service.js](file:///Users/user/Desktop/new-yt/yt-clear/core/auth/auth-service.js)**: Authentication backend logic.
  - **[session-store.js](file:///Users/user/Desktop/new-yt/yt-clear/core/auth/session-store.js)**: Secure session storage.
  - **[auth-middleware.js](file:///Users/user/Desktop/new-yt/yt-clear/core/auth/auth-middleware.js)**: Server-side route protection.
  - **[auth-events.js](file:///Users/user/Desktop/new-yt/yt-clear/core/auth/auth-events.js)**: Auth-specific event handlers.
- **📂 /ledger/**:
  - **[ledger-writer.js](file:///Users/user/Desktop/new-yt/yt-clear/core/ledger/ledger-writer.js)**: Financial persistence handler.
  - **[ledger-schema.js](file:///Users/user/Desktop/new-yt/yt-clear/core/ledger/ledger-schema.js)**: Ledger table definitions.
- **📂 /schema/**:
  - **[setup-v2.js](file:///Users/user/Desktop/new-yt/yt-clear/core/schema/setup-v2.js)**: Database setup logic.

---

## 📂 /shared
Common utilities, engines, and data models.

- **[auth-core.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/auth-core.js)**: Unified auth client logic.
- **[event-bus.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/event-bus.js)**: Global pub/sub system.
- **[storage-adapter.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/storage-adapter.js)**: Database agnostic wrapper.
- **[feature-flags.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/feature-flags.js)**: Toggle system features dynamically.
- **[asset-policy.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/asset-policy.js)**: Economic rules definitions.
- **[translate.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/translate.js)**: Translation engine.
- **[ui-state-authority.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/ui-state-authority.js)**: Manages global UI synchronization.
- **[watch-dog-guardian.js](file:///Users/user/Desktop/new-yt/yt-clear/shared/watch-dog-guardian.js)**: Shared security watchdog.
- **📂 /engines/**: Logic for Games, Likes, Transactions, Superlikes.
- **📂 /logicode/**: Advanced modules for compression, encryption, rewards, and sync.
- **📂 /watchdog-core/**: 3D models and state machine for the guardian.
- **📂 /jwt/**: Token lifecycle management.
- **📂 /balloon-engine/**: Advanced visual interaction logic.

---

## 📂 /codebank
The ecosystem of decentralized services.

- **[indexCB.html](file:///Users/user/Desktop/new-yt/yt-clear/codebank/indexCB.html)**: Primary CodeBank hub.
- **📂 /Games-Centre/**: Full multiplayer gaming infrastructure.
  - **[dashboard.html](file:///Users/user/Desktop/new-yt/yt-clear/codebank/Games-Centre/dashboard.html)**: Gaming dashboard.
  - **[game-engine.js](file:///Users/user/Desktop/new-yt/yt-clear/codebank/Games-Centre/core/game-engine.js)**: Core game logic.
  - **📂 /games/**: Subfolders for American Roulette, Casino, Chess, Snake, Tetris, etc.
- **📂 /bankode/**: Specialized vault and code management.
  - **[bankode-complete-fix.js](file:///Users/user/Desktop/new-yt/yt-clear/codebank/bankode/bankode-complete-fix.js)**: Main logic.
  - **[dashboard.html](file:///Users/user/Desktop/new-yt/yt-clear/codebank/bankode/dashboard.html)**: Vault dashboard UI.
- **📂 /battalooda/**: Audio and social studio.
  - **[battalooda-core.js](file:///Users/user/Desktop/new-yt/yt-clear/codebank/battalooda/js/battalooda-core.js)**: Studio engine.
  - **[talent-studio.html](file:///Users/user/Desktop/new-yt/yt-clear/codebank/battalooda/talent-studio.html)**: Production UI.
- **📂 /farragna/**: Interactive social video.
- **📂 /pebalaash/**: React-based barter exchange system.
- **📂 /samma3ny/**: Advanced audio player and song management.
- **📂 /shots/**: Short-form video social logic.
- **📂 /corsa/**: Learning platform dashboard.
- **📂 /e7ki/**: Multi-platform chat application.
- **📂 /qarsan/**: Specialized pirate-themed sub-game/logic.
- **📂 /js/**: A massive collection of 50+ standalone JS modules for banking, security, UI, and integrations.

---

## 📂 /api
Backend service layer.

- **📂 /modules/**: Logic for codes, monetization, trust, rewards, and sub-services.
- **📂 /middleware/**: Auth guards, admin checks, and Clerk integration.
- **📂 /utils/**: Audit logging, SMS providers, and database helpers.
- **📂 /routes/**: HTTP endpoints for all services.
- **📂 /sql/**: Master database schema files.

---

## 📂 /yt-player & /player
Specialized logic for the core YouTube experience.

- **[yt-player.js](file:///Users/user/Desktop/new-yt/yt-clear/yt-player/yt-player.js)**: Main YouTube API controller.
- **[loading-overlay.js](file:///Users/user/Desktop/new-yt/yt-clear/yt-player/loading-overlay.js)**: Player transition UI.
- **[csp-compliance.js](file:///Users/user/Desktop/new-yt/yt-clear/yt-player/csp-compliance.js)**: Security policy helper.
- **[ui-controller.js](file:///Users/user/Desktop/new-yt/yt-clear/player/ui-controller.js)**: Custom button and state management.

---

## 📂 /transaction-core
Financial logic and policy enforcement.

- **📂 /core/**: Ledger and Economic Rules logic.
- **📂 /policy-engine/**: Business logic validation.
- **📂 /policies/**: Specific rules for Likes, Games, and Stores.
- **📂 /persistence/**: Repositories for SQLite, Neon, and Balances.
- **📂 /offline-intents/**: Offline-first transaction syncing.

---

## 📂 /sound-b, /3way-switch-b, /touch-shield, /afra7
Specific UI and UX specialized components.

- **📂 /sound-b/**: Global prayer system and audio alerts.
- **📂 /3way-switch-b/**: Custom multi-state toggles.
- **📂 /touch-shield/**: Accidental interaction prevention logic.
- **📂 /afra7/**: Long-press playlist management and audio bridge.

---

## 📂 /data, /logs, /scripts, /tests
Persistence, debugging, and maintenance utilities.

- **📂 /data/**: Live SQLite databases and sync queues.
- **📂 /logs/**: err.log, out.log, and archival logs.
- **📂 /scripts/**: Migration and reconciliation scripts.
- **📂 /tests/**: E2E Playwright tests and unit test suites.
- **📂 /transaction-audit/**: Scripts for generating financial audit reports.
- **📂 /e7ki-debug/**: Specialized audit reports for the E7ki service.

---

## 📂 Project Hierarchy Tree
Below is the full visual representation of the project structure.


│   │   │       │   │   ├── typing-indicator.jsx
│   │   │       │   │   ├── voice-recorder.jsx
│   │   │       │   │   └── voice-recorder.jsx.bak
│   │   │       │   ├── theme-toggle.jsx
│   │   │       │   └── ui
│   │   │       │       ├── accordion.jsx
│   │   │       │       ├── alert-dialog.jsx
│   │   │       │       ├── alert.jsx
│   │   │       │       ├── aspect-ratio.jsx
│   │   │       │       ├── avatar.jsx
│   │   │       │       ├── badge.jsx
│   │   │       │       ├── breadcrumb.jsx
│   │   │       │       ├── button.jsx
│   │   │       │       ├── calendar.jsx
│   │   │       │       ├── card.jsx
│   │   │       │       ├── carousel.jsx
│   │   │       │       ├── chart.jsx
│   │   │       │       ├── checkbox.jsx
│   │   │       │       ├── collapsible.jsx
│   │   │       │       ├── command.jsx
│   │   │       │       ├── context-menu.jsx
│   │   │       │       ├── dialog.jsx
│   │   │       │       ├── drawer.jsx
│   │   │       │       ├── dropdown-menu.jsx
│   │   │       │       ├── form.jsx
│   │   │       │       ├── hover-card.jsx
│   │   │       │       ├── input-otp.jsx
│   │   │       │       ├── input.jsx
│   │   │       │       ├── label.jsx
│   │   │       │       ├── menubar.jsx
│   │   │       │       ├── navigation-menu.jsx
│   │   │       │       ├── pagination.jsx
│   │   │       │       ├── popover.jsx
│   │   │       │       ├── progress.jsx
│   │   │       │       ├── radio-group.jsx
│   │   │       │       ├── resizable.jsx
│   │   │       │       ├── scroll-area.jsx
│   │   │       │       ├── select.jsx
│   │   │       │       ├── separator.jsx
│   │   │       │       ├── sheet.jsx
│   │   │       │       ├── sidebar.jsx
│   │   │       │       ├── skeleton.jsx
│   │   │       │       ├── slider.jsx
│   │   │       │       ├── switch.jsx
│   │   │       │       ├── table.jsx
│   │   │       │       ├── tabs.jsx
│   │   │       │       ├── textarea.jsx
│   │   │       │       ├── toast.jsx
│   │   │       │       ├── toaster.jsx
│   │   │       │       ├── toggle-group.jsx
│   │   │       │       ├── toggle.jsx
│   │   │       │       └── tooltip.jsx
│   │   │       ├── hooks
│   │   │       │   ├── use-mobile.jsx
│   │   │       │   └── use-toast.js
│   │   │       ├── index.css
│   │   │       ├── lib
│   │   │       │   ├── auth-context.jsx
│   │   │       │   ├── chat-context.jsx
│   │   │       │   ├── indexeddb-cleaner.js
│   │   │       │   ├── indexeddb.js
│   │   │       │   ├── queryClient.js
│   │   │       │   ├── theme-provider.jsx
│   │   │       │   ├── utils.js
│   │   │       │   └── websocket-context.jsx
│   │   │       ├── main.jsx
│   │   │       └── pages
│   │   │           ├── chat.jsx
│   │   │           ├── login.jsx
│   │   │           └── not-found.jsx
│   │   ├── components.json
│   │   ├── design_guidelines.md
│   │   ├── dist
│   │   │   ├── assets
│   │   │   │   ├── index-C9RO4hM2.js
│   │   │   │   └── index-QfHQSeTL.css
│   │   │   ├── favicon.png
│   │   │   └── index.html
│   │   ├── docs
│   │   │   └── file-upload-volatility.md
│   │   ├── drizzle.config.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── replit.md
│   │   ├── script
│   │   │   └── build.js
│   │   ├── server
│   │   │   ├── auth-middleware.cjs
│   │   │   ├── database.cjs
│   │   │   ├── fileUpload.cjs
│   │   │   ├── index.cjs
│   │   │   ├── routes.js
│   │   │   ├── static.js
│   │   │   ├── storage.js
│   │   │   └── vite.js
│   │   ├── shared
│   │   │   └── schema.js
│   │   ├── tailwind.config.js
│   │   ├── test-voice.html
│   │   ├── tsconfig.json
│   │   └── vite.config.js
│   ├── e7ki.html
│   ├── eb3at.html
│   ├── farragna
│   │   ├── REAL_GUEST_UPLOAD_MODE_IMPLEMENTATION.md
│   │   ├── UPLOAD_MODAL_LAYOUT_FIXES.md
│   │   ├── app.js
│   │   ├── attached_assets
│   │   │   ├── App_1765232987761.jsx
│   │   │   ├── Comments_1765232931079.jsx
│   │   │   ├── Pasted--Replit-Farragna-TypeScript-React--1765233125945_1765233125947.txt
│   │   │   ├── Pasted--TypeScript-React-YouTube-Upload-src-components-farragn_1765233337941.txt
│   │   │   ├── ShareMenu_1765232931085.jsx
│   │   │   ├── Stories_1765232931086.jsx
│   │   │   ├── admin-dashboard_1765232931055.jsx
│   │   │   ├── build_1765233054332.js
│   │   │   ├── category-grid_1765232931076.jsx
│   │   │   ├── engagement-buttons_1765232931080.jsx
│   │   │   ├── favorites-modal_1765232931081.jsx
│   │   │   ├── header_1765232931083.jsx
│   │   │   ├── index_1765232987772.css
│   │   │   ├── main_1765232987773.jsx
│   │   │   ├── theme-provider_1765232931087.jsx
│   │   │   ├── theme-toggle_1765232931088.jsx
│   │   │   ├── upload-modal_1765232959867.jsx
│   │   │   ├── video-feed_1765232959876.jsx
│   │   │   ├── video-player_1765232959878.jsx
│   │   │   └── watermark_1765232959882.jsx
│   │   ├── client
│   │   │   ├── index.html
│   │   │   ├── public
│   │   │   │   └── favicon.png
│   │   │   └── src
│   │   │       ├── App.jsx
│   │   │       ├── components
│   │   │       │   ├── admin-dashboard.jsx
│   │   │       │   ├── category-grid.jsx
│   │   │       │   ├── engagement-buttons.jsx
│   │   │       │   ├── favorites-modal.jsx
│   │   │       │   ├── header.jsx
│   │   │       │   ├── theme-provider.jsx
│   │   │       │   ├── theme-toggle.jsx
│   │   │       │   ├── ui
│   │   │       │   │   ├── accordion.jsx
│   │   │       │   │   ├── alert-dialog.jsx
│   │   │       │   │   ├── alert.jsx
│   │   │       │   │   ├── aspect-ratio.jsx
│   │   │       │   │   ├── avatar.jsx
│   │   │       │   │   ├── badge.jsx
│   │   │       │   │   ├── breadcrumb.jsx
│   │   │       │   │   ├── button.jsx
│   │   │       │   │   ├── calendar.jsx
│   │   │       │   │   ├── card.jsx
│   │   │       │   │   ├── carousel.jsx
│   │   │       │   │   ├── chart.jsx
│   │   │       │   │   ├── checkbox.jsx
│   │   │       │   │   ├── collapsible.jsx
│   │   │       │   │   ├── command.jsx
│   │   │       │   │   ├── context-menu.jsx
│   │   │       │   │   ├── dialog.jsx
│   │   │       │   │   ├── drawer.jsx
│   │   │       │   │   ├── dropdown-menu.jsx
│   │   │       │   │   ├── form.jsx
│   │   │       │   │   ├── hover-card.jsx
│   │   │       │   │   ├── input-otp.jsx
│   │   │       │   │   ├── input.jsx
│   │   │       │   │   ├── label.jsx
│   │   │       │   │   ├── menubar.jsx
│   │   │       │   │   ├── navigation-menu.jsx
│   │   │       │   │   ├── pagination.jsx
│   │   │       │   │   ├── popover.jsx
│   │   │       │   │   ├── progress.jsx
│   │   │       │   │   ├── radio-group.jsx
│   │   │       │   │   ├── resizable.jsx
│   │   │       │   │   ├── scroll-area.jsx
│   │   │       │   │   ├── select.jsx
│   │   │       │   │   ├── separator.jsx
│   │   │       │   │   ├── sheet.jsx
│   │   │       │   │   ├── sidebar.jsx
│   │   │       │   │   ├── skeleton.jsx
│   │   │       │   │   ├── slider.jsx
│   │   │       │   │   ├── switch.jsx
│   │   │       │   │   ├── table.jsx
│   │   │       │   │   ├── tabs.jsx
│   │   │       │   │   ├── textarea.jsx
│   │   │       │   │   ├── toast.jsx
│   │   │       │   │   ├── toaster.jsx
│   │   │       │   │   ├── toggle-group.jsx
│   │   │       │   │   ├── toggle.jsx
│   │   │       │   │   └── tooltip.jsx
│   │   │       │   ├── upload-modal.jsx
│   │   │       │   ├── video-feed.jsx
│   │   │       │   ├── video-player.jsx
│   │   │       │   └── watermark.jsx
│   │   │       ├── hooks
│   │   │       │   ├── use-mobile.jsx
│   │   │       │   ├── use-toast.js
│   │   │       │   └── useAuth.js
│   │   │       ├── index.css
│   │   │       ├── lib
│   │   │       │   ├── authUtils.js
│   │   │       │   ├── queryClient.js
│   │   │       │   └── utils.js
│   │   │       ├── main.jsx
│   │   │       └── pages
│   │   │           ├── home.jsx
│   │   │           ├── landing.jsx
│   │   │           └── not-found.jsx
│   │   ├── components.json
│   │   ├── design_guidelines.md
│   │   ├── drizzle.config.js
│   │   ├── iframe-compatibility.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── script
│   │   │   └── build.js
│   │   ├── seed-videos.js
│   │   ├── server
│   │   │   ├── cloudflare-stream.js
│   │   │   ├── config.js
│   │   │   ├── db.js
│   │   │   ├── index.js
│   │   │   ├── piccarboon
│   │   │   ├── recommendation-service.js
│   │   │   ├── routes.js
│   │   │   ├── static.js
│   │   │   ├── storage.js
│   │   │   └── vite.js
│   │   ├── shared
│   │   │   └── schema.js
│   │   ├── styles.css
│   │   ├── tailwind.config.js
│   │   ├── test-farragna.html
│   │   ├── test-upload.mp4
│   │   ├── test-video.mp4
│   │   ├── test.mp4
│   │   ├── todo-list.md
│   │   ├── tsconfig.json
│   │   ├── uploads
│   │   │   ├── 1765812414355-u5h33x2cn4.mp4
│   │   │   ├── 1765812467152-fmzcbmekx6t.mp4
│   │   │   ├── video-1765234904544-901687121.mp4
│   │   │   ├── video-1765791714933-807403040.mp4
│   │   │   ├── video-1765792359939-854122369.mp4
│   │   │   ├── video-1765792390833-873541569.mp4
│   │   │   ├── video-1765800712205-178434629.mp4
│   │   │   ├── video-1765801904700-322950557.mp4
│   │   │   ├── video-1765802133757-297674084.mp4
│   │   │   ├── video-1765805220474-496236131.mp4
│   │   │   ├── video-1765807964778-197885180.mp4
│   │   │   └── video-1765808859186-743370051.mp4
│   │   └── vite.config.js
│   ├── farragna.html
│   ├── ffmpeg
│   │   ├── README.md
│   │   ├── ffmpeg-core.js
│   │   ├── ffmpeg-loader.js
│   │   └── ffmpeg.min.js
│   ├── index.html
│   ├── indexCB-styles.css
│   ├── indexCB.html
│   ├── js
│   │   ├── Counter.js
│   │   ├── advanced-cache-layer.js
│   │   ├── advanced-error-handler.js
│   │   ├── api-integration-framework.js
│   │   ├── app-core.js
│   │   ├── app-launcher.js
│   │   ├── app-registry.js
│   │   ├── app.js
│   │   ├── asset-manager.js
│   │   ├── assetSafeRenderer.js
│   │   ├── balloon-engine-advanced.js
│   │   ├── balloon-ui.js
│   │   ├── balloon-visual-standalone.js
│   │   ├── banking-processor.js
│   │   ├── batch-storage-update.js
│   │   ├── blockchain-integration.js
│   │   ├── buttons.js
│   │   ├── camera-verification.js
│   │   ├── clerk-config.js
│   │   ├── cloudinary-config-client.js
│   │   ├── counter-test.html
│   │   ├── e7ky-chat.js
│   │   ├── email-transfer-manager.js
│   │   ├── extra-mode.js
│   │   ├── farragna
│   │   │   ├── app.js
│   │   │   ├── components
│   │   │   ├── services
│   │   │   └── utils
│   │   ├── floating-app.js
│   │   ├── gate-system.js
│   │   ├── gsap-shim.js
│   │   ├── guardian-3d.js
│   │   ├── health-check.js
│   │   ├── index.js
│   │   ├── matter-shim.js
│   │   ├── notification-manager.js
│   │   ├── payment-gateway.js
│   │   ├── pebalaash-engine.js
│   │   ├── performance-monitor.js
│   │   ├── prayer-alert-system.js
│   │   ├── prayer-system.js
│   │   ├── premium-integration.js
│   │   ├── premium-manager.js
│   │   ├── safe-asset-list.js
│   │   ├── safe-code-bridge.js
│   │   ├── safe-code-manager.js
│   │   ├── safe-code.js
│   │   ├── safe-list-actions.js
│   │   ├── safe-storage.js
│   │   ├── security-manager.js
│   │   ├── service-manager.js
│   │   ├── settings-manager.js
│   │   ├── simple-transfer-manager.js
│   │   ├── sync-test.js
│   │   ├── tab-manager.js
│   │   ├── transaction-monitor.js
│   │   ├── transaction-queue.js
│   │   ├── transaction-system.js
│   │   ├── transactions-ui.js
│   │   ├── transactions.js
│   │   ├── utils.js
│   │   ├── vanilla-shared-ui.js
│   │   ├── wallet.js
│   │   └── webhook-manager.js
│   ├── nostaglia
│   │   ├── nostaglia.css
│   │   └── nostaglia.js
│   ├── oneworld
│   │   ├── README.md
│   │   ├── app.js
│   │   ├── database-schema.sql
│   │   ├── index.html
│   │   └── styles.css
│   ├── optimized-styles.css
│   ├── pebalaash
│   │   ├── attached_assets
│   │   │   └── Pasted--Extensions-CREATE-EXTENSION-IF-NOT-EXISTS-uuid-ossp-CR_1766362620497.txt
│   │   ├── client
│   │   │   ├── index.html
│   │   │   ├── public
│   │   │   │   └── favicon.png
│   │   │   ├── requirements.md
│   │   │   └── src
│   │   │       ├── App.tsx
│   │   │       ├── components
│   │   │       │   ├── AdminDashboard.tsx
│   │   │       │   ├── CartPanel.tsx
│   │   │       │   ├── MarqueeSection.tsx
│   │   │       │   ├── iceOverlay.tsx
│   │   │       │   └── ui
│   │   │       │       ├── accordion.tsx
│   │   │       │       ├── alert-dialog.tsx
│   │   │       │       ├── alert.tsx
│   │   │       │       ├── aspect-ratio.tsx
│   │   │       │       ├── avatar.tsx
│   │   │       │       ├── badge.tsx
│   │   │       │       ├── breadcrumb.tsx
│   │   │       │       ├── button.tsx
│   │   │       │       ├── calendar.tsx
│   │   │       │       ├── card.tsx
│   │   │       │       ├── carousel.tsx
│   │   │       │       ├── chart.tsx
│   │   │       │       ├── checkbox.tsx
│   │   │       │       ├── collapsible.tsx
│   │   │       │       ├── command.tsx
│   │   │       │       ├── context-menu.tsx
│   │   │       │       ├── dialog.tsx
│   │   │       │       ├── drawer.tsx
│   │   │       │       ├── dropdown-menu.tsx
│   │   │       │       ├── form.tsx
│   │   │       │       ├── hover-card.tsx
│   │   │       │       ├── input-otp.tsx
│   │   │       │       ├── input.tsx
│   │   │       │       ├── label.tsx
│   │   │       │       ├── menubar.tsx
│   │   │       │       ├── navigation-menu.tsx
│   │   │       │       ├── pagination.tsx
│   │   │       │       ├── popover.tsx
│   │   │       │       ├── progress.tsx
│   │   │       │       ├── radio-group.tsx
│   │   │       │       ├── resizable.tsx
│   │   │       │       ├── scroll-area.tsx
│   │   │       │       ├── select.tsx
│   │   │       │       ├── separator.tsx
│   │   │       │       ├── sheet.tsx
│   │   │       │       ├── sidebar.tsx
│   │   │       │       ├── skeleton.tsx
│   │   │       │       ├── slider.tsx
│   │   │       │       ├── switch.tsx
│   │   │       │       ├── table.tsx
│   │   │       │       ├── tabs.tsx
│   │   │       │       ├── textarea.tsx
│   │   │       │       ├── toast.tsx
│   │   │       │       ├── toaster.tsx
│   │   │       │       ├── toggle-group.tsx
│   │   │       │       ├── toggle.tsx
│   │   │       │       └── tooltip.tsx
│   │   │       ├── hooks
│   │   │       │   ├── use-admin.ts
│   │   │       │   ├── use-auth.ts
│   │   │       │   ├── use-checkout.ts
│   │   │       │   ├── use-mobile.tsx
│   │   │       │   ├── use-products.ts
│   │   │       │   ├── use-toast.ts
│   │   │       │   └── use-wallet.ts
│   │   │       ├── index.css
│   │   │       ├── lib
│   │   │       │   ├── queryClient.ts
│   │   │       │   └── utils.ts
│   │   │       ├── main.tsx
│   │   │       ├── pages
│   │   │       │   ├── Home.tsx
│   │   │       │   ├── Pebalaash.tsx
│   │   │       │   └── not-found.tsx
│   │   │       └── types
│   │   │           └── shims.d.ts
│   │   ├── components.json
│   │   ├── dist
│   │   │   ├── index.cjs
│   │   │   └── public
│   │   │       ├── assets
│   │   │       │   ├── index-B5RbfeEf.css
│   │   │       │   └── index-B7Tze-62.js
│   │   │       ├── favicon.png
│   │   │       └── index.html
│   │   ├── drizzle.config.ts
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── script
│   │   │   └── build.ts
│   │   ├── server
│   │   │   ├── db.ts
│   │   │   ├── index.ts
│   │   │   ├── routes.ts
│   │   │   ├── static.ts
│   │   │   ├── storage.ts
│   │   │   └── vite.ts
│   │   ├── shared
│   │   │   ├── routes.ts
│   │   │   └── schema.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── pebalaash.html
│   ├── qarsan
│   │   ├── index.html
│   │   └── qarsan-schema.sql
│   ├── safecode
│   │   └── index.html
│   ├── safecode-wrapper.html
│   ├── safecode.html
│   ├── samma3ny
│   │   ├── AdminDashboard.js
│   │   ├── CRITICAL_ISSUES_RESOLUTION_REPORT.md
│   │   ├── CSS_OPTIMIZATIONS_COMPLETE.md
│   │   ├── DEBUGGING_SESSION_COMPLETE.md
│   │   ├── ENHANCED_CLOUDINARY_IMPLEMENTATION.md<
│   │   │   └── path
│   │   ├── ERROR_ANALYSIS.md
│   │   ├── FINAL_IMPLEMENTATION_REPORT.md
│   │   ├── FIXED_HEIGHT_SCROLLABLE_PLAYLIST_COMPLETE.md
│   │   ├── IMPLEMENTATION_VERIFICATION.md
│   │   ├── PLAYLIST_ALIGNMENT_COMPLETE.md
│   │   ├── PLAYLIST_BOTTOM_COVERAGE_FIXED.md
│   │   ├── PLAYLIST_CONSTRAINTS_AND_PROGRESS_BAR_FIX_COMPLETE.md
│   │   ├── PLAYLIST_HEIGHT_REFACTOR_COMPLETE.md
│   │   ├── PLAYLIST_SPACING_OPTIMIZED.md
│   │   ├── RECURRING_ISSUES_FIXED.md
│   │   ├── SHARE_FUNCTIONALITY_COMPLETE.md
│   │   ├── SONG_ITEM_HEIGHT_FIXED.md
│   │   ├── TRACK_TITLE_CENTERING_FIXED.md
│   │   ├── cloudinary-api.js
│   │   ├── cloudinary-config.js
│   │   ├── cloudinary-upload-results.json
│   │   ├── dr.dc.png
│   │   ├── favicon.ico
│   │   ├── firebase-config.js
│   │   ├── fixes.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── player.js
│   │   ├── songs.json
│   │   ├── src
│   │   │   └── admin
│   │   │       ├── AdminModal.js
│   │   │       ├── App.css
│   │   │       ├── App.js
│   │   │       ├── PasswordModal.js
│   │   │       ├── components
│   │   │       │   ├── BulkUpload.css
│   │   │       │   ├── BulkUpload.js
│   │   │       │   ├── ShareModal.css
│   │   │       │   ├── ShareModal.js
│   │   │       │   ├── SongList.css
│   │   │       │   └── SongList.js
│   │   │       └── index.js
│   │   ├── styles.css
│   │   ├── test-spark-fix.js
│   │   ├── test_audio.mp3
│   │   ├── test_real.mp3
│   │   └── uploads
│   │       └── local_1763976542883_test.txt
│   ├── samma3ny.html
│   ├── setta
│   │   ├── server
│   │   │   ├── index.js
│   │   │   ├── package-lock.json
│   │   │   ├── package.json
│   │   │   ├── piccarboon
│   │   │   │   ├── anticheat.js
│   │   │   │   ├── challenge.js
│   │   │   │   ├── difficulty.js
│   │   │   │   ├── economy.js
│   │   │   │   ├── governor.js
│   │   │   │   ├── identity.js
│   │   │   │   ├── ledger.js
│   │   │   │   ├── orchestrator.js
│   │   │   │   ├── season.js
│   │   │   │   ├── sponsors.js
│   │   │   │   └── tiers.js
│   │   │   └── uploads
│   │   │       ├── images
│   │   │       │   └── 1765824497893.jpeg
│   │   │       └── piccarboon
│   │   │           ├── 1765890854947.jpg
│   │   │           ├── challenges
│   │   │           │   └── test.jpg
│   │   │           ├── fraud
│   │   │           │   ├── 1765891841027-gwehalztach.json
│   │   │           │   ├── 1765891875833-4xk8ubwlyhg.json
│   │   │           │   ├── 1765891986350-repeqag0hvc.json
│   │   │           │   └── 1765893406530-hf8vtnzvs6l.json
│   │   │           ├── losers
│   │   │           │   ├── 1765891841027-gwehalztach.json
│   │   │           │   ├── 1765891875833-4xk8ubwlyhg.json
│   │   │           │   ├── 1765891986350-repeqag0hvc.json
│   │   │           │   └── 1765893406530-hf8vtnzvs6l.json
│   │   │           ├── models
│   │   │           ├── reference
│   │   │           ├── scores
│   │   │           │   └── leaderboard.json
│   │   │           ├── sponsor
│   │   │           ├── submissions
│   │   │           │   ├── 1765891841027-gwehalztach.json
│   │   │           │   ├── 1765891875833-4xk8ubwlyhg.json
│   │   │           │   ├── 1765891986350-repeqag0hvc.json
│   │   │           │   └── 1765893406530-hf8vtnzvs6l.json
│   │   │           └── winners
│   │   └── uploads
│   │       ├── images
│   │       └── piccarboon
│   │           ├── challenges
│   │           │   ├── daily.json
│   │           │   └── test.jpg
│   │           ├── fraud
│   │           │   └── 1765891120966-2kqk4toquz5.json
│   │           ├── losers
│   │           │   └── 1765891120966-2kqk4toquz5.json
│   │           ├── models
│   │           ├── reference
│   │           ├── scores
│   │           │   ├── 1765890854969-5lwb3xh950s.json
│   │           │   ├── leaderboard.json
│   │           │   └── setup-sample.json
│   │           ├── setup-sample.jpg
│   │           ├── sponsor
│   │           ├── submissions
│   │           │   ├── 1765890854969-5lwb3xh950s.json
│   │           │   └── 1765891120966-2kqk4toquz5.json
│   │           └── winners
│   │               └── 1765890854969-5lwb3xh950s.json
│   ├── shots
│   │   ├── README.md
│   │   ├── integration-example.html
│   │   ├── shots-db.js
│   │   ├── shots-init-test.js
│   │   ├── shots-integration.js
│   │   ├── shots.css
│   │   ├── shots.html
│   │   └── shots.js
│   ├── src
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── AssetsTab.jsx
│   │   │   ├── AuthenticationModal.css
│   │   │   ├── AuthenticationModal.jsx
│   │   │   ├── AuthenticationTest.css
│   │   │   ├── AuthenticationTest.jsx
│   │   │   ├── CodeGenerator.css
│   │   │   ├── CodeGenerator.jsx
│   │   │   ├── FarragnaPlayer.jsx
│   │   │   ├── FarragnaUpload.jsx
│   │   │   ├── GameLeaderboard.jsx
│   │   │   ├── LeaderboardTab.jsx
│   │   │   └── WealthLeaderboard.jsx
│   │   ├── core
│   │   │   ├── auth
│   │   │   └── database
│   │   ├── e7ki
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── nostaglia
│   │   │   ├── components
│   │   │   │   ├── AdminDashboard.css
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── Feed.css
│   │   │   │   ├── Feed.jsx
│   │   │   │   ├── Upload.css
│   │   │   │   └── Upload.jsx
│   │   │   └── sse.js
│   │   ├── tabs
│   │   │   ├── BankodeTab.jsx
│   │   │   ├── CorsaTab.jsx
│   │   │   ├── E7kiTab.jsx
│   │   │   ├── FarragnaTab.jsx
│   │   │   ├── NostagliaTab.jsx
│   │   │   ├── SettaXtes3a.css
│   │   │   ├── SettaXtes3a.jsx
│   │   │   └── index.jsx
│   │   ├── utils
│   │   │   ├── api.js
│   │   │   ├── authUtils.js
│   │   │   └── sse.js
│   │   └── wallet
│   │       ├── email-transfer-manager.js
│   │       ├── sync.js
│   │       └── wallet.js
│   ├── styles
│   │   ├── optimized-styles.css
│   │   └── styles.css
│   ├── styles.css
│   ├── tasks.md
│   ├── uploads
│   │   └── ec2b7342579903796b192b6291e977a2
│   ├── videos.json
│   └── vite.config.js
├── core
│   ├── ai-brain.js
│   ├── app-lifecycle.js
│   ├── assets
│   │   ├── asset-events.js
│   │   ├── asset-locker.js
│   │   ├── asset-readonly.js
│   │   ├── asset-transactions.js
│   │   ├── assets-kernel.js
│   │   └── local-assets-bus.js
│   ├── auth
│   │   ├── auth-events.js
│   │   ├── auth-middleware.js
│   │   ├── auth-service.js
│   │   └── session-store.js
│   ├── ledger
│   │   ├── ledger-schema.js
│   │   └── ledger-writer.js
│   ├── schema
│   │   └── setup-v2.js
│   └── self-healing.js
├── counter
│   └── yt-counter.js
├── counter-container
├── country-data-service.js
├── data
│   ├── database.sqlite
│   ├── database.sqlite-shm
│   ├── database.sqlite-wal
│   └── pending_codes_queue.json
├── data.sqlite
├── data.sqlite-shm
├── data.sqlite-wal
├── data.sqlite.bak.20260323_034303
├── data.sqlite.bak.20260323_042011
├── docs
│   └── asset-event-contract.md
├── e7ki-debug
│   ├── comprehensive-audit-report.md
│   ├── fix-authentication.js
│   ├── fix-database-api.js
│   ├── fix-validation-report.md
│   ├── fix-websocket.js
│   ├── monitoring-system.js
│   └── test-infrastructure.js
├── ecosystem.config.cjs
├── event-vault
│   └── logs
│       └── vault-2026-01-27.log
├── extra-mode-b
│   ├── watch-dog-action.js
│   ├── watch-dog.mp3
│   ├── watch-tracker.js
│   └── yt-extramode.js
├── file_list.txt
├── generate_report.sh
├── hybrid-otp-service.js
├── image.png
├── index.html
├── js
│   ├── section-switch-popup.js
│   └── service-manager.js
├── kimi-console-capture
│   ├── background.js
│   ├── content.js
│   ├── icons
│   │   ├── icon128.png
│   │   ├── icon16.png
│   │   └── icon48.png
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
├── layout-bootstrap.js
├── ledger
│   ├── ledger-schema.js
│   ├── ledger-utils.js
│   ├── local-assets-bus.js
│   └── local-transaction-ledger.js
├── login.html
├── logs
│   ├── err.log
│   └── out.log
├── main.js
├── out.log
├── output.log
├── package-lock.json
├── package.json
├── play-pause-b
│   ├── bankode-core.js
│   ├── bankode-core.js.backup
│   ├── code-engine.js
│   ├── play-pause-button.js
│   ├── screenshot-limit.js
│   ├── screenshot.js
│   ├── sqlite-idb-queue.js
│   ├── yt-play-pause-button.js
│   └── yt-screenshot.js
├── player
│   └── ui-controller.js
├── popup-identity
├── project-structure-summary.txt
├── project-structure-tree.txt
├── project-structure.txt
├── projectPhilosophy.md
├── routes
│   └── watchdog.js
├── screenshots
│   └── test-fix.png
├── scripts
│   ├── migrate-to-turso.sh
│   └── run-ledger-reconciliation.js
├── server
│   ├── battalooda-freemium-handler.js
│   └── battalooda-upload.js
├── server-simple.js
├── server.js
├── services
│   ├── balloon
│   │   ├── balloon.routes.js
│   │   └── balloon.service.js
│   ├── e7ki
│   │   ├── dist
│   │   │   ├── assets
│   │   │   │   ├── main-BRxBVNlp.js
│   │   │   │   └── main-C8SXo2St.css
│   │   │   ├── favicon.png
│   │   │   └── index.html
│   │   ├── index.html
│   │   └── styles.css
│   ├── farragna-video-feed.js
│   ├── transaction-engine.js
│   ├── trust-engine
│   │   ├── behavior-analyzer.js
│   │   ├── trust-engine.js
│   │   └── trust-score.store.js
│   ├── watchdog
│   │   └── watchdog.js
│   └── watchdog-ai.js
├── shared
│   ├── asset-policy.js
│   ├── asset-types.js
│   ├── auth-bridge.js
│   ├── auth-core.js
│   ├── auth-lord.js
│   ├── auth-proxy.js
│   ├── auth-ready-component.js
│   ├── authClient.js
│   ├── balloon-engine
│   │   ├── balloon-core.js
│   │   ├── balloon-spawner.js
│   │   ├── balloon-state.js
│   │   └── balloon-validator.js
│   ├── bankode-core.js
│   ├── code-engine.js
│   ├── codebank-side-panel.js
│   ├── engines
│   │   ├── games-engine.js
│   │   ├── likes-engine.js
│   │   ├── superlikes-engine.js
│   │   └── transaction-engine.js
│   ├── event-bus.js
│   ├── extra-mode-engine.js
│   ├── feature-flags.js
│   ├── guards
│   │   └── assets-write-guard.js
│   ├── iframe-auth-client.js
│   ├── initial-identity-modal.js
│   ├── js
│   │   ├── logger.js
│   │   ├── monitoring.js
│   │   ├── screenshot.js
│   │   └── translate.js
│   ├── jwt
│   │   ├── rotateRefresh.js
│   │   ├── signAccess.js
│   │   ├── signRefresh.js
│   │   ├── verifyAccess.js
│   │   └── verifyRefresh.js
│   ├── local-asset-bus.js
│   ├── logicode
│   │   ├── actions
│   │   ├── logic-auth.js
│   │   ├── logic-compression.js
│   │   ├── logic-core.js
│   │   ├── logic-debug.js
│   │   ├── logic-deduction.js
│   │   ├── logic-expiry.js
│   │   ├── logic-rewards.js
│   │   ├── logic-storage.js
│   │   ├── logic-sync.js
│   │   ├── logicode.js
│   │   └── modules
│   │       ├── logicode-auth.js
│   │       ├── logicode-events.js
│   │       ├── logicode-expiry.js
│   │       ├── logicode-rewards.js
│   │       ├── logicode-service-fees.js
│   │       ├── logicode-storage.js
│   │       ├── logicode-sync.js
│   │       ├── logicode-utils.js
│   │       └── logicode-wallet.js
│   ├── middleware
│   │   └── authGuard.js
│   ├── neon-wallet-adapter.js
│   ├── qarsan-core.js
│   ├── qarsan-engine.js
│   ├── security-middleware.js
│   ├── service-base.js
│   ├── service-loader.js
│   ├── service-manager-v3.js
│   ├── sqlite-adapter.js
│   ├── sqlite-idb-queue.js
│   ├── storage-adapter.js
│   ├── storage-lord-ui-adapter.js.DISABLED
│   ├── storage-lord.js.DISABLED
│   ├── system-state.js
│   ├── timer-manager.js
│   ├── translate.js
│   ├── ui-state-authority.js
│   ├── utils
│   │   ├── anti-duplicate-events.js
│   │   └── cookie.js
│   ├── watch-dog-guardian.js
│   └── watchdog-core
│       ├── dog-3d-model.glb
│       ├── watchdog-animator.js
│       ├── watchdog-core.js
│       ├── watchdog-scene.js
│       └── watchdog-states.js
├── sound-b
│   ├── azan-clock.js
│   ├── azan1.mp3
│   ├── azan10.mp3
│   ├── azan11.mp3
│   ├── azan2.mp3
│   ├── azan3.mp3
│   ├── azan4.mp3
│   ├── azan5.mp3
│   ├── azan6.mp3
│   ├── azan7.mp3
│   ├── azan8.mp3
│   ├── azan9.mp3
│   ├── global-prayer-communication.js
│   ├── global-prayer-dashboard.html
│   ├── global-prayer-debug.js
│   ├── global-prayer-service-worker.js
│   ├── global-prayer-system.js
│   ├── persistent-prayer-in.html
│   ├── prayer-alert-system.js
│   ├── prayer-integration.js
│   ├── sound-button.js
│   └── yt-sound-button.js
├── sqlite
│   ├── sqlite
│   │   └── sqlite-server-adapter.js
│   └── sqlite-server-adapter.js
├── src
│   ├── App.jsx
│   ├── admin
│   │   └── admin-dashboard.js
│   ├── api
│   │   └── external-api.js
│   ├── components
│   │   └── app-grid.js
│   ├── core
│   │   ├── assetbus-v2.js
│   │   ├── database-manager.js
│   │   ├── service-manager-v2.js
│   │   └── watch-dog-optimized.js
│   ├── index.css
│   ├── main.jsx
│   ├── services
│   ├── styles
│   │   └── performance-optimizations.css
│   └── utils
│       └── performance-monitor.js
├── styles
│   ├── section-switch-popup.css
│   ├── style.css
│   ├── styles.css
│   ├── toggle-switch-3way.css
│   └── youtube-embed-responsive.css
├── test-auth-system.html
├── tests
│   ├── auth-core-fixed.js
│   ├── e2e-sqlite-assetbus.spec.js
│   ├── reports
│   │   └── assetbus-e2e-report.json
│   ├── safe-asset-list-fixed.js
│   └── send-codes.spec.js
├── touch-shield
│   └── global-touch-shield.js
├── transaction-audit
│   ├── auditTransactions.js
│   ├── dbMock.js
│   └── generateReport.js
├── transaction-core
│   ├── core
│   │   ├── BankodeManager.js
│   │   ├── EconomicRules.js
│   │   ├── Ledger.js
│   │   ├── TransactionManager.js
│   │   └── UsersManager.js
│   ├── event-vault
│   │   ├── EventVault.js
│   │   ├── README.md
│   │   ├── VaultConfig.js
│   │   ├── VaultSerializer.js
│   │   └── VaultWriter.js
│   ├── index.js
│   ├── modules
│   │   ├── BankodeToUser.js
│   │   ├── RewardsFlow.js
│   │   ├── UserToBankode.js
│   │   └── UserToUser.js
│   ├── offline-intents
│   │   ├── IntentQueue.js
│   │   ├── IntentSerializer.js
│   │   ├── IntentTypes.js
│   │   └── ReplayEngine.js
│   ├── persistence
│   │   ├── BalancesRepository.js
│   │   ├── BankodeRepository.js
│   │   ├── BaseRepository.js
│   │   ├── EventVaultRepository.js
│   │   ├── LedgerRepository.js
│   │   ├── NeonClient.js
│   │   ├── SQLiteClient.js
│   │   └── UsersRepository.js
│   ├── policies
│   │   ├── BasePolicy.js
│   │   ├── CreatorIncentivePolicy.js
│   │   ├── GameRewardPolicy.js
│   │   ├── LikePolicy.js
│   │   └── StorePolicy.js
│   └── policy-engine
│       └── PolicyEngine.js
├── ui
│   └── asset-dashboard.js
├── update-ui-controller.py
├── uploads
│   └── e7ki
├── vite.config.js
├── yt-new-clear.html
├── yt-new.runtime.js
├── yt-player
│   ├── api.js
│   ├── app-initializer.js
│   ├── app.js
│   ├── components.js
│   ├── csp-compliance.js
│   ├── index.js
│   ├── loading-overlay.js
│   ├── mediaService.js
│   ├── player-state-handler.js
│   ├── youtube-api-manager.js
│   ├── youtube-channel.html
│   ├── youtube-embed-responsive.css
│   ├── yt-bootstrap.js
│   ├── yt-player.init.js
│   └── yt-player.js
└── ytclear-dump.sql

582 directories, 3323 files
