"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, User, LogOut, LogIn, UserPlus, Home, Dumbbell, Plus, Settings } from "lucide-react"
import { Loader2 } from "lucide-react"
import type { UserType } from "@/types/user"
import { getUserFromCookie } from "@/utils/getUserFromCookie"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import Image from "next/image"

export default function Header() {
    const [user, setUser] = useState<UserType | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        ; (async () => {
            const user = await getUserFromCookie()
            setUser(user)
            setIsLoading(false)
        })()
    }, [])

    const handleLogout = async () => {
        await fetch("http://localhost:8085/logout", {
            method: "POST",
            credentials: "include",
        })
        setUser(null)
        setIsMenuOpen(false) // Cerrar el menú después de cerrar sesión
    }

    const menuItems = [
        { href: "/", label: "Inicio", icon: <Home className="h-5 w-5 mr-2" /> },
        { href: "/entrenamientos", label: "Entrenamientos", icon: <Dumbbell className="h-5 w-5 mr-2" /> },
        { href: "/crea-entrenamientos", label: "Crea Entrenamientos", icon: <Plus className="h-5 w-5 mr-2" /> },
    ]

    return (
        <header className="w-full border-b bg-background sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/img/logo.png" alt="AegirSwim Logo" width={32} height={32} className="h-8 w-8" />
                        <span className="text-xl font-bold">AegirSwim</span>
                    </Link>
                </div>

                {/* Navegación para pantallas medianas y grandes */}
                <nav className="hidden lg:flex gap-6">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-sky-500 transition-colors">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Botones de autenticación para pantallas medianas y grandes */}
                <div className="hidden lg:flex items-center gap-4">
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : user ? (
                        <>
                            <Button size="sm" className={user.id_rol === 2 || user.id_rol === 3 ? "bg-[#FFD700] hover:bg-[#e6c200] text-black" : "bg-sky-500 hover:bg-sky-600"}>
                                {user.nombre}
                            </Button>
                            {user.id_rol === 3 && (
                                <Link href="/admin/usuarios">
                                    <Button variant="destructive" size="sm">
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
                                    Iniciar sesión
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="outline" size="sm">
                                    Registrarse
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Menú hamburguesa para pantallas pequeñas */}
                <div className="lg:hidden">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                            <SheetHeader className="border-b p-4">
                                <SheetTitle className="flex items-center gap-2">
                                    <Image src="/img/logo.png" alt="AquaTrain Logo" width={32} height={32} className="h-8 w-8" />
                                    <span>AegirSwim</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="py-4 flex flex-col h-full">
                                <div className="px-4 mb-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : user ? (
                                        <div
                                            className={`flex flex-col gap-2 p-4 rounded-lg ${user.id_rol === 2 || user.id_rol === 3 ? "bg-[#FFD700] hover:bg-[#e6c200] text-black" : "bg-sky-50"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{user.nombre}</span>
                                            </div>
                                            {user.id_rol === 3 && (
                                                <Link href="/admin/usuarios" onClick={() => setIsMenuOpen(false)}>
                                                    <Button variant="destructive" size="sm" className="w-full mt-2">
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Panel de Admin
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                                <Button className="w-full bg-sky-500 hover:bg-sky-600">
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    Iniciar sesión
                                                </Button>
                                            </Link>
                                            <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                                <Button variant="outline" className="w-full">
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Registrarse
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <nav className="flex-1">
                                    <ul className="space-y-1 px-2">
                                        {menuItems.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="flex items-center px-3 py-2 rounded-md hover:bg-sky-50 transition-colors"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>

                                {user && (
                                    <SheetFooter className="px-4 py-4 border-t mt-auto">
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                handleLogout()
                                                setIsMenuOpen(false)
                                            }}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Cerrar sesión
                                        </Button>
                                    </SheetFooter>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
