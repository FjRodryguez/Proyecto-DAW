"use client"
import { AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErroresModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    errores: Record<string, any>
}

export default function ErroresModal({ open, onOpenChange, errores }: ErroresModalProps) {
    // Función para obtener el título de la sección
    const getTituloSeccion = (key: string): string => {
        switch (key) {
            case "calentamiento":
                return "Calentamiento"
            case "principal":
                return "Parte Principal"
            case "calma":
                return "Vuelta a la Calma"
            default:
                return key.charAt(0).toUpperCase() + key.slice(1)
        }
    }

    // Función para renderizar los errores de una sección
    const renderErroresSeccion = (seccion: string, erroresSeccion: any) => {
        // Si es un string simple
        if (typeof erroresSeccion === "string") {
            return (
                <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{erroresSeccion}</AlertDescription>
                </Alert>
            )
        }

        // Si es un objeto
        if (typeof erroresSeccion === "object" && erroresSeccion !== null) {
            return (
                <div className="space-y-4">
                    {Object.entries(erroresSeccion).map(([indice, erroresEjercicio]) => (
                        <div key={indice} className="border border-red-200 rounded-md p-3 bg-red-50">
                            <p className="font-medium text-red-700 mb-2">Ejercicio {indice}:</p>
                            <div className="space-y-2">
                                {Object.entries(erroresEjercicio as Record<string, string>).map(([campo, mensaje], fieldIndex) => (
                                    <div key={fieldIndex} className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        <div>
                                            <span className="font-medium">{campo.charAt(0).toUpperCase() + campo.slice(1)}:</span>{" "}
                                            <span className="text-red-600">{String(mensaje)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return null
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Errores en el entrenamiento</DialogTitle>
                    <DialogDescription>
                        Se han encontrado errores en algunas secciones del entrenamiento. Por favor, revisa y corrige los siguientes
                        problemas:
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto py-4">
                    {Object.entries(errores).map(([seccion, erroresSeccion]) => (
                        <div key={seccion} className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{getTituloSeccion(seccion)}</h3>
                            {renderErroresSeccion(seccion, erroresSeccion)}
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} className="w-full">
                        Entendido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
