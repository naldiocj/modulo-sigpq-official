import crud from "./crud-base-route";

export default function route(ApiRoute: any, Route: any): void {
  ApiRoute((): void => {
    Route.group((): void => {
      crud(Route);
    }).prefix("/sigpq/antecedente-disciplinar-criminal");
  });
}
