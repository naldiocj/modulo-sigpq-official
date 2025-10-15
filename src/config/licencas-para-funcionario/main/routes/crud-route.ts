const controller = import('../controllers/crud-controller');


export default function route(Route: any): void {
  Route.group(() => {

    Route.get('/saber-dias-de-ferias-ano-mes', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller;
      return new Ct().pegarDadosDaLicenca_Ano_mes(ctx);
    })

    Route.put('/enviar_detalhe_para_licenca_ano_mes', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().enviar_detalhe_para_licenca_ano_mes(ctx)
    })

    Route.get('/saber-dias-de-ferias', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller;
      return new Ct().saberDiasDeFerias(ctx);
    })


    Route.get('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos(ctx)
    })//.middleware(['can:user-index'])

    Route.get('/listar-todas-tarefas', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodasFerias(ctx)
    })

    Route.get('/listar-todas-licencas', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().listarTodos_ComPessoas_E_Licencas(ctx)
    })

    Route.post('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().registar(ctx)
    })//.middleware('can:user-store')


    Route.patch(':id', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().editar(ctx)
    })


    Route.patch('/', async (ctx: any): Promise<void> => {
      const { default: Ct } = await controller
      return new Ct().alterarSituacao(ctx)
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

  })
}
