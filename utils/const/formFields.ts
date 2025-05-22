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
]
};