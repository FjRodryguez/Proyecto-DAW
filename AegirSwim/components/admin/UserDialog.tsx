"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { UserTypeForAdmin } from "@/types/user"
import RolSelect from "./RolSelect"

type UserDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: UserTypeForAdmin | null
    onSave: (user: UserTypeForAdmin) => void
    errors: Record<string, string>
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export function UserDialog({ open, onOpenChange, user = null, onSave, errors, setErrors }: UserDialogProps) {
    const isEdit = !!user

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        rol: "",
        pass: "",
        pass2: "",
        changePassword: false,
    })

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setIsLoading(false)
        }
    }, [errors])

    useEffect(() => {
        if (open && user) {
            // Si hay un usuario, pre-puebla el formulario con los datos del usuario
            setFormData({
                nombre: user.nombre || "",
                email: user.email || "",
                rol: user.id_rol?.toString() || "",
                pass: "",
                pass2: "",
                changePassword: false,
            })
        } else {
            // Si no hay usuario (null), configura el formulario para un nuevo usuario
            setFormData({
                nombre: "",
                email: "",
                rol: "",
                pass: "",
                pass2: "",
                changePassword: true,
            })
        }
        setErrors({})
        setIsLoading(false)
    }, [user, open, setErrors])

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            changePassword: checked,
            pass: checked ? prev.pass : "",
            pass2: checked ? prev.pass2 : "",
        }))
        if (!checked)
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors["pass"]
                delete newErrors["pass2"]
                return newErrors
            })
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Preparamos los datos
        const resultUser: UserTypeForAdmin = {
            id: user?.id || 0,
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol,
            id_rol: Number.parseInt(formData.rol),
            ultimo_inicio_sesion: user?.ultimo_inicio_sesion || null,
            ...(formData.changePassword || !isEdit ? { pass: formData.pass } : {}),
            ...(formData.changePassword || !isEdit ? { pass2: formData.pass2 } : {}),
        } as any

        onSave(resultUser)
        setIsLoading(true)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-2 sm:space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">{isEdit ? "Editar Usuario" : "Añadir Usuario"}</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        {isEdit
                            ? "Modifique los datos del usuario y guarde los cambios."
                            : "Ingrese los datos para crear un nuevo usuario."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Campos de texto - responsive */}
                        {(["nombre", "email"] as const).map((field) => (
                            <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor={field} className="text-sm font-medium sm:text-right">
                                    {field === "nombre" ? "Nombre completo" : "Email"}
                                </Label>
                                <div className="sm:col-span-3 space-y-1">
                                    <Input
                                        id={field}
                                        name={field}
                                        type={field === "email" ? "email" : "text"}
                                        placeholder={field === "email" ? "correo@ejemplo.com" : "Juan Pérez García"}
                                        value={formData[field]}
                                        onChange={handleChange}
                                        className={`${errors[field] ? "border-destructive" : ""} text-sm sm:text-base`}
                                    />
                                    {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                                </div>
                            </div>
                        ))}

                        {/* Rol */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="rol" className="text-sm font-medium sm:text-right">
                                Rol
                            </Label>
                            <div className="sm:col-span-3">
                                <RolSelect
                                    value={formData.rol}
                                    onChange={(value) => handleSelectChange("rol", value)}
                                    error={errors["rol"]}
                                />
                            </div>
                        </div>

                        {/* Cambio de contraseña - solo en edición */}
                        {isEdit && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                                <Label htmlFor="changePassword" className="text-sm font-medium sm:text-right">
                                    Cambiar contraseña
                                </Label>
                                <div className="sm:col-span-3 flex items-center">
                                    <Switch id="changePassword" checked={formData.changePassword} onCheckedChange={handleSwitchChange} />
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {formData.changePassword ? "Activado" : "Desactivado"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Campos de contraseña */}
                        {(!isEdit || formData.changePassword) && (
                            <>
                                {(["pass", "pass2"] as const).map((field) => (
                                    <div
                                        key={field}
                                        className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4"
                                    >
                                        <Label htmlFor={field} className="text-sm font-medium sm:text-right">
                                            {field === "pass" ? "Contraseña" : "Confirmar contraseña"}
                                        </Label>
                                        <div className="sm:col-span-3 space-y-1">
                                            <Input
                                                id={field}
                                                name={field}
                                                type="password"
                                                value={formData[field]}
                                                onChange={handleChange}
                                                className={`${errors[field] ? "border-destructive" : ""} text-sm sm:text-base`}
                                                placeholder={field === "pass" ? "••••••••" : "••••••••"}
                                            />
                                            {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Error general */}
                        {errors.error && (
                            <div className="col-span-full">
                                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">{errors.error}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:w-auto order-2 sm:order-1"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-2">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    {isEdit ? "Guardando..." : "Creando..."}
                                </div>
                            ) : isEdit ? (
                                "Guardar cambios"
                            ) : (
                                "Crear usuario"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
