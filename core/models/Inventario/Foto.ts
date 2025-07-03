export interface Foto {
    id: number;
    idArticulo: number;
    articuloNombre: string;
    urlFoto: string;
    orden: number;
    esPrincipal: boolean;
    otrosF1: string;
    otrosN1: number;
    otrosN2: number;
    otrosC1: null;
    otrosC2: null;
    otrosC3: null;
    otrosC4: null;
    otrosT1: null;
    fechaRegistro: string;
    usuarioRegistroNombre: null | string;
    fechaModificacion: string;
    usuarioModificacionNombre: null | string;
}
    