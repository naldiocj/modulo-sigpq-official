const controller = import("../controllers/add-field-controller");

export default function route(Route: any): void {
  Route.post("/add-field", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;
    return new Ct().registar(ctx);
  });
}
