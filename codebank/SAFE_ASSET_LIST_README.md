# Unified Safe Asset List Renderer

## 🎯 Overview

The Unified Safe Asset List is a single component that renders all asset types (Codes, Silver Bars, Gold Bars) with a clean, architecture-driven approach. The source changes based on `ACTIVE_ASSET_TAB`, and `AssetBus` is the single source of truth.

## 🧠 Architecture

### Core Principles

1. **Single Source of Truth**: `AssetBus.snapshot()` provides all data
2. **Event-Driven**: UI reacts to `assets:updated` events
3. **No Duplication**: One renderer for all asset types
4. **Tab-Based**: `ACTIVE_ASSET_TAB` determines which asset type to display

### Data Structure

```javascript
// AssetBus snapshot structure
{
  counts: {
    normal: Number,  // codes count
    silver: Number,  // silver bars count
    gold: Number     // gold bars count
  },
  series: {
    normal: Array,   // codes array
    silver: Array,   // silver bars array
    gold: Array      // gold bars array
  },
  last: {
    normal: String|null,  // last code
    silver: String|null,  // last silver bar
    gold: String|null     // last gold bar
  }
}
```

## 📦 Files

- **`codebank/js/safe-asset-list.js`** - Main renderer component
- **`codebank/css/safe-asset-list.css`** - Styles for all asset types
- **`codebank/safe-asset-list-demo.html`** - Demo page

## 🚀 Usage

### 1. Include the Files

```html
<!-- Load AssetBus first -->
<script type="module">
  import { AssetBus } from '../shared/local-asset-bus.js';
  window.AssetBus = AssetBus;
</script>

<!-- Load Safe Asset List -->
<script src="codebank/js/safe-asset-list.js"></script>

<!-- Load Styles -->
<link rel="stylesheet" href="codebank/css/safe-asset-list.css">
```

### 2. HTML Structure

```html
<div class="safe-panel">
  <div class="safe-header">
    <div class="safe-title-group">
      <h2 id="safe-title">Safe Codes</h2>
      <div class="safe-info">
        <span>Count: <strong id="safe-count">0</strong></span>
        <span>Last: <strong id="safe-last">—</strong></span>
      </div>
    </div>
  </div>

  <div class="safe-tabs">
    <button class="safe-tab-button active" data-tab="codes">Codes</button>
    <button class="safe-tab-button" data-tab="silver">Silver</button>
    <button class="safe-tab-button" data-tab="gold">Gold</button>
  </div>

  <div id="safe-list">
    <!-- Asset items will be rendered here -->
  </div>
</div>
```

### 3. Required DOM Elements

The renderer expects these elements to exist:

- `#safe-title` - Displays the current asset type title
- `#safe-count` - Displays the count of current asset type
- `#safe-last` - Displays the last added asset
- `#safe-list` - Container for asset items
- `.safe-tab-button` - Tab buttons with `data-tab` attribute

## 🎨 Styling

### Asset Type Classes

Each asset type has its own CSS class:

- `.safe-codes` - Normal codes (gray theme)
- `.safe-silver` - Silver bars (silver theme)
- `.safe-gold` - Gold bars (gold theme)

### Customization

You can customize the appearance by modifying the CSS:

```css
/* Change codes color */
.safe-codes {
  color: #eaeaea;
  border-left: 4px solid #64748b;
}

/* Change silver color */
.safe-silver {
  color: #cfd8dc;
  border-left: 4px solid #b0bec5;
}

/* Change gold color */
.safe-gold {
  color: #ffd700;
  border-left: 4px solid #ffb300;
}
```

## 🔧 API

### Global Functions

#### `window.switchAssetTab(tab)`

Switch to a different asset tab.

```javascript
window.switchAssetTab('codes');   // Show codes
window.switchAssetTab('silver');  // Show silver bars
window.switchAssetTab('gold');    // Show gold bars
```

#### `window.SafeAssetList.render(tab)`

Manually render a specific tab.

```javascript
window.SafeAssetList.render('codes');
```

#### `window.SafeAssetList.getCurrentTab()`

Get the currently active tab.

```javascript
const currentTab = window.SafeAssetList.getCurrentTab();
console.log(currentTab); // 'codes', 'silver', or 'gold'
```

### Global State

