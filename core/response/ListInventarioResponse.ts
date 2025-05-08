import { Inventario } from "../models/Inventario";

export default interface ListInventarioResponse {
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  tamañoPagina: number;
  data: Inventario[]
}
