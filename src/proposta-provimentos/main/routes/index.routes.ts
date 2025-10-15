import emTempo from "./listar-em-tempo-route"
import todos from "./listar-todos-route"
import registarPromocao from "./registar-promocao-route"
import porGuia from './listar-por-guia'
import eliminarProposta from './eliminar-route'
import emTempoPorPessoa from './listar-em-tempo-por-pessoa-route'

export default function funcionario(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      eliminarProposta(Route)
      emTempo(Route);
      porGuia(Route);
      todos(Route);
      registarPromocao(Route);
      emTempoPorPessoa(Route)
    }).prefix('/sigpq/proposta-provimentos').middleware(['auth'])
  })
}
