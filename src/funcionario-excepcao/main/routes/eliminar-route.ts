const controller = import('../controllers/eliminar-controller')


export default function route(Route: any): void {

    Route.group((): void => {
        Route.delete('/:pessoaId', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller
            return new Ct().execute(ctx)
        })
    })
}