const controller = import('../controllers/api-ver-funcionario-controller');


export default function apiListarFuncionarioRoute(Route: any): void {
  Route.group(() => {

    Route.get('/api/:id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
