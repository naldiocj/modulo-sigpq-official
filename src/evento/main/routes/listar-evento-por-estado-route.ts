const controller = import('../controllers/listar-evento-por-estado-controller');


export default function listarRoute(Route: any): void {
  Route.group(() => {

    Route.get('/estado', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
