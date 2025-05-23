export const FORM_FIELDS_INVENTORY = {
    "almacen": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del grupo.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
  "talla": [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del item',
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
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
      description: 'Ingrese el nombre del elemento de inventario.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      description: 'El artículo está inactivo'
    }
  ]
};