"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { getCurrentUser, initializeAuth, type User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertTriangle, Users, Plus, BarChart3 } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    initializeAuth()
    setUser(getCurrentUser())
  }, [])

  const handleLoginSuccess = () => {
    setUser(getCurrentUser())
    setShowLogin(false)
  }

  const handleLoginClick = () => {
    setShowLogin(true)
  }

  const handleNewReport = () => {
    router.push("/select-location")
  }

  const handleViewDashboard = () => {
    router.push("/dashboard")
  }

  if (showLogin && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLoginClick={handleLoginClick} />
        <main className="container mx-auto px-4 py-8">
          <LoginForm onSuccess={handleLoginSuccess} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLoginClick={handleLoginClick} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Sistema de Reportes de Acessibilidade</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ajude a melhorar a acessibilidade do transporte público em São Paulo. Reporte problemas em pontos de ônibus,
            estações de trem e metrô.
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleNewReport} size="lg" className="min-w-48">
                <Plus className="h-5 w-5 mr-2" />
                Fazer Novo Reporte
              </Button>
              <Button onClick={handleViewDashboard} variant="outline" size="lg" className="min-w-48 bg-transparent">
                <BarChart3 className="h-5 w-5 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          ) : (
            <div className="bg-card p-6 rounded-lg border max-w-md mx-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Para começar a reportar problemas, faça seu cadastro:
              </p>
              <LoginForm onSuccess={handleLoginSuccess} />
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locais Cadastrados</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">Pontos de ônibus e estações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reportes Ativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Problemas aguardando solução</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Pessoas contribuindo</p>
            </CardContent>
          </Card>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
              <CardDescription>Processo simples para reportar problemas de acessibilidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Faça seu cadastro</h4>
                  <p className="text-sm text-muted-foreground">Entre com seu nome e email</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Selecione o local</h4>
                  <p className="text-sm text-muted-foreground">Escolha o ponto de ônibus ou estação</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Descreva o problema</h4>
                  <p className="text-sm text-muted-foreground">Relate o problema de acessibilidade encontrado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Problemas</CardTitle>
              <CardDescription>Principais categorias de problemas reportados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Rampas de Acesso</span>
                <span className="text-sm text-muted-foreground">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Piso Tátil</span>
                <span className="text-sm text-muted-foreground">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Elevadores</span>
                <span className="text-sm text-muted-foreground">18%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sinalização</span>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Outros</span>
                <span className="text-sm text-muted-foreground">22%</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
