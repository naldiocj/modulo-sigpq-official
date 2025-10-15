import routeImport from "./listar-habilitacao-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      routeImport(Route);
    }).prefix('/sigpq/habilitacao-literaria')
  })
}
