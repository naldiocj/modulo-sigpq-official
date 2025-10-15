import Database from "@ioc:Adonis/Lucid/Database"
import PatenteRepository from "App/Repositories/PatenteRepository";
import CrudBaseRepository from "../../config/direcao-ou-orgao/repositories/crud-base-repositorio";
import BaseRepository from "App/@piips/core/repository/BaseRepository";


const tipoCargoRepository = new BaseRepository<any>('sigpq_tipo_cargos');
const tipoActoRepository = new BaseRepository<any>('sigpq_acto_progressaos');
const tipoNomeacaoRepository = new BaseRepository<any>('sigpq_acto_nomeacaos');

// const cores = {
//     P: {
//         nome: "rgb(254, 176, 25)"
//     },
//     EX: {
//         nome: "red"
//     },
//     A: {
//         nome: "rgb(0, 143, 251)"
//     }
// };

export const estado = (key: string): string => {
    const estados: any = {
        'P': {
            estado: 'Pendente'
        },
        'A': {

            estado: 'Aprovado'
        },
        'EX': {
            estado: 'Expirado'
        },

    }

    return estados.hasOwnProperty(key) ? estados[key].estado : null;
}

export default class ListatPorGuiaRepository {

    private patentes: PatenteRepository
    private orgao: CrudBaseRepository
    constructor() {
        this.patentes = new PatenteRepository()
        this.orgao = new CrudBaseRepository()
    }

