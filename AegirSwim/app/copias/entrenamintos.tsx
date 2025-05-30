"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Clock, Flame, ChevronUp, ChevronDown, X, Loader2, User, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/Header"

// Importar los tipos
import type { Entrenamiento, EntrenamientosData } from "@/types/entrenamientos"

// Importar jsPDF para generar PDFs
import jsPDF from "jspdf"

export default function EntrenamientosPage() {
    // Estado para los entrenamientos
    const [entrenamientos, setEntrenamientos] = useState<EntrenamientosData | null>(null)
    // Estado para los entrenamientos del usuario
    const [entrenamientosUsuario, setEntrenamientosUsuario] = useState<Entrenamiento[] | null>(null)
    // Estado para controlar la carga
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingUsuario, setIsLoadingUsuario] = useState(true)
    // Estado para manejar errores
    const [error, setError] = useState<string | null>(null)
    const [errorUsuario, setErrorUsuario] = useState<string | null>(null)
    // Estado para controlar qué entrenamiento está expandido
    const [expandedId, setExpandedId] = useState<number | null>(null)
    // Estado para controlar la vista activa (predeterminados o mis entrenamientos)
    const [vistaActiva, setVistaActiva] = useState<"predeterminados" | "misEntrenamientos">("predeterminados")

    // Estado para la búsqueda
    const [terminoBusqueda, setTerminoBusqueda] = useState<string>("")
    // Estado para mostrar feedback de eliminación
    const [feedbackEliminacion, setFeedbackEliminacion] = useState<{ tipo: "exito" | "error"; mensaje: string } | null>(
        null,
    )
    // Estado para controlar el modal de confirmación
    const [entrenamientoAEliminar, setEntrenamientoAEliminar] = useState<number | null>(null)

    // Función para cargar los entrenamientos predeterminados
    useEffect(() => {
        const fetchEntrenamientos = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch("http://localhost:8085/entrenamientos")

                if (!response.ok) {
                    throw new Error(`Error al cargar los entrenamientos: ${response.status}`)
                }

                const data = await response.json()
                setEntrenamientos(data)
            } catch (err) {
                setError("Error al cargar los entrenamientos")
            } finally {
                setIsLoading(false)
            }
        }

        fetchEntrenamientos()
    }, [])

    // Función para cargar los entrenamientos del usuario
    useEffect(() => {
        const fetchEntrenamientosUsuario = async () => {
            if (vistaActiva === "misEntrenamientos") {
                setIsLoadingUsuario(true)
                setErrorUsuario(null)

                try {
                    const response = await fetch("http://localhost:8085/entrenamientosUser", {
                        credentials: "include",
                    })

                    if (!response.ok) {
                        if (response.status === 403) {
                            setErrorUsuario("Debe iniciar sesión")
                        } else {
                            const data = await response.json()
                            setErrorUsuario(data.error)
                        }
                    } else {
                        const data = await response.json()
                        setEntrenamientosUsuario(data)
                    }
                } catch (err) {
                    setErrorUsuario("Error al cargar tus entrenamientos")
                } finally {
                    setIsLoadingUsuario(false)
                }
            }
        }

        fetchEntrenamientosUsuario()
    }, [vistaActiva])

    const eliminarEntrenamiento = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8085/entrenamientos/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            const data = await response.json()
            if (response.ok) {
                // Actualizar la lista de entrenamientos del usuario
                setEntrenamientosUsuario((prev) => (prev ? prev.filter((entrenamiento) => entrenamiento.id !== id) : null))

                // Cerrar el detalle expandido si es el que se está eliminando
                if (expandedId === id) {
                    setExpandedId(null)
                }

                // Mostrar mensaje de éxito
                setFeedbackEliminacion({
                    tipo: "exito",
                    mensaje: data.success,
                })

                // Ocultar el mensaje después de 3 segundos
                setTimeout(() => {
                    setFeedbackEliminacion(null)
                }, 3000)
            } else {
                setFeedbackEliminacion({
                    tipo: "error",
                    mensaje: data.error,
                })
            }
        } catch (error) {
            setFeedbackEliminacion({
                tipo: "error",
                mensaje: "Error en la conexión con el servidor",
            })

            // Ocultar el mensaje después de 3 segundos
            setTimeout(() => {
                setFeedbackEliminacion(null)
            }, 3000)
        }

        // Limpiar el ID del entrenamiento a eliminar
        setEntrenamientoAEliminar(null)
    }

    // Función para confirmar eliminación
    const confirmarEliminacion = (id: number) => {
        setEntrenamientoAEliminar(id)
    }

    // Función para descargar entrenamiento como PDF
    const descargarEntrenamientoPDF = (entrenamiento: Entrenamiento) => {
        const doc = new jsPDF()

        // Configuración de fuentes y colores
        const primaryColor: [number, number, number] = [14, 165, 233] // sky-500
        const textColor: [number, number, number] = [31, 41, 55] // gray-800
        const lightGray: [number, number, number] = [156, 163, 175] // gray-400

        let yPosition = 20
        const pageWidth = doc.internal.pageSize.width
        const margin = 20
        const contentWidth = pageWidth - margin * 2

        // Función auxiliar para agregar texto con salto de línea automático
        const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
            doc.setFontSize(fontSize)
            const lines = doc.splitTextToSize(text, maxWidth)
            doc.text(lines, x, y)
            return y + lines.length * (fontSize * 0.4)
        }

        // Función auxiliar para verificar si necesitamos una nueva página
        const checkPageBreak = (requiredSpace: number) => {
            if (yPosition + requiredSpace > doc.internal.pageSize.height - 20) {
                doc.addPage()
                yPosition = 20
            }
        }

        // Título principal
        doc.setFontSize(20)
        doc.setTextColor(...primaryColor)
        doc.text("ENTRENAMIENTO DE NATACIÓN", margin, yPosition)
        yPosition += 15

        // Línea separadora
        doc.setDrawColor(...primaryColor)
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 15

        // Información general
        doc.setFontSize(16)
        doc.setTextColor(...textColor)
        doc.text("INFORMACIÓN GENERAL", margin, yPosition)
        yPosition += 10

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Nombre:", margin, yPosition)
        doc.setFont("helvetica", "normal")
        yPosition = addWrappedText(entrenamiento.nombre, margin + 25, yPosition, contentWidth - 25, 12)
        yPosition += 5

        doc.setFont("helvetica", "bold")
        doc.text("Descripción:", margin, yPosition)
        doc.setFont("helvetica", "normal")
        yPosition = addWrappedText(entrenamiento.descripcion, margin + 30, yPosition, contentWidth - 30, 10)
        yPosition += 10

        // Información en columnas
        const col1X = margin
        const col2X = margin + contentWidth / 2

        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Duración:", col1X, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(entrenamiento.duracion, col1X + 25, yPosition)

        doc.setFont("helvetica", "bold")
        doc.text("Nivel:", col2X, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(entrenamiento.nivel, col2X + 20, yPosition)
        yPosition += 8

        doc.setFont("helvetica", "bold")
        doc.text("Intensidad:", col1X, yPosition)
        doc.setFont("helvetica", "normal")
        doc.text(entrenamiento.intensidad, col1X + 25, yPosition)
        yPosition += 15

        // Series (si están disponibles)
        if (entrenamiento.seriesCalentamiento !== undefined) {
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...primaryColor)
            doc.text("SERIES POR SECCIÓN", margin, yPosition)
            yPosition += 8

            doc.setFontSize(10)
            doc.setTextColor(...textColor)
            doc.setFont("helvetica", "normal")
            doc.text(
                `Calentamiento: ${entrenamiento.seriesCalentamiento} ${entrenamiento.seriesCalentamiento > 1 ? "series" : "serie"}`,
                margin,
                yPosition,
            )
            yPosition += 5
            doc.text(
                `Parte Principal: ${entrenamiento.seriesPartePrincipal} ${entrenamiento.seriesPartePrincipal > 1 ? "series" : "serie"}`,
                margin,
                yPosition,
            )
            yPosition += 5
            doc.text(
                `Vuelta a la Calma: ${entrenamiento.seriesVueltaCalma} ${entrenamiento.seriesVueltaCalma > 1 ? "series" : "serie"}`,
                margin,
                yPosition,
            )
            yPosition += 15
        }

        // Función para crear tabla de ejercicios
        const crearTablaEjercicios = (titulo: string, ejercicios: any[]) => {
            checkPageBreak(30)

            // Título de la sección
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...primaryColor)
            doc.text(titulo.toUpperCase(), margin, yPosition)
            yPosition += 10

            if (ejercicios.length === 0) {
                doc.setFontSize(10)
                doc.setTextColor(...lightGray)
                doc.text("No hay ejercicios en esta sección", margin, yPosition)
                yPosition += 15
                return
            }

            // Encabezados de la tabla
            const headers = ["Rep.", "Metros", "Descanso", "Ritmo", "Estilo"]
            const colWidths = [20, 25, 25, 35, 35]
            const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)
            const startX = margin

            // Fondo del encabezado
            doc.setFillColor(240, 249, 255) // sky-50
            doc.rect(startX, yPosition - 5, tableWidth, 8, "F")

            // Texto del encabezado
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...textColor)

            let currentX = startX
            headers.forEach((header, index) => {
                doc.text(header, currentX + 2, yPosition)
                currentX += colWidths[index]
            })
            yPosition += 8

            // Línea separadora
            doc.setDrawColor(...lightGray)
            doc.setLineWidth(0.2)
            doc.line(startX, yPosition, startX + tableWidth, yPosition)
            yPosition += 3

            // Filas de datos
            ejercicios.forEach((ejercicio, index) => {
                checkPageBreak(15)

                // Fondo alternado
                if (index % 2 === 1) {
                    doc.setFillColor(249, 250, 251) // gray-50
                    doc.rect(startX, yPosition - 2, tableWidth, 10, "F")
                }

                doc.setFont("helvetica", "normal")
                doc.setFontSize(8)
                doc.setTextColor(...textColor)

                const rowData = [
                    ejercicio.repeticiones.toString(),
                    ejercicio.metros.toString(),
                    ejercicio.descanso.toString(),
                    ejercicio.ritmo,
                    ejercicio.estilo,
                ]

                currentX = startX
                rowData.forEach((data, colIndex) => {
                    const maxWidth = colWidths[colIndex] - 4
                    const lines = doc.splitTextToSize(data, maxWidth)
                    doc.text(lines, currentX + 2, yPosition + 2)
                    currentX += colWidths[colIndex]
                })

                yPosition += 8

                // Descripción (si existe)
                if (ejercicio.descripcion && ejercicio.descripcion.trim()) {
                    checkPageBreak(10)
                    doc.setFontSize(7)
                    doc.setTextColor(...lightGray)
                    doc.setFont("helvetica", "italic")
                    const descLines = doc.splitTextToSize(`Descripción: ${ejercicio.descripcion}`, tableWidth - 10)
                    doc.text(descLines, startX + 5, yPosition + 2)
                    yPosition += descLines.length * 3 + 3
                }

                yPosition += 2
            })

            yPosition += 10
        }

        // Crear tablas para cada sección
        crearTablaEjercicios("Calentamiento", entrenamiento.calentamiento)
        crearTablaEjercicios("Parte Principal", entrenamiento.partePrincipal)
        crearTablaEjercicios("Vuelta a la Calma", entrenamiento.vueltaCalma)

        // Footer
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(...lightGray)
            doc.text(`Generado por AquaTrain - Página ${i} de ${pageCount}`, margin, doc.internal.pageSize.height - 10)
            doc.text(new Date().toLocaleDateString("es-ES"), pageWidth - margin - 30, doc.internal.pageSize.height - 10)
        }

        // Descargar el PDF
        const fileName = `entrenamiento-${entrenamiento.nombre.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`
        doc.save(fileName)
    }

    const filtrarEntrenamientos = (entrenamientosData: any, termino: string) => {
        if (!termino.trim()) return entrenamientosData

        const terminoLower = termino.toLowerCase()

        if (vistaActiva === "predeterminados") {
            // Filtrar entrenamientos predeterminados
            const resultado: EntrenamientosData = {}

            Object.entries(entrenamientosData).forEach(([nivel, lista]) => {
                const listaFiltrada = (lista as Entrenamiento[]).filter(
                    (entrenamiento) =>
                        entrenamiento.nombre?.toLowerCase().includes(terminoLower) ||
                        entrenamiento.descripcion?.toLowerCase().includes(terminoLower) ||
                        entrenamiento.nivel?.toLowerCase().includes(terminoLower) ||
                        entrenamiento.intensidad?.toLowerCase().includes(terminoLower),
                )

                if (listaFiltrada.length > 0) {
                    resultado[nivel] = listaFiltrada
                }
            })

            return resultado
        } else {
            // Filtrar entrenamientos del usuario
            return (entrenamientosData as Entrenamiento[]).filter(
                (entrenamiento) =>
                    entrenamiento.nombre?.toLowerCase().includes(terminoLower) ||
                    entrenamiento.descripcion?.toLowerCase().includes(terminoLower) ||
                    entrenamiento.nivel?.toLowerCase().includes(terminoLower) ||
                    entrenamiento.intensidad?.toLowerCase().includes(terminoLower),
            )
        }
    }

    // Función para alternar la expansión
    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id)
    }

    // Función para encontrar el entrenamiento expandido
    const findExpandedEntrenamiento = (): Entrenamiento | null => {
        if (expandedId === null) return null

        if (vistaActiva === "predeterminados" && entrenamientos) {
            for (const nivel in entrenamientos) {
                const found = entrenamientos[nivel].find((e) => e.id === expandedId)
                if (found) return found
            }
        } else if (vistaActiva === "misEntrenamientos" && entrenamientosUsuario) {
            return entrenamientosUsuario.find((e) => e.id === expandedId) || null
        }

        return null
    }

    // Encontrar el entrenamiento expandido
    const expandedEntrenamiento = findExpandedEntrenamiento()

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-sky-900">Entrenamientos</h1>
                        <p className="text-muted-foreground">Explora nuestra biblioteca de entrenamientos para todos los niveles</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-52">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Buscar..."
                                className="pl-8"
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                            <span className="sr-only">Filtrar</span>
                        </Button>
                    </div>
                </div>

                {/* Selector de vista */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                        <Button
                            variant={vistaActiva === "predeterminados" ? "default" : "outline"}
                            className={`w-full sm:w-auto ${vistaActiva === "predeterminados" ? "bg-sky-500 hover:bg-sky-600" : ""}`}
                            onClick={() => setVistaActiva("predeterminados")}
                        >
                            Entrenamientos predeterminados
                        </Button>
                        <Button
                            variant={vistaActiva === "misEntrenamientos" ? "default" : "outline"}
                            className={`w-full sm:w-auto ${vistaActiva === "misEntrenamientos" ? "bg-sky-500 hover:bg-sky-600" : ""}`}
                            onClick={() => setVistaActiva("misEntrenamientos")}
                        >
                            <User className="h-4 w-4 mr-2" />
                            Mis entrenamientos
                        </Button>
                    </div>
                </div>

                {/* Feedback de eliminación */}
                {feedbackEliminacion && (
                    <Alert
                        variant={feedbackEliminacion.tipo === "exito" ? "success" : "destructive"}
                        className="mb-4 animate-in fade-in-50 duration-300"
                    >
                        <AlertTitle>{feedbackEliminacion.tipo === "exito" ? "Éxito" : "Error"}</AlertTitle>
                        <AlertDescription>{feedbackEliminacion.mensaje}</AlertDescription>
                    </Alert>
                )}

                {/* Vista de entrenamientos predeterminados */}
                {vistaActiva === "predeterminados" && (
                    <>
                        {/* Estado de carga */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
                                <p className="text-muted-foreground">Cargando entrenamientos...</p>
                            </div>
                        )}

                        {/* Mensaje de error */}
                        {error && (
                            <Alert variant="destructive" className="mb-8">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {error}
                                    <div className="mt-2">
                                        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                                            Intentar de nuevo
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Contenido principal - solo se muestra cuando no hay error y no está cargando */}
                        {!isLoading && !error && entrenamientos && (
                            <Tabs defaultValue="principiante" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
                                    <TabsTrigger value="principiante" className="py-2 px-1 sm:px-4">
                                        Principiante
                                    </TabsTrigger>
                                    <TabsTrigger value="intermedio" className="py-2 px-1 sm:px-4">
                                        Intermedio
                                    </TabsTrigger>
                                    <TabsTrigger value="avanzado" className="py-2 px-1 sm:px-4">
                                        Avanzado
                                    </TabsTrigger>
                                </TabsList>

                                {Object.entries(filtrarEntrenamientos(entrenamientos, terminoBusqueda)).map(([nivel, lista]) => (
                                    <TabsContent key={nivel} value={nivel} className="mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {(lista as Entrenamiento[]).map((entrenamiento) => (
                                                <Card key={entrenamiento.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-lg">{entrenamiento.nombre}</CardTitle>
                                                        <CardDescription className="line-clamp-2">{entrenamiento.descripcion}</CardDescription>
                                                    </CardHeader>
                                                    <CardFooter>
                                                        <Button
                                                            className={`w-full flex items-center justify-center gap-2 ${expandedId === entrenamiento.id
                                                                    ? "bg-sky-700 hover:bg-sky-800"
                                                                    : "bg-sky-500 hover:bg-sky-600"
                                                                }`}
                                                            onClick={() => toggleExpand(entrenamiento.id)}
                                                        >
                                                            {expandedId === entrenamiento.id ? (
                                                                <>
                                                                    Ocultar detalles
                                                                    <ChevronUp className="h-4 w-4" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Ver detalles
                                                                    <ChevronDown className="h-4 w-4" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        )}

                        {/* Mensaje cuando no hay resultados de búsqueda */}
                        {terminoBusqueda && Object.keys(filtrarEntrenamientos(entrenamientos, terminoBusqueda)).length === 0 && (
                            <div className="text-center py-12 border rounded-lg bg-gray-50 mt-4">
                                <Search className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                                <p className="text-muted-foreground mb-6">
                                    No hay entrenamientos que coincidan con "{terminoBusqueda}"
                                </p>
                                <Button variant="outline" onClick={() => setTerminoBusqueda("")} className="bg-sky-50">
                                    Limpiar búsqueda
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Vista de mis entrenamientos */}
                {vistaActiva === "misEntrenamientos" && (
                    <>
                        {/* Estado de carga */}
                        {isLoadingUsuario && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 text-sky-500 animate-spin mb-4" />
                                <p className="text-muted-foreground">Cargando tus entrenamientos...</p>
                            </div>
                        )}

                        {/* Mensaje de error */}
                        {errorUsuario && (
                            <Alert variant="destructive" className="mb-8">
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {errorUsuario}
                                    <div className="mt-2">
                                        {errorUsuario.includes("iniciar sesión") ? (
                                            <Link href="/login">
                                                <Button variant="outline" className="mt-2">
                                                    Iniciar sesión
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                                                Intentar de nuevo
                                            </Button>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Contenido principal - solo se muestra cuando no hay error y no está cargando */}
                        {!isLoadingUsuario && !errorUsuario && entrenamientosUsuario && (
                            <>
                                {entrenamientosUsuario.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {filtrarEntrenamientos(entrenamientosUsuario, terminoBusqueda).map(
                                            (entrenamiento: Entrenamiento) => (
                                                <Card key={entrenamiento.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-lg">{entrenamiento.nombre}</CardTitle>
                                                        <CardDescription className="line-clamp-2">{entrenamiento.descripcion}</CardDescription>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {entrenamiento.nivel}
                                                            </Badge>
                                                        </div>
                                                    </CardHeader>
                                                    <CardFooter className="flex flex-col gap-2">
                                                        <Button
                                                            className={`w-full flex items-center justify-center gap-2 ${expandedId === entrenamiento.id
                                                                    ? "bg-sky-700 hover:bg-sky-800"
                                                                    : "bg-sky-500 hover:bg-sky-600"
                                                                }`}
                                                            onClick={() => toggleExpand(entrenamiento.id)}
                                                        >
                                                            {expandedId === entrenamiento.id ? (
                                                                <>
                                                                    Ocultar detalles
                                                                    <ChevronUp className="h-4 w-4" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Ver detalles
                                                                    <ChevronDown className="h-4 w-4" />
                                                                </>
                                                            )}
                                                        </Button>
                                                        <div className="grid grid-cols-2 gap-2 w-full">
                                                            <Link href={`/crea-entrenamientos?id=${entrenamiento.id}`} className="w-full">
                                                                <Button variant="outline" size="sm" className="w-full">
                                                                    Editar
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-red-500 hover:text-red-700"
                                                                onClick={() => confirmarEliminacion(entrenamiento.id)}
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                                        <h3 className="text-xl font-semibold mb-2">No tienes entrenamientos personalizados</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Crea tu primer entrenamiento personalizado para verlo aquí
                                        </p>
                                        <Link href="/crea-entrenamientos">
                                            <Button className="bg-sky-500 hover:bg-sky-600">Crear entrenamiento</Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Mensaje cuando no hay resultados de búsqueda */}
                        {terminoBusqueda &&
                            entrenamientosUsuario &&
                            entrenamientosUsuario.length > 0 &&
                            filtrarEntrenamientos(entrenamientosUsuario, terminoBusqueda).length === 0 && (
                                <div className="text-center py-12 border rounded-lg bg-gray-50 mt-4">
                                    <Search className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                                    <p className="text-muted-foreground mb-6">
                                        No hay entrenamientos que coincidan con "{terminoBusqueda}"
                                    </p>
                                    <Button variant="outline" onClick={() => setTerminoBusqueda("")} className="bg-sky-50">
                                        Limpiar búsqueda
                                    </Button>
                                </div>
                            )}
                    </>
                )}

                {/* Sección de detalles expandidos */}
                {expandedEntrenamiento && (
                    <div className="mt-12 w-full animate-in fade-in-50 duration-300">
                        <div className="bg-white border rounded-lg shadow-md p-4 sm:p-6 max-w-5xl mx-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-sky-900">{expandedEntrenamiento.nombre}</h2>
                                        {vistaActiva === "misEntrenamientos" && <Badge className="bg-sky-500">Personalizado</Badge>}
                                    </div>
                                    <p className="text-sm sm:text-base text-muted-foreground mt-1">{expandedEntrenamiento.descripcion}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedId(null)}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Cerrar</span>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                <div className="flex items-center gap-3 bg-sky-50 p-3 sm:p-4 rounded-lg">
                                    <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-sky-500" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Duración</p>
                                        <p className="text-base sm:text-lg font-semibold">{expandedEntrenamiento.duracion}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-sky-50 p-3 sm:p-4 rounded-lg">
                                    <Flame className="h-6 sm:h-8 w-6 sm:w-8 text-sky-500" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Intensidad</p>
                                        <p className="text-base sm:text-lg font-semibold">{expandedEntrenamiento.intensidad}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Mostrar series si están disponibles (para entrenamientos personalizados) */}
                            {expandedEntrenamiento.seriesCalentamiento !== undefined && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Series Calentamiento</p>
                                        <p className="text-base sm:text-lg font-semibold">{expandedEntrenamiento.seriesCalentamiento}</p>
                                    </div>
                                    <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Series Parte Principal</p>
                                        <p className="text-base sm:text-lg font-semibold">{expandedEntrenamiento.seriesPartePrincipal}</p>
                                    </div>
                                    <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                            Series Vuelta a la Calma
                                        </p>
                                        <p className="text-base sm:text-lg font-semibold">{expandedEntrenamiento.seriesVueltaCalma}</p>
                                    </div>
                                </div>
                            )}

                            {/* Calentamiento */}
                            <div className="mb-6 sm:mb-8">
                                <h3 className="text-lg sm:text-xl font-bold text-sky-900 mb-3 sm:mb-4">Calentamiento</h3>

                                {/* Versión móvil de la tabla */}
                                <div className="block sm:hidden">
                                    {expandedEntrenamiento.calentamiento.map((ejercicio, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-lg mb-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                        >
                                            <div className="grid grid-cols-3 divide-x text-center border-b">
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Rep.</p>
                                                    <p className="font-medium">{ejercicio.repeticiones}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Metros</p>
                                                    <p className="font-medium">{ejercicio.metros}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Descanso</p>
                                                    <p className="font-medium">{ejercicio.descanso}</p>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Ritmo:</span>
                                                        <span className="text-sm">{ejercicio.ritmo}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                        <span className="text-sm">{ejercicio.estilo}</span>
                                                    </div>
                                                </div>
                                                {ejercicio.descripcion && (
                                                    <div className="mt-2 pt-2 border-t border-dashed">
                                                        <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                        <p className="text-sm">{ejercicio.descripcion}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Versión desktop de la tabla */}
                                <div className="hidden sm:block border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-sky-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Rep.
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Metros
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descanso
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Ritmo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Estilo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descripción
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {expandedEntrenamiento.calentamiento.map((ejercicio, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.repeticiones}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.metros}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descanso}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.ritmo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.estilo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descripcion}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Parte Principal */}
                            <div className="mb-6 sm:mb-8">
                                <h3 className="text-lg sm:text-xl font-bold text-sky-900 mb-3 sm:mb-4">Parte Principal</h3>

                                {/* Versión móvil de la tabla */}
                                <div className="block sm:hidden">
                                    {expandedEntrenamiento.partePrincipal.map((ejercicio, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-lg mb-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                        >
                                            <div className="grid grid-cols-3 divide-x text-center border-b">
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Rep.</p>
                                                    <p className="font-medium">{ejercicio.repeticiones}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Metros</p>
                                                    <p className="font-medium">{ejercicio.metros}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Descanso</p>
                                                    <p className="font-medium">{ejercicio.descanso}</p>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Ritmo:</span>
                                                        <span className="text-sm">{ejercicio.ritmo}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                        <span className="text-sm">{ejercicio.estilo}</span>
                                                    </div>
                                                </div>
                                                {ejercicio.descripcion && (
                                                    <div className="mt-2 pt-2 border-t border-dashed">
                                                        <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                        <p className="text-sm">{ejercicio.descripcion}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Versión desktop de la tabla */}
                                <div className="hidden sm:block border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-sky-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Rep.
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Metros
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descanso
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Ritmo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Estilo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descripción
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {expandedEntrenamiento.partePrincipal.map((ejercicio, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.repeticiones}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.metros}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descanso}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.ritmo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.estilo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descripcion}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Vuelta a la Calma */}
                            <div className="mb-6 sm:mb-8">
                                <h3 className="text-lg sm:text-xl font-bold text-sky-900 mb-3 sm:mb-4">Vuelta a la Calma</h3>

                                {/* Versión móvil de la tabla */}
                                <div className="block sm:hidden">
                                    {expandedEntrenamiento.vueltaCalma.map((ejercicio, index) => (
                                        <div
                                            key={index}
                                            className={`border rounded-lg mb-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                        >
                                            <div className="grid grid-cols-3 divide-x text-center border-b">
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Rep.</p>
                                                    <p className="font-medium">{ejercicio.repeticiones}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Metros</p>
                                                    <p className="font-medium">{ejercicio.metros}</p>
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-xs text-gray-500 mb-1">Descanso</p>
                                                    <p className="font-medium">{ejercicio.descanso}</p>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Ritmo:</span>
                                                        <span className="text-sm">{ejercicio.ritmo}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                        <span className="text-sm">{ejercicio.estilo}</span>
                                                    </div>
                                                </div>
                                                {ejercicio.descripcion && (
                                                    <div className="mt-2 pt-2 border-t border-dashed">
                                                        <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                        <p className="text-sm">{ejercicio.descripcion}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Versión desktop de la tabla */}
                                <div className="hidden sm:block border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-sky-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Rep.
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Metros
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descanso
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Ritmo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Estilo
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Descripción
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {expandedEntrenamiento.vueltaCalma.map((ejercicio, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.repeticiones}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.metros}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descanso}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.ritmo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.estilo}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{ejercicio.descripcion}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <Button
                                    size="lg"
                                    className="bg-sky-500 hover:bg-sky-600 px-6 sm:px-8"
                                    onClick={() => descargarEntrenamientoPDF(expandedEntrenamiento)}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar entrenamiento
                                </Button>
                                {vistaActiva === "misEntrenamientos" && (
                                    <Link href={`/crea-entrenamientos?id=${expandedEntrenamiento.id}`}>
                                        <Button size="lg" variant="outline" className="px-6 sm:px-8">
                                            Editar entrenamiento
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {entrenamientoAEliminar && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-2">Confirmar eliminación</h3>
                            <p className="mb-4">
                                ¿Estás seguro de que deseas eliminar este entrenamiento? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEntrenamientoAEliminar(null)}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" onClick={() => eliminarEntrenamiento(entrenamientoAEliminar)}>
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="border-t py-6 bg-white">
                <div className="container text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AegirSwim. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
