"use client";

import Link from "next/link"
import { Waves } from "lucide-react"
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebaseClient"
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        pass: "",
        pass2: "",
        aceptar_terminos: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }))

        setErrors((prevErrors) => ({ ...prevErrors, [id]: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8085/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                setErrors(data);
            } else {
                setFormData({
                    nombre: "",
                    email: "",
                    pass: "",
                    pass2: "",
                    aceptar_terminos: false,
                });
                setSuccessMessage(data.success);
                setTimeout(() => {
                    router.push('/login');
                }, 1000);
            }
        } catch (error) {
            setErrors({ error: "Error en la conexión con el servidor. Intente nuevamente." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setIsLoading(true);
        setErrors({});
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const token = await result.user.getIdToken();

            const res = await fetch("http://localhost:8085/register-google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                setErrors(data);
            } else {
                setSuccessMessage(data.success);
                setTimeout(() => {
                    router.push('/login');
                }, 1000);
            }
        } catch (error) {
            setErrors({ error: "Error en la conexión con el servidor. Intente nuevamente." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                <form onSubmit={handleSubmit} className="w-full max-w-md">
                    <Card>
                        <CardHeader className="space-y-2 text-center">
                            <div className="flex justify-center mb-4">
                                <Link href="/" className="flex items-center gap-2">
                                    <Image src="/img/logo.png" alt="AegirSwim Logo" width={32} height={32} className="h-8 w-8" />
                                    <span className="text-xl font-bold">AegirSwim</span>
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                            <CardDescription>Regístrate para comenzar a mejorar tu natación</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre completo</Label>
                                <Input id="nombre" value={formData.nombre} onChange={handleChange} />
                                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pass">Contraseña</Label>
                                <Input id="pass" type="password" value={formData.pass} onChange={handleChange} />
                                {errors.pass && <p className="text-red-500 text-sm">{errors.pass}</p>}
                                <p className="text-xs text-muted-foreground">
                                    La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula y un número
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pass2">Confirmar contraseña</Label>
                                <Input id="pass2" type="password" value={formData.pass2} onChange={handleChange} />
                            </div>
                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox
                                    id="aceptar_terminos"
                                    checked={formData.aceptar_terminos}
                                    onCheckedChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            aceptar_terminos: value === true,
                                        }))
                                    }
                                />
                                <Label htmlFor="aceptar_terminos" className="text-sm font-normal">
                                    Acepto los{" "}
                                    <Link href="/terminos" className="text-sky-500 hover:text-sky-600 font-medium">
                                        Términos y Condiciones
                                    </Link>{" "}
                                    y la{" "}
                                    <Link href="/privacidad" className="text-sky-500 hover:text-sky-600 font-medium">
                                        Política de Privacidad
                                    </Link>
                                </Label>
                            </div>
                            {errors.aceptar_terminos && <p className="text-red-500 text-sm">{errors.aceptar_terminos}</p>}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
                            {errors.error && <p className="text-red-500 text-sm">{errors.error}</p>}
                            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={isLoading}>{isLoading ? "Registrando..." : "Crear cuenta"}</Button>
                            <Button variant="outline" onClick={handleGoogleRegister} className="w-full flex items-center justify-center gap-2 h-10" disabled={isLoading}>
                                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                        <path d="M1 1h22v22H1z" fill="none" />
                                    </g>
                                </svg>
                                <span>Continuar con Google</span>
                            </Button>
                            <div className="text-center text-sm">
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login" className="text-sky-500 hover:text-sky-600 font-medium">
                                    Inicia sesión
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <footer className="py-6 text-center text-sm text-muted-foreground border-t">
                <div className="container">
                    <p>© {new Date().getFullYear()} AegirSwim. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
