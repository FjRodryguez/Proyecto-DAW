"use client"
import type { Ejercicio } from "@/types/entrenamientos"

interface SeccionEjerciciosDetalleProps {
    titulo: string
    ejercicios: Ejercicio[]
    series?: number
    seccion: "calentamiento" | "partePrincipal" | "vueltaCalma"
}

// Función para obtener el color del badge según la sección
const getColorSeccion = (seccion: string) => {
    switch (seccion) {
        case "calentamiento":
            return "bg-blue-100 text-blue-700 border-blue-200"
        case "partePrincipal":
            return "bg-green-100 text-green-700 border-green-200"
        case "vueltaCalma":
            return "bg-purple-100 text-purple-700 border-purple-200"
        default:
            return "bg-gray-100 text-gray-700 border-gray-200"
    }
}

// Función para obtener el color de fondo de la tabla según la sección
const getBackgroundSeccion = (seccion: string) => {
    switch (seccion) {
        case "calentamiento":
            return { header: "bg-blue-50", row: "bg-blue-50/30" }
        case "partePrincipal":
            return { header: "bg-green-50", row: "bg-green-50/30" }
        case "vueltaCalma":
            return { header: "bg-purple-50", row: "bg-purple-50/30" }
        default:
            return { header: "bg-gray-50", row: "bg-gray-50/30" }
    }
}

export default function SeccionEjerciciosDetalle({
    titulo,
    ejercicios,
    series,
    seccion,
}: SeccionEjerciciosDetalleProps) {
    const colors = getBackgroundSeccion(seccion)

    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-sky-900 mb-2 sm:mb-0">{titulo}</h3>
                <div className="flex flex-row gap-2 sm:gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorSeccion(seccion)} w-fit`}>
                        {ejercicios.length} {ejercicios.length === 1 ? "ejercicio" : "ejercicios"}
                    </div>
                    {series !== undefined && (
                        <div className="px-2 py-1 bg-sky-50 text-sky-700 rounded text-xs font-medium w-fit">
                            {series} {series > 1 ? "series" : "serie"}
                        </div>
                    )}
                </div>
            </div>

            {ejercicios.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                    <p>No hay ejercicios en esta sección</p>
                </div>
            ) : (
                <>
                    {/* Versión móvil de la tabla */}
                    <div className="block sm:hidden">
                        {ejercicios.map((ejercicio, index) => (
                            <div key={index} className={`border rounded-lg mb-3 ${index % 2 === 0 ? "bg-white" : colors.row}`}>
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
                            <thead className={colors.header}>
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
                                {ejercicios.map((ejercicio, index) => (
                                    <tr key={index} className={index % 2 === 0 ? "bg-white" : colors.row}>
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
                </>
            )}
        </div>
    )
}
