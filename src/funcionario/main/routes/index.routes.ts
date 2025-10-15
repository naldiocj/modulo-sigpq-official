import apiVerFuncionarioRoute from "./api-ver-funcionario-route"
import meiosPoliciaisFuncionarioRoute from "./meios-policiais-funcionario-route"

import crud from "./crud-base-route"
import fichaFuncionarioApi from "./ficha-funcionario-route"
import listar from "./listar-route"

// import perfil from "./perfil-route"

export default function funcionario(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
      // perfil(Route);
      listar(Route)
      fichaFuncionarioApi(Route)
      meiosPoliciaisFuncionarioRoute(Route)
      apiVerFuncionarioRoute(Route)
    }).prefix('/sigpq/funcionarios')
  })
}
