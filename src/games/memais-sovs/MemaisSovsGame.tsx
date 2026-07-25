import { useState } from 'react'
import { GameShell, type Rule } from '../../app/GameShell'
import { silentShowWords } from '../../silentShowWords'

const rules: Rule[] = [
  { title: 'Rādīšana', body: 'Izlozēto vārdu rāda ar žestiem un mīmiku. Runāt, izdot skaņas un norādīt uz priekšmetiem telpā nedrīkst.' },
  { title: 'Minēšana', body: 'Pārējie min skaļi. Kad vārds uzminēts, spied “Nākamais vārds”.' },
]

const randomWord = () => silentShowWords[Math.floor(Math.random() * silentShowWords.length)] ?? silentShowWords[0]

export default function MemaisSovsGame({ onHome }: { onHome: () => void }) {
  const [word, setWord] = useState(randomWord)
  const [revealed, setRevealed] = useState(false)
  const nextWord = () => {
    setWord(randomWord())
    setRevealed(false)
  }

  return (
    <GameShell title="Mēmais šovs" rules={rules} onHome={onHome}>
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-6 text-center">
        <div className="w-full rounded-2xl bg-orange-50 p-6 ring-2 ring-orange-100">
          <p className="text-5xl font-black text-stone-900">{revealed ? word : '???'}</p>
        </div>
        <button className="w-full rounded-2xl bg-stone-900 py-4 text-lg font-black text-white" onClick={() => setRevealed((value) => !value)}>
          {revealed ? 'Paslēpt vārdu' : 'Atvērt vārdu'}
        </button>
        <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={nextWord}>Nākamais vārds</button>
      </div>
    </GameShell>
  )
}
