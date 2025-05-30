export const FORM_FIELDS_INVENTORY = {
    "almacen": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'aplicaVentas',
      label: 'Aplica Ventas',
      type: 'switch' as const,
      description: 'El artículo está disponible para ventas'
    },
    {
      name: 'aplicaCompras',
      label: 'Aplica Compras',
      type: 'switch' as const,
      description: 'El artículo está disponible para compras'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "articulo": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'aplicaVentas',
      label: 'Aplica Ventas',
      type: 'switch' as const,
      description: 'El artículo está disponible para ventas'
    },
    {
      name: 'aplicaCompras',
      label: 'Aplica Compras',
      type: 'switch' as const,
      description: 'El artículo está disponible para compras'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "categoria": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "color": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "grupo": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del grupo',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'codigoCategoria',
      label: 'Categoría',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una categoría',
      description: 'Seleccione la categoría a la que pertenece el grupo',
      options: [], // Se llenará dinámicamente
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El grupo está inactivo'
    }
  ],
  "origen": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "talla": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "tipodearticulo": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    },
    {
      name: 'manejaInventario',
      label: 'Maneja Inventario',
      type: 'switch' as const,
      description: 'El tipo de articulo maneja inventario'
    }
  ],
  "tipodeimpuesto": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ],
  "seccion": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    },
    {
      name: 'codigoGrupo',
      label: 'Grupo',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione un grupo',
      description: 'Seleccione el grupo al que pertenece la sección',
      options: [], // Se llenará dinámicamente
      optionLabel: 'nombre',
      optionValue: 'id'
    }
  ],
  "unidad": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del nuevo registro'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ]
};

export const FORM_FIELDS_FINANZAS = {
  banco: [
    {
      name: 'nombre',
      label: 'Nombre del Banco',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el nombre del nuevo registro',
      description: 'Nombre completo del banco'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'Indica si el banco está suspendido'
    }
  ],
  caja: [
    {
      name: 'nombre',
      label: 'Nombre de la Caja',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el nombre del nuevo registro',
      description: 'Nombre descriptivo de la caja'
    },
    {
      name: 'codigoMoneda',
      label: 'Moneda',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione la moneda',
      description: 'Moneda principal de la caja',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'Indica si la caja está suspendida'
    }
  ],
  cuentaBancaria: [
    {
      name: 'nroCuenta',
      label: 'Número de Cuenta',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el número del nuevo registro',
      description: 'Número de cuenta bancaria'
    },
    {
      name: 'tipoDeCuenta',
      label: 'Tipo de Cuenta',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione el tipo de cuenta',
      description: 'Tipo de cuenta bancaria',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'codigoMoneda',
      label: 'Moneda',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione la moneda',
      description: 'Moneda de la cuenta',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'codigoBanco',
      label: 'Banco',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione el banco',
      description: 'Banco al que pertenece la cuenta',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'sucursal',
      label: 'Sucursal',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese la sucursal',
      description: 'Sucursal del banco'
    },
    {
      name: 'direccion',
      label: 'Dirección',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese la dirección',
      description: 'Dirección de la sucursal'
    },
    {
      name: 'nombreEjecutivo',
      label: 'Nombre del Ejecutivo',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el nombre del ejecutivo',
      description: 'Nombre del ejecutivo de cuenta'
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el teléfono',
      description: 'Teléfono de contacto'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text' as const,
      required: true,
      placeholder: 'Ingrese el email',
      description: 'Email de contacto'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'Indica si la cuenta está suspendida'
    }
  ]
};