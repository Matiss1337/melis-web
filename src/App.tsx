import { useEffect, useMemo, useState } from 'react'
import lvLocationsSource from '../locations.md?raw'
import enLocationsSource from '../locations.en.md?raw'

type Screen = 'setup' | 'roles' | 'game' | 'finished'
type Language = 'lv' | 'en'
type SavedGame = { players: string[]; minutes: number }
type PlayedLocation = { locationIndex: number; playedAt: number }
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const storageKey = 'melis-settings'
const languageKey = 'melis-language'
const playedLocationsKey = 'melis-played-locations'
const installPromptKey = 'melis-install-prompt-seen'
const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000
const parseLocations = (source: string) => source.match(/^\d+\. (.+)$/gm)?.map((line) => line.replace(/^\d+\. /, '')) ?? []
const locationsByLanguage: Record<Language, string[]> = {
  lv: parseLocations(lvLocationsSource),
  en: parseLocations(enLocationsSource),
}

const translations = {
  lv: {
    switchLanguageCode: 'EN',
    switchLanguageLabel: 'Pārslēgt uz angļu valodu',
    openSettings: 'Atvērt iestatījumus',
    openRules: 'Atvērt noteikumus',
    closeRules: 'Aizvērt noteikumus',
    rulesTitle: 'Spēles noteikumi',
    rules: [
      {
        title: 'Iestatīšana',
        body: 'Pievieno spēlētājus, izvēlies spēles ilgumu un nospied “Sākt spēli”.',
      },
      {
        title: 'Lokācijas apskate',
        body: 'Visi, izņemot Meli, slepeni redz vienu un to pašu lokāciju. Melis redz tikai “Tu esi Melis”, tāpēc nezina kopīgo lokāciju.',
      },
      {
        title: 'Spēle',
        body: 'Uzdodiet jautājumus par lokāciju. Pārējiem jāatbild pietiekami skaidri, lai pierādītu, ka viņi zina vietu, bet neatklātu to Melim.',
      },
      {
        title: 'Uzvara',
        body: 'Spēlētāji uzvar, ja atrod Meli un viņš neuzmin lokāciju. Melis uzvar, ja uzmin lokāciju pirms viņu atklāj.',
      },
    ],
    installTitle: 'Instalēt Melis',
    installPrompt: 'Pievieno Melis sākuma ekrānam ātrai piekļuvei.',
    installIos: 'Safari izvēlnē nospied Kopīgot un pēc tam “Pievienot sākuma ekrānam”.',
    installLater: 'Vēlāk',
    installAction: 'Instalēt',
    installGotIt: 'Sapratu',
    playersTitle: 'Spēlētāji',
    playersHelp: 'Pievieno vismaz 3 spēlētājus.',
    playerPlaceholder: 'Spēlētājs',
    removePlayer: 'Noņemt spēlētāju',
    addPlayer: '+ Pievienot spēlētāju',
    durationLabel: 'Spēles ilgums',
    minuteLabel: 'minūtes',
    startGame: 'Sākt spēli',
    saveAndStart: 'Saglabāt / Sākt spēli',
    viewLocation: 'Skatīt lokāciju',
    startRound: 'Sākt raundu',
    hideAndPass: 'Paslēpt un nodot tālāk',
    youAreSpy: 'Tu esi Melis',
    locationLabel: 'Lokācija',
    timerRunning: 'Laiks rit',
    timerFinished: 'Laiks ir beidzies',
    resume: 'Turpināt',
    pause: 'Pauze',
    playAgain: 'Spēlēt vēlreiz',
  },
  en: {
    switchLanguageCode: 'LV',
    switchLanguageLabel: 'Switch to Latvian',
    openSettings: 'Open settings',
    openRules: 'Open rules',
    closeRules: 'Close rules',
    rulesTitle: 'Game rules',
    rules: [
      {
        title: 'Setup',
        body: 'Add players, choose the game length, and press “Start game”.',
      },
      {
        title: 'Location reveal',
        body: 'Everyone except the Spy secretly sees the same location. The Spy only sees “You are the Spy”, so they do not know the shared location.',
      },
      {
        title: 'Game',
        body: 'Ask questions about the location. Everyone else should answer clearly enough to prove they know the place without revealing it to the Spy.',
      },
      {
        title: 'Winning',
        body: 'Players win if they find the Spy and the Spy does not guess the location. The Spy wins if they guess the location before being exposed.',
      },
    ],
    installTitle: 'Install Melis',
    installPrompt: 'Add Melis to your home screen for quick access.',
    installIos: 'In Safari, tap Share, then “Add to Home Screen”.',
    installLater: 'Later',
    installAction: 'Install',
    installGotIt: 'Got it',
    playersTitle: 'Players',
    playersHelp: 'Add at least 3 players.',
    playerPlaceholder: 'Player',
    removePlayer: 'Remove player',
    addPlayer: '+ Add player',
    durationLabel: 'Game length',
    minuteLabel: 'minutes',
    startGame: 'Start game',
    saveAndStart: 'Save / Start game',
    viewLocation: 'View location',
    startRound: 'Start round',
    hideAndPass: 'Hide and pass on',
    youAreSpy: 'You are the Spy',
    locationLabel: 'Location',
    timerRunning: 'Time is running',
    timerFinished: 'Time is up',
    resume: 'Resume',
    pause: 'Pause',
    playAgain: 'Play again',
  },
} as const

