
import crud from "./crud-route"
import modulo from './listar-por-modulo-route'

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
      modulo(Route);
    }).prefix('/sigpq/config/perfil')
  })
}
