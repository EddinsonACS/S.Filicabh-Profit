export interface TasaDeCambio {
    id: number;
    idMoneda: number;
    monedaNombre: string;
    fecha: string;
    tasaVenta: number;
    tasaCompra: number;
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
    nombre?: string;
    suspendido?: boolean;
}