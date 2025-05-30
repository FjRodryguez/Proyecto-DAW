"use client"

import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Entrenamiento } from "@/types/entrenamientos"
import Link from "next/link"

interface EntrenamientoCardProps {
    entrenamiento: Entrenamiento
    isExpanded: boolean
    onToggleExpand: () => void
    showPersonalizedBadge?: boolean
    onEdit?: () => void
    onDelete?: () => void
    showActions?: boolean
}

export default function EntrenamientoCard({
    entrenamiento,
    isExpanded,
    onToggleExpand,
    showPersonalizedBadge = false,
    onDelete,
    showActions = false,
}: EntrenamientoCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{entrenamiento.nombre}</CardTitle>
                <CardDescription className="line-clamp-2">{entrenamiento.descripcion}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                        {entrenamiento.nivel}
                    </Badge>
                    {showPersonalizedBadge && <Badge className="bg-sky-500">Personalizado</Badge>}
                </div>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
                <Button
                    className={`w-full flex items-center justify-center gap-2 ${isExpanded ? "bg-sky-700 hover:bg-sky-800" : "bg-sky-500 hover:bg-sky-600"
                        }`}
                    onClick={onToggleExpand}
                >
                    {isExpanded ? (
                        <>
                            Ocultar detalles
                            <ChevronUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Ver detalles
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </Button>
                {showActions && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Link href={`/crea-entrenamientos?id=${entrenamiento.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                                Editar
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="w-full text-red-500 hover:text-red-700" onClick={onDelete}>
                            Eliminar
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
