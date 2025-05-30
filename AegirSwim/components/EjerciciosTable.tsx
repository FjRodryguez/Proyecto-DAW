"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import type { EjercicioEnCreacion } from "@/types/entrenamientos"

interface EjerciciosTableProps {
  ejercicios: EjercicioEnCreacion[]
  estilos: { id: string; estilo: string }[]
  ritmos: { id: string; ritmo: string }[]
  onEditar: (index: number) => void
  onEliminar: (index: number) => void
  descripcionesExpandidas: Set<number>
  onToggleDescripcion: (index: number) => void
  disabled?: boolean
}

export default function EjerciciosTable({
  ejercicios,
  estilos,
  ritmos,
  onEditar,
  onEliminar,
  descripcionesExpandidas,
  onToggleDescripcion,
  disabled = false,
}: EjerciciosTableProps) {
  const getRitmoNombre = (id: string) => {
    return ritmos.find((r) => r.id.toString() === id)?.ritmo || "N/A"
  }

  const getEstiloNombre = (id: string) => {
    return estilos.find((e) => e.id.toString() === id)?.estilo || "N/A"
  }

  if (ejercicios.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No hay ejercicios en esta sección. Añade uno nuevo.</div>
    )
  }

  return (
    <>
      {/* Versión móvil */}
      <div className="block sm:hidden mb-6">
        {ejercicios.map((ejercicio, index) => (
          <div
            key={`mobile-${index}`}
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
                  <span className="text-sm">{getRitmoNombre(ejercicio.id_ritmo)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 mr-1">Estilo:</span>
                  <span className="text-sm">{getEstiloNombre(ejercicio.id_estilo)}</span>
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
                  onClick={() => onEditar(index)}
                  disabled={disabled}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  onClick={() => onEliminar(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Versión desktop */}
      <div className="hidden sm:block mb-6 border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rep.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metros</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descanso
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ritmo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estilo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ejercicios.map((ejercicio, index) => (
              <React.Fragment key={`desktop-${index}`}>
                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-sm">{ejercicio.repeticiones}</td>
                  <td className="px-4 py-3 text-sm">{ejercicio.metros}</td>
                  <td className="px-4 py-3 text-sm">{ejercicio.descanso}</td>
                  <td className="px-4 py-3 text-sm">{getRitmoNombre(ejercicio.id_ritmo)}</td>
                  <td className="px-4 py-3 text-sm">{getEstiloNombre(ejercicio.id_estilo)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 p-0 h-8 w-8"
                        onClick={() => onEditar(index)}
                        disabled={disabled}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-8 w-8"
                        onClick={() => onEliminar(index)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-0 h-8 w-8"
                        onClick={() => onToggleDescripcion(index)}
                      >
                        {descripcionesExpandidas.has(index) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span className="sr-only">Ver descripción</span>
                      </Button>
                    </div>
                  </td>
                </tr>
                {descripcionesExpandidas.has(index) && (
                  <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td colSpan={6} className="px-4 py-2 text-sm text-gray-600 border-t border-dashed border-gray-200">
                      <div className="pl-4 border-l-2 border-sky-200">
                        <span className="font-medium text-sky-700">Descripción:</span> {ejercicio.descripcion}
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
  )
}
