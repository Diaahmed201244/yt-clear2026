/* ===================================================
   Test Suite for Unified Safe Asset List
   =================================================== */

(function() {
  'use strict';

  console.log('🧪 Starting Safe Asset List Tests...');

  // Test utilities
  const TestUtils = {
    createMockAssetBus: function() {
      const mockState = {
        counts: { normal: 0, silver: 0, gold: 0 },
        series: { normal: [], silver: [], gold: [] },
        last: { normal: null, silver: null, gold: null }
      };

      return {
        snapshot: function() {
          return JSON.parse(JSON.stringify(mockState));
        },
        addAsset: function(type, code) {
          const seriesKey = type;
          mockState.series[seriesKey].push(code);
          mockState.counts[seriesKey]++;
          mockState.last[seriesKey] = code;
          const snapshot = this.snapshot();
          window.dispatchEvent(new CustomEvent('assets:updated', { 
            detail: snapshot 
          }));
          window.dispatchEvent(new CustomEvent('assets:changed', { 
            detail: snapshot 
          }));
        },
        getState: function() {
          return this.snapshot();
        }
      };
    },

    createMockDOM: function() {
      // Create required DOM elements
      const title = document.createElement('h2');
      title.id = 'safe-title';
      document.body.appendChild(title);

      const count = document.createElement('strong');
      count.id = 'safe-count';
      document.body.appendChild(count);

      const last = document.createElement('strong');
      last.id = 'safe-last';
      document.body.appendChild(last);

      const list = document.createElement('div');
      list.id = 'safe-list';
      document.body.appendChild(list);

      // Create tab buttons
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'safe-tabs';

      const codesBtn = document.createElement('button');
      codesBtn.className = 'safe-tab-button';
      codesBtn.dataset.tab = 'codes';
      codesBtn.textContent = 'Codes';

      const silverBtn = document.createElement('button');
      silverBtn.className = 'safe-tab-button';
      silverBtn.dataset.tab = 'silver';
      silverBtn.textContent = 'Silver';

      const goldBtn = document.createElement('button');
      goldBtn.className = 'safe-tab-button';
      goldBtn.dataset.tab = 'gold';
      goldBtn.textContent = 'Gold';

      tabsContainer.appendChild(codesBtn);
      tabsContainer.appendChild(silverBtn);
      tabsContainer.appendChild(goldBtn);
      document.body.appendChild(tabsContainer);
    },

    cleanupDOM: function() {
      const elements = [
        '#safe-title',
        '#safe-count',
        '#safe-last',
        '#safe-list',
        '.safe-tabs'
      ];
      elements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.remove();
      });
    },

    assert: function(condition, message) {
      if (condition) {
        console.log('✅', message);
        return true;
      } else {
        console.error('❌', message);
        return false;
      }
    },

    assertEqual: function(actual, expected, message) {
      const condition = actual === expected;
      if (condition) {
        console.log('✅', message, `(expected: ${expected}, got: ${actual})`);
      } else {
        console.error('❌', message, `(expected: ${expected}, got: ${actual})`);
      }
      return condition;
    }
  };

  // Test cases
  const tests = {
    testInitialization: function() {
      console.log('\n📋 Test 1: Initialization');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Load the component
      const script = document.createElement('script');
      script.src = 'js/safe-asset-list.js';
      document.head.appendChild(script);

      // Wait for initialization
      setTimeout(() => {
        const title = document.querySelector('#safe-title');
        TestUtils.assert(
          title && title.textContent === 'Safe Codes',
          'Initial title should be "Safe Codes"'
        );

        TestUtils.assert(
          window.ACTIVE_ASSET_TAB === 'codes',
          'Initial tab should be "codes"'
        );

        TestUtils.cleanupDOM();
        tests.testTabSwitching();
      }, 100);
    },

    testTabSwitching: function() {
      console.log('\n📋 Test 2: Tab Switching');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Switch to silver
      window.switchAssetTab('silver');
      TestUtils.assertEqual(
        window.ACTIVE_ASSET_TAB,
        'silver',
        'Tab should switch to silver'
      );

      const title = document.querySelector('#safe-title');
      TestUtils.assertEqual(
        title.textContent,
        'Silver Bars',
        'Title should update to "Silver Bars"'
      );

      // Switch to gold
      window.switchAssetTab('gold');
      TestUtils.assertEqual(
        window.ACTIVE_ASSET_TAB,
        'gold',
        'Tab should switch to gold'
      );

      TestUtils.assertEqual(
        title.textContent,
        'Gold Bars',
        'Title should update to "Gold Bars"'
      );

      TestUtils.cleanupDOM();
      tests.testAssetRendering();
    },

    testAssetRendering: function() {
      console.log('\n📋 Test 3: Asset Rendering');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Add some codes
      window.AssetBus.addAsset('normal', 'CODE-ABC123');
      window.AssetBus.addAsset('normal', 'CODE-DEF456');

      // Render codes
      window.SafeAssetList.render('codes');

      const list = document.querySelector('#safe-list');
      const items = list.querySelectorAll('.safe-item');
      
      TestUtils.assertEqual(
        items.length,
        2,
        'Should render 2 code items'
      );

      TestUtils.assert(
        items[0].classList.contains('safe-codes'),
        'First item should have safe-codes class'
      );

      TestUtils.assertEqual(
        items[0].textContent,
        'CODE-ABC123',
        'First item should have correct code'
      );

      TestUtils.cleanupDOM();
      tests.testSilverRendering();
    },

    testSilverRendering: function() {
      console.log('\n📋 Test 4: Silver Rendering');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Add silver bars
      window.AssetBus.addAsset('silver', 'SLVR-SILVER1');
      window.AssetBus.addAsset('silver', 'SLVR-SILVER2');

      // Render silver
      window.SafeAssetList.render('silver');

      const list = document.querySelector('#safe-list');
      const items = list.querySelectorAll('.safe-item');
      
      TestUtils.assertEqual(
        items.length,
        2,
        'Should render 2 silver items'
      );

      TestUtils.assert(
        items[0].classList.contains('safe-silver'),
        'First item should have safe-silver class'
      );

      TestUtils.assertEqual(
        items[0].textContent,
        'SLVR-SILVER1',
        'First item should have correct silver code'
      );

      TestUtils.cleanupDOM();
      tests.testGoldRendering();
    },

    testGoldRendering: function() {
      console.log('\n📋 Test 5: Gold Rendering');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Add gold bars
      window.AssetBus.addAsset('gold', 'GOLD-GOLD1');
      window.AssetBus.addAsset('gold', 'GOLD-GOLD2');

      // Render gold
      window.SafeAssetList.render('gold');

      const list = document.querySelector('#safe-list');
      const items = list.querySelectorAll('.safe-item');
      
      TestUtils.assertEqual(
        items.length,
        2,
        'Should render 2 gold items'
      );

      TestUtils.assert(
        items[0].classList.contains('safe-gold'),
        'First item should have safe-gold class'
      );

      TestUtils.assertEqual(
        items[0].textContent,
        'GOLD-GOLD1',
        'First item should have correct gold code'
      );

      TestUtils.cleanupDOM();
      tests.testEventDrivenUpdates();
    },

    testEventDrivenUpdates: function() {
      console.log('\n📋 Test 6: Event-Driven Updates');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Set initial state
      window.switchAssetTab('codes');

      // Add a code (triggers assets:updated event)
      window.AssetBus.addAsset('normal', 'CODE-NEW123');

      // Check if UI updated
      setTimeout(() => {
        const list = document.querySelector('#safe-list');
        const items = list.querySelectorAll('.safe-item');
        
        TestUtils.assertEqual(
          items.length,
          1,
          'UI should update after assets:updated event'
        );

        TestUtils.assertEqual(
          items[0].textContent,
          'CODE-NEW123',
          'New code should be displayed'
        );

        TestUtils.cleanupDOM();
        tests.testEmptyState();
      }, 100);
    },

    testEmptyState: function() {
      console.log('\n📋 Test 7: Empty State');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Render empty list
      window.SafeAssetList.render('codes');

      const list = document.querySelector('#safe-list');
      const emptyMsg = list.querySelector('.safe-empty');
      
      TestUtils.assert(
        emptyMsg !== null,
        'Should show empty message when no assets'
      );

      TestUtils.cleanupDOM();
      tests.testHeaderUpdates();
    },

    testHeaderUpdates: function() {
      console.log('\n📋 Test 8: Header Updates');
      
      TestUtils.createMockDOM();
      window.AssetBus = TestUtils.createMockAssetBus();

      // Add assets
      window.AssetBus.addAsset('normal', 'CODE-TEST1');
      window.AssetBus.addAsset('normal', 'CODE-TEST2');
      window.AssetBus.addAsset('normal', 'CODE-TEST3');

      // Render
      window.SafeAssetList.render('codes');

      const count = document.querySelector('#safe-count');
      const last = document.querySelector('#safe-last');
      
      TestUtils.assertEqual(
        count.textContent,
        '3',
        'Count should be 3'
      );

      TestUtils.assertEqual(
        last.textContent,
        'CODE-TEST3',
        'Last should be CODE-TEST3'
      );

      TestUtils.cleanupDOM();
      console.log('\n✅ All tests completed!');
    }
  };

  // Run tests
  window.runSafeAssetListTests = function() {
    console.log('🚀 Running Safe Asset List Test Suite...\n');
    tests.testInitialization();
  };

  // Auto-run if in test mode
  if (window.__TEST_MODE__) {
    window.runSafeAssetListTests();
  }

  console.log('📦 Safe Asset List Test Suite loaded');
})();
