"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Trash2, Save, Clock, Flame, AlertTriangle, Pencil, ChevronDown, ChevronUp, Crown } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
// Añadir la importación del componente ErroresModal
import ErroresModal from "@/components/ErroresModal"

import type { EjercicioEnCreacion } from "@/types/entrenamientos"
import type { EntrenamientoEnCreacion } from "@/types/entrenamientos"
import Link from "next/link"

// Ejercicio vacío para inicializar
const ejercicioVacio: EjercicioEnCreacion = {
    repeticiones: 0,
    metros: 0,
    descanso: 0,
    id_ritmo: "",
    id_estilo: "",
    descripcion: "",
}

export default function CreaEntrenamientosPage() {
    const router = useRouter()

    // Justo después de const router = useRouter()
    const searchParams = useSearchParams()
    const entrenamientoId = searchParams.get("id")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Estados para verificar límites de usuario
    const [isPremium, setIsPremium] = useState<boolean>(false)
    const [cantidadEntrenamientos, setCantidadEntrenamientos] = useState<number>(0)
    const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(true)
    const [puedeCrearEntrenamiento, setPuedeCrearEntrenamiento] = useState<boolean>(true)

    // Estado para el entrenamiento en creación
    const [entrenamiento, setEntrenamiento] = useState<EntrenamientoEnCreacion>({
        nombre: "",
        descripcion: "",
        duracion: "",
        nivel: "",
        intensidad: "",
        calentamiento: [],
        seriesCalentamiento: 1,
        partePrincipal: [],
        seriesPartePrincipal: 1,
        vueltaCalma: [],
        seriesVueltaCalma: 1,
    })

    // Estado para el ejercicio que se está editando actualmente
    const [ejercicioActual, setEjercicioActual] = useState<EjercicioEnCreacion>({ ...ejercicioVacio })

    // Estado para controlar qué sección está siendo editada
    const [seccionActual, setSeccionActual] = useState<"calentamiento" | "partePrincipal" | "vueltaCalma">(
        "calentamiento",
    )

    const [estilos, setEstilos] = useState<{ id: string; estilo: string }[]>([])
    const [intensidades, setIntensidades] = useState<{ id: string; intensidad: string }[]>([])
    const [niveles, setNiveles] = useState<{ id: string; nivel: string }[]>([])
    const [ritmos, setRitmos] = useState<{ id: string; ritmo: string }[]>([])
    const [duraciones, setDuraciones] = useState<{ id: string; duracion: string }[]>([])

    // Estado para controlar errores de validación
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [successMessage, setSuccessMessage] = useState("")

    // Estado para controlar errores de validación según la sección del entrenamiento
    const [erroresSecciones, setErroresSecciones] = useState<Record<string, any>>({})

    // Estado para controlar el modo de edición
    const [modoEdicion, setModoEdicion] = useState<boolean>(false)

    // Estado para guardar el índice del ejercicio que se está editando
    const [indiceEdicion, setIndiceEdicion] = useState<number>(-1)

    const [isGuardando, setIsGuardando] = useState<boolean>(false)

    // Añadir un estado para controlar la apertura del modal de errores
    // Añadir esto después de la línea donde se define el estado isGuardando
    const [modalErroresAbierto, setModalErroresAbierto] = useState<boolean>(false)

    // Estado para controlar qué ejercicios tienen la descripción expandida
    const [descripcionesExpandidas, setDescripcionesExpandidas] = useState<{
        [key: string]: Set<number>
    }>({
        calentamiento: new Set(),
        partePrincipal: new Set(),
        vueltaCalma: new Set(),
    })

    // Efecto para verificar el estado del usuario (premium y cantidad de entrenamientos)
    useEffect(() => {
        const verificarEstadoUsuario = async () => {
            // Solo verificar si estamos creando un nuevo entrenamiento
            if (entrenamientoId) {
                setIsLoadingUserData(false)
                setPuedeCrearEntrenamiento(true)
                return
            }

            setIsLoadingUserData(true)
            try {
                // Verificar si el usuario es premium
                const premiumResponse = await fetch("http://localhost:8085/usuario/premium", {
                    credentials: "include",
                })

                if (premiumResponse.ok) {
                    const premiumData = await premiumResponse.json()
                    console.log(premiumData)
                    setIsPremium(premiumData.success || false)

                    // Si no es premium, verificar cantidad de entrenamientos
                    if (!premiumData.success) {
                        const entrenamientosResponse = await fetch("http://localhost:8085/numeroEntrenamientosUser", {
                            credentials: "include",
                        })

                        if (entrenamientosResponse.ok) {
                            const entrenamientosData = await entrenamientosResponse.json()
                            console.log(entrenamientosData)
                            const cantidad = entrenamientosData.success || 0
                            setCantidadEntrenamientos(cantidad)
                            console.log(cantidad)

                            // Si tiene 3 o más entrenamientos y no es premium, no puede crear más
                            setPuedeCrearEntrenamiento(cantidad < 3)
                        } else {
                            // Si hay error al obtener entrenamientos, asumir que puede crear
                            setPuedeCrearEntrenamiento(true)
                        }
                    } else {
                        // Si es premium, puede crear sin límites
                        setPuedeCrearEntrenamiento(true)
                    }
                } else {
                    // Si hay error al verificar premium, asumir que no es premium pero puede crear
                    setIsPremium(false)
                    setPuedeCrearEntrenamiento(true)
                }
            } catch (error) {
                // En caso de error, permitir crear
                setIsPremium(false)
                setPuedeCrearEntrenamiento(true)
            } finally {
                setIsLoadingUserData(false)
            }
        }

        verificarEstadoUsuario()
    }, [entrenamientoId])

    // Efecto para cargar los datos del entrenamiento si se proporciona un ID
    useEffect(() => {
        const cargarEntrenamiento = async () => {
            if (!entrenamientoId) return

            setIsLoading(true)
            try {
                // Intentar obtener el entrenamiento del usuario
                const response = await fetch(`http://localhost:8085/entrenamientos/${entrenamientoId}`, {
                    method: "GET",
                    credentials: "include",
                })

                const data = await response.json()
                if (response.ok) {
                    setEntrenamiento({
                        nombre: data.nombre,
                        descripcion: data.descripcion,
                        duracion: data.id_duracion,
                        nivel: data.id_nivel,
                        intensidad: data.id_intensidad,
                        calentamiento: data.calentamiento,
                        seriesCalentamiento: data.seriesCalentamiento,
                        partePrincipal: data.partePrincipal,
                        seriesPartePrincipal: data.seriesPartePrincipal,
                        vueltaCalma: data.vueltaCalma,
                        seriesVueltaCalma: data.seriesVueltaCalma,
                    })
                    setModoEdicion(true)
                } else {
                    setErrors(data)
                }
            } catch (error) {
                setErrors({
                    error: "Error en la conexión. Por favor, inténtelo de nuevo." + error,
                })
            } finally {
                setIsLoading(false)
            }
        }

        cargarEntrenamiento()
    }, [entrenamientoId])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:8085/cargarDatos")
                const data = await response.json()
                if (!response.ok) {
                    setErrors(data)
                } else {
                    setEstilos(data.estilos)
                    setIntensidades(data.intensidad)
                    setNiveles(data.niveles)
                    setRitmos(data.ritmos)
                    setDuraciones(data.duracion)
                }
            } catch (error) {
                setErrors({
                    error: "Ocurrió un error en la conexión con el servidor.",
                })
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (Object.keys(erroresSecciones).length > 0) {
            setModalErroresAbierto(true)
        }
    }, [erroresSecciones])

    const guardarEntrenamiento = async () => {
        // Verificar si puede crear antes de guardar (solo para nuevos entrenamientos)
        if (!entrenamientoId && !puedeCrearEntrenamiento) {
            return
        }

        // Activar estado de guardado
        setIsGuardando(true)
        setErrors({})

        try {
            // Preparar los datos para enviar
            const entrenamientoData = {
                nombre: entrenamiento.nombre,
                descripcion: entrenamiento.descripcion,
                duracion: entrenamiento.duracion,
                nivel: entrenamiento.nivel,
                intensidad: entrenamiento.intensidad,
                calentamiento: entrenamiento.calentamiento,
                seriesCalentamiento: entrenamiento.seriesCalentamiento,
                partePrincipal: entrenamiento.partePrincipal,
                seriesPartePrincipal: entrenamiento.seriesPartePrincipal,
                vueltaCalma: entrenamiento.vueltaCalma,
                seriesVueltaCalma: entrenamiento.seriesVueltaCalma,
            }

            // URL y método dependiendo de si es creación o actualización
            const url = entrenamientoId
                ? `http://localhost:8085/entrenamientos/${entrenamientoId}`
                : "http://localhost:8085/entrenamientos/new"

            const method = entrenamientoId ? "PUT" : "POST"

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(entrenamientoData),
            })

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json()

                const erroresSecciones: Record<string, any> = {}
                const errores: Record<string, string> = {}

                // Procesar los errores
                Object.entries(errorData).forEach(([key, value]) => {
                    // Errores de secciones específicas
                    if (["calentamiento", "partePrincipal", "vueltaCalma"].includes(key)) {
                        erroresSecciones[key] = value
                    }
                    // Errores generales
                    else if (typeof value === "string") {
                        errores[key] = value as string
                    }
                    // Otros tipos de errores
                    else {
                        errores[key] = JSON.stringify(value)
                    }
                })

                setErroresSecciones(erroresSecciones)
                setErrors(errores)

                // Si hay errores en las secciones, abrir el modal
                if (Object.keys(erroresSecciones).length > 0) {
                    setModalErroresAbierto(true)
                }
            } else {
                // Respuesta exitosa
                const data = await response.json()

                // Mostrar mensaje de éxito
                setSuccessMessage(data.success)

                // Redirigir a la página de entrenamientos después de un breve retraso
                setTimeout(() => {
                    router.push("/entrenamientos")
                }, 1000)
            }
        } catch (error) {
            setErrors({
                error: "Error en la conexión. Por favor, inténtelo de nuevo.",
            })
        } finally {
            setIsGuardando(false)
        }
    }

    // Función para alternar la expansión de la descripción
    const toggleDescripcion = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma", index: number) => {
        setDescripcionesExpandidas((prev) => {
            const nuevasExpansiones = { ...prev }
            const conjunto = new Set(prev[seccion])

            if (conjunto.has(index)) {
                conjunto.delete(index)
            } else {
                conjunto.add(index)
            }

            nuevasExpansiones[seccion] = conjunto
            return nuevasExpansiones
        })
    }

    // Función para actualizar los campos del entrenamiento
    const actualizarEntrenamiento = (campo: keyof EntrenamientoEnCreacion, valor: any) => {
        setEntrenamiento((prev) => ({
            ...prev,
            [campo]: valor,
        }))

        // Limpiar error si existe
        if (errors[campo]) {
            setErrors((prev) => {
                const nuevoserrors = { ...prev }
                delete nuevoserrors[campo]
                return nuevoserrors
            })
        }
    }

    // Función para actualizar los campos del ejercicio actual
    const actualizarEjercicio = (campo: keyof EjercicioEnCreacion, valor: any) => {
        setEjercicioActual((prev) => ({
            ...prev,
            [campo]: valor,
        }))

        // Limpiar error si existe
        const errorKey = `ejercicio_${campo}`
        if (errors[errorKey]) {
            setErrors((prev) => {
                const nuevoserrors = { ...prev }
                delete nuevoserrors[errorKey]
                return nuevoserrors
            })
        }
    }

    // Función para añadir o actualizar un ejercicio
    const guardarEjercicio = () => {
        // Validar campos obligatorios
        const nuevoserrors: { [key: string]: string } = {}

        // Validar repeticiones (obligatorio y numérico)
        if (ejercicioActual.metros === undefined || ejercicioActual.metros === null) {
            nuevoserrors.ejercicio_repeticiones = "Las repeticiones son obligatorias"
        } else if (isNaN(Number(ejercicioActual.repeticiones)) || Number(ejercicioActual.repeticiones) <= 0) {
            nuevoserrors.ejercicio_repeticiones = "Debe ser un número mayor a 0"
        }

        // Validar metros (obligatorio y numérico)
        if (ejercicioActual.metros === undefined || ejercicioActual.metros === null) {
            nuevoserrors.ejercicio_metros = "Los metros son obligatorios"
        } else if (isNaN(Number(ejercicioActual.metros)) || Number(ejercicioActual.metros) <= 0) {
            nuevoserrors.ejercicio_metros = "Debe ser un número mayor a 0"
        }

        // Validar descanso (obligatorio)
        if (!ejercicioActual.descanso) {
            nuevoserrors.ejercicio_descanso = "El descanso es obligatorio"
        }

        // Validar ritmo (obligatorio)
        if (!ejercicioActual.id_ritmo) {
            nuevoserrors.ejercicio_ritmo = "El ritmo es obligatorio"
        }

        // Validar estilo (obligatorio)
        if (!ejercicioActual.id_estilo) {
            nuevoserrors.ejercicio_estilo = "El estilo es obligatorio"
        }

        // // Si hay errores, mostrarlos y no continuar
        if (Object.keys(nuevoserrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...nuevoserrors }))
            return
        }

        if (modoEdicion && indiceEdicion >= 0) {
            // Actualizar ejercicio existente
            setEntrenamiento((prev) => {
                const nuevaSeccion = [...prev[seccionActual]]
                nuevaSeccion[indiceEdicion] = { ...ejercicioActual }
                return {
                    ...prev,
                    [seccionActual]: nuevaSeccion,
                }
            })

            // Salir del modo edición
            setModoEdicion(false)
            setIndiceEdicion(-1)
        } else {
            // Añadir nuevo ejercicio
            setEntrenamiento((prev) => ({
                ...prev,
                [seccionActual]: [...prev[seccionActual], { ...ejercicioActual }],
            }))
        }

        // Resetear el ejercicio actual
        setEjercicioActual({ ...ejercicioVacio })

        // Limpiar todos los errores relacionados con ejercicios
        const errorKeys = Object.keys(errors).filter((key) => key.startsWith("ejercicio_"))
        if (errorKeys.length > 0) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                errorKeys.forEach((key) => delete newErrors[key])
                return newErrors
            })
        }
    }

    // Función para editar un ejercicio existente
    const editarEjercicio = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma", index: number) => {
        const ejercicio = entrenamiento[seccion][index]
        setEjercicioActual({ ...ejercicio })
        setSeccionActual(seccion)
        setModoEdicion(true)
        setIndiceEdicion(index)
    }

    // Función para cancelar la edición
    const cancelarEdicion = () => {
        setEjercicioActual({ ...ejercicioVacio })
        setModoEdicion(false)
        setIndiceEdicion(-1)
    }

    // Función para eliminar un ejercicio de una sección
    const eliminarEjercicio = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma", index: number) => {
        setEntrenamiento((prev) => ({
            ...prev,
            [seccion]: prev[seccion].filter((_, i) => i !== index),
        }))

        // Si estábamos editando este ejercicio, cancelar la edición
        if (modoEdicion && seccionActual === seccion && indiceEdicion === index) {
            cancelarEdicion()
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-sky-900">
                        {entrenamientoId ? "Editar entrenamiento" : "Crea tu entrenamiento"}
                    </h1>
                    <p className="text-muted-foreground">
                        {entrenamientoId
                            ? "Modifica los detalles de tu entrenamiento personalizado"
                            : "Diseña tu propio entrenamiento personalizado según tus objetivos y nivel"}
                    </p>
                </div>

                {/* Mensaje de límite para usuarios no premium */}
                {!entrenamientoId && !isLoadingUserData && !isPremium && !puedeCrearEntrenamiento && (
                    <Alert variant="destructive" className="mb-6">
                        <Crown className="h-4 w-4" />
                        <AlertTitle>Límite de entrenamientos alcanzado</AlertTitle>
                        <AlertDescription>
                            Has alcanzado el límite de {cantidadEntrenamientos} entrenamientos gratuitos. Para crear entrenamientos
                            ilimitados, actualiza a Premium.
                            <div className="mt-3">
                                <Link href="/#planes">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                                >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Actualizar a Premium
                                </Button>
                                </Link>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                        <p>Cargando datos del entrenamiento...</p>
                    </div>
                )}

                {isLoadingUserData && !entrenamientoId && (
                    <div className="flex items-center justify-center py-8">
                        <div className="mr-2 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
                        <p>Verificando permisos...</p>
                    </div>
                )}

                {/* errors generales */}
                {errors.guardar && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errors.guardar}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna de información general */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información general</CardTitle>
                                <CardDescription>Detalles básicos del entrenamiento</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">
                                        Título <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="nombre"
                                        value={entrenamiento.nombre}
                                        onChange={(e) => actualizarEntrenamiento("nombre", e.target.value)}
                                        className={errors.nombre ? "border-red-500" : ""}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    />
                                    {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">
                                        Descripción
                                    </Label>
                                    <Textarea
                                        id="descripcion"
                                        value={entrenamiento.descripcion}
                                        onChange={(e) => actualizarEntrenamiento("descripcion", e.target.value)}
                                        className={errors.descripcion ? "border-red-500" : ""}
                                        rows={3}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    />
                                    {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duracion">Duración <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={entrenamiento.duracion}
                                            onValueChange={(value) => actualizarEntrenamiento("duracion", value)}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        >
                                            <SelectTrigger id="duracion" className={errors.duracion ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Elegir duración" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {duraciones.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.duracion}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.duracion && <p className="text-xs text-red-500">{errors.duracion}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nivel">Nivel <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={entrenamiento.nivel}
                                            onValueChange={(value) => actualizarEntrenamiento("nivel", value)}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        >
                                            <SelectTrigger id="nivel" className={errors.nivel ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Elegir nivel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {niveles.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.nivel}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.nivel && <p className="text-xs text-red-500">{errors.nivel}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="intensidad">Intensidad <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={entrenamiento.intensidad}
                                        onValueChange={(value) => actualizarEntrenamiento("intensidad", value)}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    >
                                        <SelectTrigger id="intensidad" className={errors.intensidad ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Seleccionar intensidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {intensidades.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.intensidad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.intensidad && <p className="text-xs text-red-500">{errors.intensidad}</p>}
                                </div>
                                {errors.error && <p className="text-red-500 text-sm">{errors.error}</p>}
                                {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                            </CardContent>
                        </Card>

                        {/* Vista previa del entrenamiento */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Vista previa</CardTitle>
                                <CardDescription>Resumen del entrenamiento</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-sky-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Duración</p>
                                            <p className="font-medium">
                                                {duraciones.find((e) => e.id.toString() === entrenamiento.duracion)?.duracion || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-sky-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Intensidad</p>
                                            <p className="font-medium">
                                                {intensidades.find((e) => e.id.toString() === entrenamiento.intensidad)?.intensidad || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">Ejercicios</p>
                                    <ul className="text-sm">
                                        <li className="flex justify-between">
                                            <span>Calentamiento:</span>
                                            <span className="font-medium">{entrenamiento.calentamiento.length}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Parte principal:</span>
                                            <span className="font-medium">{entrenamiento.partePrincipal.length}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Vuelta a la calma:</span>
                                            <span className="font-medium">{entrenamiento.vueltaCalma.length}</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-muted-foreground">Series por sección</p>
                                    <ul className="text-sm">
                                        <li className="flex justify-between">
                                            <span>Calentamiento:</span>
                                            <span className="font-medium">
                                                {entrenamiento.seriesCalentamiento} {entrenamiento.seriesCalentamiento > 1 ? "series" : "serie"}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Parte principal:</span>
                                            <span className="font-medium">
                                                {entrenamiento.seriesPartePrincipal}{" "}
                                                {entrenamiento.seriesPartePrincipal > 1 ? "series" : "serie"}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Vuelta a la calma:</span>
                                            <span className="font-medium">
                                                {entrenamiento.seriesVueltaCalma} {entrenamiento.seriesVueltaCalma > 1 ? "series" : "serie"}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full bg-sky-500 hover:bg-sky-600"
                                    onClick={guardarEntrenamiento}
                                    disabled={
                                        isGuardando || isLoading || isLoadingUserData || (!entrenamientoId && !puedeCrearEntrenamiento)
                                    }
                                >
                                    {isGuardando ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            {entrenamientoId ? "Actualizando..." : "Guardando..."}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {entrenamientoId ? "Actualizar entrenamiento" : "Guardar entrenamiento"}
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Columna de ejercicios */}
                    <div className="lg:col-span-2">
                        <Accordion type="single" collapsible defaultValue="calentamiento" className="w-full">
                            {/* Sección de calentamiento */}
                            <AccordionItem value="calentamiento">
                                <AccordionTrigger className="hover:bg-sky-50 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-semibold">Calentamiento</h3>
                                        <span className="ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                                            {entrenamiento.calentamiento.length}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <div className="mb-4">
                                    <Label htmlFor="seriesCalentamiento" className="mb-2 block">
                                        Series (repeticiones de toda la sección)
                                    </Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="seriesCalentamiento"
                                            type="number"
                                            min="1"
                                            value={entrenamiento.seriesCalentamiento}
                                            className={errors.seriesCalentamiento ? "border-red-500" : ""}
                                            onChange={(e) =>
                                                actualizarEntrenamiento("seriesCalentamiento", Number.parseInt(e.target.value) || 1)
                                            }
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {entrenamiento.seriesCalentamiento > 1 ? "veces" : "vez"}
                                        </span>
                                    </div>
                                    {errors.seriesCalentamiento && <p className="text-red-500 text-sm">{errors.seriesCalentamiento}</p>}
                                </div>
                                <AccordionContent className="px-4">
                                    {/* Lista de ejercicios de calentamiento */}
                                    {entrenamiento.calentamiento.length > 0 ? (
                                        <>
                                            {/* Versión móvil de la tabla */}
                                            <div className="block sm:hidden mb-6">
                                                {entrenamiento.calentamiento.map((ejercicio, index) => (
                                                    <div
                                                        key={`calentamiento-mobile-${index}`}
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
                                                                    <span className="text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                                    <span className="text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {ejercicio.descripcion && (
                                                                <div className="mt-2 pt-2 border-t border-dashed">
                                                                    <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                                    <p className="text-sm">{ejercicio.descripcion}</p>
                                                                </div>
                                                            )}
                                                            <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 h-8 w-8 p-0"
                                                                    onClick={() => editarEjercicio("calentamiento", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">Editar</span>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                    onClick={() => eliminarEjercicio("calentamiento", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Eliminar</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Versión desktop de la tabla */}
                                            <div className="hidden sm:block mb-6 border rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-sky-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Rep.
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Metros
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Descanso
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Ritmo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Estilo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Acciones
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {entrenamiento.calentamiento.map((ejercicio, index) => (
                                                            <React.Fragment key={`calentamiento-${index}`}>
                                                                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.repeticiones}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.metros}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.descanso}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 p-0 h-8 w-8"
                                                                                onClick={() => editarEjercicio("calentamiento", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                                <span className="sr-only">Editar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                                                                                onClick={() => eliminarEjercicio("calentamiento", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                                <span className="sr-only">Eliminar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-0 h-8 w-8"
                                                                                onClick={() => toggleDescripcion("calentamiento", index)}
                                                                            >
                                                                                {descripcionesExpandidas.calentamiento.has(index) ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                )}
                                                                                <span className="sr-only">Ver descripción</span>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {descripcionesExpandidas.calentamiento.has(index) && (
                                                                    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                        <td
                                                                            colSpan={6}
                                                                            className="px-4 py-2 text-sm text-gray-600 border-t border-dashed border-gray-200"
                                                                        >
                                                                            <div className="pl-4 border-l-2 border-sky-200">
                                                                                <span className="font-medium text-sky-700">Descripción:</span>{" "}
                                                                                {ejercicio.descripcion}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No hay ejercicios de calentamiento. Añade uno nuevo.
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full mb-4"
                                        onClick={() => {
                                            setSeccionActual("calentamiento")
                                            setEjercicioActual({ ...ejercicioVacio })
                                            setModoEdicion(false)
                                            setIndiceEdicion(-1)
                                        }}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Añadir ejercicio
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Sección de parte principal */}
                            <AccordionItem value="partePrincipal">
                                <AccordionTrigger className="hover:bg-sky-50 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-semibold">Parte Principal</h3>
                                        <span className="ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                                            {entrenamiento.partePrincipal.length}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <div className="mb-4">
                                    <Label htmlFor="seriesPartePrincipal" className="mb-2 block">
                                        Series (repeticiones de toda la sección)
                                    </Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="seriesPartePrincipal"
                                            type="number"
                                            min="1"
                                            value={entrenamiento.seriesPartePrincipal}
                                            className={errors.seriesPartePrincipal ? "border-red-500" : ""}
                                            onChange={(e) =>
                                                actualizarEntrenamiento("seriesPartePrincipal", Number.parseInt(e.target.value) || 1)
                                            }
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {entrenamiento.seriesPartePrincipal > 1 ? "veces" : "vez"}
                                        </span>
                                    </div>
                                    {errors.seriesPartePrincipal && <p className="text-red-500 text-sm">{errors.seriesPartePrincipal}</p>}
                                </div>
                                <AccordionContent className="px-4">
                                    {/* Lista de ejercicios de parte principal */}
                                    {entrenamiento.partePrincipal.length > 0 ? (
                                        <>
                                            {/* Versión móvil de la tabla */}
                                            <div className="block sm:hidden mb-6">
                                                {entrenamiento.partePrincipal.map((ejercicio, index) => (
                                                    <div
                                                        key={`partePrincipal-mobile-${index}`}
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
                                                                    <span className="text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                                    <span className="text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {ejercicio.descripcion && (
                                                                <div className="mt-2 pt-2 border-t border-dashed">
                                                                    <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                                    <p className="text-sm">{ejercicio.descripcion}</p>
                                                                </div>
                                                            )}
                                                            <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 h-8 w-8 p-0"
                                                                    onClick={() => editarEjercicio("partePrincipal", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">Editar</span>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                    onClick={() => eliminarEjercicio("partePrincipal", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Eliminar</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Versión desktop de la tabla */}
                                            <div className="hidden sm:block mb-6 border rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-sky-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Rep.
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Metros
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Descanso
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Ritmo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Estilo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Acciones
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {entrenamiento.partePrincipal.map((ejercicio, index) => (
                                                            <React.Fragment key={`partePrincipal-${index}`}>
                                                                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.repeticiones}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.metros}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.descanso}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 p-0 h-8 w-8"
                                                                                onClick={() => editarEjercicio("partePrincipal", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                                <span className="sr-only">Editar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                                                                                onClick={() => eliminarEjercicio("partePrincipal", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                                <span className="sr-only">Eliminar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-0 h-8 w-8"
                                                                                onClick={() => toggleDescripcion("partePrincipal", index)}
                                                                            >
                                                                                {descripcionesExpandidas.partePrincipal.has(index) ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                )}
                                                                                <span className="sr-only">Ver descripción</span>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {descripcionesExpandidas.partePrincipal.has(index) && (
                                                                    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                        <td
                                                                            colSpan={6}
                                                                            className="px-4 py-2 text-sm text-gray-600 border-t border-dashed border-gray-200"
                                                                        >
                                                                            <div className="pl-4 border-l-2 border-sky-200">
                                                                                <span className="font-medium text-sky-700">Descripción:</span>{" "}
                                                                                {ejercicio.descripcion}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No hay ejercicios en la parte principal. Añade uno nuevo.
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full mb-4"
                                        onClick={() => {
                                            setSeccionActual("partePrincipal")
                                            setEjercicioActual({ ...ejercicioVacio })
                                            setModoEdicion(false)
                                            setIndiceEdicion(-1)
                                        }}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Añadir ejercicio
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Sección de vuelta a la calma */}
                            <AccordionItem value="vueltaCalma">
                                <AccordionTrigger className="hover:bg-sky-50 px-4 rounded-lg">
                                    <div className="flex items-center">
                                        <h3 className="text-lg font-semibold">Vuelta a la Calma</h3>
                                        <span className="ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                                            {entrenamiento.vueltaCalma.length}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <div className="mb-4">
                                    <Label htmlFor="seriesVueltaCalma" className="mb-2 block">
                                        Series (repeticiones de toda la sección)
                                    </Label>
                                    <div className="flex items-center">
                                        <Input
                                            id="seriesVueltaCalma"
                                            type="number"
                                            min="1"
                                            value={entrenamiento.seriesVueltaCalma}
                                            className={errors.seriesVueltaCalma ? "border-red-500" : ""}
                                            onChange={(e) =>
                                                actualizarEntrenamiento("seriesVueltaCalma", Number.parseInt(e.target.value) || 1)
                                            }
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {entrenamiento.seriesVueltaCalma > 1 ? "veces" : "vez"}
                                        </span>
                                    </div>
                                    {errors.seriesVueltaCalma && <p className="text-red-500 text-sm">{errors.seriesVueltaCalma}</p>}
                                </div>
                                <AccordionContent className="px-4">
                                    {/* Lista de ejercicios de vuelta a la calma */}
                                    {entrenamiento.vueltaCalma.length > 0 ? (
                                        <>
                                            {/* Versión móvil de la tabla */}
                                            <div className="block sm:hidden mb-6">
                                                {entrenamiento.vueltaCalma.map((ejercicio, index) => (
                                                    <div
                                                        key={`vueltaCalma-mobile-${index}`}
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
                                                                    <span className="text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                                                                    <span className="text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {ejercicio.descripcion && (
                                                                <div className="mt-2 pt-2 border-t border-dashed">
                                                                    <p className="text-xs text-gray-500 mb-1">Descripción:</p>
                                                                    <p className="text-sm">{ejercicio.descripcion}</p>
                                                                </div>
                                                            )}
                                                            <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 h-8 w-8 p-0"
                                                                    onClick={() => editarEjercicio("vueltaCalma", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">Editar</span>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                                    onClick={() => eliminarEjercicio("vueltaCalma", index)}
                                                                    disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Eliminar</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Versión desktop de la tabla */}
                                            <div className="hidden sm:block mb-6 border rounded-lg overflow-hidden">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-sky-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Rep.
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Metros
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Descanso
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Ritmo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Estilo
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Acciones
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {entrenamiento.vueltaCalma.map((ejercicio, index) => (
                                                            <React.Fragment key={`vueltaCalma-${index}`}>
                                                                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.repeticiones}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.metros}</td>
                                                                    <td className="px-4 py-3 text-sm">{ejercicio.descanso}</td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {ritmos.find((e) => e.id.toString() === ejercicio.id_ritmo)?.ritmo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {estilos.find((e) => e.id.toString() === ejercicio.id_estilo)?.estilo || "N/A"}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 p-0 h-8 w-8"
                                                                                onClick={() => editarEjercicio("vueltaCalma", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                                <span className="sr-only">Editar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                                                                                onClick={() => eliminarEjercicio("vueltaCalma", index)}
                                                                                disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                                <span className="sr-only">Eliminar</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-0 h-8 w-8"
                                                                                onClick={() => toggleDescripcion("vueltaCalma", index)}
                                                                            >
                                                                                {descripcionesExpandidas.vueltaCalma.has(index) ? (
                                                                                    <ChevronUp className="h-4 w-4" />
                                                                                ) : (
                                                                                    <ChevronDown className="h-4 w-4" />
                                                                                )}
                                                                                <span className="sr-only">Ver descripción</span>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {descripcionesExpandidas.vueltaCalma.has(index) && (
                                                                    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                                        <td
                                                                            colSpan={6}
                                                                            className="px-4 py-2 text-sm text-gray-600 border-t border-dashed border-gray-200"
                                                                        >
                                                                            <div className="pl-4 border-l-2 border-sky-200">
                                                                                <span className="font-medium text-sky-700">Descripción:</span>{" "}
                                                                                {ejercicio.descripcion}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No hay ejercicios de vuelta a la calma. Añade uno nuevo.
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full mb-4"
                                        onClick={() => {
                                            setSeccionActual("vueltaCalma")
                                            setEjercicioActual({ ...ejercicioVacio })
                                            setModoEdicion(false)
                                            setIndiceEdicion(-1)
                                        }}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Añadir ejercicio
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Formulario para añadir o editar ejercicio */}
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>{modoEdicion ? "Editar ejercicio" : "Añadir ejercicio"}</CardTitle>
                                <CardDescription>
                                    {modoEdicion
                                        ? "Modifica los detalles del ejercicio seleccionado"
                                        : "Añade un nuevo ejercicio a la sección actual"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="repeticiones">
                                            Repeticiones <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="repeticiones"
                                            type="number"
                                            min="0"
                                            value={ejercicioActual.repeticiones}
                                            onChange={(e) => actualizarEjercicio("repeticiones", Number(e.target.value))}
                                            className={errors.ejercicio_repeticiones ? "border-red-500" : ""}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        />
                                        {errors.ejercicio_repeticiones && (
                                            <p className="text-xs text-red-500">{errors.ejercicio_repeticiones}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="metros">
                                            Metros <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="metros"
                                            type="number"
                                            min="0"
                                            value={ejercicioActual.metros}
                                            onChange={(e) => actualizarEjercicio("metros", Number(e.target.value))}
                                            className={errors.ejercicio_metros ? "border-red-500" : ""}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        />
                                        {errors.ejercicio_metros && <p className="text-xs text-red-500">{errors.ejercicio_metros}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descanso">
                                        Descanso (segundos) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="descanso"
                                        type="number"
                                        min="0"
                                        value={ejercicioActual.descanso}
                                        onChange={(e) => actualizarEjercicio("descanso", Number(e.target.value))}
                                        className={errors.ejercicio_descanso ? "border-red-500" : ""}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    />
                                    {errors.ejercicio_descanso && <p className="text-xs text-red-500">{errors.ejercicio_descanso}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ritmo">
                                            Ritmo <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={ejercicioActual.id_ritmo}
                                            onValueChange={(value) => actualizarEjercicio("id_ritmo", value)}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        >
                                            <SelectTrigger id="ritmo" className={errors.ejercicio_ritmo ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Seleccionar ritmo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ritmos.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.ritmo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.ejercicio_ritmo && <p className="text-xs text-red-500">{errors.ejercicio_ritmo}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="estilo">
                                            Estilo <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={ejercicioActual.id_estilo}
                                            onValueChange={(value) => actualizarEjercicio("id_estilo", value)}
                                            disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                        >
                                            <SelectTrigger id="estilo" className={errors.ejercicio_estilo ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Seleccionar estilo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {estilos.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.estilo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.ejercicio_estilo && <p className="text-xs text-red-500">{errors.ejercicio_estilo}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Textarea
                                        id="descripcion"
                                        placeholder="Añade detalles adicionales sobre el ejercicio"
                                        value={ejercicioActual.descripcion}
                                        onChange={(e) => actualizarEjercicio("descripcion", e.target.value)}
                                        disabled={!entrenamientoId && !puedeCrearEntrenamiento}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                {modoEdicion && (
                                    <Button variant="ghost" onClick={cancelarEdicion}>
                                        Cancelar
                                    </Button>
                                )}
                                <Button
                                    onClick={guardarEjercicio}
                                    disabled={isGuardando || (!entrenamientoId && !puedeCrearEntrenamiento)}
                                >
                                    {modoEdicion ? "Actualizar ejercicio" : "Añadir ejercicio"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
            {/* Mostrar el modal de errores si hay errores en las secciones */}
            <ErroresModal open={modalErroresAbierto} onOpenChange={setModalErroresAbierto} errores={erroresSecciones} />
        </div>
    )
}
