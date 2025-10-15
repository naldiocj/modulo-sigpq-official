const controller = import('../controllers/listar-utilizador-sem-contas-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/listarUtilizadoresSemContas', async (): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos()
    })//.middleware(['can:user-index'])
     
  })
}
 