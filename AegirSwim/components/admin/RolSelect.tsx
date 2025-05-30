"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"

interface RolSelectProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    includeAllOption?: boolean
    allOptionLabel?: string
    error?: string
    disabled?: boolean
}

interface Rol {
    id: string
    rol: string
}

const RolSelect: React.FC<RolSelectProps> = ({
    value,
    onChange,
    placeholder = "Seleccione un rol",
    includeAllOption = false,
    allOptionLabel = "Todos los roles",
    error,
    disabled = false,
}) => {
    const [roles, setRoles] = useState<Rol[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true)
                setFetchError(null)

                const response = await fetch("http://localhost:8085/roles", {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                setRoles(data)
            } catch (error) {
                setFetchError("No se pudieron cargar los roles")
            } finally {
                setLoading(false)
            }
        }

        fetchRoles()
    }, [])

    const handleValueChange = (newValue: string) => {
        if (newValue === "all") {
            onChange("")
        } else {
            onChange(newValue)
        }
    }

    const getDisplayValue = () => {
        if (!value || value === "") {
            return includeAllOption ? "all" : ""
        }
        return value
    }

    const getPlaceholderText = () => {
        if (loading) return "Cargando roles..."
        if (fetchError) return fetchError
        return placeholder
    }

    // Función para obtener el texto que se debe mostrar
    const getDisplayText = () => {
        if (loading) {
            return (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando roles...</span>
                </div>
            )
        }

        if (fetchError) {
            return (
                <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fetchError}</span>
                </div>
            )
        }

        // Si no hay valor seleccionado
        if (!value || value === "") {
            if (includeAllOption) {
                return allOptionLabel
            }
            return null // Esto hará que se muestre el placeholder
        }

        // Si hay un valor, buscar el nombre del rol
        const rolEncontrado = roles.find((rol) => rol.id === value)
        return rolEncontrado ? rolEncontrado.rol : "Rol no encontrado"
    }

    const displayText = getDisplayText()

    return (
        <div className="space-y-2">
            <Select
                value={getDisplayValue()}
                onValueChange={handleValueChange}
                disabled={disabled || loading || !!fetchError}
            >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                    <SelectValue placeholder={getPlaceholderText()}>{displayText}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {!loading && !fetchError && (
                        <>
                            {includeAllOption && <SelectItem value="all">{allOptionLabel}</SelectItem>}
                            {roles.map((rol) => (
                                <SelectItem key={rol.id} value={rol.id}>
                                    {rol.rol}
                                </SelectItem>
                            ))}
                            {roles.length === 0 && (
                                <SelectItem value="empty" disabled>
                                    No hay roles disponibles
                                </SelectItem>
                            )}
                        </>
                    )}
                    {loading && (
                        <SelectItem value="loading" disabled>
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Cargando...</span>
                            </div>
                        </SelectItem>
                    )}
                    {fetchError && (
                        <SelectItem value="error" disabled>
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                <span>Error al cargar</span>
                            </div>
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}

export default RolSelect
