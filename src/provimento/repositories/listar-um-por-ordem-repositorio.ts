import Database from '@ioc:Adonis/Lucid/Database'

export default class ListarUmPorOrdemRepository {

    public async execute(numero: string): Promise<any> {
        try {
            let query: any = await Database.from('sigpq_provimentos as p')
                .select(
                    'p.activo',
                    'p.numero_despacho',
                    'p.numero_ordem',
                    'p.situacao',
                    'p.pessoa_id',
                    'p.ordem_descricao',
                    'p.despacho_descricao',
                    Database.raw("DATE_FORMAT(p.data_provimento, '%d/%m/%Y') as data_provimento"),
                    'sigpq_acto_progressaos.nome as sigpq_acto_progressaos_nome',
                    'patentes.nome as patente_nome',
                    Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
                    Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y') as createdAt"),
                    Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
                )
                .innerJoin('patentes', 'patentes.id', 'p.patente_id')
                .leftJoin('sigpq_acto_progressaos', 'sigpq_acto_progressaos.id', 'p.acto_progressao_id')
                .where('p.ordem_descricao', numero)
                .first()


            return await query

        } catch (e) {
            console.error('Erro ao listar os registros: ', e)
            throw new Error('Não foi possível listar os registos.')
        }
    }
}
