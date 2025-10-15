// import registarUtilizadorRoute from "./registar-utilizador-route"
import routeImport from "./listar-tipo-meio-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      routeImport(Route);
    }).prefix('/sigpq/tipo-meio')
  })
}
