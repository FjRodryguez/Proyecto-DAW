"use client";

import { useState } from "react"
import Image from "next/image"
import { Calendar, Medal, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Link from "next/link"

export default function Home() {
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const hacerPremium = async () => {
    try {
      const response = await fetch(`http://localhost:8085/usuario/doPremium`, {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json()
      if (!response.ok) {
        setErrorMessage(data.error)
      } else {
        setSuccessMessage(data.success)

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setErrorMessage("Error en la conexión con el servidor")
    }
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section ?height=500&width=600*/}
        <section id="inicio" className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white py-20 md:py-32">
          <div className="container flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-sky-900">
                Mejora tu técnica de natación con entrenamientos
              </h1>
              <p className="text-lg text-muted-foreground">
                AegirSwim te ayuda a perfeccionar tu estilo, mejorar tu resistencia y alcanzar tus metas en la natación
                con planes personalizados y seguimiento profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-sky-500 hover:bg-sky-600">
                  Comenzar ahora
                </Button>
                <Link href="#planes">
                  <Button size="lg" variant="outline">
                    Ver planes
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative h-[300px] md:h-[500px] w-full rounded-xl overflow-hidden shadow-xl hidden xl:block">
              <Image
                src="/img/imagen-principal.jpg"
                alt="Nadador profesional"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        </section>

        {/* Features Section */}
        <section id="caracteristicas" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">¿Por qué elegir AegirSwim?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nuestra aplicación combina tecnología avanzada con metodologías probadas para ofrecerte la mejor
                experiencia de entrenamiento.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-sky-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <Medal className="h-10 w-10 text-sky-500 mb-2" />
                  <CardTitle>Entrenamientos</CardTitle>
                  <CardDescription>Planes adaptados a tu nivel y objetivos específicos.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Accede a una variedad de rutinas diseñadas por expertos en natación. Mejora tu resistencia, velocidad y técnica con sesiones personalizadas según tu progreso.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-sky-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-sky-500 mb-2" />
                  <CardTitle>Crea tus propios entrenamientos</CardTitle>
                  <CardDescription>Organiza tus sesiones según tu disponibilidad y metas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Diseña tus entrenamientos desde cero: elige estilo, metros, intensidad y más. Guarda tus sesiones y llévalas contigo al agua.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-sky-100 hover:shadow-md transition-shadow">
                <CardHeader>
                  <Crown className="h-10 w-10 text-sky-500 mb-2" />
                  <CardTitle>Versión Premium</CardTitle>
                  <CardDescription>Desbloquea todo el potencial de la app.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Con la versión Premium puedes crear entrenamientos ilimitados, acceder a funciones avanzadas y mantener un historial completo de tu progreso. Ideal para nadadores comprometidos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Create Your Own Trainings Section */}
        <section id="crea-entrenamientos" className="py-20 bg-sky-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">Crea tus propios entrenamientos</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Diseña rutinas personalizadas según tus objetivos y nivel de experiencia.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl hidden sm:block">
                <Image
                  src="/img/imagen-secundaria.jpg?height=400&width=600"
                  alt="Creación de entrenamientos"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-sky-100 text-sky-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-bold">Selecciona tu objetivo</h3>
                  </div>
                  <p className="text-muted-foreground pl-10">
                    Define si quieres mejorar resistencia, velocidad, técnica o prepararte para una competición.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-sky-100 text-sky-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-bold">Elige ejercicios</h3>
                  </div>
                  <p className="text-muted-foreground pl-10">
                    Selecciona entre cientos de ejercicios específicos para cada estilo de natación.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-sky-100 text-sky-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-bold">Personaliza la intensidad</h3>
                  </div>
                  <p className="text-muted-foreground pl-10">
                    Ajusta series, repeticiones y descansos según tu nivel actual.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-sky-100 text-sky-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      4
                    </div>
                    <h3 className="text-xl font-bold">Guarda y comparte</h3>
                  </div>
                  <p className="text-muted-foreground pl-10">
                    Almacena tus rutinas favoritas y compártelas con otros nadadores de la comunidad.
                  </p>
                </div>
                <Button className="mt-4 bg-sky-500 hover:bg-sky-600">Comenzar a crear</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planes" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">Plan Premium</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Accede a todas las funcionalidades con nuestro plan premium.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <Card className="border-sky-500 shadow-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">AegirSwim Premium</CardTitle>
                  <CardDescription className="text-lg">
                    Todas las herramientas que necesitas para mejorar tu natación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Características incluidas:</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <span className="mr-2 text-sky-500">✓</span>
                          Acceso a todos los entrenamientos
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-sky-500">✓</span>
                          Creación ilimitada de rutinas personalizadas
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-sky-500">✓</span>
                          Seguimiento de progreso avanzado
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-sky-500">✓</span>
                          Acceso a la comunidad premium
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-sky-500">✓</span>
                          Soporte prioritario
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Elige tu plan:</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:border-sky-500 cursor-pointer transition-colors">
                            <div>
                              <p className="font-medium">1 mes</p>
                              <p className="text-sm text-muted-foreground">Acceso completo durante 1 mes</p>
                            </div>
                            <p className="text-xl font-bold text-sky-700">€9.99</p>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg border-sky-500 bg-sky-50 cursor-pointer transition-colors relative">
                            <div className="absolute -top-3 left-4 bg-sky-500 text-white text-xs px-2 py-1 rounded-full">
                              Más popular
                            </div>
                            <div>
                              <p className="font-medium">3 meses</p>
                              <p className="text-sm text-muted-foreground">Ahorra un 15% respecto al plan mensual</p>
                            </div>
                            <p className="text-xl font-bold text-sky-700">€25.49</p>
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-lg hover:border-sky-500 cursor-pointer transition-colors">
                            <div>
                              <p className="font-medium">1 año</p>
                              <p className="text-sm text-muted-foreground">Ahorra un 30% respecto al plan mensual</p>
                            </div>
                            <p className="text-xl font-bold text-sky-700">€89.99</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col space-y-2 w-full">
                    <Button className="bg-sky-500 hover:bg-sky-600 py-6 text-lg" onClick={hacerPremium}>
                      Comenzar ahora
                    </Button>
                    {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
