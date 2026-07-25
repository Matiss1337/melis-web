import { useState } from 'react'
import { GameShell, type Rule } from '../../app/GameShell'

const maxQuestions = 20
const rules: Rule[] = [
  { title: 'Slepenā atbilde', body: 'Viens spēlētājs ievada priekšmetu, personu vai jēdzienu un nospiež “Paslēpt un sākt”.' },
  { title: 'Jautājumi', body: 'Nodod telefonu pārējiem. Kopā drīkst uzdot līdz 20 jautājumiem, uz kuriem atbilde ir tikai “jā” vai “nē”.' },
  { title: 'Minējums', body: 'Ja atbilde ir uzminēta, nospied “Atklāt atbildi”. Pēc 20. jautājuma atbilde tiek atklāta automātiski.' },
]

export default function TwentyQuestionsGame({ onHome }: { onHome: () => void }) {
  const [secret, setSecret] = useState('')
  const [questions, setQuestions] = useState(0)
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const finish = () => setRevealed(true)
  const nextQuestion = () => {
    if (questions + 1 === maxQuestions) finish()
    setQuestions((value) => Math.min(value + 1, maxQuestions))
  }
  const reset = () => {
    setSecret('')
    setQuestions(0)
    setStarted(false)
    setRevealed(false)
  }

  return (
    <GameShell title="20 jautājumi" icon="20-questions.png" rules={rules} onHome={onHome}>
      {!started ? (
        <div className="flex min-h-[600px] flex-col justify-center">
          <div>
            <h2 className="text-2xl font-bold">Ievadi slepeno atbildi</h2>
            <p className="mt-1 text-stone-500">Tā var būt persona, priekšmets vai jēdziens.</p>
          </div>
          <label className="mt-6 block">
            <span className="sr-only">Slepenā atbilde</span>
            <input className="w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-orange-500 focus:ring-2" type="password" autoComplete="off" placeholder="Slepenā atbilde" value={secret} onChange={(event) => setSecret(event.target.value)} />
          </label>
          <button className="mt-4 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white disabled:bg-stone-300" disabled={!secret.trim()} onClick={() => setStarted(true)}>Paslēpt un sākt</button>
        </div>
      ) : revealed ? (
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
          <p className="text-xl font-black text-stone-500">Slepenā atbilde bija</p>
          <p className="mt-3 break-words text-5xl font-black text-stone-900">{secret}</p>
          <button className="mt-10 w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={reset}>Sākt no jauna</button>
        </div>
      ) : (
        <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
          <p className="text-xl font-black text-stone-500">Jautājumi</p>
          <p className="mt-3 text-7xl font-black tabular-nums text-stone-900">{questions} <span className="text-4xl text-stone-400">/ {maxQuestions}</span></p>
          <button className="mt-10 w-full rounded-2xl bg-stone-900 py-4 text-lg font-black text-white" onClick={nextQuestion}>Nākamais jautājums +1</button>
          <button className="mt-4 w-full rounded-2xl border-2 border-orange-500 py-4 text-lg font-black text-orange-500" onClick={finish}>Atklāt atbildi</button>
        </div>
      )}
    </GameShell>
  )
}
