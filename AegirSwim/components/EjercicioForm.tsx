"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { EjercicioEnCreacion } from "@/types/entrenamientos"

interface EjercicioFormProps {
  ejercicio: EjercicioEnCreacion
  onEjercicioChange: (campo: keyof EjercicioEnCreacion, valor: any) => void
  onGuardar: () => void
  onCancelar?: () => void
  estilos: { id: string; estilo: string }[]
  ritmos: { id: string; ritmo: string }[]
  errors: Record<string, string>
  modoEdicion: boolean
  seccionActual: "calentamiento" | "partePrincipal" | "vueltaCalma"
  disabled?: boolean
}

export default function EjercicioForm({
  ejercicio,
  onEjercicioChange,
  onGuardar,
  onCancelar,
  estilos,
  ritmos,
  errors,
  modoEdicion,
  seccionActual,
  disabled = false,
}: EjercicioFormProps) {
  // Función para obtener el nombre de la sección en español
  const getNombreSeccion = (seccion: string) => {
    switch (seccion) {
      case "calentamiento":
        return "Calentamiento"
      case "partePrincipal":
        return "Parte Principal"
      case "vueltaCalma":
        return "Vuelta a la Calma"
      default:
        return seccion
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{modoEdicion ? "Editar ejercicio" : "Añadir ejercicio"}</CardTitle>
            <CardDescription>
              {modoEdicion
                ? "Modifica los detalles del ejercicio seleccionado"
                : "Añade un nuevo ejercicio a la sección actual"}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getColorSeccion(seccionActual)}`}>
            {getNombreSeccion(seccionActual)}
          </div>
        </div>
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
              value={ejercicio.repeticiones}
              onChange={(e) => onEjercicioChange("repeticiones", Number(e.target.value))}
              className={errors.ejercicio_repeticiones ? "border-red-500" : ""}
              disabled={disabled}
            />
            {errors.ejercicio_repeticiones && <p className="text-xs text-red-500">{errors.ejercicio_repeticiones}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metros">
              Metros <span className="text-red-500">*</span>
            </Label>
            <Input
              id="metros"
              type="number"
              min="0"
              value={ejercicio.metros}
              onChange={(e) => onEjercicioChange("metros", Number(e.target.value))}
              className={errors.ejercicio_metros ? "border-red-500" : ""}
              disabled={disabled}
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
            value={ejercicio.descanso}
            onChange={(e) => onEjercicioChange("descanso", Number(e.target.value))}
            className={errors.ejercicio_descanso ? "border-red-500" : ""}
            disabled={disabled}
          />
          {errors.ejercicio_descanso && <p className="text-xs text-red-500">{errors.ejercicio_descanso}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ritmo">
              Ritmo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={ejercicio.id_ritmo}
              onValueChange={(value) => onEjercicioChange("id_ritmo", value)}
              disabled={disabled}
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
              value={ejercicio.id_estilo}
              onValueChange={(value) => onEjercicioChange("id_estilo", value)}
              disabled={disabled}
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
            value={ejercicio.descripcion}
            onChange={(e) => onEjercicioChange("descripcion", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {modoEdicion && onCancelar && (
          <Button variant="ghost" onClick={onCancelar} disabled={disabled}>
            Cancelar
          </Button>
        )}
        <Button onClick={onGuardar} disabled={disabled}>
          {modoEdicion ? "Actualizar ejercicio" : "Añadir ejercicio"}
        </Button>
      </CardFooter>
    </Card>
  )
}
