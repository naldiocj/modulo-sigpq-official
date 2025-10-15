const controller = import('../controllers/registar-controller')

export default function route(Route: any): void {
    Route.group(() => {
        Route.post('/', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller
            return new Ct().execute(ctx)
        })
    }).prefix('/')
}