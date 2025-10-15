const controller = import('../controllers/listar-em-tempo-por-pessoa-controller');


export default function Route(Route: any): void {
  Route.group(() => {

    Route.get('/em-tempo/:pessoaId', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