function isLanguage(value: string | null): value is Language {
  return value === 'lv' || value === 'en'
}

function loadLanguage(): Language {
  const value = localStorage.getItem(languageKey)
  return isLanguage(value) ? value : 'lv'
}

function loadSettings(): SavedGame {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '')
    if (Array.isArray(value.players) && typeof value.minutes === 'number') return value
  } catch {
    // Use defaults when saved data is missing or malformed.
  }
  return { players: ['', '', ''], minutes: 10 }
}

function loadRecentLocations(language: Language): PlayedLocation[] {
  const oldestAllowed = Date.now() - weekInMilliseconds
  try {
    const value = JSON.parse(localStorage.getItem(playedLocationsKey) ?? '[]')
    if (Array.isArray(value)) {
      return value.flatMap((item): PlayedLocation[] => {
        if (typeof item?.playedAt !== 'number' || item.playedAt <= oldestAllowed) return []
        if (typeof item.locationIndex === 'number') return [{ locationIndex: item.locationIndex, playedAt: item.playedAt }]
        if (typeof item.name !== 'string') return []

        const locationIndex = locationsByLanguage[language].indexOf(item.name)
        return locationIndex === -1 ? [] : [{ locationIndex, playedAt: item.playedAt }]
      })
    }
  } catch {
    // Use an empty history when saved data is missing or malformed.
  }
  return []
}

