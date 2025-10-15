const controller = import('../controllers/mapa-cargo-direcao-chefia-controller');

export default function route(Route: any): void {
  Route.group(() => {
    Route.get('/mapa-cargo-direcao-chefia', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos(ctx)
    })
  })
}
