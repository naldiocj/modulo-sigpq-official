import listarRoute from "./listar-route"

export default function sigt(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      listarRoute(Route); 
    }).prefix('/sigpq/config')
  })
}
