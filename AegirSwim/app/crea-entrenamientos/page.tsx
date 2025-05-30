"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertTriangle, Crown } from "lucide-react"

import { Accordion } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "@/components/Header"
import ErroresModal from "@/components/ErroresModal"
import EjercicioForm from "@/components/EjercicioForm"
import SeccionEjercicios from "@/components/SeccionEjercicios"
import EntrenamientoInfo from "@/components/EntrenamientoInfo"

import type { EjercicioEnCreacion, EntrenamientoEnCreacion } from "@/types/entrenamientos"
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

    // Estado para controlar la apertura del modal de errores
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

            console.log(entrenamientoData)
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

    // Funciones para manejar las secciones
    const handleAñadirEjercicio = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma") => {
        setSeccionActual(seccion)
        setEjercicioActual({ ...ejercicioVacio })
        setModoEdicion(false)
        setIndiceEdicion(-1)
    }

    const handleEditarEjercicio = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma", index: number) => {
        editarEjercicio(seccion, index)
    }

    const handleEliminarEjercicio = (seccion: "calentamiento" | "partePrincipal" | "vueltaCalma", index: number) => {
        eliminarEjercicio(seccion, index)
    }

    const disabled = !entrenamientoId && !puedeCrearEntrenamiento

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
                            Has alcanzado el límite de 3 entrenamientos gratuitos. Para crear entrenamientos
                            ilimitados, actualiza a Premium.
                            <div className="mt-3">
                                <Link href="/#planes">
                                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                                        <Crown className="h-4 w-4 mr-2" />
                                        Actualizar a Premium
                                    </button>
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
                        <EntrenamientoInfo
                            entrenamiento={entrenamiento}
                            onEntrenamientoChange={actualizarEntrenamiento}
                            onGuardar={guardarEntrenamiento}
                            duraciones={duraciones}
                            niveles={niveles}
                            intensidades={intensidades}
                            errors={errors}
                            successMessage={successMessage}
                            isGuardando={isGuardando}
                            isLoading={isLoading}
                            isLoadingUserData={isLoadingUserData}
                            puedeCrearEntrenamiento={puedeCrearEntrenamiento}
                            entrenamientoId={entrenamientoId}
                            disabled={disabled}
                        />
                    </div>

                    {/* Columna de ejercicios */}
                    <div className="lg:col-span-2">
                        <Accordion type="single" collapsible defaultValue="calentamiento" className="w-full">
                            <SeccionEjercicios
                                seccion="calentamiento"
                                titulo="Calentamiento"
                                ejercicios={entrenamiento.calentamiento}
                                series={entrenamiento.seriesCalentamiento}
                                onSeriesChange={(series) => actualizarEntrenamiento("seriesCalentamiento", series)}
                                onAñadirEjercicio={() => handleAñadirEjercicio("calentamiento")}
                                onEditarEjercicio={(index) => handleEditarEjercicio("calentamiento", index)}
                                onEliminarEjercicio={(index) => handleEliminarEjercicio("calentamiento", index)}
                                estilos={estilos}
                                ritmos={ritmos}
                                descripcionesExpandidas={descripcionesExpandidas.calentamiento}
                                onToggleDescripcion={(index) => toggleDescripcion("calentamiento", index)}
                                errors={errors}
                                disabled={disabled}
                            />

                            <SeccionEjercicios
                                seccion="partePrincipal"
                                titulo="Parte Principal"
                                ejercicios={entrenamiento.partePrincipal}
                                series={entrenamiento.seriesPartePrincipal}
                                onSeriesChange={(series) => actualizarEntrenamiento("seriesPartePrincipal", series)}
                                onAñadirEjercicio={() => handleAñadirEjercicio("partePrincipal")}
                                onEditarEjercicio={(index) => handleEditarEjercicio("partePrincipal", index)}
                                onEliminarEjercicio={(index) => handleEliminarEjercicio("partePrincipal", index)}
                                estilos={estilos}
                                ritmos={ritmos}
                                descripcionesExpandidas={descripcionesExpandidas.partePrincipal}
                                onToggleDescripcion={(index) => toggleDescripcion("partePrincipal", index)}
                                errors={errors}
                                disabled={disabled}
                            />

                            <SeccionEjercicios
                                seccion="vueltaCalma"
                                titulo="Vuelta a la Calma"
                                ejercicios={entrenamiento.vueltaCalma}
                                series={entrenamiento.seriesVueltaCalma}
                                onSeriesChange={(series) => actualizarEntrenamiento("seriesVueltaCalma", series)}
                                onAñadirEjercicio={() => handleAñadirEjercicio("vueltaCalma")}
                                onEditarEjercicio={(index) => handleEditarEjercicio("vueltaCalma", index)}
                                onEliminarEjercicio={(index) => handleEliminarEjercicio("vueltaCalma", index)}
                                estilos={estilos}
                                ritmos={ritmos}
                                descripcionesExpandidas={descripcionesExpandidas.vueltaCalma}
                                onToggleDescripcion={(index) => toggleDescripcion("vueltaCalma", index)}
                                errors={errors}
                                disabled={disabled}
                            />
                        </Accordion>

                        {/* Formulario para añadir o editar ejercicio */}
                        <div className="mt-8">
                            <EjercicioForm
                                ejercicio={ejercicioActual}
                                onEjercicioChange={actualizarEjercicio}
                                onGuardar={guardarEjercicio}
                                onCancelar={modoEdicion ? cancelarEdicion : undefined}
                                estilos={estilos}
                                ritmos={ritmos}
                                errors={errors}
                                modoEdicion={modoEdicion}
                                seccionActual={seccionActual}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </div>
            </main>
            {/* Mostrar el modal de errores si hay errores en las secciones */}
            <ErroresModal open={modalErroresAbierto} onOpenChange={setModalErroresAbierto} errores={erroresSecciones} />
        </div>
    )
}
