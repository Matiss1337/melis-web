import { useEffect, useRef, useState } from 'react'
import { GameShell, type Rule } from '../../app/GameShell'
import { baseUrl } from '../../baseUrl'

const tossDelay = 2_000
const coinImages = { Cipars: 'coin-number.png', Ģerbonis: 'coin-face.png' } as const
const rules: Rule[] = [
  { title: 'Met monētu', body: 'Nospied “Mest monētu”, lai sāktu metienu.' },
  { title: 'Rezultāts', body: 'Pēc divām sekundēm monēta parāda ciparu vai ģerboni.' },
]

export default function CiparsVaiGerbonisGame({ onHome }: { onHome: () => void }) {
  const [result, setResult] = useState<'Cipars' | 'Ģerbonis' | null>(null)
  const [tossing, setTossing] = useState(false)
  const timer = useRef<number | null>(null)
  const toss = () => {
    setResult(null)
    setTossing(true)
    timer.current = window.setTimeout(() => {
      setResult(Math.random() < 0.5 ? 'Cipars' : 'Ģerbonis')
      setTossing(false)
    }, tossDelay)
  }

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  return (
    <GameShell title={<span className="whitespace-nowrap text-2xl">Lats vai gerbonis</span>} icon="coin-number.png" rules={rules} onHome={onHome}>
      <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
        <div className="size-52 overflow-hidden rounded-full [perspective:800px]">
          {tossing ? (
            <div className="coin-toss flex size-full items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-950/20">
              <span className="h-4 w-4/5 rounded-full bg-white" />
            </div>
          ) : (
            <img className="size-full rounded-full" src={`${baseUrl}${result ? coinImages[result] : 'coin-number.png'}`} alt={result ?? 'Cipars'} />
          )}
        </div>
        <button className="mt-10 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white disabled:bg-stone-300" disabled={tossing} onClick={toss}>
          {result ? 'Mest vēlreiz' : 'Mest monētu'}
        </button>
      </div>
    </GameShell>
  )
}
