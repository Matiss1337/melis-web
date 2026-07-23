import { useEffect, useMemo, useState } from 'react'
import locationsSource from '../locations.md?raw'

type Screen = 'setup' | 'roles' | 'game' | 'finished'
type SavedGame = { players: string[]; minutes: number }

const storageKey = 'melis-settings'
const locations = locationsSource.match(/^\d+\. (.+)$/gm)?.map((line) => line.replace(/^\d+\. /, '')) ?? []

function loadSettings(): SavedGame {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '')
    if (Array.isArray(value.players) && typeof value.minutes === 'number') return value
  } catch {
    // Use defaults when saved data is missing or malformed.
  }
  return { players: ['', '', ''], minutes: 10 }
}

function App() {
  const saved = useMemo(loadSettings, [])
  const [screen, setScreen] = useState<Screen>('setup')
  const [players, setPlayers] = useState(saved.players)
  const [minutes, setMinutes] = useState(saved.minutes)
  const [revealed, setRevealed] = useState(0)
  const [location, setLocation] = useState('')
  const [spy, setSpy] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const validPlayers = players.map((player) => player.trim()).filter(Boolean)
  const save = () => localStorage.setItem(storageKey, JSON.stringify({ players: validPlayers, minutes }))

  useEffect(() => {
    if (screen !== 'game' || secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((value) => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [screen, secondsLeft])

  useEffect(() => {
    if (screen === 'game' && secondsLeft === 0) setScreen('finished')
  }, [screen, secondsLeft])

  const start = () => {
    if (validPlayers.length < 3 || locations.length === 0) return
    save()
    setPlayers(validPlayers)
    setLocation(locations[Math.floor(Math.random() * locations.length)])
    setSpy(Math.floor(Math.random() * validPlayers.length))
    setRevealed(0)
    setScreen('roles')
  }

  const play = () => {
    setSecondsLeft(minutes * 60)
    setScreen('game')
  }

  const time = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`
  const addPlayer = () => setPlayers((value) => [...value, ''])

  return (
    <main className="min-h-dvh bg-orange-50 px-4 py-6 text-stone-900 sm:flex sm:items-center sm:justify-center">
      <section className="mx-auto w-full max-w-[430px] rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-950/10 sm:min-h-[780px]">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-orange-600">Melis</h1>
          {screen !== 'setup' && <button className="text-sm font-bold text-orange-600" onClick={() => setScreen('setup')}>Iestatījumi</button>}
        </header>

        {screen === 'setup' && (
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">Spēlētāji</h2><p className="mt-1 text-stone-500">Pievieno vismaz 3 spēlētājus.</p></div>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div className="flex gap-2" key={index}>
                  <input className="w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-orange-400 focus:ring-2" placeholder={`Spēlētājs ${index + 1}`} value={player} onChange={(event) => setPlayers((value) => value.map((name, item) => item === index ? event.target.value : name))} />
                  {players.length > 3 && <button className="rounded-xl px-3 text-stone-400" onClick={() => setPlayers((value) => value.filter((_, item) => item !== index))}>×</button>}
                </div>
              ))}
              <button className="font-bold text-orange-600" onClick={addPlayer}>+ Pievienot spēlētāju</button>
            </div>
            <label className="block"><span className="mb-2 block font-bold">Spēles ilgums</span><select className="w-full rounded-xl bg-stone-100 px-4 py-3" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>{[5, 10, 15, 20].map((value) => <option key={value} value={value}>{value} minūtes</option>)}</select></label>
            <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white disabled:bg-stone-300" disabled={validPlayers.length < 3} onClick={start}>Sākt spēli</button>
          </div>
        )}

        {screen === 'roles' && (
          <div className="flex min-h-[600px] flex-col justify-center text-center">
            <p className="text-stone-500">Nodod telefonu</p><h2 className="mt-2 text-3xl font-black">{validPlayers[revealed]}</h2>
            <button className="mt-10 rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={() => Number.isInteger(revealed) ? setRevealed(revealed + 0.5) : revealed === validPlayers.length - 0.5 ? play() : setRevealed(Math.ceil(revealed))}>{Number.isInteger(revealed) ? 'Skatīt lomu' : revealed === validPlayers.length - 0.5 ? 'Sākt raundu' : 'Paslēpt un nodot tālāk'}</button>
            {!Number.isInteger(revealed) && <div className="mt-6 rounded-2xl bg-orange-50 p-6"><p className="text-sm font-bold uppercase tracking-wider text-orange-500">Tava loma</p><p className="mt-2 text-3xl font-black">{Math.floor(revealed) === spy ? 'Tu esi Melis' : location}</p></div>}
            {!Number.isInteger(revealed) && revealed !== validPlayers.length - 0.5 && <button className="mt-4 font-bold text-orange-600" onClick={() => setRevealed(Math.ceil(revealed))}>Paslēpt</button>}
          </div>
        )}

        {(screen === 'game' || screen === 'finished') && (
          <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
            <p className="text-stone-500">{screen === 'game' ? 'Laiks rit' : 'Laiks ir beidzies'}</p>
            <p className={`mt-3 text-7xl font-black tabular-nums ${screen === 'finished' ? 'text-red-600' : 'text-stone-900'}`}>{screen === 'finished' ? '0' : time}</p>
            {screen === 'finished' && <button className="mt-10 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={start}>Spēlēt vēlreiz</button>}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
