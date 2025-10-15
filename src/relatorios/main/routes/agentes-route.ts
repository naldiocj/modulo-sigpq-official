const controller = import('../controllers/agentes-controller');
const controllerLicenca = import('../controllers/licencas-controller');
const controllerLicencaModelo = import('../controllers/modelos-licencas-controller');
const controllerExportarAgentesModelo = import('../controllers/modelos-exportar-agentes-controller');
const controllerTransferencia = import('../controllers/modelos-transferencia-controlller');
const controllerEfectividade = import('../controllers/modelo-efectividade-controller');
const controllerClinico = import('../controllers/modelo-clinico-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerLicenca
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas-modelo', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerLicencaModelo
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas-modelo-transferencia', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerTransferencia
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas-modelo-exportar-agentes', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerExportarAgentesModelo
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas-modelo-efectividade', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEfectividade
      return new Ct().listarTodos(ctx)
    })

    Route.get('/licencas-modelo-clinico', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerClinico
      return new Ct().listarTodos(ctx)
    })

    Route.get('/buscarOpcoesDoSelector', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().buscarOpcoesDoSelector(ctx)
    })

    // Route.get('/', async (ctx: any): Promise<void> => {
    //   const { default: Ct } = await controller
    //   return new Ct().listarTodos(ctx)
    // })
    // .middleware(['can:user-index'])
  })
}
