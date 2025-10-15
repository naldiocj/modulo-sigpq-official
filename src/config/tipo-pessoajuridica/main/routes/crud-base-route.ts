const controller = import('../controllers/crud-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(ctx)
    })

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos(ctx)
    })
    // .middleware(['can:user-index'])


    Route.post('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().registar(ctx)
    })


    Route.patch(':id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().editar(ctx)
    })


    Route.get(':id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarUm(ctx)
    })


    Route.delete(':id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().eliminar(ctx)
    })



  })
}
