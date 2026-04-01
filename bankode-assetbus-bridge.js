// bankode-assetbus-bridge.js - UV: SAFE-UI-BRIDGE-2026-02-18
(function attachBankodeBridge() {
  // التأكد من وجود Bankode و AssetBus قبل العمل
  if (!window.Bankode || !window.AssetBus) {
    return console.error('Bankode أو AssetBus غير موجود، تأكد من تحميل السكربتات الأساسية أولاً');
  }

  // منع تكرار listener
  if (Bankode._uiBridgeAttached) return;
  Bankode._uiBridgeAttached = true;

  // تابع لبث snapshot للـ UI
  function broadcastSnapshot(source = 'bankode-bridge') {
    try {   
      if (!AssetBus || !AssetBus.snapshot) return;
      const snap = AssetBus.snapshot();
      const evt = new CustomEvent('assets:updated', { detail: { snapshot: snap, source } });
      window.dispatchEvent(evt);
      console.log('[UI SNAPSHOT BROADCASTED]', snap);
    } catch (err) {
      console.error('[Bankode Bridge] Failed to broadcast snapshot', err);
    }
  }

  // listener للجسر
  Bankode.on(function(payload) {
    console.log('[UI RECEIVED]', payload);

    // 1️⃣ تحديث AssetBus
    if (typeof AssetBus.addAsset === 'function') {
      AssetBus.addAsset(payload.assetType, payload.value);

      // إعادة بناء snapshot وإطلاق حدث assets:updated
      broadcastSnapshot('bankode-bridge');
    }
  });

  // 2️⃣ إعادة بث snapshot الحالي عند Init للتأكد من عرض أي أكواد سابقة
  setTimeout(() => {
    broadcastSnapshot('bankode-bridge-init');
  }, 100); // تأخير صغير لضمان أن AssetBus والـ UI جاهزين

  console.log('✅ جسر Bankode → AssetBus جاهز وفعال');
})();
