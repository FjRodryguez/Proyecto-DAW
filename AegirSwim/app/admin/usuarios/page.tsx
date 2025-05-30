"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Search,
    Filter,
    Users,
    Shield,
    Clock,
    Mail,
    User,
    Loader2,
    AlertTriangle,
    ChevronFirst,
    ChevronLast,
    Eye,
    Edit,
    Trash2,
    Plus,
    MoreHorizontal,
    ChevronDown,
    ChevronUp,
    CheckCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import Header from "@/components/Header"
import RolSelect from "@/components/admin/RolSelect"
import { UserDialog } from "@/components/admin/UserDialog"
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog"

import type { UserTypeForAdmin, FiltrosUsuarios } from "@/types/user"

export default function AdminUsuariosPage() {
    // Estados para los usuarios
    const [usuarios, setUsuarios] = useState<UserTypeForAdmin[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Estados para los filtros
    const [filtros, setFiltros] = useState<FiltrosUsuarios>({
        email: "",
        nombre: "",
        rol: "",
    })
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

    // Estados para el ordenamiento
    const [order, setOrder] = useState<"1" | "2" | "3" | "4" | "">("1")
    const [sentido, setSentido] = useState<"asc" | "desc">("asc")

    // Estados para la paginación
    const [paginaActual, setPaginaActual] = useState(1)
    const [hayMasPaginas, setHayMasPaginas] = useState(true)
    const [maxPage, setMaxPage] = useState(1)

    // Estados para los modales
    const [userDialogOpen, setUserDialogOpen] = useState(false)
    const [userDetailsOpen, setUserDetailsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserTypeForAdmin | null>(null)
    const [dialogErrors, setDialogErrors] = useState<Record<string, string>>({})

    // Estado para confirmación de eliminación
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<UserTypeForAdmin | null>(null)

    // Estado para mensajes de éxito
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Función para resetear página y ejecutar callback
    const resetPaginaYActualizar = (callback: () => void) => {
        setPaginaActual(1)
        callback()
    }

    // Función para mostrar mensaje de éxito temporal
    const mostrarMensajeExito = (mensaje: string) => {
        setSuccessMessage(mensaje)
        setTimeout(() => {
            setSuccessMessage(null)
        }, 5000) // 5 segundos
    }

    // Función para cargar usuarios con filtros, ordenamiento y paginación
    const cargarUsuarios = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Construir query parameters
            const params = new URLSearchParams()

            if (filtros.email && filtros.email.trim()) {
                params.append("email", filtros.email.trim())
            }

            if (filtros.nombre && filtros.nombre.trim()) {
                params.append("nombre", filtros.nombre.trim())
            }

            if (filtros.rol && filtros.rol !== "") {
                params.append("rol", filtros.rol)
            }

            // Añadir parámetros de ordenamiento
            if (order) {
                params.append("order", order)
                params.append("sentido", sentido)
            }

            // Añadir parámetro de paginación
            params.append("page", paginaActual.toString())

            const url = `http://localhost:8085/usuarios${params.toString() ? `?${params.toString()}` : ""}`

            const response = await fetch(url, {
                credentials: "include",
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.error)
            } else {
                // Actualizar usuarios y datos de paginación
                setUsuarios(data.usuarios)
                setHayMasPaginas(data.maxPage > paginaActual)
                setMaxPage(data.maxPage)
            }
        } catch (err) {
            setError("Error en la conexión con el servidor")
        } finally {
            setIsLoading(false)
        }
    }, [filtros, order, sentido, paginaActual])

    // Cargar usuarios cuando cambien las dependencias
    useEffect(() => {
        cargarUsuarios()
    }, [cargarUsuarios])

    // Función para actualizar filtros
    const actualizarFiltro = (campo: keyof FiltrosUsuarios, valor: string) => {
        resetPaginaYActualizar(() => {
            setFiltros((prev) => ({
                ...prev,
                [campo]: valor,
            }))
        })
    }

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        resetPaginaYActualizar(() => {
            setFiltros({
                email: "",
                nombre: "",
                rol: "",
            })
            // También limpiar el ordenamiento
            setOrder("1")
            setSentido("asc")
        })
    }

    // Función para manejar el ordenamiento
    const handleOrder = (campo: "1" | "2" | "3" | "4") => {
        resetPaginaYActualizar(() => {
            if (order === campo) {
                // Si es la misma columna, cambiar dirección
                setSentido(sentido === "asc" ? "desc" : "asc")
            } else {
                // Si es columna diferente, establecer nueva columna y dirección ascendente
                setOrder(campo)
                setSentido("asc")
            }
        })
    }

    // Funciones para manejar acciones de usuario
    const handleViewUser = (user: UserTypeForAdmin) => {
        setSelectedUser(user)
        setUserDetailsOpen(true)
    }

    const handleEditUser = (user: UserTypeForAdmin) => {
        setSelectedUser(user)
        setDialogErrors({})
        setUserDialogOpen(true)
    }

    const handleAddUser = () => {
        setSelectedUser(null)
        setDialogErrors({})
        setUserDialogOpen(true)
    }

    const handleDeleteUser = (user: UserTypeForAdmin) => {
        setUserToDelete(user)
        setDeleteConfirmOpen(true)
    }

    // Función para guardar usuario (crear o editar)
    const handleSaveUser = async (userData: UserTypeForAdmin) => {
        try {
            const isEdit = !!selectedUser
            const url = isEdit ? `http://localhost:8085/usuarios/${selectedUser.id}` : "http://localhost:8085/usuarios/new"

            const method = isEdit ? "PUT" : "POST"
            console.log(userData)
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(userData),
            })

            const data = await response.json()
            if (!response.ok) {
                setDialogErrors(data)
            } else {
                setUserDialogOpen(false)
                setSelectedUser(null)
                setDialogErrors({})

                // Mostrar mensaje de éxito
                const mensaje = isEdit
                    ? `Usuario "${userData.nombre}" actualizado correctamente`
                    : `Usuario "${userData.nombre}" creado correctamente`
                mostrarMensajeExito(mensaje)
            }
            await cargarUsuarios()
        } catch (error) {
            setDialogErrors({
                error: "Error en la conexión con el servidor. Por favor, inténtelo de nuevo.",
            })
        }
    }

    // Función para confirmar eliminación
    const confirmDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const response = await fetch(`http://localhost:8085/usuarios/${userToDelete.id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error)
            } else {
                // Éxito: cerrar modal y mostrar mensaje de éxito
                setDeleteConfirmOpen(false)
                mostrarMensajeExito(`Usuario "${userToDelete.nombre}" eliminado correctamente`)
                setUserToDelete(null)
            }
            await cargarUsuarios()
        } catch (error) {
            setError("Error en la conexión con el servidor. Por favor, inténtelo de nuevo.")
        }
    }

    // Función para formatear fecha
    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return "Nunca"

        try {
            return new Date(fecha).toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
        } catch {
            return "Fecha inválida"
        }
    }

    // Función para obtener el color del badge según el rol
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

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 container py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
                {/* Header responsive */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-sky-900">Panel de Administración</h1>
                        </div>
                        <Button onClick={handleAddUser} className="bg-sky-500 hover:bg-sky-600 w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Usuario
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-2">Gestión de usuarios del sistema</p>
                </div>

                {/* Mensaje de éxito */}
                {successMessage && (
                    <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                        <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Filtros responsive con collapsible en móvil */}
                <Card className="mb-4 sm:mb-6">
                    <CardHeader className="pb-3 sm:pb-6">
                        <div className={`flex items-center justify-between ${!filtrosAbiertos ? "py-2 sm:py-0" : ""}`}>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                                <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
                            </div>
                            {/* Botón para mostrar/ocultar filtros en móvil */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="sm:hidden"
                                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                            >
                                {filtrosAbiertos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                        <CardDescription className={`hidden sm:block ${filtrosAbiertos ? "block" : "hidden"} sm:block`}>
                            Filtra la lista de usuarios por email, nombre o rol
                        </CardDescription>
                    </CardHeader>

                    {/* Contenido de filtros - siempre visible en desktop, collapsible en móvil */}
                    <div className={`${filtrosAbiertos ? "block" : "hidden"} sm:block`}>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-2">
                                    <label htmlFor="filtro-email" className="text-sm font-medium">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="filtro-email"
                                            type="email"
                                            placeholder="Buscar por email..."
                                            value={filtros.email}
                                            onChange={(e) => actualizarFiltro("email", e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="filtro-nombre" className="text-sm font-medium">
                                        Nombre
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="filtro-nombre"
                                            placeholder="Buscar por nombre..."
                                            value={filtros.nombre}
                                            onChange={(e) => actualizarFiltro("nombre", e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                    <label htmlFor="filtro-rol" className="text-sm font-medium">
                                        Rol
                                    </label>
                                    <RolSelect
                                        value={filtros.rol ?? ""}
                                        onChange={(value) => actualizarFiltro("rol", value)}
                                        includeAllOption={true}
                                        allOptionLabel="Todos los roles"
                                        placeholder="Seleccionar rol"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={() => cargarUsuarios()} className="bg-sky-500 hover:bg-sky-600 w-full sm:w-auto">
                                    <Search className="h-4 w-4 mr-2" />
                                    Aplicar filtros
                                </Button>
                                <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto">
                                    Limpiar filtros
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </Card>

                {/* Lista de usuarios */}
                <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                            Usuarios ({usuarios.length})
                        </CardTitle>
                        <CardDescription className="text-sm">Lista de todos los usuarios registrados en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                        {/* Estado de carga */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-sky-500 mb-4" />
                                <p className="text-muted-foreground text-sm sm:text-base">Cargando usuarios...</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <Alert variant="destructive" className="mb-4 sm:mb-6">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription className="text-sm">
                                    {error}
                                    <Button variant="outline" size="sm" onClick={cargarUsuarios} className="mt-2 ml-2">
                                        Reintentar
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Lista de usuarios - Versión móvil mejorada */}
                        {!isLoading && !error && usuarios.length > 0 && (
                            <>
                                <div className="block lg:hidden space-y-3">
                                    {usuarios.map((usuario) => (
                                        <Card key={usuario.id} className="p-3 sm:p-4 border border-gray-200">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-sm sm:text-base truncate">{usuario.nombre}</h3>
                                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">ID: {usuario.id}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Badge variant={getBadgeVariant(usuario.id_rol)} className="text-xs">
                                                            {usuario.rol}
                                                        </Badge>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewUser(usuario)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEditUser(usuario)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDeleteUser(usuario)} className="text-red-600">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-xs sm:text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-muted-foreground">Email:</span>
                                                        <span className="truncate">{usuario.email}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-muted-foreground">Último acceso:</span>
                                                        <span className="truncate">{formatearFecha(usuario.ultimo_inicio_sesion)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Tabla de usuarios - Versión desktop */}
                                <div className="hidden lg:block border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-sky-50">
                                                <tr>
                                                    <th
                                                        className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-sky-100 transition-colors"
                                                        onClick={() => handleOrder("1")}
                                                    >
                                                        Usuario {order === "1" && (sentido === "asc" ? "↑" : "↓")}
                                                    </th>
                                                    <th
                                                        className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-sky-100 transition-colors"
                                                        onClick={() => handleOrder("2")}
                                                    >
                                                        Email {order === "2" && (sentido === "asc" ? "↑" : "↓")}
                                                    </th>
                                                    <th
                                                        className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-sky-100 transition-colors"
                                                        onClick={() => handleOrder("3")}
                                                    >
                                                        Rol {order === "3" && (sentido === "asc" ? "↑" : "↓")}
                                                    </th>
                                                    <th
                                                        className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-sky-100 transition-colors"
                                                        onClick={() => handleOrder("4")}
                                                    >
                                                        Último acceso {order === "4" && (sentido === "asc" ? "↑" : "↓")}
                                                    </th>
                                                    <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {usuarios.map((usuario, index) => (
                                                    <tr key={usuario.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-8 w-8 xl:h-10 xl:w-10">
                                                                    <div className="h-8 w-8 xl:h-10 xl:w-10 rounded-full bg-sky-100 flex items-center justify-center">
                                                                        <User className="h-4 w-4 xl:h-5 xl:w-5 text-sky-500" />
                                                                    </div>
                                                                </div>
                                                                <div className="ml-3 xl:ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                                                    <div className="text-sm text-gray-500">ID: {usuario.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900 max-w-xs truncate">{usuario.email}</div>
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                                                            <Badge variant={getBadgeVariant(usuario.id_rol)} className="text-xs">
                                                                {usuario.rol}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatearFecha(usuario.ultimo_inicio_sesion)}
                                                        </td>
                                                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center gap-1 xl:gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleViewUser(usuario)}
                                                                    className="text-sky-600 hover:text-sky-900 h-8 w-8 p-0"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEditUser(usuario)}
                                                                    className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteUser(usuario)}
                                                                    className="text-red-600 hover:text-red-900 h-8 w-8 p-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Estado vacío */}
                        {!isLoading && !error && usuarios.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                                <p className="text-sm sm:text-base text-gray-500 mb-4">
                                    No hay usuarios que coincidan con los filtros aplicados.
                                </p>
                                <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto">
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Paginación responsive */}
                {!isLoading && !error && usuarios.length > 0 && (
                    <div className="flex items-center justify-center mt-4 sm:mt-6">
                        <Pagination>
                            <PaginationContent className="flex-wrap gap-1">
                                {/* Primera página - solo en desktop */}
                                <PaginationItem className="hidden sm:block">
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setPaginaActual(1)
                                        }}
                                        aria-disabled={paginaActual === 1}
                                        className={paginaActual === 1 ? "pointer-events-none text-gray-400 cursor-not-allowed" : ""}
                                    >
                                        <ChevronFirst className="h-4 w-4" />
                                    </PaginationLink>
                                </PaginationItem>

                                {/* Anterior */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setPaginaActual((prev) => Math.max(prev - 1, 1))
                                        }}
                                        aria-disabled={paginaActual === 1}
                                        className={`${paginaActual === 1 ? "pointer-events-none text-gray-400 cursor-not-allowed" : ""} text-sm`}
                                    />
                                </PaginationItem>

                                {/* Página actual */}
                                <PaginationItem>
                                    <span className="px-2 sm:px-3 py-1 text-sm text-muted-foreground">
                                        Página {paginaActual} de {maxPage}
                                    </span>
                                </PaginationItem>

                                {/* Siguiente */}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (hayMasPaginas) {
                                                setPaginaActual((prev) => prev + 1)
                                            }
                                        }}
                                        aria-disabled={!hayMasPaginas}
                                        className={`${!hayMasPaginas ? "pointer-events-none text-gray-400 cursor-not-allowed" : ""} text-sm`}
                                    />
                                </PaginationItem>

                                {/* Última página - solo en desktop */}
                                <PaginationItem className="hidden sm:block">
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (paginaActual !== maxPage) setPaginaActual(maxPage)
                                        }}
                                        aria-disabled={paginaActual === maxPage}
                                        className={paginaActual === maxPage ? "pointer-events-none text-gray-400 cursor-not-allowed" : ""}
                                    >
                                        <ChevronLast className="h-4 w-4" />
                                    </PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </main>

            {/* Modales */}
            <UserDialog
                open={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                user={selectedUser}
                onSave={handleSaveUser}
                errors={dialogErrors}
                setErrors={setDialogErrors}
            />

            <UserDetailsDialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen} user={selectedUser} />

            {/* Modal de confirmación de eliminación responsive */}
            {deleteConfirmOpen && userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Confirmar eliminación</h3>
                        <p className="mb-4 text-sm sm:text-base">
                            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.nombre}</strong>? Esta acción no se
                            puede deshacer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={confirmDeleteUser} className="w-full sm:w-auto">
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="border-t py-4 sm:py-6 bg-white">
                <div className="container text-center text-xs sm:text-sm text-muted-foreground px-4">
                    <p>© {new Date().getFullYear()} AegirSwim. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
