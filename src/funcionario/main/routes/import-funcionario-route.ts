const controller = import('../controllers/import-funcionario-controller');


export default function importFuncionarioRoute(Route: any): void {
    Route.group(() => {
        Route.get('import-csv', async (ctx: any): Promise<void> => {
            const { default: Ct } = await controller

            return new Ct().execute(ctx)
        })
            .middleware(['validateToken'])
    })
}
