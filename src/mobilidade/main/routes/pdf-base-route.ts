const controller = import('../controllers/pdf-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/pdf/:id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().pdf(ctx)
    })
    // .middleware(['can:user-index'])

    // Route.get('/:id/pdfId', async (ctx: any): Promise<void> => {
    //   const { default: Ct } = await controller
    //   return new Ct().pdfIdividual(ctx)
    // })
    // .middleware(['can:user-index'])
      
  })
}
 