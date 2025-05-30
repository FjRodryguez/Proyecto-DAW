// components/Footer.tsx
import Link from "next/link"
import Image from "next/image"

export default function Footer() {
    return (
        <footer className="border-t py-12 bg-white">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Image src="/img/logo.png" alt="AquaTrain Logo" width={32} height={32} className="h-8 w-8" />
                            <span className="text-xl font-bold">AegirSwim</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Transformando la forma en que las personas aprenden y mejoran en natación.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4">Empresa</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Sobre nosotros
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Carreras
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Prensa
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4">Recursos</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Guías
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Tutoriales
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Soporte
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Términos
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Cookies
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-sky-500">
                                    Licencias
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} AegirSwim. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
