const controller = import('../controllers/crud-controller');

export default function route(Route: any): void {
  Route.group(() => {

   /*  Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos(ctx)
    }) */
    // .middleware(['can:user-index'])

    Route.post('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().registar(ctx)
    })

    Route.put(':id', async (ctx: any): Promise<void> => {
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

    Route.patch(':id/editarFoto', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().editarFoto(ctx)
    })

    Route.patch(':id/editarEstado', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().editarStado(ctx)
    })




  })
}
