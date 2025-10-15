const controller = import('../controllers/listar-um-por-ordem-controller');


export default function listarUmPorOrdem(Route: any): void {
  Route.group(() => {
    Route.get('/por-ordem', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware('can:funcionario-registar')

  })
}
