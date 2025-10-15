const controller = import('../controllers/eliminar-controller');


export default function route(Route: any): void {
    Route.group(() => {
        Route.delete('/:id', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller
            return new Ct().execute(ctx)
        })
        // .middleware(['can:user-index'])

    })
}
