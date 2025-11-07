import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './header'

// Mock the useAuth hook
const mockSignOut = jest.fn()
const mockUseAuth = jest.fn()

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Header', () => {
  beforeEach(() => {
    mockSignOut.mockClear()
    mockUseAuth.mockClear()
  })

  it('mostra título e botão Entrar quando usuário não está autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: mockSignOut,
    })

    const onLoginClick = jest.fn()
    render(<Header onLoginClick={onLoginClick} />)

    expect(screen.getByText(/Acessibilidade SP/i)).toBeInTheDocument()
    expect(screen.getByText(/Sistema de Reportes/i)).toBeInTheDocument()

    const loginButton = screen.getByRole('button', { name: /Entrar/i })
    fireEvent.click(loginButton)

    expect(onLoginClick).toHaveBeenCalledTimes(1)
  })

  it('mostra UserMenu quando usuário está autenticado', () => {
    const mockUser = { id: '1', name: 'Usuário Teste', email: 'teste@exemplo.com' }
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: mockSignOut,
    })

    const onLoginClick = jest.fn()
    render(<Header onLoginClick={onLoginClick} />)

    expect(screen.getByText(/Acessibilidade SP/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Entrar/i })).not.toBeInTheDocument()
  })
})
