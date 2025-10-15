import crud from "./crud-route"

export default function sigt(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
    }).prefix('/sigpq/config/tipo-cargo')
  })
}
