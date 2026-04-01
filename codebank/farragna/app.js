const api = {
  async feed() {
  },
  async view(id) {
    try {  await fetch(`/api/farragna/${id}`, { credentials: 'include' }) } catch (_) {}
  },
  async requestUpload() {
  }
}

function fmtDuration(sec){
  const s = Math.max(0, Math.floor(sec||0))
  const m = Math.floor(s/60), r = s%60
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
}

function showStatus(msg){
  const el = document.getElementById('status-bar')
  if (!el) return
  el.textContent = msg
  el.style.display = 'block'
  clearTimeout(showStatus._t)
  showStatus._t = setTimeout(()=>{ el.style.display='none' }, 2500)
}

function createReel(v){
  const reel = document.createElement('div')
  reel.className = 'reel'

  const frame = document.createElement('div')
  frame.className = 'video-frame'
  const video = document.createElement('video')
  video.setAttribute('playsinline', 'true')
  video.muted = true
  video.loop = true
  video.preload = 'metadata'
  frame.appendChild(video)

  const overlay = document.createElement('div')
  overlay.className = 'overlay'
  const views = document.createElement('div')
  views.className = 'pill'
  const duration = document.createElement('div')
  duration.className = 'pill'
  duration.innerHTML = `⏱️ ${fmtDuration(v.duration||0)}`
  overlay.append(views, rewards, duration)

  reel.appendChild(frame)
  reel.appendChild(overlay)

  // View counting: call once on first play
  let viewed = false
  video.addEventListener('play', () => {
    if (!viewed) { viewed = true; api.view(v.id) }
  })

  return { reel, video }
}

function setupObserver(items){
  const options = { threshold: 0.6 }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      const video = e.target.querySelector('video')
      if (!video) return
      if (e.isIntersecting) {
        try {  video.play() } catch(_){}
      } else {
        try {  video.pause() } catch(_){}
      }
    })
  }, options)
  items.forEach(item => io.observe(item))
}

async function loadReels(){
  const container = document.getElementById('reels-container')
  if (!container) return
  container.innerHTML = ''
  let list = []
  try {  list = await api.feed() } catch(_){}
  if (!list || !list.length) {
    try {  list = await api.trending() } catch(_){}
  }
  if (!ready.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:80vh;opacity:.7">No ready videos yet</div>'
    return
  }
  const items = []
  for (const v of ready) {
    const { reel } = createReel(v)
    container.appendChild(reel)
    items.push(reel)
  }
  setupObserver(items)
}

async function setupUpload(){
  const btn = document.getElementById('upload-btn')
  const input = document.getElementById('upload-input')
  if (!btn || !input) return
  btn.onclick = ()=> input.click()
  input.onchange = async (e)=>{
    const file = e.target.files?.[0]
    if (!file) return
    } catch (err) {
      showStatus('Error: '+err.message)
    }
  }
}

  const container = document.getElementById('reels-container')
  if (container) {
    container.addEventListener('wheel', (e)=>{
      e.preventDefault()
      container.scrollBy({ top: e.deltaY>0 ? container.clientHeight : -container.clientHeight, behavior: 'smooth' })
    }, { passive: false })
  }
})

