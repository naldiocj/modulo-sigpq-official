const controller = import('../controllers/listar-por-modulo-controller');


export default function listarUtilizadorRoute(Route: any): void {
  Route.group(() => {

    Route.get('/:id/modulo', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:user-index'])

  })
}
 