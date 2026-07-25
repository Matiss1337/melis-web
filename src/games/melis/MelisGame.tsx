import { useEffect, useMemo, useState } from 'react'
import { GameShell, type Rule } from '../../app/GameShell'
import { locations } from './locations'

type Screen = 'setup' | 'roles' | 'game' | 'finished'
type SavedGame = { players: string[]; minutes: number }
type PlayedLocation = { locationIndex: number; playedAt: number }

const storageKey = 'melis-settings'
const playedLocationsKey = 'melis-played-locations'
const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000
const rules: Rule[] = [
  { title: 'Iestatīšana', body: 'Pievieno spēlētājus, izvēlies spēles ilgumu un nospied “Sākt spēli”.' },
  { title: 'Lokācijas apskate', body: 'Visi, izņemot Meli, slepeni redz vienu un to pašu lokāciju. Melis redz tikai “Tu esi Melis”, tāpēc nezina kopīgo lokāciju.' },
  { title: 'Spēle', body: 'Uzdodiet jautājumus par lokāciju. Pārējiem jāatbild pietiekami skaidri, lai pierādītu, ka viņi zina vietu, bet neatklātu to Melim.' },
  { title: 'Uzvara', body: 'Spēlētāji uzvar, ja atrod Meli un viņš neuzmin lokāciju. Melis uzvar, ja uzmin lokāciju pirms viņu atklāj.' },
]

function loadSettings(): SavedGame {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '')
    if (Array.isArray(value.players) && typeof value.minutes === 'number') return value
  } catch {
    // Use defaults when saved data is missing or malformed.
  }
  return { players: ['', '', ''], minutes: 10 }
}

function loadRecentLocations(): PlayedLocation[] {
  const oldestAllowed = Date.now() - weekInMilliseconds
  try {
    const value = JSON.parse(localStorage.getItem(playedLocationsKey) ?? '[]')
    if (Array.isArray(value)) {
      return value.flatMap((item): PlayedLocation[] => {
        if (typeof item?.playedAt !== 'number' || item.playedAt <= oldestAllowed) return []
        if (typeof item.locationIndex === 'number') return [{ locationIndex: item.locationIndex, playedAt: item.playedAt }]
        if (typeof item.name !== 'string') return []

        const locationIndex = locations.indexOf(item.name)
        return locationIndex === -1 ? [] : [{ locationIndex, playedAt: item.playedAt }]
      })
    }
  } catch {
    // Use an empty history when saved data is missing or malformed.
  }
  return []
}

