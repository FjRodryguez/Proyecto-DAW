// utils/getUserFromCookie.ts

export type User = {
    id_usuario: number;
    nombre: string;
    id_rol: number;
};

export async function getUserFromCookie(): Promise<User | null> {
    try {
        const res = await fetch("http://localhost:8085/me", {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return null;
    }
}
