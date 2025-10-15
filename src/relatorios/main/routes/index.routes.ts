import agentes from "./agentes-route"
import mapacargodirecaochefia from "./mapa-cargo-direcao-chefia-route"

export default function funcionario(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      agentes(Route)
      mapacargodirecaochefia(Route)
    }).prefix('/sigpq/relatorio')
  })
}
