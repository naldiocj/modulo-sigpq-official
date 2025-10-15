const controller = import('../controllers/forcar-alterar-senha-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/:email/forcar-alterar-senha', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().forcarAlterarSenha(ctx)
    })//.middleware(['can:user-index'])
     

    Route.post('/:email/forcar-alterar-senha', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().forcarAlterarSenhaStore(ctx)
    })//.middleware(['can:user-index'])
  })
}
 