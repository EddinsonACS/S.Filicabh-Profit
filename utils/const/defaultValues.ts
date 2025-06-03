export const DEFAULT_VALUES_INVENTORY = {
    "almacen":{
        nombre: '',
        aplicaVentas: false,
        aplicaCompras: false,
        suspendido: false
    },
    "articulo":{
        nombre: '',
        descripcion: '',
        codigoArticulo: '',
        codigoModelo: '',
        codigoBarra: '',
        codigoGrupo: undefined,
        codigoColor: undefined,
        codigoTalla: undefined,
        codigoTipoArticulo: undefined,
        codigoImpuesto: undefined,
        peso: 0,
        volumen: 0,
        metroCubico: 0,
        pie: 0,
        manejaLote: false,
        manejaSerial: false,
        poseeGarantia: false,
        descripcionGarantia: '',
        manejaPuntoMinimo: false,
        puntoMinimo: 0,
        manejaPuntoMaximo: false,
        puntoMaximo: 0,
        suspendido: false,
    },
    "categoria":{
        nombre: '',
        suspendido: false
    },
    "color":{
        nombre: '',
        suspendido: false
    },
    "grupo":{
        nombre: '',
        suspendido: false
    },
    "origen":{
        nombre: '',
        suspendido: false
    },
    "talla":{
        nombre: '',
        suspendido: false
    },
    "tipodearticulo":{
        nombre: '',
        suspendido: false,
        manejaInventario: false
    },
    "tipodeimpuesto":{
        nombre: '',
        suspendido: false
    },
    "seccion":{
        nombre: '',
        suspendido: false
    },
    "unidad":{
        nombre: '',
        suspendido: false
    }
};

export const DEFAULT_VALUES_FINANZAS = {
    "banco":{
        nombre: '',
        suspendido: false
    },
    "caja":{
        nombre: '',
        suspendido: false,
        codigoMoneda: undefined
    },
    "cuentaBancaria":{
        suspendido: false,
        nroCuenta: '',
        tipoDeCuenta: '',
        codigoMoneda: undefined,
        codigoBanco: undefined,
        sucursal: '',
        direccion: '',
        nombreEjecutivo: '',
        telefono: '',
        email: ''
    }
};
