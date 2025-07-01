export interface Articulo {
  // Campos de identificación
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  codigoArticulo: string;
  codigoModelo: string;
  codigoBarra: string;

  // Referencias a otras entidades
  idGrupo: number;
  grupoNombre?: string;
  idColor: number;
  colorNombre?: string;
  idTalla: number;
  tallaNombre?: string;
  idTipoArticulo: number;
  tipoArticuloNombre?: string;
  idImpuesto: number;
  impuestoNombre?: string;

  // Medidas y características físicas
  peso: number;
  volumen: number;
  metroCubico: number;
  pie: number;

  // Configuraciones de manejo
  manejaLote: boolean;
  manejaSerial: boolean;
  poseeGarantia: boolean;
  descripcionGarantia: string;
  manejaPuntoMinimo: boolean;
  puntoMinimo: number;
  manejaPuntoMaximo: boolean;
  puntoMaximo: number;
  suspendido: boolean;

  // Presentaciones
  presentaciones: number[] | number;

  // Campos de auditoría
  fechaRegistro?: string;
  usuarioRegistroNombre?: string;
  fechaModificacion?: string;
  usuarioModificacionNombre?: string;
  usuario: number;
  equipo: string;

  // Campos adicionales
  otrosF1: string;
  otrosN1: number;
  otrosN2: number;
  otrosC1: string | null;
  otrosC2: string | null;
  otrosC3: string | null;
  otrosC4: string | null;
  otrosT1: string | null;

  // Campos opcionales
  imagen?: string;
  precio?: number;
  stock?: number;
}