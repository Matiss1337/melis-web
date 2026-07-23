import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const fillPlayers = async (user: ReturnType<typeof userEvent.setup>, names: string[], placeholder: string) => {
  for (const [index, name] of names.entries()) {
    await user.type(screen.getByPlaceholderText(`${placeholder} ${index + 1}`), name)
  }
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

    expect(screen.getByRole('heading', { name: 'Spēlētāji' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeDisabled()

    await fillPlayers(user, ['Anna', 'Berts', 'Cēsis'], 'Spēlētājs')

    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeEnabled()
  })

  it('switches to English and reveals an English location during the role journey', async () => {
    const user = userEvent.setup()
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Pārslēgt uz angļu valodu' }))
    await fillPlayers(user, ['Alice', 'Bob', 'Charlie'], 'Player')
    await user.click(screen.getByRole('button', { name: 'Start game' }))

    await user.click(screen.getByRole('button', { name: 'View location' }))
    expect(screen.getByText('You are the Spy')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hide and pass on' }))
    await user.click(screen.getByRole('button', { name: 'View location' }))

    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Park')).toBeInTheDocument()
  })

  it('completes the journey, pauses the timer, and resets with play again', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    jest.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

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
})
