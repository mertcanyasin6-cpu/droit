import { useMemo, useRef, useState, useEffect } from 'react'
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
  { key: 'me', label: 'ME / DO', value: '#C2A2DA' },
  { key: 'white', label: 'Beyaz', value: '#F0F0F0' },
  { key: 'gray', label: 'Gri (OOC)', value: '#B9BECA' },
  { key: 'yellow', label: 'Sarı (Telsiz)', value: '#FFD633' },
]

const I18N = {
  tr: {
    title: 'droit',
    subtitle: 'GTA WORLD TR',
    lang: 'Dil',
    theme: 'Tema',
    chatLines: 'Chat Satırları',
    font: 'Yazı Boyutu',
    width: 'Genişlik',
    height: 'Yükseklik',
    line: 'Satır Aralığı',
    bgOpacity: 'Kutu Opaklığı',
    showTime: 'Saati Göster',
    savePng: 'PNG Kaydet',
    ready: 'Hazır',
    chatPngDone: 'Chat PNG kaydedildi',
    editorTab: '📝 Editör',
    appearanceTab: '🎨 Görünüm',
    backgroundTab: '🖼️ Arka Plan (SS)',
    fontFamily: 'Yazı Tipi',
    shadowStyle: 'Dış Çizgi / Gölge',
    censorSelected: 'Seçileni Sansürle',
    uploadSs: 'Görsel Yükle (Sürükle veya Tıkla)',
    posX: 'Yatay Konum (X)',
    posY: 'Dikey Konum (Y)',
    exportCombined: 'SS ile Birleştirip Kaydet',
    exportChat: 'Sadece Şeffaf Chat Kaydet',
    resetPosition: 'Pozisyonu Sıfırla',
    lineVisibility: 'Satır Görünürlüğü',
    visible: 'Açık',
    hidden: 'Gizli',
    outlineNone: 'Gölgesiz',
    outlineClassic: 'Klasik Gölge',
    outlineBorder1: 'İnce Outline (1px)',
    outlineBorder2: 'Kalın Outline (2px)',
    clearImage: 'Görseli Kaldır',
    cleanChat: 'Temizle',
    normalize: 'Normalize',
    clearDuplicates: 'Çiftleri Temizle',
    saveRecent: 'Kaydet',
    preset: 'Sıfırla',
    smartClean: 'Akıllı Temizle 🧹',
    wizardTitle: 'Sihirbaz (RP Satırları)',
    watermarkTitle: 'Filigran (Watermark) & Logolar',
    watermarkType: 'Logo Tipi',
    watermarkPos: 'Logo Konumu',
    watermarkScale: 'Logo Boyutu',
    uploadLogo: 'Özel Logo Yükle (.png)',
    removeLogo: 'Logoyu Kaldır',
    dragTip: '💡 İpucu: Arka plan görseli aktifken chat kutusunu mouse ile sürükleyerek taşıyabilirsiniz!',
    autoCensorLabel: 'Otomatik Sansür (Kelimeler/İsimler)',
    autoCensorPlaceholder: 'örn: Tariq Sharp, Percival, polisler (virgülle ayırın)',
  },
  en: {
    title: 'droit',
    subtitle: 'GTA WORLD TR',
    lang: 'Language',
    theme: 'Theme',
    chatLines: 'Chat Lines',
    font: 'Font Size',
    width: 'Width',
    height: 'Height',
    line: 'Line Height',
    bgOpacity: 'Box Opacity',
    showTime: 'Show Time',
    savePng: 'Save PNG',
    ready: 'Ready',
    chatPngDone: 'Chat PNG exported',
    editorTab: '📝 Editor',
    appearanceTab: '🎨 Styling',
    backgroundTab: '🖼️ Background (SS)',
    fontFamily: 'Font Family',
    shadowStyle: 'Text Outline / Shadow',
    censorSelected: 'Censor Selected',
    uploadSs: 'Upload Screenshot (Drag & Drop)',
    posX: 'Horizontal Pos (X)',
    posY: 'Vertical Pos (Y)',
    exportCombined: 'Save Merged Screenshot',
    exportChat: 'Save Transparent Chat',
    resetPosition: 'Reset Position',
    lineVisibility: 'Line Visibility',
    visible: 'Visible',
    hidden: 'Hidden',
    outlineNone: 'No Shadow',
    outlineClassic: 'Classic Shadow',
    outlineBorder1: 'Thin Outline (1px)',
    outlineBorder2: 'Thick Outline (2px)',
    clearImage: 'Remove Image',
    cleanChat: 'Clear',
    normalize: 'Normalize',
    clearDuplicates: 'Clear Duplicates',
    saveRecent: 'Save',
    preset: 'Reset',
    smartClean: 'Smart Clean 🧹',
    wizardTitle: 'Wizard (RP Lines Injector)',
    watermarkTitle: 'Watermark & Logos',
    watermarkType: 'Logo Type',
    watermarkPos: 'Logo Position',
    watermarkScale: 'Logo Scale',
    uploadLogo: 'Upload Custom Logo (.png)',
    removeLogo: 'Remove Logo',
    dragTip: '💡 Tip: You can drag the chat box directly with your mouse when a background image is loaded!',
    autoCensorLabel: 'Auto-Censor (Words/Names)',
    autoCensorPlaceholder: 'e.g. Tariq Sharp, Percival, police (comma separated)',
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

function autoBlurText(text, censorListStr) {
  if (!censorListStr || !censorListStr.trim()) return text
  
  const words = censorListStr.split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    
  if (words.length === 0) return text
  
  let result = text
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  for (const word of words) {
    const escaped = escapeRegExp(word)
    const boundary = /^[a-zA-Z0-9_]+$/.test(word) ? '\\b' : ''
    const regex = new RegExp(`(${boundary}${escaped}${boundary})`, 'gi')
    
    result = result.replace(regex, (match, p1, offset, string) => {
      // Avoid wrapping inside existing tags e.g. !{blur} or !{color}
      const before = string.slice(0, offset)
      const openTagsCount = (before.match(/!\{/g) || []).length
      const closeTagsCount = (before.match(/\}/g) || []).length
      if (openTagsCount > closeTagsCount) {
        return match
      }
      return `!{blur}${match}!{/blur}`
    })
  }
  return result
}

function parseSampChat(text, autoCensorWords = '') {
  const censuredText = autoBlurText(text, autoCensorWords)
  return censuredText
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
  const re = /(?:!\{(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))\})|(?:\{([0-9a-fA-F]{6})\})|(?:!\{(blur)\})|(?:!\{(\/blur)\})/g
  const out = []
  let currentColor = baseColor
  let isBlurred = false
  let lastIdx = 0
  let match
  
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIdx) {
      out.push({ 
        text: text.slice(lastIdx, match.index), 
        color: currentColor,
        blur: isBlurred
      })
    }
    if (match[1]) {
      currentColor = match[1]
    } else if (match[2]) {
      currentColor = `#${match[2]}`
    } else if (match[3]) {
      isBlurred = true
    } else if (match[4]) {
      isBlurred = false
    }
    lastIdx = re.lastIndex
  }
  if (lastIdx < text.length) {
    out.push({ 
      text: text.slice(lastIdx), 
      color: currentColor,
      blur: isBlurred
    })
  }
  return out
}