    public async execute(options: any): Promise<any> {
        try {
            let despachos = Database.from({ f: 'sigpq_funcionarios' })
                .select(
                    Database.raw("upper(p.nome_completo) as nome_completo"),
                    'pp.id as sigpq_proposta_provimento_id',
                    'p.activo',
                    'pf.apelido',
                    'pf.genero',
                    'pf.estado as estado_funcionario',
                    'f.nip',
                    'f.numero_processo',
                    'f.numero_agente',
                    'f.foto_efectivo',
                    'f.id',
                    'patentes.nome as patente_nome',
                    'regimes.quadro',

                    "pp.user_id",
                    "pp.numero",
                    "pp.patente_id",
                    "pp.sigpq_acto_progressao_id",
                    "pp.estado as estado_proposta",
                    "pp.cor",
                    "pp.pessoajuridica_id",
                    "pp.sigpq_tipo_cargo_id",
                    "pp.sigpq_acto_nomeacao_id",
                    "pp.patente_id_actual",
                    "pp.sigpq_tipo_cargo_id_actual",
                    "orgao.nome_completo as orgao",
                    "pessoajuridicas.sigla as orgao_sigla",

                    Database.raw('YEAR(DATE(sigpq_provimentos.data_provimento)) as ano_acto'),
                    Database.raw("(YEAR(NOW()) - YEAR(DATE(sigpq_provimentos.data_provimento))) as acto_duracao"),
                    Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
                    Database.raw("DATE_FORMAT(pp.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
                    Database.raw("DATE_FORMAT(pp.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")

                )
                .innerJoin('sigpq_proposta_provimentos as pp', 'pp.sigpq_funcionario_id', 'f.id')
                .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'pp.pessoajuridica_id')
                .innerJoin('pessoas  as orgao', 'orgao.id', 'pessoajuridicas.id')
                .innerJoin('patentes', 'patentes.id', 'pp.patente_id')
                .innerJoin('sigpq_acto_progressaos', 'sigpq_acto_progressaos.id', 'pp.sigpq_acto_progressao_id')

                .innerJoin('pessoas as p', 'p.id', 'f.id')
                .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')

                .innerJoin('regimes', 'regimes.id', 'pf.regime_id')
                .innerJoin('sigpq_funcionario_estados as fe', 'fe.pessoafisica_id', 'f.id')
                .innerJoin('sigpq_situacao_estados as se', 'se.id', 'fe.sigpq_situacao_id')
                .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'f.id')
                .where('pp.eliminado', 0)


                // .groupBy('pp.pessoajuridica_id')

                .where(query => {
                    if (options.search) {
                        query.where('fo.despacho', 'like', `%${options.search}%`)
                        query.orWhere('fo.numero_guia', 'like', `%${options.search}%`)
                        query.orWhere('pessoajuridicas.sigla', 'like', `%${options.search}%`)
                        query.orWhere('passado.sigla', 'like', `%${options.search}%`)
                        query.orWhere('pessoas.nome_completo', 'like', `%${options.search}%`)
                        query.orWhere('p.nome_completo', 'like', `%${options.search}%`)
                        // query.orWhere('fo.ordem_descricao', options.search)
                        query.orWhere('fo.despacho_descricao', 'like', `%${options.search}%`)
                        // query.orWhere('fo.numero_ordem', options.search)
                    }
                })
                .where((query: any) => {
                    if (options.estadoId) {
                        query.where('fe.sigpq_estado_id', options.estadoId)
                    }

                })
                .where((query: any) => {
                    if (options.situacaoId) {
                        query.where('fe.sigpq_situacao_id', options.situacaoId)
                    }

                })

                .where(query => {
                    if (options.regimeId) {

                        query.where('pf.regime_id', Number(options.regimeId))
                    }
                })
                .where(query => {
                    if (options.patenteId) {
                        query.where('pp.patente_id_actual.id', Number(options.patenteId))
                        query.orWhere('patentes.id', Number(options.patenteId))
                    }
                })
                .where(query => {
                    if (options.tipoVinculoId) {
                        query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId))
                    }
                })
                .where(query => {
                    if (options.patenteClasse) {
                        query.where('patentes.sigpq_tipo_carreira_id', Number(options.patenteClasse))
                    }
                })
                .where(query => {
                    if (options.user?.aceder_todos_agentes) {
                        if (options.orgaoId) {
                            query.where('pp.pessoajuridica_id', options.orgaoId)
                            // query.orWhere('fo.pessoajuridica_passado_id', options.orgaoId)
                        }
                    } else {
                        query.where('pp.pessoajuridica_id', options.orgao?.id)
                        // query.orWhere('fo.pessoajuridica_passado_id', options.orgao?.id)
                    }
                })

                .where(query => {
                    if (options.genero) {
                        query.where('pf.genero', options.genero)
                    }
                })


            if (options.numero_guia) {
                despachos.where('pp.numero', options.numero_guia)
                despachos.where('pp.activo', true)
                despachos.where('sigpq_provimentos.situacao', 'actual')
            }

            

            if (options.page) {
                const pagination = await despachos.paginate(options.page, options.perPage || 10);
                pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {

                    const user = await this.buscarUtilizador(item?.user_id)
                    const responsavel = await this.mobilidadeResponsavel(item?.user_id)
                    if (responsavel instanceof Error) {
                        return Error(responsavel.message)
                    }
                    const patente_promover = item?.patente_id ? await this.patentes.findById(item?.patente_id) : null
                    const cargo_promover = item?.sigpq_tipo_cargo_id ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id) : null
                    const patente_actual = item?.patente_id_actual ? await this.patentes.findById(item?.patente_id_actual) : null
                    const cargo_actual = item?.sigpq_tipo_cargo_id_actual ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id_actual) : null
                    const nomeacao = await tipoNomeacaoRepository.listarUmPorId(item?.sigpq_acto_nomeacao_id)
                    const acto = await tipoActoRepository.listarUmPorId(item?.sigpq_acto_progressao_id)
                    const orgao = await this.orgao.listarUm(item?.pessoajuridica_id)
                    const agentes: any = await this.agenteNumeroProposta({ numero: item?.numero })
                    delete item.user_id
                    delete item.pessoajuridica_id

                    return {
                        ...item,
                        agentes,
                        user: user,
                        patente_promover,
                        cargo_promover,
                        patente_actual,
                        cargo_actual,
                        acto,
                        orgao,
                        nomeacao,
                        // tratamento,
                        status: estado(item?.estado_proposta),
                        agente_responsavel: responsavel
                    };
                }));

                return pagination;
            } else {
                const items = await despachos;
                const all = await Promise.all(items.map(async (item: any) => {

                    const user = await this.buscarUtilizador(item.user_id)
                    const responsavel = await this.mobilidadeResponsavel(item?.user_id)

                    if (responsavel instanceof Error) {
                        return Error(responsavel.message)
                    }

                    const patente_promover = item?.patente_id ? await this.patentes.findById(item?.patente_id) : null
                    const cargo_promover = item?.sigpq_tipo_cargo_id ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id) : null
                    const patente_actual = item?.patente_id_actual ? await this.patentes.findById(item?.patente_id_actual) : null
                    const cargo_actual = item?.sigpq_tipo_cargo_id_actual ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id_actual) : null
                    const nomeacao = await tipoNomeacaoRepository.listarUmPorId(item?.sigpq_acto_nomeacao_id)
                    const acto = await tipoActoRepository.listarUmPorId(item?.sigpq_acto_progressao_id)
                    const orgao = await this.orgao.listarUm(item?.pessoajuridica_id)
                    const agentes: any = await this.agenteNumeroProposta({ numero: item?.numero })
                    delete item.user_id
                    delete item.pessoajuridica_id

                    return {
                        ...item,
                        agentes,
                        user: user,
                        patente_promover,
                        cargo_promover,
                        patente_actual,
                        cargo_actual,
                        orgao,
                        acto,
                        nomeacao,
                        // tratamento,
                        status: estado(item?.estado_proposta),
                        agente_responsavel: responsavel
                    };
                }));
                return all;
            }

        } catch (e) {
            console.log(e);
            return Error('Não foi possível listar os registos.');
        }

    }


    public async mobilidadeResponsavel(user_id: any): Promise<any> {
        try {

            let query = Database.from({ f: 'sigpq_funcionarios' })
                .select(
                    'pessoas.nome_completo',
                    'patentes.nome as patente_nome',
                    'f.nip',
                    'f.numero_processo',
                    'f.numero_agente',
                    'f.foto_efectivo',
                    'f.descricao',
                    'f.id',
                    'm.id as sigpq_mais_mobilidade_id',
                    "m.ordenante as comandante",
                    "m.sigpq_fun_id as sigpq_funcionario_orgao_id",
                )
                .innerJoin('pessoas', 'pessoas.id', 'f.id')
                .innerJoin('users as u', 'u.pessoa_id', 'pessoas.id')
                .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
                .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
                .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
                .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
                .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
                .innerJoin('sigpq_mais_mobilidades as m', 'm.pessoafisica_id', 'f.id')
                .where('sigpq_provimentos.activo', true)
                .where('u.id', user_id)
                .first()

            return await query

        } catch (e) {
            console.log(e);
            return Error('Não foi possível listar os registos.');
        }
    }

    public async buscarUtilizador(user_id: any) {
        return await Database.from({ u: 'users' })
            .select(
                "u.id",
                "u.username",
                "u.email"
            )
            .where('u.id', user_id)
            .first()
    }


    public async agenteNumeroProposta(options: any): Promise<any> {
        try {
            let query = Database.from({ f: 'sigpq_funcionarios' })
                .select(

                    'f.*',
                    'pp.id as sigpq_proposta_provimento_id',
                    'pp.*',

                )
                .innerJoin('sigpq_proposta_provimentos as pp', 'pp.sigpq_funcionario_id', 'f.id')
                .where('pp.activo', true)
                .where('pp.eliminado', false)
                .where((query: any) => {
                    if (options.numero) {
                        query.where('pp.numero', options.numero)
                    }
                })

            return await query
        } catch (e) {
            console.log(e);
            return Error('Não foi possível listar os registos.');
        }

    }
}