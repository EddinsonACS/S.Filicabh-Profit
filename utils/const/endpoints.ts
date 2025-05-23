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
    }
  },
  "sells":{
    "acuerdodepago":{
      "list": "/api/acuerdodepago",
      "create": "/api/acuerdodepago",
      "getOne": (id: number) => `/api/acuerdodepago/${id}`,
      "update": (id: number) => `/api/acuerdodepago/${id}`,
      "delete": (id: number) => `/api/acuerdodepago/${id}`
    }
  }
}
