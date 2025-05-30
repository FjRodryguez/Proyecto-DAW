export type Ejercicio = {
    repeticiones: number
    metros: number
    descanso: number
    ritmo: string
    estilo: string
    descripcion: string
}

export type EjercicioEnCreacion = {
    repeticiones: number
    metros: number
    descanso: number
    id_ritmo: string
    id_estilo: string
    descripcion: string
}

export type Entrenamiento = {
    id: number
    nombre: string
    descripcion: string
    duracion: string
    nivel: string
    intensidad: string
    imagen?: string
    calentamiento: Ejercicio[]
    partePrincipal: Ejercicio[]
    vueltaCalma: Ejercicio[]
    seriesCalentamiento: number
    seriesPartePrincipal: number
    seriesVueltaCalma: number
}

export type EntrenamientoEnCreacion = {
    nombre: string
    descripcion: string
    duracion: string
    nivel: string
    intensidad: string
    calentamiento: EjercicioEnCreacion[]
    seriesCalentamiento: number
    partePrincipal: EjercicioEnCreacion[]
    seriesPartePrincipal: number
    vueltaCalma: EjercicioEnCreacion[]
    seriesVueltaCalma: number
}

export type EntrenamientosData = {
    [key: string]: Entrenamiento[]
}