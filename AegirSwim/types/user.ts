export type UserType = {
    id_usuario: number;
    nombre: string;
    id_rol: number;
};

export interface UserTypeForAdmin {
    id: number
    nombre: string
    email: string
    ultimo_inicio_sesion: string | null
    rol: string
    id_rol: number
    fecha_registro?: string
}

export interface FiltrosUsuarios {
    email?: string
    nombre?: string
    rol?: string
}