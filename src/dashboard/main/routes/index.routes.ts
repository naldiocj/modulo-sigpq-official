import listarRoute from "./listar-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      listarRoute(Route)
    }).prefix('/sigpq')
  })
}
