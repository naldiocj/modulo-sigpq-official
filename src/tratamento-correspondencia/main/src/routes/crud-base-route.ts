const controller = import('../controllers/crud-base-controller')

export default function route(Route: any) {
  Route.get("/", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;
    return new Ct().listarTodos(ctx);
  });

  Route.get("/:id", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;
    return new Ct().listarUm(ctx);
  });

  Route.post("/", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;

    return new Ct().registar(ctx);
  });

  Route.put("/:id", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;

    return new Ct().editar(ctx);
  });

  Route.patch("/:id", async (ctx: any): Promise<void> => {
    const { default: Ct } = await controller;

    return new Ct().editar(ctx);
  });

  Route.delete("/:id", async (ctx: any): Promise<any> => {
    const { default: Ct } = await controller;

    return new Ct().eliminar(ctx);
  });
}
