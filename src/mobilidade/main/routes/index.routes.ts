import crud from "./crud-base-route"
import pdf from "./pdf-base-route"
import porPessoa from './crud-por-pessoa-route'
import porGuia  from './listar-por-guia'


export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      porPessoa(Route)
      porGuia(Route)
      pdf(Route);
      crud(Route);
    }).prefix('/sigpq/mobilidade')
  })
}
