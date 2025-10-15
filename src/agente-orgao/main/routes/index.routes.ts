import routeImport from "./listar-agente-orgao-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      routeImport(Route);
    }).prefix('/sigpq/agente-orgao')
  })
}
