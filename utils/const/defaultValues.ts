export const DEFAULT_VALUES_INVENTORY = {
  almacen: {
    nombre: "",
    aplicaVentas: false,
    aplicaCompras: false,
    suspendido: false,
  },
  articulo: {
    nombre: "",
    codigo: "",
    idGrupo: 1,
    idTipoArticulo: 1,
    idImpuesto: 1,
    precio: 0,
    stockActual: 0,
    puntoMinimo: 0,
    puntoMaximo: 0,
    manejaLote: false,
    manejaSerial: false,
    poseeGarantia: false,
    descripcionGarantia: "",
    manejaPuntoMinimo: false,
    presentaciones: undefined,
    manejaPuntoMaximo: false,
    suspendido: false,
  },
  categoria: {
    nombre: "",
    suspendido: false,
  },
  color: {
    nombre: "",
    suspendido: false,
  },
  grupo: {
    nombre: "",
    suspendido: false,
    idCategoria: undefined,
  },
  origen: {
    nombre: "",
    suspendido: false,
  },
  talla: {
    nombre: "",
    suspendido: false,
  },
  tipodearticulo: {
    nombre: "",
    suspendido: false,
    manejaInventario: false,
  },
  tipodeimpuesto: {
    nombre: "",
    suspendido: false,
  },
  seccion: {
    nombre: "",
    suspendido: false,
    idGrupo: undefined,
  },
  presentacion: {
    nombre: "",
    suspendido: false,
  },
};

export const DEFAULT_VALUES_FINANZAS = {
  banco: {
    nombre: "",
    suspendido: false,
  },
  caja: {
    nombre: "",
    suspendido: false,
    idMoneda: undefined,
  },
  cuentaBancaria: {
    suspendido: false,
    nroCuenta: "",
    tipoDeCuenta: "",
    idMoneda: undefined,
    idBanco: undefined,
    sucursal: "",
    direccion: "",
    nombreEjecutivo: "",
    telefono: "",
    email: "",
  },
};
