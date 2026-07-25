import { useState, type ReactNode } from 'react'
import { baseUrl } from '../baseUrl'

export type Rule = { title: string; body: string }

type GameShellProps = {
  title: string
  rules: readonly Rule[]
  children: ReactNode
  onHome: () => void
  headerAction?: ReactNode
  onRulesChange?: (open: boolean) => void
}

export function GameShell({ title, rules, children, onHome, headerAction, onRulesChange }: GameShellProps) {
  const [rulesOpen, setRulesOpen] = useState(false)
  const setRules = (open: boolean) => {
    setRulesOpen(open)
    onRulesChange?.(open)
  }

  return (
    <main className="min-h-dvh bg-orange-50 px-4 py-6 text-stone-900 sm:flex sm:items-center sm:justify-center">
      <section className="relative mx-auto w-full max-w-[430px] rounded-[2rem] bg-white p-6 shadow-xl shadow-orange-950/10 sm:min-h-[780px]">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <img className="mr-2 size-8 rounded-lg" src={`${baseUrl}icon-192.png`} alt="" />
            <h1 className="text-3xl font-black tracking-tight text-orange-600">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {headerAction}
            <button className="text-orange-600" aria-label="Uz spēlēm" onClick={onHome}>
              <svg className="size-8 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3 9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8Z" />
              </svg>
            </button>
            <button className="text-orange-600" aria-label="Atvērt noteikumus" onClick={() => setRules(true)}>
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
                <h2 className="text-lg font-black">Spēles noteikumi</h2>
                <div className="mt-3 space-y-3 text-sm leading-5 text-stone-600">
                  {rules.map((rule) => (
                    <section key={rule.title}>
                      <h3 className="font-bold text-stone-900">{rule.title}</h3>
                      <p>{rule.body}</p>
                    </section>
                  ))}
                </div>
              </div>
              <button
                className="text-4xl font-semibold leading-none text-stone-500 !text-[20px]"
                aria-label="Aizvērt noteikumus"
                onClick={() => setRules(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {children}
      </section>
    </main>
  )
}
