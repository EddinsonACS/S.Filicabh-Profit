export const endpoints = {
  "login": "/api/Auth/login",
  "change-password": "/api/Auth/change-password",
  "select-enterprise": "/api/Auth/seleccionar-empresa",
  "logout": "/api/Auth/logout",
  "enterpriseList":"/api/empresa",
  "inventory": {
    "almacen":{
      "list": "/api/almacen",
      "create": "/api/almacen",
      "getOne": (id: number) => `/api/almacen/${id}`,
      "update": (id: number) => `/api/almacen/${id}`,
      "delete": (id: number) => `/api/almacen/${id}`
    },
    "categoria":{
      "list": "/api/categoria",
      "create": "/api/categoria",
      "getOne": (id: number) => `/api/categoria/${id}`,
      "update": (id: number) => `/api/categoria/${id}`,
      "delete": (id: number) => `/api/categoria/${id}`
    },
    "grupo":{
      "list": "/api/grupo",
      "create": "/api/grupo",
      "getOne": (id: number) => `/api/grupo/${id}`,
      "update": (id: number) => `/api/grupo/${id}`,
      "delete": (id: number) => `/api/grupo/${id}`
    },
    "seccion":{
      "list": "/api/seccion",
      "create": "/api/seccion",
      "getOne": (id: number) => `/api/seccion/${id}`,
      "update": (id: number) => `/api/seccion/${id}`,
      "delete": (id: number) => `/api/seccion/${id}`
    },
    "unidad":{
      "list": "/api/unidad",
      "create": "/api/unidad",
      "getOne": (id: number) => `/api/unidad/${id}`,
      "update": (id: number) => `/api/unidad/${id}`,
      "delete": (id: number) => `/api/unidad/${id}`
    },
    "talla":{
      "list": "/api/talla",
      "create": "/api/talla",
      "getOne": (id: number) => `/api/talla/${id}`,
      "update": (id: number) => `/api/talla/${id}`,
      "delete": (id: number) => `/api/talla/${id}`
    },
    "color":{
      "list": "/api/color",
      "create": "/api/color",
      "getOne": (id: number) => `/api/color/${id}`,
      "update": (id: number) => `/api/color/${id}`,
      "delete": (id: number) => `/api/color/${id}`
    },
    "tipoDeImpuesto":{
      "list": "/api/tipodeimpuesto",
      "create": "/api/tipodeimpuesto",
      "getOne": (id: number) => `/api/tipodeimpuesto/${id}`,
      "update": (id: number) => `/api/tipodeimpuesto/${id}`,
      "delete": (id: number) => `/api/tipodeimpuesto/${id}`
    },
    "tipoDeArticulo":{
      "list": "/api/tipodearticulo",
      "create": "/api/tipodearticulo",
      "getOne": (id: number) => `/api/tipodearticulo/${id}`,
      "update": (id: number) => `/api/tipodearticulo/${id}`,
      "delete": (id: number) => `/api/tipodearticulo/${id}`
    },
    "origen":{
      "list": "/api/origen",
      "create": "/api/origen",
      "getOne": (id: number) => `/api/origen/${id}`,
      "update": (id: number) => `/api/origen/${id}`,
      "delete": (id: number) => `/api/origen/${id}`
    },
    "articulo":{
      "list": "/api/articulo",
      "create": "/api/articulo",
      "getOne": (id: number) => `/api/articulo/${id}`,
      "update": (id: number) => `/api/articulo/${id}`,
      "delete": (id: number) => `/api/articulo/${id}`
    }
  },
  "sales": {
    "acuerdodepago": {
      "list": "/api/acuerdodepago",
      "create": "/api/acuerdodepago",
      "getOne": (id: number) => `/api/acuerdodepago/${id}`,
      "update": (id: number) => `/api/acuerdodepago/${id}`,
      "delete": (id: number) => `/api/acuerdodepago/${id}`
    },
    "ciudad": {
      "list": "/api/ciudad",
      "create": "/api/ciudad",
      "getOne": (id: number) => `/api/ciudad/${id}`,
      "update": (id: number) => `/api/ciudad/${id}`,
      "delete": (id: number) => `/api/ciudad/${id}`
    },
    "region": {
      "list": "/api/region",
      "create": "/api/region",
      "getOne": (id: number) => `/api/region/${id}`,
      "update": (id: number) => `/api/region/${id}`,
      "delete": (id: number) => `/api/region/${id}`
    },
    "pais": {
      "list": "/api/pais",
      "create": "/api/pais",
      "getOne": (id: number) => `/api/pais/${id}`,
      "update": (id: number) => `/api/pais/${id}`,
      "delete": (id: number) => `/api/pais/${id}`
    },
    "formadeentrega": {
      "list": "/api/formadeentrega",
      "create": "/api/formadeentrega",
      "getOne": (id: number) => `/api/formadeentrega/${id}`,
      "update": (id: number) => `/api/formadeentrega/${id}`,
      "delete": (id: number) => `/api/formadeentrega/${id}`
    },
    "tipopersona": {
      "list": "/api/tipopersona",
      "create": "/api/tipopersona",
      "getOne": (id: number) => `/api/tipopersona/${id}`,
      "update": (id: number) => `/api/tipopersona/${id}`,
      "delete": (id: number) => `/api/tipopersona/${id}`
    },
    "tipovendedor": {
      "list": "/api/tipovendedor",
      "create": "/api/tipovendedor",
      "getOne": (id: number) => `/api/tipovendedor/${id}`,
      "update": (id: number) => `/api/tipovendedor/${id}`,
      "delete": (id: number) => `/api/tipovendedor/${id}`
    },
    "vendedor": {
      "list": "/api/vendedor",
      "create": "/api/vendedor",
      "getOne": (id: number) => `/api/vendedor/${id}`,
      "update": (id: number) => `/api/vendedor/${id}`,
      "delete": (id: number) => `/api/vendedor/${id}`
    },
    "moneda": {
      "list": "/api/moneda",
      "create": "/api/moneda",
      "getOne": (id: number) => `/api/moneda/${id}`,
      "update": (id: number) => `/api/moneda/${id}`,
      "delete": (id: number) => `/api/moneda/${id}`
    },
    "tasadecambio": {
      "list": "/api/tasadecambio",
      "create": "/api/tasadecambio",
      "getOne": (id: number) => `/api/tasadecambio/${id}`,
      "update": (id: number) => `/api/tasadecambio/${id}`,
      "delete": (id: number) => `/api/tasadecambio/${id}`
    },
    "listadeprecio": {
      "list": "/api/listadeprecio",
      "create": "/api/listadeprecio",
      "getOne": (id: number) => `/api/listadeprecio/${id}`,
      "update": (id: number) => `/api/listadeprecio/${id}`,
      "delete": (id: number) => `/api/listadeprecio/${id}`
    },
    "sector": {
      "list": "/api/sector",
      "create": "/api/sector",
      "getOne": (id: number) => `/api/sector/${id}`,
      "update": (id: number) => `/api/sector/${id}`,
      "delete": (id: number) => `/api/sector/${id}`
    },
    "rubro": {
      "list": "/api/rubro",
      "create": "/api/rubro",
      "getOne": (id: number) => `/api/rubro/${id}`,
      "update": (id: number) => `/api/rubro/${id}`,
      "delete": (id: number) => `/api/rubro/${id}`
    },
    "figuraComercial":{
      "list": "/api/figuracomercial",
      "create": "/api/figuracomercial",
      "getOne": (id: number) => `/api/figuracomercial/${id}`,
      "update": (id: number) => `/api/figuracomercial/${id}`,
      "delete": (id: number) => `/api/figuracomercial/:codigo?id=${id}`
    }
  },
  "finanzas": {
    "banco": {
      "list": "/api/banco",
      "create": "/api/banco",
      "getOne": (id: number) => `/api/banco/${id}`,
      "update": (id: number) => `/api/banco/${id}`,
      "delete": (id: number) => `/api/banco/${id}`
    },
    "caja": {
      "list": "/api/caja",
      "create": "/api/caja",
      "getOne": (id: number) => `/api/caja/${id}`,
      "update": (id: number) => `/api/caja/${id}`,
      "delete": (id: number) => `/api/caja/${id}`
    },
    "cuentaBancaria": {
      "list": "/api/cuentabancaria",
      "create": "/api/cuentabancaria",
      "getOne": (id: number) => `/api/cuentabancaria/${id}`,
      "update": (id: number) => `/api/cuentabancaria/${id}`,
      "delete": (id: number) => `/api/cuentabancaria/${id}`
    }
  }
}