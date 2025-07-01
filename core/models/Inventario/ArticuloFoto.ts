export interface ArticuloFoto {
    id: number;
    idArticulo: number;
    urlFoto?: string;
    orden: number;
    esPrincipal: boolean;
    imageFile?: File;
    otrosF1?: string;
    otrosN1?: number;
    otrosN2?: number;
    otrosC1?: string;
    otrosC2?: string;
    otrosC3?: string;
    otrosC4?: string;
    otrosT1?: string;
    usuario?: number;
    equipo: string;
}