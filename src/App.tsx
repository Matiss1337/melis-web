import { Suspense, useEffect, useState } from 'react'
import { HashRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import { baseUrl } from './baseUrl'
import { MelisGame, MemaisSovsGame, TikTokGame } from './app/games'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const installPromptKey = 'melis-install-prompt-seen'
const placeholders = Array.from({ length: 3 }, (_, index) => index)

function GamesHub() {
  return (
    <main className="min-h-dvh bg-orange-50 px-4 py-6 text-stone-900 sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto flex min-h-[780px] w-full max-w-[430px] flex-col rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-950/10">
        <header className="mb-8 flex items-center">
          <img className="mr-2 size-8 rounded-lg" src={`${baseUrl}icon-192.png`} alt="" />
          <h1 className="text-3xl font-black tracking-tight text-orange-600">Spēles</h1>
        </header>
        <div>
          <h2 className="text-2xl font-bold">Izvēlies spēli</h2>
          <p className="mt-1 text-stone-500">Izvēlies spēli vakaram.</p>
        </div>
        <div className="mt-6 space-y-3">
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/melis">
            <img className="size-14 rounded-2xl" src={`${baseUrl}icon-192.png`} alt="" />
            <span className="text-xl font-black">Melis</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/tik-tok">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-black text-white" aria-hidden="true">X</div>
            <span className="text-xl font-black">Tik Tok</span>
          </Link>
          <Link className="flex w-full items-center gap-4 rounded-2xl bg-orange-50 p-4 ring-2 ring-orange-100 transition hover:bg-orange-100 focus:outline-none focus:ring-orange-400" to="/games/memais-sovs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-black text-white" aria-hidden="true">M</div>
            <span className="text-xl font-black">Mēmais šovs</span>
          </Link>
          {placeholders.map((index) => (
            <div className="flex items-center gap-4 rounded-2xl bg-stone-100 p-4 opacity-60" key={index}>
              <img className="size-14 rounded-2xl grayscale" src={`${baseUrl}icon-192.png`} alt="" />
              <span className="text-xl font-black text-stone-500">Iznāks vēlāk</span>
            </div>
          ))}
        </div>
        <p className="mt-auto pb-3 pt-6 text-center text-xs text-orange-600">
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
          <h2 className="text-lg font-black">Instalēt Melis</h2>
          <p className="mt-2 text-sm leading-5 text-stone-600">{installPrompt ? 'Pievieno Melis sākuma ekrānam ātrai piekļuvei.' : 'Safari izvēlnē nospied Kopīgot un pēc tam “Pievienot sākuma ekrānam”.'}</p>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-xl border-2 border-orange-500 py-3 font-black text-orange-600" onClick={dismissInstall}>Vēlāk</button>
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
          <Route path="*" element={<GamesHub />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return <HashRouter><AppRoutes /></HashRouter>
}
