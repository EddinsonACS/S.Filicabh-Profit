export interface Region {
    id: number;
    nombre: string;
    suspendido: boolean;
    otrosF1: string;
    otrosN1: number;
    otrosN2: number;
    otrosC1: string;
    otrosC2: string;
    otrosC3: string;
    otrosC4: string;
    otrosT1: string;
    usuario: number;
    equipo: string;
    fechaRegistro?: string;
    usuarioRegistroNombre?: string;
    fechaModificacion?: string;
    usuarioModificacionNombre?: string;
}