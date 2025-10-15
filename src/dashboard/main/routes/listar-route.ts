const controller = import('../controllers/listar-controller');
const controllerNovaEstrutura = import('../controllers/listar-controller-nova-estrutura');
const controllerEstatisticaGeral = import('../controllers/estatistica-geral-controller');


export default function listarRoute(Route: any): void {
  Route.group(() => {

    Route.get('/dashboard-nova-estrutura', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerNovaEstrutura
      return new Ct().executes(ctx)
    })


    Route.get('/dashboards', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().execute(ctx)
    })



    Route.get('/estatisticageral-mapaefetividade-mensal', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executeMapaEfetividadeMensal(ctx)
    })

    Route.get('/estatisticageral-mapapassividade-mensal', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executeMapaPassividadeMensal(ctx)
    })

    Route.get('/estatisticageral-mapa-composicaoetaria', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executecomposicaoEtaria(ctx)
    })

    Route.get('/estatisticageral-distribuicao-por-orgao', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executeDistribuicaoPorOrgao(ctx)
    })

    Route.get('/estatisticageral-distribuicao-cargo-chefia', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executecargoDirecaoChefia(ctx)
    })

    Route.get('/estatisticageral-formacao-academica', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controllerEstatisticaGeral
      return new Ct().executeFormacaoAcademica(ctx)
    })
    // .middleware(['can:funcionario-listar'])

  })
}
