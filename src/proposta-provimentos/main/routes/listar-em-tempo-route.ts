const controller = import('../controllers/listar-em-tempo-controller');


export default function Route(Route: any): void {
  Route.group(() => {

    Route.get('/em-tempo', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
