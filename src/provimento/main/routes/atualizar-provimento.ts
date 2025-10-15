const controller = import('../controllers/atualizar-provimento');


export default function atualizarprovimento(Route: any): void {
  Route.group(() => {

    Route.put('/atualizar-data-provimento/:id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
