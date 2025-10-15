const controller = import('../controllers/listar-habilitacao-literaria-controller');


export default function listarRoute(Route: any): void {
  Route.group(() => {

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })
    // .middleware(['can:user-index'])

  }).prefix('/')
}
 