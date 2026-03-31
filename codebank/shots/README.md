# 📸 Shots! Tab Implementation

A complete screenshot capture and gallery system for CodeBank, featuring IndexedDB storage, auto-cleanup, and play-pause button integration.

## 🎯 Features

- **Screenshot Capture**: Tap play-pause button to capture full-page screenshots
- **Gallery View**: Long-press play-pause button to view all screenshots
- **IndexedDB Storage**: All screenshots stored locally in browser's IndexedDB
- **Auto Cleanup**: Automatically deletes screenshots older than 30 days
- **Rich Gallery**: View, download, delete, and share screenshots
- **Export Functionality**: Export all screenshots as HTML gallery
- **Mobile Responsive**: Fully responsive design with touch-friendly controls

## 📁 File Structure

```
services/codebank/shots/
├── shots.html           # Main tab interface
├── shots.css            # Styling for the tab
├── shots.js             # Core functionality
├── shots-db.js          # IndexedDB utilities
├── shots-integration.js # Play-pause button integration
└── README.md           # This file
```

## 🏗️ Architecture

### Core Components

1. **ShotsDB Class** (`shots-db.js`)
   - Handles all IndexedDB operations
   - Stores screenshots with timestamps
   - Manages auto-cleanup of expired shots
   - Provides CRUD operations

2. **ShotsTab Class** (`shots.js`)
   - Main tab interface controller
   - Manages gallery display and interactions
   - Handles modal viewers and actions
   - Provides export functionality

3. **ShotsIntegration Class** (`shots-integration.js`)
   - Bridges play-pause buttons with screenshot capture
   - Manages tap vs long-press detection
   - Shows inline gallery modals
   - Provides capture animations

## 🔧 Integration Guide

### 1. Including in HTML

Add these scripts to your page (order matters):

```html
<!-- Required dependency -->
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>

<!-- Shots system -->
<script src="services/codebank/shots/shots-db.js"></script>
<script src="services/codebank/shots/shots-integration.js"></script>
```

### 2. Play-Pause Button Integration

Add data attribute to play-pause buttons:

```html
<button data-play-pause id="my-play-pause-btn">⏯️</button>
```

Or trigger capture manually:

```javascript
// Capture screenshot on tap
window.captureShotOnTap();

// Show gallery on long-press
window.showShotsGallery();
```

### 3. Tab Integration

Include the Shots tab in your navigation:

```html
<a href="services/codebank/shots/shots.html" class="tab-link">📸 Shots!</a>
```

Or embed directly:

```html
<iframe src="services/codebank/shots/shots.html" width="100%" height="100%"></iframe>
```

## 🎮 Usage

### For Users

1. **Capture Screenshot**: Tap any play-pause button to capture a screenshot
2. **View Gallery**: Long-press any play-pause button to see all screenshots
3. **Manage Shots**: Open the Shots! tab to view, download, delete, or export

### For Developers

#### Capture Screenshot Programmatically

```javascript
// Using the global function
const success = await window.captureShotOnTap();

// Using the integration class
const integration = window.shotsIntegration;
await integration.captureShotOnTap();
```

#### Show Gallery Programmatically

```javascript
// Using the global function
window.showShotsGallery();

// Using the integration class
const integration = window.shotsIntegration;
await integration.showShotsGallery();
```

#### Access IndexedDB Directly

```javascript
// Initialize database
await window.shotsDB.init();

// Save screenshot
const screenshot = await window.shotsDB.saveScreenshot(dataUrl);

// Get all screenshots
const screenshots = await window.shotsDB.getAllScreenshots();

// Delete specific screenshot
await window.shotsDB.deleteScreenshot(screenshotId);

// Clean up expired screenshots
const deletedIds = await window.shotsDB.deleteExpiredScreenshots();
```

## 🔒 Data Schema

### IndexedDB Structure

**Database Name**: `ShotsDB`  
**Store Name**: `shotsStore`  
**KeyPath**: `id`

### Screenshot Object Structure

```javascript
{
    id: "uuid-string",           // Unique identifier
    timestamp: 1234567890123,    // Unix timestamp in milliseconds
    dataUrl: "data:image/png;base64,iVBORw0KGgo..." // Base64 encoded image
}
```

## 🧹 Auto Cleanup

The system automatically cleans up screenshots older than 30 days:

- Triggered on app startup
- Also triggered when loading the Shots tab
- Uses IndexedDB indexes for efficient cleanup
- Logs cleanup activity to console

## 📱 Responsive Design

The interface adapts to different screen sizes:

- **Desktop**: Multi-column grid layout
- **Tablet**: Adjustable grid with touch-friendly controls
- **Mobile**: Single column with optimized button sizes

## 🎨 Styling

The Shots! tab uses a modern gradient design with:

- Glass morphism effects
- Smooth animations and transitions
- Dark theme with colorful accents
- Accessible color contrast
- Touch-friendly button sizes

## 🔐 Privacy & Security

- **Local Storage Only**: All data stays in the user's browser
- **No Server Upload**: Screenshots are never sent to external servers
- **IndexedDB Isolation**: Each browser profile has separate storage
- **No Authentication Required**: Works without user accounts

## 🚀 Performance

- **Lazy Loading**: Images load as needed
- **Efficient Storage**: Optimized data structures
- **Background Cleanup**: Non-blocking auto-cleanup
- **Memory Management**: Proper cleanup of modal elements

## 🐛 Troubleshooting

### Common Issues

1. **html2canvas not loading**
   - Ensure the CDN script is included before Shots scripts
   - Check browser console for network errors

2. **Screenshots not saving**
   - Verify IndexedDB is supported in the browser
   - Check for quota exceeded errors
   - Ensure `window.shotsDB` is available

3. **Integration not working**
   - Confirm `shots-integration.js` is loaded
   - Check that play-pause buttons have `data-play-pause` attribute
   - Verify no JavaScript errors in console

### Debug Mode

Enable debug logging:

```javascript
window.shotsIntegration.debug = true;
```

## 🔄 API Reference

### Global Functions

- `window.captureShotOnTap()` - Capture screenshot on button tap
- `window.showShotsGallery()` - Show gallery modal on long-press
- `window.shotsDB` - Access to ShotsDB instance
- `window.shotsTab` - Access to ShotsTab instance
- `window.shotsIntegration` - Access to ShotsIntegration instance

### Events

- `shots-updated` - Fired when new screenshots are added
- `play-pause-tap` - Custom event for tap detection
- `play-pause-longpress` - Custom event for long-press detection

## 📈 Future Enhancements

Potential improvements for future versions:

- Image editing tools (crop, annotate)
- Cloud sync options (user opt-in)
- Video screenshot support
- Screenshot categories/tags
- Batch operations
- Search functionality
- Compression options
- Watermark support

## 🤝 Contributing

When extending this system:

1. **Maintain Privacy**: Never send data to external servers without explicit user consent
2. **Follow Patterns**: Use existing class structures and naming conventions
3. **Test Thoroughly**: Test on multiple browsers and devices
4. **Document Changes**: Update this README for new features
5. **Respect Limits**: Consider storage quotas and performance impacts

---

**Built with ❤️ for CodeBank - Local, Private, Powerful**