
// import BaseRepository from "App/@piips/core/repository/BaseRepository"
import { DTOCorrespondncia } from "../dto/correspondencia-dto"
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository"
import Database, { DatabaseQueryBuilderContract } from "@ioc:Adonis/Lucid/Database"


import NumeroAutomaticoService from 'App/@piips/shared/service/NumeroAutomaticoService';
import { estado } from "../utils/cor-estado-utils";

const { gerarUnicoNumeroParaProcesso } = require('App/@piips/shared/metodo-generico/Gerar-Numero-Unico')

const { uploadFile, deleteFileUrl } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')

const validar = require('../validation/validar')




export default class CrudRepository extends BaseModuloRepository {

    #tabela = 'sigpq_correspondencias'
    #numeroAutomaticoService: NumeroAutomaticoService
    #data: any = {
        created_at: new Date(),
        updated_at: new Date()
    }

    constructor() {
        super('sigpq_correspondencias')
        this.#numeroAutomaticoService = new NumeroAutomaticoService();
    }

    public async registar(input: DTOCorrespondncia, file: any = null, trx: any = null): Promise<any> {

        trx = trx ?? await Database.transaction()

        const valido = await validar(input)
        let documento: any = null
        if (['string'].includes(typeof valido)) {
            return Error(valido)
        }

        try {

            const orgaos = input.pessoajuridicas_id.toString().split(',')

            let file_: any = file.file('anexo')
            documento = file_ ? await uploadFile(input.remetente_id + '/doc-correspondencia', file_) : null


            for (let item of orgaos) {


                const siglaRemetente = await this.buscarColocacao(input.remetente_id)
                const siglaDestinatario = await this.buscarColocacao(item)



                const codigoSistema = `${siglaRemetente}/PNA - ${await this.numeroAleatorio()} - ${siglaDestinatario}/PNA`

                const inputCorrespondencia = {
                    tipo_natureza_id: input.tipo_natureza_id,
                    importancia_id: input.importancia_id,
                    tipo_correspondencia_id: input.tipo_correspondencia_id,
                    assunto: input.assunto,
                    procedencia_correspondencia_id: input.procedencia_correspondencia_id,
                    codigo_sistema: codigoSistema,
                    nota: input.nota,
                    user_id: input.user_id,
                    ...this.#data
                }
                const correspondenciaId = await Database.insertQuery().useTransaction(trx).table(this.#tabela).insert(inputCorrespondencia)

                const inputTratamento = {
                    user_id: input.user_id,
                    correspondencia_id: correspondenciaId[0],
                    ...this.#data
                }

                await Database.insertQuery().insert(inputTratamento).useTransaction(trx).table('sigpq_tratamento_correspondencias')

                const documentoInput: any = {
                    anexo: documento,
                    user_id: input.user_id,
                    correspondencia_id: correspondenciaId[0],
                    numero_oficio: input.numero_oficio,
                    ...this.#data
                }

                await Database.insertQuery().insert(documentoInput).useTransaction(trx).table('sigpq_documento_correspondencias')

                const orgao_correspondencia: any = {
                    sigpq_correspondencia_id: correspondenciaId[0],
                    pessoajuridica_id: item,
                    remetente_id: input.remetente_id,
                    ...this.#data
                }

                await Database.insertQuery().useTransaction(trx).insert(orgao_correspondencia).table('sigpq_orgao_correspondencias')
            }
            return await trx.commit()

        } catch (e) {
            await trx.rollback()
            console.log(e)
            if (documento) {
                // await deleteFileUrl(documento)
            }
            return Error('Não foi possível criar registo')
        }

    }



    public async listarTodos(options: any): Promise<any> {
        try {
            const query: DatabaseQueryBuilderContract = Database.from({ oc: 'sigpq_orgao_correspondencias' })
                .select
                ('c.id',
                    'c.nota',
                    'c.codigo_sistema',
                    'c.assunto',
                    'c.activo',
                    Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
                    Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
                    'oc.n_lido',
                    'oc.marcado',
                    'oc.pessoajuridica_id as pessoajuridica_id',
                    'pj.sigla as orgao_sigla',
                    'p.nome_completo as orgao',

                    'n.nome as natureza',
                    'n.id as tipo_natureza_id',
                    'ip.id as importancia_id',
                    'ip.nome as importancia',
                    'pc.id as procedencia_correspondencia_id',
                    'pc.nome as procedencia_correspondencia',
                    'tc.id as tipo_correspondencia_id',
                    'tc.nome as tipo_correspondencia',

                    'd.anexo',
                    'd.numero_oficio',

                    'oc.remetente_id as rementente_id',
                    'rj.sigla as remetente_sigla',
                    'r.nome_completo as remetente',

                    'tco.id as sigpq_tratamento_correspondencia_id',
                    'tco.estado as estado',
                    'tco.cor',


                ).innerJoin('pessoajuridicas as rj', 'rj.id', 'oc.remetente_id')
                .innerJoin('pessoajuridicas as pj ', 'pj.id', 'oc.pessoajuridica_id')
                .innerJoin('sigpq_correspondencias as c', 'c.id', 'oc.sigpq_correspondencia_id')
                .innerJoin('sigpq_documento_correspondencias as d', 'd.correspondencia_id', 'c.id')
                .innerJoin('pessoas as p', 'p.id', 'pj.id')
                .innerJoin('pessoas as r', 'r.id', 'rj.id')
                .innerJoin('tipo_correspondencias as tc', 'tc.id', 'c.tipo_correspondencia_id')
                .innerJoin('procedencia_correspondencias as pc', 'pc.id', 'c.procedencia_correspondencia_id')
                .innerJoin('tipo_naturezas as n', 'n.id', 'c.tipo_natureza_id')
                .innerJoin('tipo_importancias as ip', 'ip.id', 'c.importancia_id')
                .innerJoin('sigpq_tratamento_correspondencias as tco ', 'tco.correspondencia_id', 'c.id')
                .where('tco.activo', true)
                .where('c.eliminado', false)
                .orderBy('c.created_at', 'asc')
                .where('c.activo', true)
                // .where('tco.activo', true)

                .where((query: any) => {
                    if (options.remtente_id) {
                        query.where('oc.remetente_id', '=', options.remtente_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.remtente_id) {
                        query.where('oc.remetente_id', '=', options.remtente_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.natureza_id) {
                        query.where('n.id', '=', options.natureza_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.procedencia_id) {
                        query.where('pc.id ', '=', options.procedencia_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.tipo_id) {
                        query.where('tc.id', '=', options.tipo_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.importancia_id) {
                        query.where('ip.id', '=', options.importancia_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.estado_id) {
                        query.where('tco.estado', '=', options.estado_id)
                        // .orWhere('oc.pessoajuridica_id', '=', options.remtente_id)
                    }
                })
                .where((query: any) => {
                    if (options.enviado_para) {
                        query.where('oc.pessoajuridica_id', '=', options.enviado_para)
                    }
                }).where((query: any) => {
                    if (options.search) {

                        query.where('c.nota', 'like', `%${options.search}%`)
                        query.orWhere('c.codigo_sistema', 'like', `%${options.search}%`)
                        query.orWhere('c.assunto', 'like', `%${options.search}%`)
                        // query.orWhere('c.estado', 'like', `%${options.search}%`)
                        query.orWhere('pj.sigla ', 'like', `%${options.search}%`)
                        query.orWhere('p.nome_completo ', 'like', `%${options.search}%`)

                        query.orWhere('n.nome', 'like', `%${options.search}%`)
                        query.orWhere('ip.nome ', 'like', `%${options.search}%`)
                        query.orWhere('pc.nome ', 'like', `%${options.search}%`)
                        query.orWhere('tc.nome ', 'like', `%${options.search}%`)

                        query.orWhere('d.numero_oficio', 'like', `%${options.search}%`)
                        query.orWhere('rj.sigla ', 'like', `%${options.search}%`)
                        query.orWhere('r.nome_completo', 'like', `%${options.search}%`)
                    }
                })
                .clone()
            if (options.page) {
                const pagination = await query.paginate(options.page, options.perPage || 10)
                pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {


                    // const tratamento: any = await Database.from({ t: 'sigpq_tratamento_correspondencias' }).select('t.*').where('t.correspondencia_id', item.id).where('t.activo', true).first()

                    return {
                        ...item,
                        status: estado(item?.estado),
                        // tratamento
                    }
                }))

                return pagination
            } else {
                const items = await query

                const all = await Promise.all(items.map(async (item: any) => {


                    // const tratamento: any = await Database.from({ t: 'sigpq_tratamento_correspondencias' }).select('t.*').where('t.correspondencia_id', item.id).where('t.activo', true).first()

                    return {
                        ...item,
                        status: estado(item?.estado),
                        // tratamento
                    }
                }))

                return all;
            }
        } catch (e) {

            console.log(e)
            return Error('Não foi possível listar registo')
        }
    }

    public async listarUm(id: any): Promise<any> {
        try {
            const query: any = Database.from({ oc: 'sigpq_orgao_correspondencias' })
                .select
                ('c.id',
                    'c.nota',
                    'c.codigo_sistema',
                    'c.assunto',
                    'c.activo',
                    Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
                    Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
                    'oc.n_lido',
                    'oc.marcado',
                    'oc.pessoajuridica_id as pessoajuridica_id',
                    'pj.sigla as orgao_sigla',
                    'p.nome_completo as orgao',

                    'n.nome as natureza',
                    'n.id as tipo_natureza_id',
                    'ip.id as importancia_id',
                    'ip.nome as importancia',
                    'pc.id as procedencia_correspondencia_id',
                    'pc.nome as procedencia_correspondencia',
                    'tc.id as tipo_correspondencia_id',
                    'tc.nome as tipo_correspondencia',

                    'd.anexo',
                    'd.numero_oficio',

                    'oc.remetente_id as rementente_id',
                    'rj.sigla as remetente_sigla',
                    'r.nome_completo as remetente',

                ).innerJoin('pessoajuridicas as rj', 'rj.id', 'oc.remetente_id')
                .innerJoin('pessoajuridicas as pj ', 'pj.id', 'oc.pessoajuridica_id')
                .innerJoin('sigpq_correspondencias as c', 'c.id', 'oc.sigpq_correspondencia_id')
                .innerJoin('sigpq_documento_correspondencias as d', 'd.correspondencia_id', 'c.id')
                .innerJoin('pessoas as p', 'p.id', 'pj.id')
                .innerJoin('pessoas as r', 'r.id', 'rj.id')
                .innerJoin('tipo_correspondencias as tc', 'tc.id', 'c.tipo_correspondencia_id')
                .innerJoin('procedencia_correspondencias as pc', 'pc.id', 'c.procedencia_correspondencia_id')
                .innerJoin('tipo_naturezas as n', 'n.id', 'c.tipo_natureza_id')
                .innerJoin('tipo_importancias as ip', 'ip.id', 'c.importancia_id')
                .where('c.eliminado', false)
                .orderBy('c.created_at', 'asc')
                .where('c.activo', true)
                .where('oc.id', id)
                .first()

            const item = await query
            const tratamento: any = await Database.from({ t: 'sigpq_tratamento_correspondencias' }).select('t.*').where('t.correspondencia_id', item.id).where('activo', true).first()
            return {
                ...item,
                status: estado(tratamento?.estado),
                tratamento
            }

        } catch (e) {

            console.log(e)
            return Error('Não foi possível listar registo')
        }
    }

    public async buscarColocacao(pessoajuridica_id: any) {
        const query = await Database.from({ p: 'pessoas' })
            .select(
                "pf.sigla",
            )
            .innerJoin('pessoajuridicas as pf', "pf.id", 'p.id')
            .where('p.id', pessoajuridica_id)
            .first()

        return query.sigla
    }


    private async numeroAleatorio(): Promise<any> {
        const numeroAutomatico = await this.#numeroAutomaticoService.gerarNumeroAutomatico('Numero_Processo_Correspondencia');
        return gerarUnicoNumeroParaProcesso(numeroAutomatico)
    }


}
