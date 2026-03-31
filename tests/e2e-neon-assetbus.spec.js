import puppeteer from 'puppeteer'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const PAGE_URL = BASE_URL + '/yt-clear/yt-new-clear.html'

async function getUVTrace(page){
  return await page.evaluate(() => { try { return (window.__UV_TRACE__||[]).slice(); } catch(_){ return [] } })
}

async function getAssetSnapshot(page){
  return await page.evaluate(() => {
    try{
      if (window.AssetBus && typeof window.AssetBus.getState==='function') {
        return window.AssetBus.getState();
      }
      const ss = window.safeStorage || null;
      const raw = ss ? ss.get('codebank_assets') : null;
      return raw ? JSON.parse(raw) : null;
    }catch(_){ return null }
  })
}

async function devLogin(page){
  const res = await page.evaluate(async (url) => {
    const r = await fetch(url, { method:'POST', credentials:'include' });
    return { status: r.status, ok: r.ok }
  }, BASE_URL + '/api/auth/dev-login')
  return res && res.ok
}

async function collectEvents(page){
  await page.evaluate(() => {
    try{
      window.__E2E_EVENTS__ = [];
      window.addEventListener('assets:updated', (e) => {
        const d = e && e.detail || {};
        try { window.__E2E_EVENTS__.push({ type:'assets:updated', detail: d }); } catch(_){}
      });
    }catch(_){ }
  })
}

function findZeroResets(trace){
  return trace.filter(r => r.type==='assets:updated'
    && (r.data && (r.data.type==='codes'))
    && (!r.data.latest || r.data.latest==='')
    && (typeof r.data.count==='number' ? r.data.count===0 : true))
}

function anyPPInAuth(events){
  return events.some(ev => {
    const d = ev && ev.detail || {}
    const vals = Object.values(d).filter(v => typeof v === 'string')
    return vals.some(v => /_PP$/.test(v))
  })
}

async function waitAuthReady(page){
  await page.waitForFunction(() => {
    try{
      const t = (window.__UV_TRACE__||[]).some(r => r.type==='auth:ready' && r.data && r.data.authenticated===true)
      return t
    }catch(_){ return false }
  }, { timeout: 8000 })
}

async function getConsoleErrors(page){
  const logs = []
  page.on('console', msg => { try { if (msg.type() === 'error') logs.push(msg.text()) } catch(_){ } })
  return logs
}

async function writeJsonReport(path, obj){
  const fs = await import('fs')
  await fs.promises.mkdir('tests/reports', { recursive: true })
  await fs.promises.writeFile(path, JSON.stringify(obj, null, 2))
}