export default function MelisGame({ onHome }: { onHome: () => void }) {
  const saved = useMemo(loadSettings, [])
  const [screen, setScreen] = useState<Screen>('setup')
  const [players, setPlayers] = useState(saved.players)
  const [minutes, setMinutes] = useState(saved.minutes)
  const [revealed, setRevealed] = useState(0)
  const [locationIndex, setLocationIndex] = useState(0)
  const [spy, setSpy] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<Screen>('setup')
  const validPlayers = players.map((player) => player.trim()).filter(Boolean)
  const canStart = players.length >= 3 && players.every((player) => player.trim().length > 0)

  useEffect(() => {
    if (screen !== 'game' || paused || secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [screen, paused, secondsLeft])

  useEffect(() => {
    if (screen === 'game' && secondsLeft === 0) setScreen('finished')
  }, [screen, secondsLeft])

  const start = () => {
    if (!canStart || locations.length === 0) return
    const recentLocations = loadRecentLocations()
    const recentIndexes = new Set(recentLocations.map((item) => item.locationIndex))
    const availableIndexes = locations.map((_, index) => index).filter((index) => !recentIndexes.has(index))
    const choices = availableIndexes.length > 0 ? availableIndexes : locations.map((_, index) => index)
    const nextLocationIndex = choices[Math.floor(Math.random() * choices.length)]

    localStorage.setItem(storageKey, JSON.stringify({ players: validPlayers, minutes }))
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
      setRevealed((value) => value + 0.5)
      return
    }
    if (revealed === validPlayers.length - 0.5) {
      play()
      return
    }
    setRevealed(Math.ceil(revealed))
  }
  const openSettings = () => {
    setSettingsReturnScreen(screen)
    setScreen('setup')
  }
  const time = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
  const roleButtonLabel = Number.isInteger(revealed)
    ? 'Skatīt lokāciju'
    : revealed === validPlayers.length - 0.5 ? 'Sākt raundu' : 'Paslēpt un nodot tālāk'
  const headerAction = screen !== 'setup' && (
    <button className="text-orange-500" aria-label="Atvērt iestatījumus" onClick={openSettings}>
      <svg className="size-8 fill-current" viewBox="0 0 24 24">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.96-.7 2.8l1.46 1.46A7.94 7.94 0 0 0 20 12c0-4.42-3.58-8-8-8Zm-6.76 4.74A7.94 7.94 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.01.25-1.96.7-2.8L5.24 8.74Z" />
      </svg>
    </button>
  )

  return (
    <GameShell
      title="Melis"
      icon="melis.png"
      rules={rules}
      onHome={onHome}
      headerAction={headerAction}
      onRulesChange={(open) => screen === 'game' && setPaused(open)}
    >
      {screen === 'setup' && (
        <div className="flex min-h-[calc(100dvh-10rem)] flex-col">
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Spēlētāji</h2><p className="mt-1 text-stone-500">Pievieno vismaz 3 spēlētājus.</p></div>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div className="flex gap-2" key={index}>
                  <input className="w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-orange-500 focus:ring-2" placeholder={`Spēlētājs ${index + 1}`} value={player} onChange={(event) => setPlayers((value) => value.map((name, item) => item === index ? event.target.value : name))} />
                  {players.length > 3 && <button className="rounded-xl px-3 !text-[20px] font-semibold leading-none text-stone-400" aria-label={`Noņemt spēlētāju ${index + 1}`} onClick={() => setPlayers((value) => value.filter((_, item) => item !== index))}>×</button>}
                </div>
              ))}
              <button className="font-bold text-orange-500" onClick={() => setPlayers((value) => [...value, ''])}>+ Pievienot spēlētāju</button>
            </div>
            <label className="block">
              <span className="mb-2 block font-bold">Spēles ilgums</span>
              <select className="timer-select w-full rounded-xl bg-stone-100 py-3 pl-4 pr-14" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>
                {[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} minūtes</option>)}
              </select>
            </label>
            <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white disabled:bg-stone-300" disabled={!canStart} onClick={start}>{settingsReturnScreen === 'setup' ? 'Sākt spēli' : 'Saglabāt / Sākt spēli'}</button>
          </div>
        </div>
      )}
      {screen === 'roles' && (
        <div className="flex min-h-[600px] flex-col pt-24 text-center">
          <h2 className="text-3xl font-black">{validPlayers[Math.floor(revealed)]}</h2>
          <button className="mt-10 rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={revealOrPass}>{roleButtonLabel}</button>
          <div className="mt-6 min-h-40">
            {!Number.isInteger(revealed) && (
              <div className="rounded-2xl bg-orange-50 p-6">
                {Math.floor(revealed) === spy ? <p className="text-3xl font-black">Tu esi Melis</p> : <><p className="text-sm font-bold uppercase tracking-wider text-orange-500">Lokācija</p><p className="mt-2 text-3xl font-black">{locations[locationIndex] ?? ''}</p></>}
              </div>
            )}
          </div>
        </div>
      )}
      {(screen === 'game' || screen === 'finished') && (
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
          <p className="text-xl font-black text-stone-500">{screen === 'game' ? 'Laiks rit' : 'Laiks ir beidzies'}</p>
          <p className={`mt-3 text-7xl font-black tabular-nums ${screen === 'finished' ? 'text-red-600' : 'text-stone-900'}`}>{time}</p>
          {screen === 'game' && <button className="mt-8 w-full rounded-2xl bg-stone-900 py-4 text-xl font-black text-white" onClick={() => setPaused((value) => !value)}>{paused ? 'Turpināt' : 'Pauze'}</button>}
          {screen === 'finished' && <button className="mt-10 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={start}>Spēlēt vēlreiz</button>}
        </div>
      )}
    </GameShell>
  )
}
