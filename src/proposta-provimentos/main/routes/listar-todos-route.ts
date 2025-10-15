const controller = import('../controllers/listar-todos-controller');


export default function listarTodos(Route: any): void {
  Route.group(() => {

    Route.get('', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