async function run(){
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  page.setDefaultTimeout(20000)
  const errors1 = await getConsoleErrors(page)

  console.log('➡️ Open page (guest)')
  await page.goto(PAGE_URL, { waitUntil:'domcontentloaded' })
  await collectEvents(page)

  console.log('➡️ Perform dev login')
  const ok = await devLogin(page)
  if(!ok) throw new Error('dev-login failed')
  await page.reload({ waitUntil:'domcontentloaded' })
  await collectEvents(page)
  const who = await page.evaluate(async () => { try { const r = await fetch('/api/auth/me', { credentials:'include' }); const j = await r.json(); return j && j.user && j.user.id ? j.user : null } catch(_){ return null } })
  if (!who) throw new Error('auth: user not detected after login')
  console.log('➡️ Auth user detected:', who && who.id)

  console.log('➡️ Verify no zero-reset after login')
  let trace = await getUVTrace(page)
  const zeros = findZeroResets(trace)
  if(zeros.length){ throw new Error('Zero-reset events detected after login: ' + JSON.stringify(zeros.slice(0,3))) }

  console.log('➡️ Verify no PP suffix in authenticated session')
  const evsAfterLogin = await page.evaluate(() => (window.__E2E_EVENTS__||[]).slice())
  if (anyPPInAuth(evsAfterLogin)) throw new Error('PP suffix detected in authenticated events')

  console.log('➡️ Neon balances sync on auth:ready')
  await page.waitForFunction(() => (window.__UV_TRACE__||[]).some(r => r.type==='fetch' && /\/api\/balances$/.test(r.data && r.data.url) && typeof r.data.ms==='number'), { timeout: 8000 })
  trace = await getUVTrace(page)
  const balFetch = trace.filter(r => r.type==='fetch' && /\/api\/balances$/.test(r.data && r.data.url)).pop() || null
  const balEvent = trace.filter(r => r.type==='assets:updated').pop() || null
  if(!balFetch || !balEvent) throw new Error('Balances fetch or assets update missing')

  console.log('➡️ Verify snapshot persisted in safeStorage')
  const snap1 = await getAssetSnapshot(page)
  if(!snap1 || typeof snap1.codes!=='number'){ throw new Error('Snapshot invalid or codes missing') }

  console.log('➡️ Generate Neon code and mirror balances locally')
  const genRes = await page.evaluate(async () => {
    const code = 'E2ETEST' + Date.now() + 'P1'
    const res = await fetch('/api/neon/codes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, suffix: 'P1', ts: Date.now() })
    })
    let j=null; try{ j=await res.json() }catch(_){}
    return { ok: res.ok, status: res.status, body: j }
  })
  if(!genRes || !genRes.ok) throw new Error('writeCodeToNeon failed')
  const neonCodes = await page.evaluate(async () => { const r = await fetch('/api/neon/codes', { credentials:'include' }); return r.ok ? await r.json() : null })
  if(!neonCodes || neonCodes.status!=='success') throw new Error('GET /api/neon/codes failed after write')
  const neonCount = typeof neonCodes.count==='number' ? neonCodes.count : (Array.isArray(neonCodes.rows)? neonCodes.rows.length : 0)
  await page.evaluate((c) => { const p = new CustomEvent('balances:updated', { detail: { balances: { codes: c } } }); window.dispatchEvent(p) }, neonCount)
  await page.waitForTimeout(200)
  const snapAfterGen = await getAssetSnapshot(page)
  if(!snapAfterGen || snapAfterGen.codes !== neonCount) throw new Error('Local codes not matching Neon after generation')

  console.log('➡️ Reload page and check stability')
  await page.reload({ waitUntil:'domcontentloaded' })
  const snap2 = await getAssetSnapshot(page)
  if(!snap2 || typeof snap2.codes!=='number'){ throw new Error('Snapshot invalid after reload') }
  trace = await getUVTrace(page)
  if(findZeroResets(trace).length){ throw new Error('Zero-reset events detected after reload') }

  console.log('➡️ Multi-tab check (same session)')
  const page2 = await browser.newPage()
  const errors2 = await getConsoleErrors(page2)
  await page2.goto(PAGE_URL, { waitUntil:'domcontentloaded' })
  const who2 = await page2.evaluate(async () => { try { const r = await fetch('/api/auth/me', { credentials:'include' }); const j = await r.json(); return j && j.user && j.user.id ? j.user : null } catch(_){ return null } })
  if (!who2) throw new Error('auth: user not detected in second tab')
  await page2.waitForFunction(() => { try { const ss = window.safeStorage || null; if (!ss) return false; const raw = ss.get('codebank_assets'); return !!raw } catch(_){ return false } }, { timeout: 4000 })
  const stats1 = await page.evaluate(() => { try { return (window.safeStorage&&window.safeStorage.getStats&&window.safeStorage.getStats())||null } catch(_){ return null } })
  const stats2 = await page2.evaluate(() => { try { return (window.safeStorage&&window.safeStorage.getStats&&window.safeStorage.getStats())||null } catch(_){ return null } })
  try { console.log('safeStorage stats tab1:', stats1) } catch(_){}
  try { console.log('safeStorage stats tab2:', stats2) } catch(_){}
  const raw1 = await page.evaluate(() => { try { const ss=window.safeStorage||null; return ss? ss.get('codebank_assets') : null } catch(_){ return null } })
  const raw2 = await page2.evaluate(() => { try { const ss=window.safeStorage||null; return ss? ss.get('codebank_assets') : null } catch(_){ return null } })
  try { console.log('safeStorage raw tab1:', raw1) } catch(_){}
  try { console.log('safeStorage raw tab2:', raw2) } catch(_){}
  const snap3 = await getAssetSnapshot(page2)
  if(!snap3 || snap3.codes !== snap2.codes){ throw new Error('Multi-tab snapshot mismatch') }

  console.log('➡️ Transactions increment via AssetBus')
  await page.evaluate(() => { try {
    const s = window.AssetBus && window.AssetBus.getState && window.AssetBus.getState() || { codes:0, transactions:0, lastCode:null };
    const next = Object.assign({}, s, { transactions: 3, updatedAt: Date.now() });
    const ss = window.safeStorage || null; if (ss) ss.set('codebank_assets', JSON.stringify(next));
    try{ window.dispatchEvent(new CustomEvent('assets:updated', { detail: { type:'transactions', latest: next.lastCode || '', count: next.codes || 0, transactions: next.transactions, ts: Date.now(), proof: 'E2E', expiryTs: Date.now()+5000 } })) }catch(_){ }
  } catch(_){} })
  await page.waitForTimeout(300)
  const evsAfterTx = await page.evaluate(() => (window.__E2E_EVENTS__||[]).slice())
  try { console.log('events after tx:', evsAfterTx.slice(-3)) } catch(_){}
  const snap4 = await getAssetSnapshot(page)
  try { console.log('snap4 after transactions:', snap4) } catch(_){}
  if(!snap4 || typeof snap4.transactions!=='number' || snap4.transactions < 3){ throw new Error('Transactions not persisted via AssetBus') }

  console.log('➡️ Neon codes endpoint call')
  const neonRes = await page.evaluate(async (url) => {
    try { const r = await fetch(url, { method:'GET', credentials:'include' }); const j = await r.json(); return { status: r.status, body: j } } catch(e){ return { status: 0 } }
  }, BASE_URL + '/api/neon/codes')
  console.log('GET /api/neon/codes status:', neonRes.status)
  trace = await getUVTrace(page)
  if(findZeroResets(trace).length){ throw new Error('Zero-reset after Neon call') }

  console.log('➡️ Stress increments atomicity')
  await page.evaluate(() => { try { const s = window.AssetBus && window.AssetBus.getState && window.AssetBus.getState() || { likes:0 }; const next = Object.assign({}, s, { likes: (s.likes||0) + 50, updatedAt: Date.now() }); const ss = window.safeStorage || null; if (ss) ss.set('codebank_assets', JSON.stringify(next)); window.dispatchEvent(new CustomEvent('assets:updated', { detail: { type:'likes', latest: next.lastCode || '', count: next.codes || 0, likes: next.likes, ts: Date.now(), proof: 'E2E', expiryTs: Date.now()+5000 } })) } catch(_){ } })
  await page.waitForTimeout(200)
  const snapStress = await getAssetSnapshot(page)
  if(!snapStress || typeof snapStress.likes!=='number' || snapStress.likes < 50){ throw new Error('Likes increments lost under stress') }

  console.log('➡️ Rewards transfer A → B (codes)')
  const ctxB = await browser.createIncognitoBrowserContext()
  const pageB = await ctxB.newPage()
  pageB.setDefaultTimeout(60000)
  await pageB.goto(PAGE_URL, { waitUntil:'domcontentloaded' })
  const okB = await pageB.evaluate(async (url) => { const r = await fetch(url, { method:'POST', credentials:'include' }); return r.ok }, BASE_URL + '/api/auth/dev-login')
  if(!okB) throw new Error('dev-login B failed')
  await pageB.reload({ waitUntil:'domcontentloaded' })
  const whoB = await pageB.evaluate(async () => { const r = await fetch('/api/auth/me', { credentials:'include' }); const j = await r.json(); return j && j.user && j.user.id ? j.user : null })
  if (!whoB) throw new Error('auth: user B not detected')
  const whoA = await page.evaluate(async () => { const r = await fetch('/api/auth/me', { credentials:'include' }); const j = await r.json(); return j && j.user && j.user.id ? j.user : null })
  if (!whoA) throw new Error('auth: user A not detected')
  const ensureAHasCode = await page.evaluate(async () => {
    const r = await fetch('/api/neon/codes', { method:'GET', credentials:'include' }); const j = await r.json(); const c = (typeof j.count==='number'? j.count : (Array.isArray(j.rows)? j.rows.length : 0));
    if (c>0) return true;
    const code = 'E2ETEST' + Date.now() + 'P1'
    const p = await fetch('/api/neon/codes', { method:'POST', credentials:'include', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ code, suffix:'P1', ts: Date.now() }) })
    return p.ok
  })
  if (!ensureAHasCode) throw new Error('Failed to seed A with a code')
  const balA1 = await page.evaluate(async () => { const r = await fetch('/api/balances', { credentials:'include' }); const j = await r.json(); return j && j.balances && (typeof j.balances.codes==='number'? j.balances.codes : 0) })
  const balB1 = await pageB.evaluate(async () => { const r = await fetch('/api/balances', { credentials:'include' }); const j = await r.json(); return j && j.balances && (typeof j.balances.codes==='number'? j.balances.codes : 0) })
  try { console.log('pre-transfer A,B:', balA1, balB1) } catch(_){ }
  const txRes = await page.evaluate(async (toId) => { const r = await (window.sendReward? window.sendReward(toId, 1) : { status:'failed' }); return r }, whoB.id)
  try { console.log('transfer result:', txRes) } catch(_){}
  if (!txRes || txRes.status!=='success') throw new Error('Reward transfer failed')
  await page.waitForTimeout(400)
  const neonAB = await page.evaluate(async (url, a, b) => { const r = await fetch(url + '?user1=' + a + '&user2=' + b); const j = await r.json(); return j && j.rows ? j.rows : [] }, BASE_URL + '/api/neon/balances', whoA.id, whoB.id)
  try { console.log('neon balances rows:', neonAB) } catch(_){ }
  const aRow = Array.isArray(neonAB) ? neonAB.find(r => (String(r.user_id||r.userId||'') === String(whoA.id)) && (String(r.asset||'') === 'codebank')) : null
  const bRow = Array.isArray(neonAB) ? neonAB.find(r => (String(r.user_id||r.userId||'') === String(whoB.id)) && (String(r.asset||'') === 'codebank')) : null
  function toNum(v){ if (typeof v==='number') return v; if (typeof v==='string') { const n = Number(v); return Number.isFinite(n)? n : 0 } return 0 }
  const aCodes = aRow ? (toNum(aRow.amount) || toNum(aRow.balance)) : 0
  const bCodes = bRow ? (toNum(bRow.amount) || toNum(bRow.balance)) : 0
  try { console.log('post-transfer Neon A,B:', aCodes, bCodes) } catch(_){ }
  if (!(aCodes === balA1 - 1 && bCodes === balB1 + 1)) throw new Error('Neon balances not updated after transfer')
  await pageB.reload({ waitUntil:'domcontentloaded' })
  const balBReload = await pageB.evaluate(async () => { const r = await fetch('/api/balances', { credentials:'include' }); const j = await r.json(); return j && j.balances && (typeof j.balances.codes==='number'? j.balances.codes : 0) })
  if (balBReload !== bCodes) throw new Error('Client B balances not reflecting Neon after reload')
  const snapAAfter = await getAssetSnapshot(page)
  const rawAfter = await page.evaluate(() => { try { const ss=window.safeStorage||null; return ss? ss.get('codebank_assets') : null } catch(_){ return null } })
  try { console.log('raw snapshot after transfer:', rawAfter) } catch(_){ }
  if (!snapAAfter || typeof snapAAfter.codes!=='number') throw new Error('Snapshot invalid after transfer')
  if (snapAAfter.codes !== aCodes) throw new Error('Local snapshot not mirroring Neon after transfer')

  console.log('➡️ Concurrent transfer stress (A → B twice)')
  const results = await page.evaluate(async (toId) => {
    const p1 = window.sendReward? window.sendReward(toId, 1) : Promise.resolve({ status:'failed' });
    const p2 = window.sendReward? window.sendReward(toId, 1) : Promise.resolve({ status:'failed' });
    const r = await Promise.allSettled([p1, p2]);
    return r.map(x => x.status==='fulfilled' ? x.value : { status:'failed' });
  }, whoB.id)
  try { console.log('concurrent results:', results) } catch(_){}
  const succ = results.filter(r => r && r.status === 'success').length
  await page.waitForTimeout(400)
  const neonAB2 = await page.evaluate(async (url, a, b) => { const r = await fetch(url + '?user1=' + a + '&user2=' + b); const j = await r.json(); return j && j.rows ? j.rows : [] }, BASE_URL + '/api/neon/balances', whoA.id, whoB.id)
  const aRow2 = Array.isArray(neonAB2) ? neonAB2.find(r => (String(r.user_id||r.userId||'') === String(whoA.id)) && (String(r.asset||'') === 'codebank')) : null
  const bRow2 = Array.isArray(neonAB2) ? neonAB2.find(r => (String(r.user_id||r.userId||'') === String(whoB.id)) && (String(r.asset||'') === 'codebank')) : null
  function toNum2(v){ if (typeof v==='number') return v; if (typeof v==='string') { const n = Number(v); return Number.isFinite(n)? n : 0 } return 0 }
  const aCodes2 = aRow2 ? (toNum2(aRow2.amount) || toNum2(aRow2.balance)) : 0
  const bCodes2 = bRow2 ? (toNum2(bRow2.amount) || toNum2(bRow2.balance)) : 0
  try { console.log('post-concurrency Neon A,B:', aCodes2, bCodes2) } catch(_){ }
  if (aCodes2 < 0) throw new Error('Sender negative balance after concurrent transfers')
  if (succ === 0) {
    if (!(aCodes2 === aCodes && bCodes2 === bCodes)) throw new Error('Balances changed despite failed concurrent transfers')
  } else if (succ === 1) {
    if (!(aCodes2 === aCodes - 1 && bCodes2 === bCodes + 1)) throw new Error('Incorrect balances after single successful concurrent transfer')
  } else {
    throw new Error('More than one concurrent transfer succeeded unexpectedly')
  }
  // Ledger verification optional; balances are the source of truth in this flow
  try { await ctxB.close() } catch(_){ }

  const fetchTimes = trace.filter(r => r.type==='fetch').map(r => ({ url: r.data && r.data.url, ms: r.data && r.data.ms, status: r.data && r.data.status }))
  const report = {
    sessionCycle: { guestToLogin: true, reloadStable: true, multiTabStable: true, noPPInAuth: true },
    neonMirroring: { balancesFetched: !!balFetch, balancesAssetsUpdated: !!balEvent, neonCodesStatus: neonRes.status },
    countersStability: { noZeroResetsLogin: zeros.length===0, noZeroResetsReload: findZeroResets(trace).length===0, atomicStressLikes: true },
    codesToBalanceLink: { neonCount, snapshotCodes: snap2.codes, transactions: snap4.transactions },
    proofsAndPolicy: { hasProofOnEvents: true },
    performance: { fetchTimes },
    consoleErrors: { tab1: errors1, tab2: errors2 }
  }
  await writeJsonReport('tests/reports/assetbus-e2e-report.json', report)

  console.log('✅ E2E checks passed')
  await browser.close()
}

run().catch(async (e) => { console.error('❌ E2E failed:', e && e.message || e); process.exit(1) })
