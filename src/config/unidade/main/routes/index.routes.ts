import listar from "./crud-base-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      listar(Route);
    }).prefix('/sigpq/config/unidade')
  })
}
