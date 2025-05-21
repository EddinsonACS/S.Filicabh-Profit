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
