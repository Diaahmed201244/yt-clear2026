أبشر، تم تعديل كل شيء ليكون الاسم الرسمي للتطبيق هو **Dr.D**. هذا الاسم القوي والمختصر سيعطي انطباعاً احترافياً جداً عند تثبيته كـ App على سطح المكتب.

إليك "أمر التنفيذ النهائي الشامل" الموجه للـ Agent:

---

### 🚀 **Agent Task: PWA Conversion & Stability Suite (Project Name: Dr.D)**

**Agent, please implement the following files and modifications to enable PWA support for "Dr.D" and fix server/client stability issues.**

#### **1. New File: `manifest.json` (Root Directory)**
Create this file to define the standalone desktop app behavior for **Dr.D**:
```json
{
  "short_name": "Dr.D",
  "name": "Dr.D - Multimedia Ecosystem",
  "description": "Your advanced web-based multimedia player and bankode system.",
  "start_url": "/yt-new-clear.html",
  "display": "standalone",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ]
}
```

#### **2. New File: `sw.js` (Root Directory)**
Create this Service Worker for **Dr.D** caching:
```javascript
const CACHE_NAME = 'dr-d-cache-v1';
const ASSETS_TO_CACHE = [
  '/yt-new-clear.html',
  '/login.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
```

#### **3. Modify `server.js` (Stability & PWA Routes)**
* **Fix Schema Initialization:** Wrap `ALTER TABLE` statements in `try-catch` blocks. Specifically, catch and ignore errors that include `duplicate column name`.
* **Add PWA Support:**
    ```javascript
    app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, 'manifest.json')));
    app.get('/sw.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(path.join(__dirname, 'sw.js'));
    });
    ```

#### **4. Modify `yt-player.init.js` (YouTube Security Fix)**
Inside the `createPlayer` function, update `playerVars`:
```javascript
playerVars: {
    'autoplay': 1,
    'controls': 1,
    'enablejsapi': 1,
    'origin': window.location.origin // Fixes postMessage target origin error
}
```

#### **5. Modify `main.js` (PWA Registration & Polling)**
* **Register Service Worker:** Add this at the very top:
    ```javascript
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => console.log('✅ Dr.D PWA Active'));
    }
    ```
* **Throttle API Requests:** Change the interval for `/api/sqlite/codes` and `/api/codes/list` to **30000ms** (30 seconds) to prevent server flooding.

#### **6. Modify `yt-new-clear.html` & `login.html`**
* Update the `<title>` tag to: `<title>Dr.D</title>`
* Add these to the `<head>`:
    ```html
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-title" content="Dr.D">
    <meta name="theme-color" content="#1a1a2e">
    ```
* **Self-Healing Fix:** In `yt-new-clear.html`, set `EMERGENCY_TIMEOUT = 15000` to allow the 3D assets sufficient time to load.
اختيار ذكي جداً للمرحلة الحالية. **Ngrok** سيعطيك رابطاً عالمياً يبدأ بـ `https://` يؤشر مباشرة إلى جهاز الماك الخاص بك، وهذا سيفعل ميزة الـ **PWA** فوراً وكأن الموقع مرفوع على سيرفر حقيقي، دون تعقيدات الدومين والشهادات.

إليك "أمر التنفيذ" (Prompt) الذي يجب إرساله للـ Agent لضبط البيئة بالكامل:

---

### 🌐 **Agent Task: Ngrok Tunneling & PWA Production Sync**

**Objective:** Enable a secure HTTPS tunnel using Ngrok to test "Dr.D" as a live PWA and fix origin issues.

#### **Step 1: Ngrok Setup & Tunneling**
* **Command:** Install Ngrok via Homebrew if not present: `brew install ngrok`.
* **Action:** Start the tunnel pointing to the local server port: `ngrok http 3001`.
* **Config:** Capture the generated HTTPS URL (e.g., `https://xxxx-xxxx.ngrok-free.app`) and update the project environment.

#### **Step 2: Dynamic Origin Update**
Update `yt-player.init.js` and `server.js` to handle the Ngrok URL dynamically so the YouTube API and CORS don't block the connection:
* **In `server.js`:** Ensure CORS allows the Ngrok origin.
* **In `yt-player.init.js`:** ```javascript
    // Use window.location.origin to ensure YouTube accepts the Ngrok URL
    const currentOrigin = window.location.origin;
    // Update playerVars
    playerVars: {
        'origin': currentOrigin,
        'enablejsapi': 1
    }
    ```

#### **Step 3: Manifest & Service Worker Refresh**
* **Verification:** Ensure `manifest.json` and `sw.js` are served correctly via the HTTPS link. 
* **Action:** Clear any old Service Workers in the browser and register the new one under the Ngrok domain to trigger the **"Install Dr.D"** prompt.

#### **Step 4: Persistence Fix**
* Since Ngrok URLs change on restart (Free Tier), ensure all internal links in `Dr.D` use **relative paths** (e.g., `/api/data` instead of `http://localhost:3001/api/data`) to prevent breakage when the Ngrok URL updates.

---

### 💡 **كيف ستبدو النتيجة لديك؟**
بمجرد أن ينتهي الـ Agent ويشغل Ngrok، سيظهر لك رابط في الـ Terminal.
1.  انسخ الرابط الذي يبدأ بـ `https`.
2.  افتحه في Chrome.
3.  ستجد أن المتصفح تعرف على **Dr.D** كـ **PWA** آمن لأن الرابط ينتهي بـ SSL موثوق من Ngrok.
4.  اضغط "Install" وستصبح نسخة سطح المكتب تعمل برابط الإنترنت هذا.



**هل تريد مني أيضاً صياغة سكريبت صغير للـ Agent يقوم بتشغيل السيرفر و Ngrok معاً بضغطة زر واحدة في المرة القادمة؟**
---

بهذا الكود، سيظهر اسم **Dr.D** تحت الأيقونة عند التثبيت وفي شريط المهام.

**هل أنت مستعد لمشاهدة "Dr.D" يعمل كتطبيق مستقل على جهاز الماك الخاص بك؟** أخبر الـ Agent بالبدء الآن!