#### `window.ACTIVE_ASSET_TAB`

The currently active asset tab. Can be set before initialization.

```javascript
window.ACTIVE_ASSET_TAB = 'silver';
```

## 🔄 Event Handling

### assets:updated

The renderer automatically listens for `assets:updated` events and re-renders the current tab.

```javascript
// This will trigger a re-render
window.dispatchEvent(new CustomEvent('assets:updated', { detail: state }));
```

### Tab Switching

Tab buttons automatically trigger tab switching when clicked. The renderer handles this internally.

## 🛡️ Security & Best Practices

### ✅ DO

- Use `AssetBus.snapshot()` as the single source of truth
- Listen to `assets:updated` events for updates
- Use `window.switchAssetTab()` for tab switching
- Keep the renderer stateless (no internal state)

### ❌ DON'T

- Don't check `code.startsWith('SLVR')` or similar patterns
- Don't check `ExtraMode.isActive()` in the renderer
- Don't create separate renderers for each asset type
- Don't duplicate logic across asset types

## 🧪 Testing

### Demo Page

Open `codebank/safe-asset-list-demo.html` in your browser to test the component.

### Manual Testing

```javascript
// Add a code
const code = 'CODE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
window.AssetBus.addAsset('normal', code);

// Add a silver bar
const silver = 'SLVR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
window.AssetBus.addAsset('silver', silver);

// Add a gold bar
const gold = 'GOLD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
window.AssetBus.addAsset('gold', gold);

// Switch tabs
window.switchAssetTab('silver');
```

## 📊 Migration Guide

### From Old Implementation

If you're migrating from the old implementation:

1. **Remove old renderers**: Delete `renderCodes()`, `renderSilver()`, `renderGold()`
2. **Remove old listeners**: Remove BroadcastChannel listeners
3. **Update HTML**: Ensure required DOM elements exist
4. **Include new files**: Add `` and `safe-asset-list.css`
5. **Update tab switching**: Use `window.switchAssetTab()` instead of custom logic

### Example Migration

**Before:**
```javascript
function renderCodes() {
  const list = codesCache;
  const container = document.getElementById('codes-list');
  container.innerHTML = '';
  list.forEach(code => {
    const item = document.createElement('div');
    item.className = 'code-item';
    item.textContent = code;
    container.appendChild(item);
  });
}

function renderSilver() {
  const list = silverCache;
  const container = document.getElementById('silver-list');
  container.innerHTML = '';
  list.forEach(code => {
    const item = document.createElement('div');
    item.className = 'silver-item';
    item.textContent = code;
    container.appendChild(item);
  });
}
```

**After:**
```javascript
// Just use the unified renderer
window.SafeAssetList.render('codes');
window.SafeAssetList.render('silver');
```

## 🔮 Future Extensions

The unified architecture makes it easy to add new asset types:

1. Add the new asset type to `TAB_MAP` and `TITLE_MAP`
2. Add CSS styles for the new asset type
3. Add a tab button with the appropriate `data-tab` attribute
4. No changes needed to the renderer logic!

Example for Platinum:

```javascript
// In safe-asset-list.js
const TAB_MAP = {
  'codes': 'normal',
  'silver': 'silver',
  'gold': 'gold',
  'platinum': 'platinum'  // New!
};

const TITLE_MAP = {
  'codes': 'Safe Codes',
  'silver': 'Silver Bars',
  'gold': 'Gold Bars',
  'platinum': 'Platinum Bars'  // New!
};
```

```css
/* In safe-asset-list.css */
.safe-platinum {
  color: #e5e4e2;
  border-left: 4px solid #d4d4d4;
}
```

```html
<!-- In HTML -->
<button class="safe-tab-button" data-tab="platinum">Platinum</button>
```

## 📝 Summary

The Unified Safe Asset List provides:

✅ No duplication
✅ No special cases
✅ Extra Mode doesn't know anything about UI
✅ AssetBus = single source of truth
✅ UI reacts only on events
✅ Easy to extend for new asset types

## 🤝 Contributing

When adding new features:

1. Keep the renderer stateless
2. Use AssetBus as the single source of truth
3. Don't add asset-specific logic to the renderer
4. Use CSS for visual differences between asset types
5. Test with all asset types

## 📄 License

This component is part of the CodeBank project.
