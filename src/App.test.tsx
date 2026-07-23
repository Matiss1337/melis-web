import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('requires three named players before starting', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Spēlētāji' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Spēlētājs 1'), 'Anna')
    await user.type(screen.getByPlaceholderText('Spēlētājs 2'), 'Berts')
    await user.type(screen.getByPlaceholderText('Spēlētājs 3'), 'Cēsis')

    expect(screen.getByRole('button', { name: 'Sākt spēli' })).toBeEnabled()
  })

  it('switches to English and reveals an English location', async () => {
    const user = userEvent.setup()
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Pārslēgt uz angļu valodu' }))
    await user.type(screen.getByPlaceholderText('Player 1'), 'Alice')
    await user.type(screen.getByPlaceholderText('Player 2'), 'Bob')
    await user.type(screen.getByPlaceholderText('Player 3'), 'Charlie')
    await user.click(screen.getByRole('button', { name: 'Start game' }))

    await user.click(screen.getByRole('button', { name: 'View location' }))
    expect(screen.getByText('You are the Spy')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hide and pass on' }))
    await user.click(screen.getByRole('button', { name: 'View location' }))

    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Park')).toBeInTheDocument()
  })
})
