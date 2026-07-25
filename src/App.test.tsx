import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { silentShowWords } from './silentShowWords'

const fillPlayers = async (user: ReturnType<typeof userEvent.setup>, names: string[], placeholder: string) => {
  for (const [index, name] of names.entries()) {
    await user.type(screen.getByPlaceholderText(`${placeholder} ${index + 1}`), name)
  }
}

const openMelis = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Melis' }))
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('requires three named players before starting', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Spēles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Melis' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tick Tock' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mēmais šovs' })).toBeInTheDocument()
    expect(screen.getAllByText('Coming soon')).toHaveLength(3)

    await openMelis(user)

    expect(screen.getByRole('heading', { name: 'Spēlētāji' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeDisabled()

    await fillPlayers(user, ['Anna', 'Berts', 'Cēsis'], 'Spēlētājs')

    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeEnabled()
  })

  it('completes the journey, pauses the timer, and resets with play again', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    jest.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    await openMelis(user)
    await fillPlayers(user, ['Anna', 'Berts', 'Cēsis'], 'Spēlētājs')
    await user.click(screen.getByRole('button', { name: 'Sākt spēli' }))

    await user.click(screen.getByRole('button', { name: 'Skatīt lokāciju' }))
    expect(screen.getByText('Tu esi Melis')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Paslēpt un nodot tālāk' }))
    await user.click(screen.getByRole('button', { name: 'Skatīt lokāciju' }))
    expect(screen.getByText('Parks')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Paslēpt un nodot tālāk' }))
    await user.click(screen.getByRole('button', { name: 'Skatīt lokāciju' }))
    await user.click(screen.getByRole('button', { name: 'Sākt raundu' }))

    expect(screen.getByText('Laiks rit')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pauze' }))
    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByRole('button', { name: 'Turpināt' })).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Turpināt' }))
    act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText('9:59')).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(599000))
    expect(screen.getByText('Laiks ir beidzies')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spēlēt vēlreiz' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Spēlēt vēlreiz' }))

    expect(screen.getByRole('heading', { name: 'Anna' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skatīt lokāciju' })).toBeInTheDocument()
  })

  it('starts tick tock and resets the board', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Tick Tock' }))
    await user.click(screen.getByRole('button', { name: 'Atvērt noteikumus' }))

    expect(screen.getByRole('heading', { name: 'Spēles noteikumi' })).toBeInTheDocument()
    expect(screen.getByText('Gājieni')).toBeInTheDocument()
    expect(screen.getByText('Spēlētāji pēc kārtas spiež tukšu lauciņu. Pirmais gājiens ir X.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aizvērt noteikumus' }))
    await user.click(screen.getByRole('button', { name: 'Tick Tock 1' }))
    await user.click(screen.getByRole('button', { name: 'Tick Tock 2' }))

    expect(screen.getByRole('button', { name: 'Tick Tock 1' })).toHaveTextContent('X')
    expect(screen.getByRole('button', { name: 'Tick Tock 2' })).toHaveTextContent('O')

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByRole('button', { name: 'Tick Tock 1' })).toHaveTextContent('')
    expect(screen.getByRole('button', { name: 'Tick Tock 2' })).toHaveTextContent('')
  })

  it('starts mēmais šovs with simple one-word prompts and rules', async () => {
    const user = userEvent.setup()
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1 / silentShowWords.length)

    render(<App />)

    expect(silentShowWords).toHaveLength(300)
    expect(silentShowWords.every((word) => !/\s/.test(word))).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Mēmais šovs' }))

    expect(screen.getByRole('heading', { name: 'Mēmais šovs' })).toBeInTheDocument()
    expect(screen.getByText('1 vārds')).toBeInTheDocument()
    expect(screen.getByText(silentShowWords[0])).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Atvērt noteikumus' }))

    expect(screen.getByRole('heading', { name: 'Spēles noteikumi' })).toBeInTheDocument()
    expect(screen.getByText('Rādīšana')).toBeInTheDocument()
    expect(screen.getByText('Pagaidām katrs uzdevums ir viens vārds.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aizvērt noteikumus' }))
    await user.click(screen.getByRole('button', { name: 'Nākamais vārds' }))

    expect(screen.getByText(silentShowWords[1])).toBeInTheDocument()
  })
})
