export default interface ListDataResponse<T> {
  totalRegistros: number;
  totalPaginas: number;
  paginaActual: number;
  tamañoPagina: number;
  data: T[];
}
