const controller = import('../controllers/meios-policiais-funcionario-controller');


export default function Route(Route: any): void {
  Route.group(() => {

    Route.get('/meios-policiais/:id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