function App() {
  const [lang, setLang] = useState('tr')
  const [themeMode, setThemeMode] = useState('slate-dark')
  const [activeTab, setActiveTab] = useState('editor')
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
  const [fontFamily, setFontFamily] = useState('Tahoma')
  const [shadowStyle, setShadowStyle] = useState('classic')
  const [hiddenLines, setHiddenLines] = useState([])
  const [bgImage, setBgImage] = useState(null)
  const [posX, setPosX] = useState(30)
  const [posY, setPosY] = useState(30)
  const [exportTransparent, setExportTransparent] = useState(true)

  // Dragging states
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  // Faction Logos and Watermarks
  const [watermarkType, setWatermarkType] = useState('none')
  const [watermarkPos, setWatermarkPos] = useState('bottom-right')
  const [watermarkScale, setWatermarkScale] = useState(1.0)
  const [customLogo, setCustomLogo] = useState(null)

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

  const [autoCensorWords, setAutoCensorWords] = useState(() => {
    try {
      return localStorage.getItem('droit_auto_censor_v1') || ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('droit_auto_censor_v1', autoCensorWords)
    } catch (e) {
      console.error(e)
    }
  }, [autoCensorWords])

  const chatContainerRef = useRef(null) // Only text container for transparent export
  const viewportRef = useRef(null) // Holds screenshot + text + watermark for merged capture
  const textAreaRef = useRef(null)
  const rows = useMemo(() => parseSampChat(chatText, autoCensorWords), [chatText, autoCensorWords])
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

  const getSelectionLineBaseColor = (startIdx) => {
    const lines = parseLines(chatText)
    let charCount = 0
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1
      if (startIdx < charCount) {
        return getLineColor(lines[i])
      }
    }
    return '#f2f2f2'
  }

  const applyColorToSelection = () => {
    const el = textAreaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) return
    const baseColor = getSelectionLineBaseColor(start)
    const openTag = `!{${highlightColor}}`
    const closeTag = `!{${baseColor}}`
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

  const applyCensorshipToSelection = () => {
    const el = textAreaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    if (start === end) return
    const openTag = '!{blur}'
    const closeTag = '!{/blur}'
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

  // Keyboard Hotkey Listener
  useEffect(() => {
    const handleHotkeys = (e) => {
      if (document.activeElement !== textAreaRef.current) return
      
      // Ctrl + H -> Highlight
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        applyColorToSelection()
      }
      
      // Ctrl + Shift + C -> Censor
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        applyCensorshipToSelection()
      }
    }
    window.addEventListener('keydown', handleHotkeys)
    return () => window.removeEventListener('keydown', handleHotkeys)
  }, [chatText, highlightColor])

  // Mouse Dragging Handlers
  const handleMouseDown = (e) => {
    if (!bgImage) return
    // Prevent dragging if clicking input elements or selections
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - posX,
      y: e.clientY - posY,
    }
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    // Bound the dragging inside the typical canvas limits
    const newX = Math.max(0, Math.min(e.clientX - dragStart.current.x, 850))
    const newY = Math.max(0, Math.min(e.clientY - dragStart.current.y, 450))
    setPosX(newX)
    setPosY(newY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Smart Log Cleaner
  const cleanLogJunk = () => {
    const lines = parseLines(chatText)
    const cleaned = lines.filter((line) => {
      const cl = line.trim()
      if (!cl) return false
      // GTA World Server OOC adverts, warnings, Paydays, connections
      if (/Sunucuya hoşgeldiniz|Welcome to GTA World|GTA:World/i.test(cl)) return false
      if (/Sunucuyla bağlantı|Connected to|Connection/i.test(cl)) return false
      if (/PAYDAY|Maaş günü|Paycheck|Banka hesabınıza|bank account/i.test(cl)) return false
      if (/^\s*\[İLAN\]|^\s*\[AD\]|^\s*İlan veren:/i.test(cl)) return false
      if (/YARDIM:|HELP:|İpucu:|Tip:/i.test(cl)) return false
      if (/^\s*\*\*\s+Admin|^\s*\*\*\s+Sunucu/i.test(cl)) return false
      if (/^\s*\[Rapor\]|^\s*\[Report\]/i.test(cl)) return false
      if (/^\s*\[Sistem\]|^\s*\[System\]/i.test(cl)) return false
      if (/giriş yaptı|has logged in|çıkış yaptı|has logged out/i.test(cl)) return false
      if (/destek ekibi|support team|/i.test(cl) && cl.includes('Sunucu')) return false
      if (/\[BİLGİ\]/i.test(cl) && (cl.includes('aracını') || cl.includes('kilitledin') || cl.includes('park etti'))) return false
      if (/^\s*\*+.*?Sunucu yetkilisi/i.test(cl)) return false
      return true
    })
    setChatText(joinLines(cleaned))
    setStatus('Junk loglar temizlendi 🧹')
  }

  // Inject RP Template lines at cursor
  const injectTemplate = (type) => {
    const el = textAreaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    
    let template = ''
    switch (type) {
      case 'me':
        template = `* John Doe `
        break
      case 'do':
        template = `*  (( John Doe ))`
        break
      case 'radio':
        template = `[Telsiz] John Doe diyor ki: `
        break
      case 'phone':
        template = `[Telefon] Gelen SMS:  (Gönderen: John Doe)`
        break
      default:
        break
    }
    
    const next = chatText.slice(0, start) + template + chatText.slice(end)
    setChatText(next)
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + template.length
      el.setSelectionRange(newPos, newPos)
      updateActiveLine()
    })
  }

  const toggleLineVisibility = (idx) => {
    if (hiddenLines.includes(idx)) {
      setHiddenLines(hiddenLines.filter((x) => x !== idx))
    } else {
      setHiddenLines([...hiddenLines, idx])
    }
  }

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBgImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCustomLogo(event.target.result)
        setWatermarkType('custom')
      }
      reader.readAsDataURL(file)
    }
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
    if (!exportTransparent && viewportRef.current && bgImage) {
      setStatus('Birleştiriliyor...')
      const shot = await html2canvas(viewportRef.current, { scale: 2, backgroundColor: null })
      const a = document.createElement('a')
      a.href = shot.toDataURL('image/png')
      a.download = 'merged-screenshot.png'
      a.click()
      saveRecent()
      setStatus(t.chatPngDone)
    } else if (chatContainerRef.current) {
      setStatus('Şeffaf dışa aktarılıyor...')
      const shot = await html2canvas(chatContainerRef.current, { scale: 2, backgroundColor: null })
      const a = document.createElement('a')
      a.href = shot.toDataURL('image/png')
      a.download = 'samp-chat.png'
      a.click()
      saveRecent()
      setStatus(t.chatPngDone)
    }
  }

  const renderColoredText = (text, baseColor) => {
    const segments = parseInlineColorSegments(text, baseColor)
    return segments.map((seg, idx) => (
      <span 
        key={`${idx}-${seg.color}`} 
        style={{ color: seg.color }}
        className={seg.blur ? 'blurred-text' : ''}
      >
        {seg.text}
      </span>
    ))
  }

  const getShadowClass = () => {
    switch (shadowStyle) {
      case 'none':
        return 'shadow-none'
      case 'classic':
        return 'shadow-classic'
      case 'outline-1px':
        return 'shadow-outline'
      case 'outline-2px':
        return 'shadow-thick'
      default:
        return 'shadow-classic'
    }
  }

  // Pre-configured SVGs for Watermarks
  const renderWatermarkSvg = () => {
    const style = {
      transform: `scale(${watermarkScale})`,
      transformOrigin: watermarkPos.includes('right') ? 'right bottom' : 'left bottom',
    }

    if (watermarkType === 'custom' && customLogo) {
      return <img src={customLogo} alt="Custom Logo" className="watermark-logo-img" style={style} />
    }

    switch (watermarkType) {
      case 'gtaworld':
        return (
          <div className="watermark-logo-gtaw" style={style}>
            <span className="logo-gta">gta:</span>
            <span className="logo-world">world</span>
            <span className="logo-pill">TR</span>
          </div>
        )
      case 'lspd':
        return (
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none" className="watermark-logo-svg" style={style}>
            <polygon points="32,2 58,16 50,48 32,62 14,48 6,16" fill="#1e3a8a" stroke="#d97706" strokeWidth="2" />
            <polygon points="32,8 52,18 46,44 32,54 18,44 12,18" fill="#101e42" />
            <circle cx="32" cy="30" r="12" fill="#d97706" />
            <path d="M32,24 L35,29 L41,30 L37,34 L38,40 L32,37 L26,40 L27,34 L23,30 L29,29 Z" fill="#101e42" />
            <text x="32" y="50" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="monospace">L.P.D.</text>
          </svg>
        )
      case 'lssd':
        return (
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none" className="watermark-logo-svg" style={style}>
            <path d="M32,2 L37,17 L52,12 L44,26 L58,34 L42,38 L48,53 L34,44 L32,60 L30,44 L16,53 L22,38 L6,34 L20,26 L12,12 L27,17 Z" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="14" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="10" fill="#d97706" />
            <text x="32" y="34" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="900" fontFamily="sans-serif">★</text>
            <text x="32" y="49" textAnchor="middle" fill="#d97706" fontSize="5" fontWeight="bold" fontFamily="monospace">SHERIFF</text>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`app theme-${themeMode}`}>
      <header className="header">
        <div className="header-brand">
          <h1 className="brand-title">{t.title}</h1>
          <p className="brand-subtitle">{t.subtitle}</p>
        </div>
        <div className="header-controls">
          <label className="header-label">
            {t.lang}
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="header-select">
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
          </label>
          <label className="header-label">
            {t.theme}
            <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} className="header-select">
              <option value="slate-dark">Slate</option>
              <option value="forest-dark">Forest</option>
              <option value="warm-light">Warm</option>
            </select>
          </label>
        </div>
      </header>

      <section className="grid chat-grid">
        {/* Left Side: Control Panel with Tabs */}
        <div className="panel controls">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'editor' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              {t.editorTab}
            </button>
            <button
              className={`tab-btn ${activeTab === 'styling' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('styling')}
            >
              {t.appearanceTab}
            </button>
            <button
              className={`tab-btn ${activeTab === 'overlay' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('overlay')}
            >
              {t.backgroundTab}
            </button>
          </div>

          <div className="tab-content">
            {/* TAB 1: METIN EDITORU */}
            {activeTab === 'editor' && (
              <div className="tab-pane animate-fade-in">
                <div className="row3">
                  <label>Preset
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
                      {recentItems.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="editor-input-wrap">
                  <label className="text-area-label">
                    {t.chatLines}
                    <textarea
                      ref={textAreaRef}
                      rows={10}
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      onClick={updateActiveLine}
                      onKeyUp={updateActiveLine}
                      className="main-textarea"
                      placeholder="chatlog.txt satırlarını buraya yapıştırın..."
                    />
                  </label>
                </div>

                {/* Hotkey Reminder */}
                <div className="hotkey-reminder">
                  <span>Ctrl+H: Renklendir | Ctrl+Shift+C: Sansürle</span>
                </div>

                {/* Smart clean & template actions */}
                <div className="actions actions-muted">
                  <button className="btn btn-ghost" onClick={() => setChatText(CHAT_PRESETS[lang])}>
                    {t.preset}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setChatText('')}>
                    {t.cleanChat}
                  </button>
                  <button className="btn btn-ghost btn-primary" onClick={cleanLogJunk}>
                    {t.smartClean}
                  </button>
                  <button className="btn btn-ghost" onClick={normalizeChatText}>
                    {t.normalize}
                  </button>
                  <button className="btn btn-ghost" onClick={removeDuplicateLines}>
                    {t.clearDuplicates}
                  </button>
                  <button className="btn btn-ghost" onClick={saveRecent}>
                    {t.saveRecent}
                  </button>
                </div>

                {/* Line Operations */}
                <div className="actions actions-muted line-operations">
                  <button className="btn btn-icon btn-ghost" onClick={() => moveLine(-1)} title="Line Up">⬆️</button>
                  <button className="btn btn-icon btn-ghost" onClick={() => moveLine(1)} title="Line Down">⬇️</button>
                  <button className="btn btn-ghost" onClick={duplicateLine}>Klonla</button>
                  <button className="btn btn-ghost" onClick={deleteLine}>Sil</button>
                  <span className="line-indicator">Line: {activeLine + 1}</span>
                </div>

                {/* RP Line Wizard */}
                <div className="rp-wizard-container">
                  <h4>{t.wizardTitle}</h4>
                  <div className="wizard-actions">
                    <button className="btn btn-ghost btn-small" onClick={() => injectTemplate('me')}>+ /me</button>
                    <button className="btn btn-ghost btn-small" onClick={() => injectTemplate('do')}>+ /do</button>
                    <button className="btn btn-ghost btn-small" onClick={() => injectTemplate('radio')}>+ Telsiz</button>
                    <button className="btn btn-ghost btn-small" onClick={() => injectTemplate('phone')}>+ Telefon</button>
                  </div>
                </div>

                {/* Auto Censor Word List */}
                <div className="auto-censor-container" style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--line)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <span>🔒 {t.autoCensorLabel}</span>
                  </h4>
                  <input
                    type="text"
                    value={autoCensorWords}
                    onChange={(e) => setAutoCensorWords(e.target.value)}
                    placeholder={t.autoCensorPlaceholder}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '0.8rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>

                {/* Line Visibility List */}
                <div className="line-visibility-container">
                  <h3>{t.lineVisibility}</h3>
                  <div className="line-visibility-list">
                    {rows.map((row, idx) => (
                      <div key={row.id} className="line-visibility-item">
                        <button
                          className={`btn-visibility ${hiddenLines.includes(idx) ? 'is-hidden' : ''}`}
                          onClick={() => toggleLineVisibility(idx)}
                          title={hiddenLines.includes(idx) ? t.hidden : t.visible}
                        >
                          {hiddenLines.includes(idx) ? '❌' : '👁️'}
                        </button>
                        <span className="line-preview-text" style={{ color: row.color }}>
                          {row.time ? `[${row.time}] ` : ''}
                          {row.hasColonFormat ? `${row.author}: ${row.msg}` : row.raw}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GORUNUM AYARLARI */}
            {activeTab === 'styling' && (
              <div className="tab-pane animate-fade-in styling-tab">
                <div className="styling-group">
                  <label className="styling-label">
                    <span>{t.fontFamily}</span>
                    <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                      <option value="Tahoma">Tahoma (Authentic SAMP)</option>
                      <option value="Arial">Arial</option>
                      <option value="Courier New">Courier New (Console)</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </label>
                </div>

                <div className="styling-group">
                  <label className="styling-label">
                    <span>{t.shadowStyle}</span>
                    <select value={shadowStyle} onChange={(e) => setShadowStyle(e.target.value)}>
                      <option value="none">{t.outlineNone}</option>
                      <option value="classic">{t.outlineClassic}</option>
                      <option value="outline-1px">{t.outlineBorder1}</option>
                      <option value="outline-2px">{t.outlineBorder2}</option>
                    </select>
                  </label>
                </div>

                <div className="styling-slider-group">
                  <div className="slider-header">
                    <span>{t.font}</span>
                    <span className="slider-value">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="30"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="styled-slider"
                  />
                </div>

                <div className="styling-slider-group">
                  <div className="slider-header">
                    <span>{t.line}</span>
                    <span className="slider-value">{lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="styled-slider"
                  />
                </div>

                <div className="styling-slider-group">
                  <div className="slider-header">
                    <span>{t.bgOpacity}</span>
                    <span className="slider-value">{Math.round(bgOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.05"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                    className="styled-slider"
                  />
                </div>

                <div className="row2">
                  <label className="styling-label">
                    <span>{t.width}</span>
                    <input
                      type="number"
                      min="400"
                      max="1920"
                      value={chatWidth}
                      onChange={(e) => setChatWidth(Number(e.target.value))}
                    />
                  </label>
                  <label className="styling-label">
                    <span>{t.height}</span>
                    <input
                      type="number"
                      min="200"
                      max="1080"
                      value={chatHeight}
                      onChange={(e) => setChatHeight(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="styling-checkbox-group">
                  <label className="check styled-check">
                    <input
                      type="checkbox"
                      checked={showTime}
                      onChange={(e) => setShowTime(e.target.checked)}
                    />
                    <span>{t.showTime}</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 3: ARKA PLAN / OVERLAY */}
            {activeTab === 'overlay' && (
              <div className="tab-pane animate-fade-in overlay-tab">
                {/* Screenshot Uploader */}
                <div className="upload-container">
                  <div
                    className="upload-dropzone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <label style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgImageUpload}
                        style={{ display: 'none' }}
                      />
                      <div className="dropzone-text">
                        <span className="dropzone-icon">📷</span>
                        <span>{t.uploadSs}</span>
                      </div>
                    </label>
                  </div>
                  {bgImage && (
                    <button className="btn btn-danger btn-small" onClick={() => setBgImage(null)}>
                      {t.clearImage}
                    </button>
                  )}
                </div>

                {bgImage && (
                  <div className="drag-help-box animate-fade-in">
                    <span>{t.dragTip}</span>
                  </div>
                )}

                {/* Watermark Section */}
                <div className="watermark-options-panel">
                  <h4>{t.watermarkTitle}</h4>
                  <div className="row2">
                    <label>{t.watermarkType}
                      <select value={watermarkType} onChange={(e) => setWatermarkType(e.target.value)}>
                        <option value="none">Yok</option>
                        <option value="gtaworld">GTA World TR</option>
                        <option value="lspd">LSPD Badge</option>
                        <option value="lssd">LSSD Star</option>
                        <option value="custom">Özel Yükle</option>
                      </select>
                    </label>
                    <label>{t.watermarkPos}
                      <select value={watermarkPos} onChange={(e) => setWatermarkPos(e.target.value)}>
                        <option value="bottom-right">Sağ Alt</option>
                        <option value="bottom-left">Sol Alt</option>
                        <option value="top-right">Sağ Üst</option>
                        <option value="top-left">Sol Üst</option>
                      </select>
                    </label>
                  </div>

                  <div className="styling-slider-group">
                    <div className="slider-header">
                      <span>{t.watermarkScale}</span>
                      <span className="slider-value">{watermarkScale.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={watermarkScale}
                      onChange={(e) => setWatermarkScale(Number(e.target.value))}
                      className="styled-slider"
                    />
                  </div>

                  {watermarkType === 'custom' && (
                    <div className="custom-logo-uploader">
                      <label className="btn btn-ghost btn-small text-center">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                        {t.uploadLogo}
                      </label>
                      {customLogo && (
                        <button className="btn btn-danger btn-small" onClick={() => setCustomLogo(null)}>
                          {t.removeLogo}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {bgImage && (
                  <div className="overlay-controls animate-fade-in">
                    <div className="styling-slider-group">
                      <div className="slider-header">
                        <span>{t.posX}</span>
                        <span className="slider-value">{posX}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="800"
                        value={posX}
                        onChange={(e) => setPosX(Number(e.target.value))}
                        className="styled-slider"
                      />
                    </div>

                    <div className="styling-slider-group">
                      <div className="slider-header">
                        <span>{t.posY}</span>
                        <span className="slider-value">{posY}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="600"
                        value={posY}
                        onChange={(e) => setPosY(Number(e.target.value))}
                        className="styled-slider"
                      />
                    </div>

                    <div className="actions">
                      <button className="btn btn-ghost" onClick={() => { setPosX(30); setPosY(30); }}>
                        {t.resetPosition}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export Action Area */}
          <div className="panel-footer-actions">
            {bgImage && (
              <div className="export-mode-selector">
                <label className="check styled-check">
                  <input
                    type="checkbox"
                    checked={!exportTransparent}
                    onChange={(e) => setExportTransparent(!e.target.checked)}
                  />
                  <span>{t.exportCombined}</span>
                </label>
              </div>
            )}
            <button className="btn btn-primary btn-large btn-glow" onClick={onExportChat}>
              {exportTransparent ? t.exportChat : t.exportCombined}
            </button>
          </div>
        </div>

        {/* Right Side: Virtual Screenshot Viewport */}
        <div className="panel preview-wrap">
          <div className="preview-header">
            <h2>Preview</h2>
            {/* Color Highlight and Censorship bar */}
            <div className="color-tools">
              <div className="quick-colors">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c.key}
                    className={`btn btn-ghost quick-color ${
                      highlightColor.toLowerCase() === c.value.toLowerCase() ? 'is-active' : ''
                    }`}
                    onClick={() => setHighlightColor(c.value)}
                  >
                    <span className="quick-dot" style={{ background: c.value }} />
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="color-selection-actions">
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="color-picker-input"
                />
                <button className="btn btn-primary" onClick={applyColorToSelection}>
                  Renklendir
                </button>
                <button className="btn btn-danger" onClick={applyCensorshipToSelection}>
                  {t.censorSelected}
                </button>
              </div>
            </div>
          </div>

          {/* Draggable Viewport Canvas */}
          <div
            className={`virtual-viewport-canvas ${bgImage ? 'has-bg' : 'grid-bg'}`}
            ref={viewportRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              width: bgImage ? '960px' : '100%',
              height: bgImage ? '540px' : '450px',
            }}
          >
            {/* Draggable SAMP Box */}
            <div
              className="samp-box"
              onMouseDown={handleMouseDown}
              style={{
                width: `${chatWidth}px`,
                minHeight: `${chatHeight}px`,
                background: `rgba(0,0,0,${bgOpacity})`,
                position: bgImage ? 'absolute' : 'relative',
                left: bgImage ? `${posX}px` : 'auto',
                top: bgImage ? `${posY}px` : 'auto',
                border: bgImage ? 'none' : '1px solid var(--line)',
                padding: '14px',
                cursor: bgImage ? 'move' : 'default',
              }}
            >
              {/* Export container wrapper (ensures 100% šeffaf) */}
              <div
                className="samp-chat-export-target"
                ref={chatContainerRef}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  fontFamily: `${fontFamily}, Tahoma, Arial, sans-serif`,
                }}
              >
                {rows.map((r, idx) => {
                  if (hiddenLines.includes(idx)) return null
                  return (
                    <p key={r.id} className={`samp-line ${getShadowClass()}`} style={{ color: r.color }}>
                      {showTime && r.time && <span className="time">[{r.time}] </span>}
                      {r.hasColonFormat ? (
                        <>
                          <span className="name">{renderColoredText(r.author, r.color)}:</span>{' '}
                          <span>{renderColoredText(r.msg, r.color)}</span>
                        </>
                      ) : (
                        <span>{renderColoredText(r.raw, r.color)}</span>
                      )}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Logo Watermark Overlay */}
            {watermarkType !== 'none' && (
              <div className={`watermark-overlay-item position-${watermarkPos}`}>
                {renderWatermarkSvg()}
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="status">{status}</footer>
    </div>
  )
}

export default App
