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
    expect(screen.getByRole('button', { name: 'Tik Tok' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mēmais šovs' })).toBeInTheDocument()
    expect(screen.getAllByText('Iznāks vēlāk')).toHaveLength(3)

    await openMelis(user)

    expect(screen.getByRole('heading', { name: 'Spēlētāji' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeDisabled()

    await fillPlayers(user, ['Anna', 'Berts', 'Cēsis'], 'Spēlētājs')

    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeEnabled()
  })

  it('returns to the games list', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openMelis(user)
    await user.click(screen.getByRole('button', { name: 'Uz spēlēm' }))

    expect(screen.getByRole('heading', { name: 'Spēles' })).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: 'Tik Tok' }))
    expect(screen.getByText('Nākamais:')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Atvērt noteikumus' }))

    expect(screen.getByRole('heading', { name: 'Spēles noteikumi' })).toBeInTheDocument()
    expect(screen.getByText('Gājieni')).toBeInTheDocument()
    expect(screen.getByText('Spēlētāji pēc kārtas spiež tukšu lauciņu. Pirmais gājiens ir X.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aizvērt noteikumus' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 1' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 2' }))

    expect(screen.getByRole('button', { name: 'Tik Tok 1' })).toHaveTextContent('X')
    expect(screen.getByRole('button', { name: 'Tik Tok 2' })).toHaveTextContent('O')
    expect(screen.getAllByText('X')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Sākt no jauna' }))

    expect(screen.getByRole('button', { name: 'Tik Tok 1' })).toHaveTextContent('')
    expect(screen.getByRole('button', { name: 'Tik Tok 2' })).toHaveTextContent('')
  })

  it('announces the Tik Tok winner', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Tik Tok' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 1' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 2' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 5' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 3' }))
    await user.click(screen.getByRole('button', { name: 'Tik Tok 9' }))

    expect(screen.getByRole('heading', { name: 'Uzvarēja!' })).toBeInTheDocument()
    expect(screen.getByTestId('tik-tok-winning-line')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tik Tok 4' })).toBeDisabled()
  })

  it('reveals, hides, and changes mēmais šovs prompts', async () => {
    const user = userEvent.setup()
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1 / silentShowWords.length)

    render(<App />)

    expect(silentShowWords).toHaveLength(300)

    await user.click(screen.getByRole('button', { name: 'Mēmais šovs' }))

    expect(screen.getByRole('heading', { name: 'Mēmais šovs' })).toBeInTheDocument()
    expect(screen.queryByText(silentShowWords[0])).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Atvērt noteikumus' }))

    expect(screen.getByRole('heading', { name: 'Spēles noteikumi' })).toBeInTheDocument()
    expect(screen.getByText('Rādīšana')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Aizvērt noteikumus' }))
    await user.click(screen.getByRole('button', { name: 'Atvērt vārdu' }))

    expect(screen.getByText(silentShowWords[0])).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Paslēpt vārdu' }))

    expect(screen.queryByText(silentShowWords[0])).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Nākamais vārds' }))

    expect(screen.queryByText(silentShowWords[1])).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Atvērt vārdu' }))

    expect(screen.getByText(silentShowWords[1])).toBeInTheDocument()
  })
})
