const controller = import('../controllers/ficha-funcionario-controller');


export default function fichaFuncionarioApi(Route: any): void {
  Route.group(() => {

    Route.get('/:id/ficha', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
