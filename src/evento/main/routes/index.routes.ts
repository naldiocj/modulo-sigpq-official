import routeImport from "./listar-evento-route"
import registarRoute from "./registar-route"
import listarEventoPorEstado from './listar-evento-por-estado-route'

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      routeImport(Route)
      registarRoute(Route)
      listarEventoPorEstado(Route)
    }).prefix('/sigpq/evento')
  })
}
