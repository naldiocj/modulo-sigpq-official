const controller = import('../controllers/listar-um-por-pessoa-controller')


export default function route(Route: any): void {

    Route.group(() => {
        Route.get('/:pessoa_id', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller
            return new Ct().execute(ctx)
        })
    }).prefix('/emTempo')
}