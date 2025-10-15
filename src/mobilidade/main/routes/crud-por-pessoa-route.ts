const controller = import('../controllers/por-pessoa-controller.');


export default function route(Route: any): void {
  Route.group(() => {

    Route.put('/editarData/:id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().editarData(ctx)
    })

    Route.get('', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    }).prefix('/por-pessoa')
    // .middleware(['can:user-index'])

  })
}
