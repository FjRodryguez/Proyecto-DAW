"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Save, Clock, Flame } from "lucide-react"
import type { EntrenamientoEnCreacion } from "@/types/entrenamientos"

interface EntrenamientoInfoProps {
  entrenamiento: EntrenamientoEnCreacion
  onEntrenamientoChange: (campo: keyof EntrenamientoEnCreacion, valor: any) => void
  onGuardar: () => void
  duraciones: { id: string; duracion: string }[]
  niveles: { id: string; nivel: string }[]
  intensidades: { id: string; intensidad: string }[]
  errors: Record<string, string>
  successMessage: string
  isGuardando: boolean
  isLoading: boolean
  isLoadingUserData: boolean
  puedeCrearEntrenamiento: boolean
  entrenamientoId?: string | null
  disabled?: boolean
}

export default function EntrenamientoInfo({
  entrenamiento,
  onEntrenamientoChange,
  onGuardar,
  duraciones,
  niveles,
  intensidades,
  errors,
  successMessage,
  isGuardando,
  isLoading,
  isLoadingUserData,
  puedeCrearEntrenamiento,
  entrenamientoId,
  disabled = false,
}: EntrenamientoInfoProps) {
  return (
    <>
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
              onChange={(e) => onEntrenamientoChange("nombre", e.target.value)}
              className={errors.nombre ? "border-red-500" : ""}
              disabled={disabled}
            />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              value={entrenamiento.descripcion}
              onChange={(e) => onEntrenamientoChange("descripcion", e.target.value)}
              className={errors.descripcion ? "border-red-500" : ""}
              rows={3}
              disabled={disabled}
            />
            {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracion">Duración</Label>
              <Select
                value={entrenamiento.duracion}
                onValueChange={(value) => onEntrenamientoChange("duracion", value)}
                disabled={disabled}
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
              <Label htmlFor="nivel">Nivel</Label>
              <Select
                value={entrenamiento.nivel}
                onValueChange={(value) => onEntrenamientoChange("nivel", value)}
                disabled={disabled}
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
            <Label htmlFor="intensidad">Intensidad</Label>
            <Select
              value={entrenamiento.intensidad}
              onValueChange={(value) => onEntrenamientoChange("intensidad", value)}
              disabled={disabled}
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
                  {entrenamiento.seriesPartePrincipal} {entrenamiento.seriesPartePrincipal > 1 ? "series" : "serie"}
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
            onClick={onGuardar}
            disabled={isGuardando || isLoading || isLoadingUserData || (!entrenamientoId && !puedeCrearEntrenamiento)}
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
    </>
  )
}
