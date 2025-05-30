"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus } from "lucide-react"
import EjerciciosTable from "./EjerciciosTable"
import type { EjercicioEnCreacion } from "@/types/entrenamientos"

interface SeccionEjerciciosProps {
  seccion: "calentamiento" | "partePrincipal" | "vueltaCalma"
  titulo: string
  ejercicios: EjercicioEnCreacion[]
  series: number
  onSeriesChange: (series: number) => void
  onAñadirEjercicio: () => void
  onEditarEjercicio: (index: number) => void
  onEliminarEjercicio: (index: number) => void
  estilos: { id: string; estilo: string }[]
  ritmos: { id: string; ritmo: string }[]
  descripcionesExpandidas: Set<number>
  onToggleDescripcion: (index: number) => void
  errors: Record<string, string>
  disabled?: boolean
}

export default function SeccionEjercicios({
  seccion,
  titulo,
  ejercicios,
  series,
  onSeriesChange,
  onAñadirEjercicio,
  onEditarEjercicio,
  onEliminarEjercicio,
  estilos,
  ritmos,
  descripcionesExpandidas,
  onToggleDescripcion,
  errors,
  disabled = false,
}: SeccionEjerciciosProps) {
  const seriesFieldName = `series${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`

  return (
    <AccordionItem value={seccion}>
      <AccordionTrigger className="hover:bg-sky-50 px-4 rounded-lg">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <span className="ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">{ejercicios.length}</span>
        </div>
      </AccordionTrigger>
      <div className="mb-4">
        <Label htmlFor={seriesFieldName} className="mb-2 block">
          Series (repeticiones de toda la sección)
        </Label>
        <div className="flex items-center">
          <Input
            id={seriesFieldName}
            type="number"
            min="1"
            value={series}
            className={errors[seriesFieldName] ? "border-red-500" : ""}
            onChange={(e) => onSeriesChange(Number.parseInt(e.target.value) || 1)}
            disabled={disabled}
          />
          <span className="ml-2 text-sm text-muted-foreground">{series > 1 ? "veces" : "vez"}</span>
        </div>
        {errors[seriesFieldName] && <p className="text-red-500 text-sm">{errors[seriesFieldName]}</p>}
      </div>
      <AccordionContent className="px-4">
        <EjerciciosTable
          ejercicios={ejercicios}
          estilos={estilos}
          ritmos={ritmos}
          onEditar={onEditarEjercicio}
          onEliminar={onEliminarEjercicio}
          descripcionesExpandidas={descripcionesExpandidas}
          onToggleDescripcion={onToggleDescripcion}
          disabled={disabled}
        />

        <Button variant="outline" className="w-full mb-4" onClick={onAñadirEjercicio} disabled={disabled}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir ejercicio
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}