function App() {
  const saved = useMemo(loadSettings, [])
  const initialLanguage = useMemo(loadLanguage, [])
  const [screen, setScreen] = useState<Screen>('setup')
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [players, setPlayers] = useState(saved.players)
  const [minutes, setMinutes] = useState(saved.minutes)
  const [revealed, setRevealed] = useState(0)
  const [locationIndex, setLocationIndex] = useState(0)
  const [spy, setSpy] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<Screen>('setup')
  const [rulesOpen, setRulesOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installOpen, setInstallOpen] = useState(false)

  const t = translations[language]
  const locations = locationsByLanguage[language]
  const validPlayers = players.map((player) => player.trim()).filter(Boolean)
  const canStart = players.length >= 3 && players.every((player) => player.trim().length > 0)
  const save = () => localStorage.setItem(storageKey, JSON.stringify({ players: validPlayers, minutes }))

  useEffect(() => {
    localStorage.setItem(languageKey, language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (screen !== 'game' || paused || secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [screen, paused, secondsLeft])

  useEffect(() => {
    if (screen === 'game' && secondsLeft === 0) setScreen('finished')
  }, [screen, secondsLeft])

  useEffect(() => {
    if (localStorage.getItem(installPromptKey)) return

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    if (!isIos && !isAndroid) return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    if (isIos && !isStandalone) setInstallOpen(true)

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
      setInstallOpen(true)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  const start = () => {
    if (!canStart || locations.length === 0) return
    const recentLocations = loadRecentLocations(language)
    const recentIndexes = new Set(recentLocations.map((item) => item.locationIndex))
    const availableLocationIndexes = locations.map((_, index) => index).filter((index) => !recentIndexes.has(index))
    const nextLocationIndexes = availableLocationIndexes.length > 0 ? availableLocationIndexes : locations.map((_, index) => index)
    const nextLocationIndex = nextLocationIndexes[Math.floor(Math.random() * nextLocationIndexes.length)]

    save()
    localStorage.setItem(playedLocationsKey, JSON.stringify([{ locationIndex: nextLocationIndex, playedAt: Date.now() }, ...recentLocations]))
    setPlayers(validPlayers)
    setLocationIndex(nextLocationIndex)
    setSpy(Math.floor(Math.random() * validPlayers.length))
    setRevealed(0)
    setSettingsReturnScreen('setup')
    setScreen('roles')
  }

  const play = () => {
    setSecondsLeft(minutes * 60)
    setPaused(false)
    setScreen('game')
  }

  const revealOrPass = () => {
    if (Number.isInteger(revealed)) {
      setRevealed(revealed + 0.5)
      return
    }
    if (revealed === validPlayers.length - 0.5) {
      play()
      return
    }
    setRevealed(Math.ceil(revealed))
  }

  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
  const location = locations[locationIndex] ?? ''
  const roleButtonLabel = Number.isInteger(revealed)
    ? t.viewLocation
    : revealed === validPlayers.length - 0.5
      ? t.startRound
      : t.hideAndPass
  const addPlayer = () => setPlayers((value) => [...value, ''])
  const openSettings = () => {
    setSettingsReturnScreen(screen)
    setScreen('setup')
  }
  const dismissInstall = () => {
    localStorage.setItem(installPromptKey, 'true')
    setInstallOpen(false)
  }
  const install = async () => {
    if (!installPrompt) {
      dismissInstall()
      return
    }
    await installPrompt.prompt()
    await installPrompt.userChoice
    dismissInstall()
  }

  return (
    <main className="min-h-dvh bg-orange-50 px-4 py-6 text-stone-900 sm:flex sm:items-center sm:justify-center">
      <section className="relative mx-auto w-full max-w-[430px] rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-950/10 sm:min-h-[780px]">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <img className="mr-2 size-8 rounded-lg" src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" />
            <h1 className="text-3xl font-black tracking-tight text-orange-600">Melis</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1 rounded-full text-sm font-black text-orange-600"
              aria-label={t.switchLanguageLabel}
              title={t.switchLanguageLabel}
              onClick={() => setLanguage((value) => value === 'lv' ? 'en' : 'lv')}
            >
              <svg className="size-7 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.2">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
              </svg>
              <span>{t.switchLanguageCode}</span>
            </button>
            {screen !== 'setup' && (
              <button className="text-orange-600" aria-label={t.openSettings} onClick={openSettings}>
                <svg className="size-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.96-.7 2.8l1.46 1.46A7.94 7.94 0 0 0 20 12c0-4.42-3.58-8-8-8Zm-6.76 4.74A7.94 7.94 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.01.25-1.96.7-2.8L5.24 8.74Z" />
                </svg>
              </button>
            )}
            <button
              className="text-orange-600"
              aria-label={t.openRules}
              onClick={() => {
                if (screen === 'game') setPaused(true)
                setRulesOpen(true)
              }}
            >
              <svg className="size-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {rulesOpen && (
          <div className="absolute inset-x-6 top-20 z-10 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">{t.rulesTitle}</h2>
                <div className="mt-3 space-y-3 text-sm leading-5 text-stone-600">
                  {t.rules.map((rule) => (
                    <section key={rule.title}>
                      <h3 className="font-bold text-stone-900">{rule.title}</h3>
                      <p>{rule.body}</p>
                    </section>
                  ))}
                </div>
              </div>
              <button
                className="text-4xl font-semibold leading-none text-stone-500 !text-[20px]"
                aria-label={t.closeRules}
                onClick={() => {
                  setRulesOpen(false)
                  if (screen === 'game') setPaused(false)
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {installOpen && (
          <div className="absolute inset-x-6 top-20 z-20 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-stone-200">
            <h2 className="text-lg font-black">{t.installTitle}</h2>
            <p className="mt-2 text-sm leading-5 text-stone-600">{installPrompt ? t.installPrompt : t.installIos}</p>
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-xl border-2 border-orange-500 py-3 font-black text-orange-600" onClick={dismissInstall}>
                {t.installLater}
              </button>
              <button className="flex-1 rounded-xl bg-orange-500 py-3 font-black text-white" onClick={install}>
                {installPrompt ? t.installAction : t.installGotIt}
              </button>
            </div>
          </div>
        )}

        {screen === 'setup' && (
          <div className="flex min-h-[calc(100dvh-10rem)] flex-col">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{t.playersTitle}</h2>
                <p className="mt-1 text-stone-500">{t.playersHelp}</p>
              </div>
              <div className="space-y-3">
                {players.map((player, index) => (
                  <div className="flex gap-2" key={index}>
                    <input
                      className="w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-orange-400 focus:ring-2"
                      placeholder={`${t.playerPlaceholder} ${index + 1}`}
                      value={player}
                      onChange={(event) => setPlayers((value) => value.map((name, item) => item === index ? event.target.value : name))}
                    />
                    {players.length > 3 && (
                      <button
                        className="rounded-xl px-3 !text-[20px] font-semibold leading-none text-stone-400"
                        aria-label={`${t.removePlayer} ${index + 1}`}
                        onClick={() => setPlayers((value) => value.filter((_, item) => item !== index))}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button className="font-bold text-orange-600" onClick={addPlayer}>{t.addPlayer}</button>
              </div>
              <label className="block">
                <span className="mb-2 block font-bold">{t.durationLabel}</span>
                <select
                  className="timer-select w-full rounded-xl bg-stone-100 py-3 pl-4 pr-14"
                  value={minutes}
                  onChange={(event) => setMinutes(Number(event.target.value))}
                >
                  {[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} {t.minuteLabel}</option>)}
                </select>
              </label>
              <button
                className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white disabled:bg-stone-300"
                disabled={!canStart}
                onClick={start}
              >
                {settingsReturnScreen === 'setup' ? t.startGame : t.saveAndStart}
              </button>
            </div>
            <p className="mt-auto pb-3 pt-6 text-center text-xs text-orange-600">
              <a className="font-semibold" href="https://www.linkedin.com/in/matiss-judins-319235228/" target="_blank" rel="noreferrer">MatissJ</a>
            </p>
          </div>
        )}

        {screen === 'roles' && (
          <div className="flex min-h-[600px] flex-col pt-24 text-center">
            <h2 className="text-3xl font-black">{validPlayers[Math.floor(revealed)]}</h2>
            <button className="mt-10 rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={revealOrPass}>{roleButtonLabel}</button>
            <div className="mt-6 min-h-40">
              {!Number.isInteger(revealed) && (
                <div className="rounded-2xl bg-orange-50 p-6">
                  {Math.floor(revealed) === spy ? (
                    <p className="text-3xl font-black">{t.youAreSpy}</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold uppercase tracking-wider text-orange-500">{t.locationLabel}</p>
                      <p className="mt-2 text-3xl font-black">{location}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(screen === 'game' || screen === 'finished') && (
          <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
            <p className="text-xl font-black text-stone-500">{screen === 'game' ? t.timerRunning : t.timerFinished}</p>
            <p className={`mt-3 text-7xl font-black tabular-nums ${screen === 'finished' ? 'text-red-600' : 'text-stone-900'}`}>{time}</p>
            {screen === 'game' && (
              <button className="mt-8 w-full rounded-2xl bg-stone-900 py-4 text-xl font-black text-white" onClick={() => setPaused((value) => !value)}>
                {paused ? t.resume : t.pause}
              </button>
            )}
            {screen === 'finished' && (
              <button className="mt-10 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={start}>{t.playAgain}</button>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
