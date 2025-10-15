import listar from "./listar-route";
import eliminar from './eliminar-route'
// import actualizar from './actualizar-route'
import registar from "./registar-route";
import listarPorPessoa from "./listar-por-pessoa";

export default function funcionario(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      eliminar(Route)
      listar(Route);
      registar(Route);
      listarPorPessoa(Route);
      // actualizar(Route)
    })
      .prefix("/sigpq/excepto-funcionarios")
      // .middleware(["auth"]);
  });
}
