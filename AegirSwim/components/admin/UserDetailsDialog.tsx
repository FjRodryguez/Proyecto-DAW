"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Shield, Calendar, Clock } from "lucide-react"
import type { UserTypeForAdmin } from "@/types/user"

type UserDetailsDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserTypeForAdmin | null
}

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
    if (!user) return null

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return "Nunca"

        try {
            return new Date(fecha).toLocaleString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch {
            return "Fecha inválida"
        }
    }

    const getBadgeVariant = (rolId: number) => {
        const id = typeof rolId === "string" ? Number.parseInt(rolId, 10) : rolId
        switch (id) {
            case 1:
                return "outline" // Usuario normal
            case 2:
                return "default" // Usuario premium
            case 3:
                return "destructive" // Admin
            default:
                return "outline"
        }
    }

    const userInfo = [
        {
            icon: User,
            label: "ID de Usuario",
            value: user.id.toString(),
        },
        {
            icon: Mail,
            label: "Email",
            value: user.email,
        },
        {
            icon: Shield,
            label: "Rol del Sistema",
            value: user.rol,
        },
        ...(user.fecha_registro
            ? [
                {
                    icon: Calendar,
                    label: "Fecha de Registro",
                    value: formatearFecha(user.fecha_registro),
                },
            ]
            : []),
        {
            icon: Clock,
            label: "Último Inicio de Sesión",
            value: formatearFecha(user.ultimo_inicio_sesion),
        },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 sm:space-y-3">
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        Detalles del Usuario
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Información completa del usuario seleccionado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-4">
                    {/* Header con nombre y rol */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold truncate">{user.nombre}</h3>
                                <p className="text-sm text-muted-foreground">Usuario del sistema</p>
                            </div>
                            <Badge variant={getBadgeVariant(user.id_rol)} className="self-start sm:self-center">
                                {user.rol}
                            </Badge>
                        </div>

                        {/* Información del usuario */}
                        <div className="grid gap-3 sm:gap-4">
                            {userInfo.map((info, index) => {
                                const IconComponent = info.icon
                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-sky-100 flex-shrink-0">
                                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm font-medium text-gray-900">{info.label}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground break-words">{info.value}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
