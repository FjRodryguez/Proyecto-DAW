"use client"

import Link from "next/link"
import { X, Clock, Flame, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SeccionEjerciciosDetalle from "./SeccionEjerciciosDetalle"
import type { Entrenamiento } from "@/types/entrenamientos"

interface EntrenamientoDetalleProps {
    entrenamiento: Entrenamiento
    onClose: () => void
    onDownloadPDF: () => void
    isPersonalized?: boolean
}

export default function EntrenamientoDetalle({
    entrenamiento,
    onClose,
    onDownloadPDF,
    isPersonalized = false,
}: EntrenamientoDetalleProps) {
    return (
        <div className="mt-12 w-full animate-in fade-in-50 duration-300">
            <div className="bg-white border rounded-lg shadow-md p-4 sm:p-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl sm:text-2xl font-bold text-sky-900">{entrenamiento.nombre}</h2>
                            {isPersonalized && <Badge className="bg-sky-500">Personalizado</Badge>}
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">{entrenamiento.descripcion}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cerrar</span>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 bg-sky-50 p-3 sm:p-4 rounded-lg">
                        <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-sky-500" />
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Duración</p>
                            <p className="text-base sm:text-lg font-semibold">{entrenamiento.duracion}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-sky-50 p-3 sm:p-4 rounded-lg">
                        <Flame className="h-6 sm:h-8 w-6 sm:w-8 text-sky-500" />
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Intensidad</p>
                            <p className="text-base sm:text-lg font-semibold">{entrenamiento.intensidad}</p>
                        </div>
                    </div>
                </div>

                {/* Mostrar series si están disponibles (para entrenamientos personalizados) */}
                {entrenamiento.seriesCalentamiento !== undefined && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Series Calentamiento</p>
                            <p className="text-base sm:text-lg font-semibold">{entrenamiento.seriesCalentamiento}</p>
                        </div>
                        <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Series Parte Principal</p>
                            <p className="text-base sm:text-lg font-semibold">{entrenamiento.seriesPartePrincipal}</p>
                        </div>
                        <div className="bg-sky-50 p-3 sm:p-4 rounded-lg text-center">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Series Vuelta a la Calma</p>
                            <p className="text-base sm:text-lg font-semibold">{entrenamiento.seriesVueltaCalma}</p>
                        </div>
                    </div>
                )}

                {/* Secciones de ejercicios */}
                <SeccionEjerciciosDetalle
                    titulo="Calentamiento"
                    ejercicios={entrenamiento.calentamiento}
                    series={entrenamiento.seriesCalentamiento}
                    seccion="calentamiento"
                />

                <SeccionEjerciciosDetalle
                    titulo="Parte Principal"
                    ejercicios={entrenamiento.partePrincipal}
                    series={entrenamiento.seriesPartePrincipal}
                    seccion="partePrincipal"
                />

                <SeccionEjerciciosDetalle
                    titulo="Vuelta a la Calma"
                    ejercicios={entrenamiento.vueltaCalma}
                    series={entrenamiento.seriesVueltaCalma}
                    seccion="vueltaCalma"
                />

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Button size="lg" className="bg-sky-500 hover:bg-sky-600 px-6 sm:px-8" onClick={onDownloadPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar entrenamiento
                    </Button>
                    {isPersonalized && (
                        <Link href={`/crea-entrenamientos?id=${entrenamiento.id}`}>
                            <Button size="lg" variant="outline" className="px-6 sm:px-8">
                                Editar entrenamiento
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
