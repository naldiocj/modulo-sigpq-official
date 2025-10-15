import routeImport from "./listar-endereco-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      routeImport(Route);
    }).prefix('/sigpq/endereco')
  })
}
