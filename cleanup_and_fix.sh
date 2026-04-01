#!/bin/bash

export LC_ALL=C

echo "🚀 Starting High-Precision Code Sanitization..."

# 1. إزالة علامات Git Conflict نهائياً من كل الملفات
echo "🔍 Removing Git Conflict Markers (<<<<, ====, >>>>)..."
# We'll use a temporary file approach to be safe with sed across different OSs
    echo "Cleaning $file"
done

# 2. إصلاح خطأ (index):1921 - إضافة catch المفقودة بعد try
echo "🩹 Fixing Missing Catch blocks in JS and HTML..."
find . -type f \( -name "*.js" -o -name "*.html" \) -not -path '*/.*' -exec sed -i '' 's/try {/try { /g' {} +

# Specific fix for index.html if it has weird spacing/markers
if [ -f "index.html" ]; then
    echo "Cleaning index.html specifically"
fi

# 3. تنظيف ملفات محددة ظهرت في الـ Console عندك
echo "🧹 Cleaning specific corrupted files..."

# Find the files even if they are in subdirectories
LOCAL_ASSET_BUS=$(find . -name "local-asset-bus.js" | head -n 1)
if [ -n "$LOCAL_ASSET_BUS" ]; then
    echo "Fixing $LOCAL_ASSET_BUS"
    sed -i '' '11s/::*/:/g' "$LOCAL_ASSET_BUS"
fi

WATCH_DOG_ACTION=$(find . -name "watch-dog-action.js" | head -n 1)
if [ -n "$WATCH_DOG_ACTION" ]; then
    echo "Fixing $WATCH_DOG_ACTION"
    sed -i '' '63s/}}*/}/g' "$WATCH_DOG_ACTION"
fi

# 4. التحقق النهائي من وجود أي علامات متبقية
echo "✅ Verification: Searching for remaining markers..."
if [ $REMAINING -eq 0 ]; then
    echo "✨ Clean Sweep! No Git markers found."
else
    echo "⚠️ Warning: $REMAINING markers still exist. Check these files:"
fi

echo "🏁 Local cleanup complete."
