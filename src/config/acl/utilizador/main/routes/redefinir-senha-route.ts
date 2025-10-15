const controller = import('../controllers/redefinir-senha-controller');

export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/:id/redefinir-senha', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().redefinirSenha(ctx)
    })//.middleware(['can:user-index'])
     
  })
}
 