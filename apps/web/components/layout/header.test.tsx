import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { Header } from './header'

// Mock auth functions to simulate logged-in state
type TestUser = { id: string; name: string } | null
const mockGetCurrentUser = jest.fn<TestUser, []>(() => null)
const mockInitializeAuth = jest.fn()

jest.mock('@/lib/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  initializeAuth: () => mockInitializeAuth(),
}))

describe('Header', () => {
  beforeEach(() => {
    mockGetCurrentUser.mockClear()
    mockInitializeAuth.mockClear()
    mockGetCurrentUser.mockReturnValue(null)
  })

  it('mostra título e botão Entrar chama callback', () => {
    const onLoginClick = jest.fn()
    render(<Header onLoginClick={onLoginClick} />)

    expect(screen.getByText(/Acessibilidade SP/i)).toBeInTheDocument()

    const loginButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalled()
  })

  it('não mostra botão Entrar quando usuário está logado', () => {
    mockGetCurrentUser.mockReturnValue({ id: '1', name: 'Usuário Teste' })

    const onLoginClick = jest.fn()
    render(<Header onLoginClick={onLoginClick} />)

    expect(screen.queryByRole('button', { name: /Entrar/i })).toBeNull()
    expect(screen.getByText(/Acessibilidade SP/i)).toBeInTheDocument()
  })
})
