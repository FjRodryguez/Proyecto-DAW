"use client"

import type React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import EntrenamientoCard from "./EntrenamientoCard"
import type { Entrenamiento } from "@/types/entrenamientos"

interface EntrenamientosGridProps {
    entrenamientos: Entrenamiento[]
    expandedId: number | null
    onToggleExpand: (id: number) => void
    terminoBusqueda: string
    onClearSearch: () => void
    isPersonalized?: boolean
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    emptyStateTitle?: string
    emptyStateDescription?: string
    emptyStateAction?: React.ReactNode
}

export default function EntrenamientosGrid({
    entrenamientos,
    expandedId,
    onToggleExpand,
    terminoBusqueda,
    onClearSearch,
    isPersonalized = false,
    onEdit,
    onDelete,
    emptyStateTitle = "No se encontraron entrenamientos",
    emptyStateDescription = "No hay entrenamientos disponibles en esta sección",
    emptyStateAction,
}: EntrenamientosGridProps) {
    // Si hay búsqueda pero no hay resultados
    if (terminoBusqueda && entrenamientos.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-gray-50 mt-4">
                <Search className="h-12 w-12 text-sky-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                <p className="text-muted-foreground mb-6">No hay entrenamientos que coincidan con "{terminoBusqueda}"</p>
                <Button variant="outline" onClick={onClearSearch} className="bg-sky-50">
                    Limpiar búsqueda
                </Button>
            </div>
        )
    }

    // Si no hay entrenamientos en absoluto
    if (entrenamientos.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-2">{emptyStateTitle}</h3>
                <p className="text-muted-foreground mb-6">{emptyStateDescription}</p>
                {emptyStateAction}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {entrenamientos.map((entrenamiento) => (
                <EntrenamientoCard
                    key={entrenamiento.id}
                    entrenamiento={entrenamiento}
                    isExpanded={expandedId === entrenamiento.id}
                    onToggleExpand={() => onToggleExpand(entrenamiento.id)}
                    showPersonalizedBadge={isPersonalized}
                    showActions={isPersonalized}
                    onEdit={onEdit ? () => onEdit(entrenamiento.id) : undefined}
                    onDelete={onDelete ? () => onDelete(entrenamiento.id) : undefined}
                />
            ))}
        </div>
    )
}
