const controller = import('../controllers/crud-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      console.log(ctx);
      
      return new Ct().listarTodos(ctx)
    })//.middleware(['can:role-index'])
    

    Route.post('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().registar(ctx)
    })//.middleware('can:role-store')
    

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
 