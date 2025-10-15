import crud from "./crud-route"

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
    }).prefix('/sigpq/config/departamento')
  })
}
