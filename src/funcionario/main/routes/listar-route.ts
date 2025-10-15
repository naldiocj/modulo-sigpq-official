const controller = import('../controllers/listar-controller');

export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller

      return new Ct().listarTodos(ctx)
    }).middleware(['validateToken']) 
    // .middleware(['can:user-index'])

  })
}
