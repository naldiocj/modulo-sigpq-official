import crud from "./crud-route"
import listarUtilizadorSemContasRepositorio from "./listar-utilizador-sem-contas-route"
import forcarAlterarSenha from "./forcar-alterar-senha-route"
import redefinirSenha from "./redefinir-senha-route"
import activaDesactiva from './active-destactiva-route'

export default function sigt(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
      listarUtilizadorSemContasRepositorio(Route);
      forcarAlterarSenha(Route)
      redefinirSenha(Route)
      activaDesactiva(Route)
    }).prefix('/sigpq/config/acl/utilizador')
  })
}
