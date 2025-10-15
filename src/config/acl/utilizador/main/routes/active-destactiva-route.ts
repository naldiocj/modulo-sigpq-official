const controller = import('../controllers/activa-destactiva-controller');

export default function route(Route: any): void {
    Route.group(() => {

        Route.get('/:id/activa-desactiva', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller
            return new Ct().execute(ctx)
        })//.middleware(['can:user-index'])

    })
}