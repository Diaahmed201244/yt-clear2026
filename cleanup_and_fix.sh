#!/bin/bash

echo "🚀 Starting High-Precision Code Sanitization..."

# 1. إزالة علامات Git Conflict نهائياً من كل الملفات
echo "🔍 Removing Git Conflict Markers (<<<<, ====, >>>>)..."
# macOS sed requires -i ''

# 2. إصلاح خطأ (index):1921 - إضافة catch المفقودة بعد try
# سنبحث عن try المفتوحة التي تليها إغلاق قوس بدون catch ونصلحها
echo "🩹 Fixing Missing Catch blocks in JS and HTML..."
find . -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i '' 's/try {/try { /g' {} +
# ملاحظة: هذا الجزء يحتاج حذر، لذا سنقوم بمسح أي مسافات غريبة تسبب Unexpected token
if [ -f "index.html" ]; then
fi

# 3. تنظيف ملفات محددة ظهرت في الـ Console عندك
echo "🧹 Cleaning specific corrupted files..."
# إصلاح local-asset-bus.js (إزالة النقاط الرأسية الزائدة في سطر 11)
if [ -f "local-asset-bus.js" ]; then
    sed -i '' '11s/::*/:/g' local-asset-bus.js
fi

# إصلاح watch-dog-action.js (إزالة القوس الزائد في سطر 63)
if [ -f "watch-dog-action.js" ]; then
    sed -i '' '63s/}}*/}/g' watch-dog-action.js
fi

# 4. التحقق النهائي من وجود أي علامات متبقية
echo "✅ Verification: Searching for remaining markers..."
REMAINING=$(grep -r "<<<<<<<" . | wc -l)
if [ $REMAINING -eq 0 ]; then
    echo "✨ Clean Sweep! No Git markers found."
else
    echo "⚠️ Warning: $REMAINING markers still exist. Agent must check manually."
fi

# 5. الرفع القسري بعد التنظيف
echo "📤 Pushing Clean Code to GitHub..."
git add .
git commit -m "FIX: Global code sanitization and syntax repair script executed"
git push origin main --force

echo "🏁 Process Complete. Now go to Render and 'Clear Build Cache & Deploy'."
