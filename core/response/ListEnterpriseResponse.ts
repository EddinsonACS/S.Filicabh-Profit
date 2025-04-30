import { Enterprise } from "../models/Enterpise";

export default interface ListEnterpriseResponse {
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  tamañoPagina: number;
  data: Enterprise[]
}
