import { Suspense, useEffect, useState } from 'react'
import { HashRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { baseUrl } from './baseUrl'
import { CiparsVaiGerbonisGame, MelisGame, MemaisSovsGame, TikTokGame, TwentyQuestionsGame } from './app/games'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const installPromptKey = 'melis-install-prompt-seen'
const homeLanguageKey = 'melis-home-language'
const placeholders = [0]

const homeCopy = {
  lv: {
    language: 'lv',
    flag: '🇬🇧',
    switchLanguage: 'Pārslēgt uz angļu valodu',
    title: 'Vakara Spēles',
    melis: 'Melis',
    charades: 'Mēmais šovs',
    questions: '20 jautājumi',
    coin: 'Lats vai gerbonis',
    tikTok: 'Tik Tok',
    comingSoon: 'Iznāks vēlāk',
  },
  en: {
    language: 'en',
    flag: '🇱🇻',
    switchLanguage: 'Switch to Latvian',
    title: 'Evening Games',
    melis: 'Spy',
    charades: 'Charades',
    questions: '20 Questions',
    coin: 'Heads or Tails',
    tikTok: 'Tic-Tac-Toe',
    comingSoon: 'Coming soon',
  },
} as const

type HomeLanguage = keyof typeof homeCopy

function GamesHub() {
  const [language, setLanguage] = useState<HomeLanguage>(() => localStorage.getItem(homeLanguageKey) === 'en' ? 'en' : 'lv')
  const copy = homeCopy[language]
  const toggleLanguage = () => {
    const nextLanguage = language === 'lv' ? 'en' : 'lv'
    localStorage.setItem(homeLanguageKey, nextLanguage)
    setLanguage(nextLanguage)
  }

  return (
    <main className="min-h-dvh bg-orange-50 px-4 py-6 text-stone-900 sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto flex min-h-[780px] w-full max-w-[430px] flex-col rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-950/10" lang={copy.language}>
        <div className="-mx-6 -mt-6 mb-6 flex justify-end rounded-t-[2rem] bg-orange-500 px-6 py-3">
          <button
            aria-label={copy.switchLanguage}
            className="rounded-xl bg-white px-3 py-1.5 text-2xl leading-none shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500"
            onClick={toggleLanguage}
            title={copy.switchLanguage}
            type="button"
          >
            <span aria-hidden="true">{copy.flag}</span>
          </button>
        </div>
        <header className="mb-8 flex items-center">
          <img className="mr-2 size-8 rounded-lg" src={`${baseUrl}icon-192.png`} alt="" />
          <h1 className="text-3xl font-black tracking-tight text-orange-500">{copy.title}</h1>
        </header>
        <div className="space-y-3">
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/melis">
            <img className="size-14 rounded-2xl" src={`${baseUrl}melis.png`} alt="" />
            <span className="text-xl font-black">{copy.melis}</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/memais-sovs">
            <img className="size-14 rounded-2xl" src={`${baseUrl}memais-sovs.png`} alt="" />
            <span className="text-xl font-black">{copy.charades}</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/20-jautajumi">
            <img className="size-14 rounded-2xl" src={`${baseUrl}20-questions.png`} alt="" />
            <span className="text-xl font-black">{copy.questions}</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/cipars-vai-gerbonis">
            <img className="size-14 rounded-full" src={`${baseUrl}coin-number.png`} alt="" />
            <span className="text-xl font-black">{copy.coin}</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/tik-tok">
            <img className="size-14 rounded-2xl" src={`${baseUrl}tik-tok.png`} alt="" />
            <span className="text-xl font-black">{copy.tikTok}</span>
          </Link>
          {placeholders.map((index) => (
            <div className="flex items-center gap-4 rounded-2xl bg-stone-100 p-4 opacity-60" key={index}>
              <img className="size-14 rounded-2xl grayscale" src={`${baseUrl}icon-192.png`} alt="" />
              <span className="text-xl font-black text-stone-500">{copy.comingSoon}</span>
            </div>
          ))}
        </div>
        <p className="mt-auto pb-3 pt-6 text-center text-xs text-orange-500">
          <a className="font-semibold" href="https://www.linkedin.com/in/matiss-judins-319235228/" target="_blank" rel="noreferrer">MatissJ</a>
        </p>
      </section>
    </main>
  )
}

function AppRoutes() {
  const navigate = useNavigate()
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installOpen, setInstallOpen] = useState(false)
  const dismissInstall = () => {
    localStorage.setItem(installPromptKey, 'true')
    setInstallOpen(false)
  }

  useEffect(() => {
    if (localStorage.getItem(installPromptKey)) return
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    if (!isIos && !isAndroid) return

    if (isIos && !window.matchMedia('(display-mode: standalone)').matches) setInstallOpen(true)
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
      setInstallOpen(true)
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  const install = async () => {
    if (!installPrompt) return dismissInstall()
    await installPrompt.prompt()
    await installPrompt.userChoice
    dismissInstall()
  }
  const onHome = () => navigate('/')

  return (
    <>
      {installOpen && (
        <div className="fixed inset-x-6 top-20 z-20 mx-auto max-w-[382px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-stone-200">
          <h2 className="text-lg font-black">Instalēt Vakara Spēles</h2>
          <p className="mt-2 text-sm leading-5 text-stone-600">{installPrompt ? 'Pievieno Vakara Spēles sākuma ekrānam ātrai piekļuvei.' : 'Safari izvēlnē nospied Kopīgot un pēc tam “Pievienot sākuma ekrānam”.'}</p>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-xl border-2 border-orange-500 py-3 font-black text-orange-500" onClick={dismissInstall}>Vēlāk</button>
            <button className="flex-1 rounded-xl bg-orange-500 py-3 font-black text-white" onClick={install}>{installPrompt ? 'Instalēt' : 'Sapratu'}</button>
          </div>
        </div>
      )}
      <Suspense fallback={<GamesHub />}>
        <Routes>
          <Route path="/" element={<GamesHub />} />
          <Route path="/games/melis" element={<MelisGame onHome={onHome} />} />
          <Route path="/games/tik-tok" element={<TikTokGame onHome={onHome} />} />
          <Route path="/games/memais-sovs" element={<MemaisSovsGame onHome={onHome} />} />
          <Route path="/games/20-jautajumi" element={<TwentyQuestionsGame onHome={onHome} />} />
          <Route path="/games/cipars-vai-gerbonis" element={<CiparsVaiGerbonisGame onHome={onHome} />} />
          <Route path="*" element={<GamesHub />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return <HashRouter><AppRoutes /></HashRouter>
}
