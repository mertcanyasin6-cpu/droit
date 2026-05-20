import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

const TIME_RE = /\[?([01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\]?/

const CHAT_COLORS = {
  blue: '#42a5ff',
  yellow: '#ffd633',
  violet: '#c7a4ff',
  green: '#3dff69',
  white: '#f2f2f2',
  cyan: '#2de6ff',
  red: '#ff3b30',
  orange: '#ffb347',
}

const CHAT_PRESETS = {
  tr: `[21:40:28] John Doe: Selam.
[21:40:25] Jane Doe kısık sesle (John Doe): Selam.
[21:40:20] [BİLGİ] Transfer başarıyla tamamlandı.
[21:40:16] * Mike Sanders sigarasından bir nefes alır.`,
  en: `[21:40:28] John Doe: Hello.
[21:40:25] Jane Doe whispers (John Doe): Hello.
[21:40:20] [INFO] Transfer completed successfully.
[21:40:16] * Mike Sanders takes a drag from his cigarette.`,
}

const STYLE_PRESETS = {
  classic: { fontSize: 19, lineHeight: 1.2, bgOpacity: 0.52 },
  clean: { fontSize: 18, lineHeight: 1.35, bgOpacity: 0.2 },
  stream: { fontSize: 22, lineHeight: 1.25, bgOpacity: 0.62 },
}

const EXPORT_PROFILES = {
  discord: { width: 860, height: 420 },
  forum: { width: 1080, height: 520 },
  ticket: { width: 760, height: 360 },
}

const QUICK_COLORS = [
  { key: 'me', label: 'ME', value: '#C2A2DA' },
  { key: 'white', label: 'Beyaz', value: '#F0F0F0' },
  { key: 'gray', label: 'Gri', value: '#B9BECA' },
  { key: 'yellow', label: 'Sarı', value: '#FFD633' },
]

const I18N = {
  tr: {
    title: 'droit',
    subtitle: 'GTA WORLD TR',
    lang: 'Dil',
    theme: 'Tema',
    chatLines: 'Chat Satırları',
    font: 'Font',
    width: 'Genişlik',
    height: 'Yükseklik',
    line: 'Satır Aralığı',
    bgOpacity: 'Arkaplan Opaklık',
    showTime: 'Saati göster',
    savePng: 'PNG Kaydet',
    ready: 'Hazır',
    chatPngDone: 'Chat PNG kaydedildi',
  },
  en: {
    title: 'droit',
    subtitle: 'GTA WORLD TR',
    lang: 'Language',
    theme: 'Theme',
    chatLines: 'Chat Lines',
    font: 'Font',
    width: 'Width',
    height: 'Height',
    line: 'Line Height',
    bgOpacity: 'Background Opacity',
    showTime: 'Show time',
    savePng: 'Save PNG',
    ready: 'Ready',
    chatPngDone: 'Chat PNG exported',
  },
}

function getLineColor(line) {
  if (/\(\(\s*\((\d+)\)\s*.*:\s*(OOC CHAT|FOOC Chat)\s*\)\)/i.test(line)) return '#b9beca'
  if (/^\*{6,}\s*ACİL ÇAĞRI/i.test(line) || /^\*\s*(Çağrı Numarası|Telefon Numarası|Konum|Durum):/i.test(line)) return CHAT_COLORS.blue
  if (/\[John Doe İnterkom\]/i.test(line)) return CHAT_COLORS.blue
  if (/\(\(\s*(Gelen PM|Giden PM)/i.test(line)) return CHAT_COLORS.yellow
  if (/^\s*\*\*/.test(line) || /\*\*\s*\[S:\s*\d+\s*\|\s*CH:/i.test(line)) return CHAT_COLORS.yellow
  if (/\[Mikrofon\]|\[Megafon\]|\(Telefon\)|\(iFruit 15\)|\[\s*DAO\s*->\s*LSSD\s*\]|\[\s*LSSD\s*->\s*DAO\s*\]/i.test(line)) return CHAT_COLORS.yellow
  if (/^\*|^>/i.test(line) || /\(\(.*\)\)/.test(line)) return CHAT_COLORS.violet
  if (/(adlı kişi sana|kişisine .* verdin|Transfer başarıyla tamamlandı|\[BİLGİ\]|Hapisten çıkmana)/i.test(line)) return CHAT_COLORS.green
  if (/\[CK\]|\[HATA\]|öldürüldü|Mülkün içerisinde Telefon/i.test(line)) return CHAT_COLORS.red
  if (/\[CASHTAP\]|Metamfetamin|MDMA|gösterdin|Interiordan düşme|ANTI-FALL/i.test(line)) return CHAT_COLORS.cyan
  if (/Mülke Telefon|Mülkün içerisinden|Araca KARTVİZİT|Araçtan .*KARTVİZİT|BİLGİ: Plastik Torba/i.test(line)) return CHAT_COLORS.orange
  if (/kısık sesle|fısıldar/i.test(line)) return '#d4d4d4'
  return CHAT_COLORS.white
}

function parseSampChat(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const timeMatch = line.match(TIME_RE)
      const time = timeMatch ? timeMatch[0].replace('[', '').replace(']', '') : ''
      const clean = line.replace(TIME_RE, '').trim()
      const m = clean.match(/^([^:]{1,64}):\s*(.+)$/)
      return {
        id: `${idx}-${Date.now()}`,
        author: m ? m[1] : 'Server',
        msg: m ? m[2] : clean,
        time,
        raw: clean,
        color: getLineColor(clean),
        hasColonFormat: Boolean(m),
      }
    })
}

function parseInlineColorSegments(text, baseColor) {
  const re = /!\{(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\}/g
  const out = []
  let currentColor = baseColor
  let lastIdx = 0
  let match = re.exec(text)
  while (match) {
    if (match.index > lastIdx) {
      out.push({ text: text.slice(lastIdx, match.index), color: currentColor })
    }
    currentColor = match[1]
    lastIdx = re.lastIndex
    match = re.exec(text)
  }
  if (lastIdx < text.length) {
    out.push({ text: text.slice(lastIdx), color: currentColor })
  }
  return out
}

function App() {
  const [lang, setLang] = useState('tr')
  const [themeMode, setThemeMode] = useState('warm-light')
  const t = I18N[lang]

  const [chatText, setChatText] = useState(CHAT_PRESETS.tr)
  const [fontSize, setFontSize] = useState(19)
  const [lineHeight, setLineHeight] = useState(1.2)
  const [chatWidth, setChatWidth] = useState(860)
  const [chatHeight, setChatHeight] = useState(420)
  const [bgOpacity, setBgOpacity] = useState(0)
  const [showTime, setShowTime] = useState(true)
  const [status, setStatus] = useState(I18N.tr.ready)
  const [stylePreset, setStylePreset] = useState('classic')
  const [exportProfile, setExportProfile] = useState('discord')
  const [activeLine, setActiveLine] = useState(0)
  const [highlightColor, setHighlightColor] = useState('#ffd633')
  const [recentItems, setRecentItems] = useState(() => {
    try {
      const raw = localStorage.getItem('droit_chat_recent_v1')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.slice(0, 8) : []
    } catch {
      return []
    }
  })

  const chatRef = useRef(null)
  const textAreaRef = useRef(null)
  const rows = useMemo(() => parseSampChat(chatText), [chatText])
  const STORAGE_KEY = 'droit_chat_recent_v1'

  const parseLines = (text) => text.split(/\r?\n/)
  const joinLines = (lines) => lines.join('\n')

  const lineFromCursor = () => {
    const el = textAreaRef.current
    if (!el) return 0
    return el.value.slice(0, el.selectionStart).split(/\r?\n/).length - 1
  }

  const updateActiveLine = () => setActiveLine(Math.max(0, lineFromCursor()))

  const moveLine = (dir) => {
    const lines = parseLines(chatText)
    const idx = Math.max(0, Math.min(activeLine, lines.length - 1))
    const target = idx + dir
    if (target < 0 || target >= lines.length) return
    ;[lines[idx], lines[target]] = [lines[target], lines[idx]]
    setChatText(joinLines(lines))
    setActiveLine(target)
  }

  const duplicateLine = () => {
    const lines = parseLines(chatText)
    const idx = Math.max(0, Math.min(activeLine, lines.length - 1))
    lines.splice(idx + 1, 0, lines[idx] || '')
    setChatText(joinLines(lines))
    setActiveLine(idx + 1)
  }

  const deleteLine = () => {
    const lines = parseLines(chatText)
    if (!lines.length) return
    const idx = Math.max(0, Math.min(activeLine, lines.length - 1))
    lines.splice(idx, 1)
    setChatText(joinLines(lines))
    setActiveLine(Math.max(0, Math.min(idx, lines.length - 1)))
  }

  const normalizeChatText = () => {
    const normalized = parseLines(chatText)
      .map((line) => line.trim().replace(/\s{2,}/g, ' '))
      .filter(Boolean)
      .map((line) => line.replace(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+/, '[$1] '))
      .join('\n')
    setChatText(normalized)
  }

  const removeDuplicateLines = () => {
    const seen = new Set()
    const unique = parseLines(chatText).filter((line) => {
      const key = line.trim()
      if (!key) return false
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    setChatText(joinLines(unique))
  }

  const applyColorToSelection = () => {
    const el = textAreaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) return
    const openTag = `!{${highlightColor}}`
    const closeTag = '!{#F0F0F0}'
    const next =
      chatText.slice(0, start) +
      openTag +
      chatText.slice(start, end) +
      closeTag +
      chatText.slice(end)
    setChatText(next)
    requestAnimationFrame(() => {
      el.focus()
      const nextStart = start + openTag.length
      const nextEnd = nextStart + (end - start)
      el.setSelectionRange(nextStart, nextEnd)
    })
  }

  const applyStylePreset = (key) => {
    setStylePreset(key)
    const preset = STYLE_PRESETS[key]
    if (!preset) return
    setFontSize(preset.fontSize)
    setLineHeight(preset.lineHeight)
    setBgOpacity(preset.bgOpacity)
  }

  const applyExportProfile = (key) => {
    setExportProfile(key)
    const preset = EXPORT_PROFILES[key]
    if (!preset) return
    setChatWidth(preset.width)
    setChatHeight(preset.height)
  }

  const saveRecent = () => {
    const now = new Date().toISOString()
    const item = {
      id: `${Date.now()}`,
      name: `${lang.toUpperCase()} - ${now.slice(11, 19)}`,
      text: chatText,
      stylePreset,
      exportProfile,
      createdAt: now,
    }
    const next = [item, ...recentItems.filter((x) => x.text !== chatText)].slice(0, 8)
    setRecentItems(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const loadRecent = (id) => {
    const item = recentItems.find((x) => x.id === id)
    if (!item) return
    setChatText(item.text)
    if (item.stylePreset) applyStylePreset(item.stylePreset)
    if (item.exportProfile) applyExportProfile(item.exportProfile)
  }

  const onExportChat = async () => {
    if (!chatRef.current) return
    const shot = await html2canvas(chatRef.current, { scale: 2, backgroundColor: null })
    const a = document.createElement('a')
    a.href = shot.toDataURL('image/png')
    a.download = 'samp-chat.png'
    a.click()
    saveRecent()
    setStatus(t.chatPngDone)
  }

  const renderColoredText = (text, baseColor) => {
    const segments = parseInlineColorSegments(text, baseColor)
    return segments.map((seg, idx) => <span key={`${idx}-${seg.color}`} style={{ color: seg.color }}>{seg.text}</span>)
  }

  return (
    <div className={`app theme-${themeMode}`}>
      <header className="header">
        <div>
          <h1 className="brand-title">{t.title}</h1>
          <p className="brand-subtitle">{t.subtitle}</p>
        </div>
        <div className="header-controls">
          <label>
            {t.lang}
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
          </label>
          <label>
            {t.theme}
            <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)}>
              <option value="warm-light">Warm</option>
              <option value="slate-dark">Slate</option>
              <option value="forest-dark">Forest</option>
            </select>
          </label>
        </div>
      </header>

      <section className="grid chat-grid">
        <div className="panel controls">
          <h2>Editor</h2>
          <div className="row3">
            <label>Style Preset
              <select value={stylePreset} onChange={(e) => applyStylePreset(e.target.value)}>
                <option value="classic">Classic</option>
                <option value="clean">Clean</option>
                <option value="stream">Stream</option>
              </select>
            </label>
            <label>Export Profile
              <select value={exportProfile} onChange={(e) => applyExportProfile(e.target.value)}>
                <option value="discord">Discord</option>
                <option value="forum">Forum</option>
                <option value="ticket">Ticket</option>
              </select>
            </label>
            <label>Recent
              <select defaultValue="" onChange={(e) => loadRecent(e.target.value)}>
                <option value="" disabled>Choose</option>
                {recentItems.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
          </div>
          <label>{t.chatLines}<textarea ref={textAreaRef} rows={14} value={chatText} onChange={(e) => setChatText(e.target.value)} onClick={updateActiveLine} onKeyUp={updateActiveLine} /></label>
          <div className="actions actions-muted">
            <button className="btn btn-ghost" onClick={() => setChatText(CHAT_PRESETS[lang])}>Preset</button>
            <button className="btn btn-ghost" onClick={() => setChatText('')}>Temizle</button>
            <button className="btn btn-ghost" onClick={normalizeChatText}>Normalize</button>
            <button className="btn btn-ghost" onClick={removeDuplicateLines}>Çiftleri Temizle</button>
            <button className="btn btn-ghost" onClick={saveRecent}>Save Recent</button>
          </div>
          <div className="actions actions-muted">
            <button className="btn btn-ghost" onClick={() => moveLine(-1)}>Line Up</button>
            <button className="btn btn-ghost" onClick={() => moveLine(1)}>Line Down</button>
            <button className="btn btn-ghost" onClick={duplicateLine}>Duplicate</button>
            <button className="btn btn-ghost" onClick={deleteLine}>Delete Line</button>
            <span className="line-indicator">Line: {activeLine + 1}</span>
          </div>
          <div className="row3">
            <label>{t.font}<input type="number" min="12" max="30" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} /></label>
            <label>{t.width}<input type="number" min="500" max="1300" value={chatWidth} onChange={(e) => setChatWidth(Number(e.target.value))} /></label>
            <label>{t.height}<input type="number" min="220" max="800" value={chatHeight} onChange={(e) => setChatHeight(Number(e.target.value))} /></label>
          </div>
          <div className="row3">
            <label>{t.line}<input type="number" min="1" max="1.9" step="0.05" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} /></label>
            <label>{t.bgOpacity}<input type="number" min="0" max="0.9" step="0.05" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} /></label>
            <label className="check"><input type="checkbox" checked={showTime} onChange={(e) => setShowTime(e.target.checked)} />{t.showTime}</label>
          </div>
          <div className="actions"><button className="btn btn-primary" onClick={onExportChat}>{t.savePng}</button></div>
        </div>

        <div className="panel preview-wrap">
          <h2>Preview</h2>
          <div className="color-tools">
            <div className="quick-colors">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c.key}
                  className={`btn btn-ghost quick-color ${highlightColor.toLowerCase() === c.value.toLowerCase() ? 'is-active' : ''}`}
                  onClick={() => setHighlightColor(c.value)}
                >
                  <span className="quick-dot" style={{ background: c.value }} />
                  {c.label}
                </button>
              ))}
            </div>
            <div className="actions">
              <input type="color" value={highlightColor} onChange={(e) => setHighlightColor(e.target.value)} />
              <button className="btn btn-primary" onClick={applyColorToSelection}>Seçileni Renklendir</button>
            </div>
          </div>
          <div className="samp-box" ref={chatRef} style={{ width: `${chatWidth}px`, minHeight: `${chatHeight}px`, fontSize: `${fontSize}px`, lineHeight, background: `rgba(0,0,0,${bgOpacity})` }}>
            {rows.map((r) => (
              <p key={r.id} className="samp-line" style={{ color: r.color }}>
                {showTime && r.time && <span className="time">[{r.time}] </span>}
                {r.hasColonFormat
                  ? <><span className="name">{r.author}:</span> <span>{renderColoredText(r.msg, r.color)}</span></>
                  : <span>{renderColoredText(r.raw, r.color)}</span>}
              </p>
            ))}
          </div>
        </div>
      </section>

      <footer className="status">{status}</footer>
    </div>
  )
}

export default App



