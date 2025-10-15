const controller = import('../controllers/crud-controller');

export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/estados', async (): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarEstados()
    })
    // .middleware(['can:user-index'])

  })
}
