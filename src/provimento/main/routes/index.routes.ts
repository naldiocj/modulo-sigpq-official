import emTempo from "./listar-em-tempo-route"
import todos from "./listar-todos-route"
import registarPromocao from "./registar-promocao-route"
import emTempoPorPessoa from './listar-em-tempo-por-pessoa-route'
import listarUmPorOrdem from "./listar-um-por-ordem-route"
import atualizarprovimento from "./atualizar-provimento"

export default function funcionario(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      atualizarprovimento(Route)
      emTempo(Route);
      todos(Route);
      registarPromocao(Route);
      emTempoPorPessoa(Route);
      listarUmPorOrdem(Route);
    }).prefix('/sigpq/provimento')
  })
}
