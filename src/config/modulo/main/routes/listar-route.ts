const controller = import('../controllers/listar-controller');


export default function listarUtilizadorRoute(Route: any): void {
  Route.group(() => {

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:user-index'])

  }).prefix('/modulo')
}
 