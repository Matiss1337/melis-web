import { useMemo, useState } from 'react'
import { GameShell, type Rule } from '../../app/GameShell'

type Cell = 'X' | 'O' | null

const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]] as const
const rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8]] as const
const lineExtension = 0.22
const rules: Rule[] = [
  { title: 'Gājieni', body: 'Spēlētāji pēc kārtas spiež tukšu lauciņu. Pirmais gājiens ir X.' },
  { title: 'Uzvara', body: 'Uzvar tas, kurš savieno trīs savus simbolus rindā, kolonnā vai diagonālē.' },
  { title: 'Sākt no jauna', body: 'Nospied “Sākt no jauna”, lai sāktu no sākuma.' },
]

function Mark({ mark, className, showLabel = true }: { mark: Exclude<Cell, null>; className: string; showLabel?: boolean }) {
  return (
    <>
      {showLabel && <span className="sr-only">{mark}</span>}
      {mark === 'X' ? (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      ) : (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
        </svg>
      )}
    </>
  )
}

export default function TikTokGame({ onHome }: { onHome: () => void }) {
  const [board, setBoard] = useState<Cell[]>(() => Array.from({ length: 9 }, () => null))
  const [turn, setTurn] = useState<Exclude<Cell, null>>('X')
  const winningLine = useMemo(() => lines.find(([first, second, third]) => (
    board[first] && board[first] === board[second] && board[first] === board[third]
  )), [board])
  const winner = winningLine ? board[winningLine[0]] : null
  const reset = () => {
    setBoard(Array.from({ length: 9 }, () => null))
    setTurn('X')
  }
  const play = (index: number) => {
    if (board[index] || winner || board.every(Boolean)) return
    setBoard((value) => value.map((cell, cellIndex) => cellIndex === index ? turn : cell))
    setTurn((value) => value === 'X' ? 'O' : 'X')
  }

  return (
    <GameShell title="Tik Tok" icon="tik-tok.png" rules={rules} onHome={onHome}>
      <div className="flex min-h-[600px] flex-col items-center justify-center gap-6">
        <div className="relative w-full">
          <div className="space-y-3">
            {rows.map((row) => (
              <div className="flex gap-3" key={row.join('-')}>
                {row.map((index) => (
                  <button
                    className="flex aspect-square flex-1 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 ring-2 ring-orange-100 disabled:cursor-default"
                    aria-label={`Tik Tok ${index + 1}`}
                    disabled={Boolean(board[index]) || Boolean(winner) || board.every(Boolean)}
                    key={index}
                    onClick={() => play(index)}
                  >
                    {board[index] && <Mark mark={board[index]} className="size-16" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {winningLine && (
            <svg className="pointer-events-none absolute inset-0 size-full text-orange-500" viewBox="0 0 3.2 3.2" preserveAspectRatio="none" aria-hidden="true">
              <line
                x1={winningLine[0] % 3 + 0.5 + (winningLine[0] % 3) * 0.1 - Math.sign(winningLine[2] % 3 - winningLine[0] % 3) * lineExtension}
                y1={Math.floor(winningLine[0] / 3) + 0.5 + Math.floor(winningLine[0] / 3) * 0.1 - Math.sign(Math.floor(winningLine[2] / 3) - Math.floor(winningLine[0] / 3)) * lineExtension}
                x2={winningLine[2] % 3 + 0.5 + (winningLine[2] % 3) * 0.1 + Math.sign(winningLine[2] % 3 - winningLine[0] % 3) * lineExtension}
                y2={Math.floor(winningLine[2] / 3) + 0.5 + Math.floor(winningLine[2] / 3) * 0.1 + Math.sign(Math.floor(winningLine[2] / 3) - Math.floor(winningLine[0] / 3)) * lineExtension}
                stroke="currentColor"
                strokeWidth="0.04"
                strokeLinecap="round"
                data-testid="tik-tok-winning-line"
              />
            </svg>
          )}
        </div>
        <h2 className="flex items-center gap-3 rounded-full bg-orange-50 px-5 py-3 font-black text-stone-700 ring-2 ring-orange-100">
          {winner ? <><Mark mark={winner} className="size-7 text-orange-500" showLabel={false} /><span>Uzvarēja!</span></> : <><span>Nākamais:</span><Mark mark={turn} className="size-7 text-orange-500" /></>}
        </h2>
        <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-black text-white" onClick={reset}>Sākt no jauna</button>
      </div>
    </GameShell>
  )
}
