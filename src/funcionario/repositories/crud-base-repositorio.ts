import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import CrudDocumentoBaseRepository from "../../documento/repositories/crud-base-repositorio";
import OrgaoCrudBaseRepository from "./../../config/direcao-ou-orgao/repositories/crud-base-repositorio";
import sigpqHabilitacaoLiterariaRepo from "./../../habilitacao-literaria/repositories/listar-habilitacao-literaria-repositorio";
import EnderecoRepo from "./../../endereco/repositories/listar-endereco-repositorio";
import ContactoRepo from "./../../contacto/repositories/listar-contacto-repositorio";
import NotCreatedException from "App/Exceptions/NotCreatedException";
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";
import NotUpdateException from "App/Exceptions/NotUpdateException";
import PassRepo from "../../gerar-passes/repositories/crud-base-repositorio";
import { funcaoCompoatilhada_isValidString } from "../../../@core/helpers/funcoesCompartilhadas";

const {
  gerarUnicoNumeroParaProcesso,
} = require("App/@piips/shared/metodo-generico/Gerar-Numero-Unico");
const {
  uploadFile,
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");
const {
  extensao_ordem,
  extensao_despacho,
} = require("App/@piips/shared/metodo-generico/Buscar-Data-Extensao");

import { mysql2 } from "./../../../../config/database/database";

export default class CrudBaseRepository {
  dateTime = new Date();
  #table = "sigpq_funcionarios";

  #crudDocumentoBaseRepository: any;

  #sigpqHabilitacaoLiterariaRepo: any;
  #numeroAutomaticoService: any;
  #sigpqEnderecoRepo: any;
  #sigpqContactoRepo: any;
  #passeRepo: any;

  constructor() {
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository();
    this.#sigpqHabilitacaoLiterariaRepo = new sigpqHabilitacaoLiterariaRepo();
    this.#numeroAutomaticoService = new NumeroAutomaticoService();
    this.#sigpqEnderecoRepo = new EnderecoRepo();
    this.#sigpqContactoRepo = new ContactoRepo();
    this.#passeRepo = new PassRepo();
  }

  public async registar(input: any, file: any = null): Promise<any> {
    let pessoaIdExiste: any = null;

    let foto_efectivo = "";
    let foto_civil = "";

    if ((await this.buscarNip(input.nip)) && input.nip) {
      return Error("Número do nip já existe");
    }

    if (
      (await this.buscarAgentePoNumero(input.numero_agente)) &&
      input.numero_agente
    ) {
      return Error("Número do agente já existe");
    }

    if ((await this.buscarNPS(input.nps)) && input.nps) {
      return Error("Número do nps já existe");
    }

    const numeroAutomatico =
      await this.#numeroAutomaticoService.gerarNumeroAutomatico(
        "Numero_Processo_Agente"
      );

    const trx = await Database.transaction();

    try {
      const pessoa = {
        nome_completo: input.nome_completo,
        tipo: "pf",
        activo: input.activo,
        user_id: input.user_id,
        email_pessoal: input.email,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      const pessoaId = await Database.table("pessoas")
        .useTransaction(trx)
        .insert(pessoa)
        .returning("id");

      input["pessoafisica_id"] = pessoaId;
      pessoaIdExiste = pessoaId;

      const documento = {
        nid: input.nid,
        pessoafisica_id: pessoaId,
        user_id: input.user_id,
        sigpq_tipo_documento_id: 1,
        data_expira: input.data_expira,
        local_emissao: input.residencia_bi,
        data_emissao: input.data_emissao,
      };

      const resultDocumento = await this.#crudDocumentoBaseRepository.registar(
        documento,
        trx
      );

      if (resultDocumento instanceof Error) {
        return resultDocumento;
      }

      if (input.numero_carta_conducao) {
        const cartaConducao = {
          nid: input.numero_carta_conducao,
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 2,
          data_expira: input.data_expira_carta_conducao,
        };

        const resultadoCartaConducao =
          await this.#crudDocumentoBaseRepository.registar(cartaConducao, trx);

        if (resultadoCartaConducao instanceof Error) {
          return resultadoCartaConducao;
        }
      }

      if (input.numero_passaporte) {
        const passaporte = {
          nid: input.numero_passaporte,
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 4,
          data_expira: input.data_expira_passaporte,
        };

        const resultadoPassaporte =
          await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

        if (resultadoPassaporte instanceof Error) {
          return resultadoPassaporte;
        }
      }

      const fileFC = file.file("foto_civil");

      foto_civil = fileFC ? await uploadFile(pessoaId[0], fileFC) : null;

      const fileFE = file.file("foto_efectivo");
      foto_efectivo = fileFE ? await uploadFile(pessoaId[0], fileFE) : null;

      const pessoaFisica = {
        id: pessoaId,
        foto_civil: foto_civil,
        estado: input.estado,
        apelido: input.apelido,
        genero: input.genero,
        nome_mae: input.nome_mae,
        nome_pai: input.nome_pai,
        iban: input.iban,
        data_nascimento: input.data_nascimento,
        nacionalidade_id: 1,
        naturalidade_id: input.naturalidade_id,
        estado_civil_id: input.estado_civil_id,
        local_nascimento: input.local_nascimento,
        municipio_id: input.municipio_id,
        distrito_id: input.distrito_id,
        regime_id: input.regime_id,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      await Database.insertQuery()
        .table("pessoafisicas")
        .useTransaction(trx)
        .insert(pessoaFisica);

      if (input.contacto) {
        const contacto = {
          contacto: input.contacto,
          pessoa_id: pessoaId,
          sigpq_tipo_contacto_id: 1,
          user_id: input.user_id,
          descricao: "Telefone",
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_contactos")
          .useTransaction(trx)
          .insert(contacto);
      }

      if (input.contacto_alternativo) {
        const contacto = {
          contacto: input.contacto_alternativo,
          pessoa_id: pessoaId,
          sigpq_tipo_contacto_id: 1,
          descricao: "Telefone alternativo",
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_contactos")
          .useTransaction(trx)
          .insert(contacto);
      }
      if (input.contacto_profissional) {
        const contacto = {
          contacto: input.contacto_profissional,
          pessoa_id: pessoaId,
          sigpq_tipo_contacto_id: 1,
          user_id: input.user_id,
          descricao: "Telefone de serviço",
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_contactos")
          .useTransaction(trx)
          .insert(contacto);
      }

      if (
        input.sigpq_tipo_habilitacao_literaria_id &&
        !isNaN(input.sigpq_tipo_habilitacao_literaria_id)
      ) {
        const fileCH = file.file("habilitacao_literaria_certificado");
        let anexo_ch = fileCH
          ? await uploadFile(pessoaId + "/individual", fileCH)
          : "";

        const passaporte = {
          anexo: anexo_ch,
          nid: "Pessoal",
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 3,
          updated_at: this.dateTime,
          created_at: this.dateTime,
        };

        const doc = await Database.insertQuery()
          .table("sigpq_documentos")
          .useTransaction(trx)
          .insert(passaporte);

        const habilitacaoliteraria = {
          pessoafisica_id: pessoaId,
          sigpq_tipo_habilitacaoliteraria_id:
            input.sigpq_tipo_habilitacao_literaria_id,
          user_id: input.user_id,
          sigpq_documento_id: doc[0],
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_habilitacaoliterarias")
          .useTransaction(trx)
          .insert(habilitacaoliteraria);
      }

      if (input.numero_ordem || input.numero_despacho) {
        const fileProvimento = file.file("anexo");

        let anexo_provimento = fileProvimento
          ? await uploadFile(pessoaId + "/individual", fileProvimento)
          : null;

        const passaporte = {
          anexo: anexo_provimento,
          nid: "Profissional",
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 21,
        };

        const resultadoPassaporte =
          await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

        if (resultadoPassaporte instanceof Error) {
          return resultadoPassaporte;
        }

        const provimento = {
          pessoa_id: pessoaId,
          patente_id: input.patente_id,
          data_provimento: input?.data_ordem ?? null,

          ordem_data: input?.data_ordem ?? null,
          ordem_descricao:
            input.regime_id == 1 && input?.numero_ordem
              ? extensao_ordem(input?.data_ordem, input?.numero_ordem)
              : null,
          despacho_descricao:
            input?.regime_id == 2 && input?.numero_despacho
              ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
              : null,

          despacho_data: input?.data_despacho ?? null,
          numero_despacho:
            input?.numero_despacho && input?.regime_id == 2
              ? input?.numero_despacho
              : null,
          numero_ordem:
            input.regime_id == 1 && input?.numero_ordem
              ? input?.numero_ordem
              : null,

          acto_progressao_id: input?.sigpq_acto_progressao_id ?? 3,
          user_id: input.user_id,
          sigpq_documento_id: resultadoPassaporte[0],
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_provimentos")
          .useTransaction(trx)
          .insert(provimento);
      }

      if (
        input.sigpq_tipo_cargo_id &&
        !isNaN(input.sigpq_tipo_cargo_id) &&
        input.numero_despacho_nomeacao
      ) {
        const fileProvimento = file.file("anexo_nomeacao");

        let anexo_provimento = fileProvimento
          ? await uploadFile(pessoaId + "/individual", fileProvimento)
          : null;

        const passaporte = {
          anexo: anexo_provimento,
          nid: "Profissional",
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 21,
        };

        const resultadoPassaporte =
          await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

        if (resultadoPassaporte instanceof Error) {
          return resultadoPassaporte;
        }

        const sigpq_cargo = {
          sigpq_tipo_cargo_id: input.sigpq_tipo_cargo_id,
          pessoafisica_id: pessoaId,
          pessoajuridica_id: input.orgao_id,
          patente_id: input.patente_id,
          numero_despacho: input?.numero_despacho
            ? extensao_despacho(
                input?.data_despacho_nomeacao,
                input?.numero_despacho_nomeacao
              )
            : null,
          numero_ordem: input?.numero_despacho_nomeacao ?? null,
          sigpq_acto_nomeacao_id: input?.sigpq_acto_nomeacao_id,
          sigpq_documento_id: resultadoPassaporte[0],
          situacao: "actual",
          data: input?.data_despacho_nomeacao ?? null,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_cargos")
          .useTransaction(trx)
          .insert(sigpq_cargo);
      }

      if (Number(input.sigpq_tipo_funcao_id)) {
        const sigpq_funcao = {
          sigpq_tipo_funcao_id: input.sigpq_tipo_funcao_id,
          pessoafisica_id: pessoaId,
          pessoajuridica_id: input.orgao_id,
          patente_id: input.patente_id,
          situacao: "actual",
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_funcaos")
          .useTransaction(trx)
          .insert(sigpq_funcao);
      }

      const funcionario = {
        id: pessoaId,
        nip: input?.nip,
        nps: input?.nps,
        numero_processo: gerarUnicoNumeroParaProcesso(numeroAutomatico),
        pseudonimo: input.pseudonimo,
        numero_agente: input?.numero_agente,
        seccao: input?.seccao,
        brigada: input?.brigada,
        tipo_funcao_id: input?.sigpq_tipo_funcao_id, // AQUI
        email_servico: input?.email_servico,
        contacto_servico: input?.contacto_servico,
        tipo_cargo_id: input?.tipo_cargo_id,
        foto_efectivo: foto_efectivo,
        sigpq_tipo_vinculo_id: input.sigpq_tipo_vinculo_id,
        sigpq_tipo_sanguineo_id: input?.sigpq_tipo_sanguineo_id,
        data_adesao: input.data_adesao,
        descricao: input.descricao,
        tipo_estrutura_organica_id: input?.tipo_orgao ?? null,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      const fc = await Database.insertQuery()
        .table("sigpq_funcionarios")
        .useTransaction(trx)
        .insert(funcionario);

      funcionario.id = fc[0];

      const passes = Array(funcionario);

      const passe = await this.#passeRepo.registar(
        { user_id: input?.user_id, agentes: passes },
        trx
      );

      if (passe instanceof Error) {
        return passe;
      }

      const enderecoBi = {
        residencia_actual: input.residencia_bi,
        pessoa_id: pessoaId,
        user_id: input.user_id,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      await Database.insertQuery()
        .table("sigpq_enderecos")
        .useTransaction(trx)
        .insert(enderecoBi);

      if (input.residencia_actual) {
        const residenciaActual = {
          residencia_actual: input.residencia_actual,
          pessoa_id: pessoaId,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_enderecos")
          .useTransaction(trx)
          .insert(residenciaActual);
      }

      if (input.sigpq_situacao_id) {
        const estadoFuncionario = {
          pessoafisica_id: pessoaId,
          sigpq_situacao_id: input.sigpq_situacao_id,
          sigpq_estado_id: input?.sigpq_estado_id,
          // sigpq_estado_reforma_id: input?.sigpq_estado_reforma_id,
          // activo: 1,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        await Database.insertQuery()
          .table("sigpq_funcionario_estados")
          .useTransaction(trx)
          .insert(estadoFuncionario);
      }

      const orgao_colocado = {
        pessoajuridica_id: input.orgao_id,
        pessoafisica_id: pessoaId[0],
        numero_guia: input?.numero_guia ?? null,
        despacho: input?.numero_despacho,
        despacho_descricao: input?.numero_despacho
          ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
          : null,
        despacho_data: input?.data_despacho ?? null,
        situacao: "actual",
        user_id: input.user_id,
        nivel_colocacao: "muito-alto",
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      await Database.insertQuery()
        .table("sigpq_funcionario_orgaos")
        .useTransaction(trx)
        .insert(orgao_colocado);

      if (input.departamento_id) {
        const orgao_colocado = {
          pessoajuridica_id: input.departamento_id,
          pessoafisica_id: pessoaId,
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho,
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          situacao: "actual",
          nivel_colocacao: "alto",
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_funcionario_orgaos")
          .useTransaction(trx)
          .insert(orgao_colocado);
      }

      if (input.seccao_id) {
        const orgao_colocado = {
          pessoajuridica_id: input.seccao_id,
          pessoafisica_id: pessoaId[0],
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho,
          situacao: "actual",
          nivel_colocacao: "medio",

          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_funcionario_orgaos")
          .useTransaction(trx)
          .insert(orgao_colocado);
      }

      // if (input.posto_id) {
      //   const orgao_colocado = {
      //     pessoajuridica_id: input.posto_id,
      //     pessoafisica_id: pessoaId[0],
      //     numero_guia: input?.numero_guia ?? null,
      //     despacho: input?.numero_despacho,
      //     situacao: "actual",
      //     nivel_colocacao: "baixo",
      //     despacho_descricao: input?.numero_despacho
      //       ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
      //       : null,
      //     despacho_data: input?.data_despacho ?? null,
      //     user_id: input.user_id,
      //     created_at: this.dateTime,
      //     updated_at: this.dateTime,
      //   };

      //   await Database.insertQuery()
      //     .table("sigpq_funcionario_orgaos")
      //     .useTransaction(trx)
      //     .insert(orgao_colocado);
      // }

      if (input.sigpq_tipo_curso_id && !isNaN(input.sigpq_tipo_curso_id)) {
        const curso = {
          sigpq_tipo_curso_id: input.sigpq_tipo_curso_id,
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        await Database.insertQuery()
          .table("sigpq_cursos")
          .useTransaction(trx)
          .insert(curso);
      }

      if (input?.sigpq_tipo_categoria_id) {
        const data = {
          sigpq_tipo_carreira_id: input.sigpq_tipo_categoria_id,
          pessoajuridica_id: input.orgao_id,
          pessoafisica_id: pessoaId,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_carreiras")
          .useTransaction(trx)
          .insert(data);
      }

      await trx.commit();
      return pessoaId;
    } catch (e) {
      await this.#numeroAutomaticoService.gerarNumeroAutomaticoDesconto(
        "Numero_Processo_Agente"
      );

      // if (pessoaIdExiste) {
      //   await deleteDirectory(pessoaIdExiste)
      // }

      // if (foto_efectivo) {
      //   await deleteFileUrl(foto_efectivo)
      // }
      // if (foto_civil) {
      //   await deleteFileUrl(foto_civil)
      // }

      await trx.rollback();
      console.log(e);
      throw new NotCreatedException(null);
    }
  }

  /* public async listarTodosAntiga(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo"),
          'p.activo',
          'pj.sigla',
          Database.raw("upper(pf.apelido) as apelido"),
          'pf.genero',
          // 'pf.estado',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.id',
          'fe.duracao_inatividade',
          'fe.sigpq_estado_id',
          'fe.sigpq_situacao_id',
          'fe.sigpq_estado_reforma_id',
          // Database.raw('upper(tc.nome) as cargo'),
          'regimes.quadro',
          Database.raw('upper(se.nome) as estado'),
          'patentes.nome as patente_nome',
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
          Database.raw("DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade")
        )
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'p.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        .innerJoin('regimes', 'regimes.id', 'pf.regime_id')
        // .innerJoin('sigpq_cargos as c', 'c.pessoafisica_id', 'f.id')
        // .innerJoin('sigpq_tipo_cargos as tc', 'tc.id', 'c.sigpq_tipo_cargo_id')
        .innerJoin('sigpq_funcionario_estados as fe', 'fe.pessoafisica_id', 'f.id')
        .innerJoin('sigpq_situacao_estados as se', 'se.id', 'fe.sigpq_situacao_id')
        // .leftJoin('sigpq_estados as es', 'es.id', 'fe.sigpq_estado_id')

        .where('sigpq_provimentos.activo', true)
        // .where('pf.estado', 'activo')
        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)
        .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
        // .where('c.activo', true)

        .where('p.eliminado', false)
        .orderBy('p.updated_at', 'desc')
        .where((query: any) => {
          if (options.idadeMenos || options.idadeMais) {
            if (options.idadeMenos == options.idadeMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) = ' + options.idadeMenos)
            } else if (options.idadeMenos < options.idadeMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) >= ' + options.idadeMenos + ' and (YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) <= ' + options.idadeMais)
            } else if (options.idadeMenos && !options.idadeMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) >= ' + options.idadeMenos)

            } else if (!options.idadeMenos && options.idadeMais && options.idadeMais > 18) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) >=18 and (YEAR(NOW()) - YEAR(pf.data_nascimento)) <= ' + options.idadeMais)
            } else if (options.idadeMenos > options.idadeMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(pf.data_nascimento))) >= ' + options.idadeMenos)
            }
          }
          if (options.anoMenos || options.anoMais) {
            if (options.anoMenos == options.anoMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) = ' + options.anoMenos)
            } else if (options.anoMenos < options.anoMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos + ' and (YEAR(NOW()) - YEAR(DATE(f.data_adesao))) <= ' + options.anoMais)
            } else if (options.anoMenos && !options.anoMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)

            } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >=18 and (YEAR(NOW()) - YEAR(f.data_adesao)) <= ' + options.anoMais)
            } else if (options.anoMenos > options.anoMais) {
              query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)
            }
          }
        })
        .where((query: any) => {
          if (options.regimeId) {
            query.where('pf.regime_id', Number(options.regimeId))
          }

        })
        .where((query: any) => {
          if (options.patenteId) {
            query.where('patentes.id', Number(options.patenteId))
          }
        })
        .where((query: any) => {

          if (options.tipoVinculoId) {
            query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId))
          }
        })
        .where((query: any) => {

          if (options.tipoOrgao_id) {
            query.whereLike('pj.orgao_comando_provincial', options.tipoOrgao_id)
          }
        })
        .where((query: any) => {

          if (options.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId)
            }
            if (options.tipoOrgaoId) {
              query.where('pj.tipo_estrutura_organica_sigla', options.tipoOrgaoId)
            }

          } else {
            query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
          }
        })
        .where((query: any) => {
          if (options.genero) {
            query.where('pf.genero', options.genero)
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

        .where((query: any) => {
          if (options.forcaPassiva) {
            query.where('fe.sigpq_situacao_id', '<>', options.forcaPassiva)
          }
        })

        // if (options.idadeMais) {
        //   query.whereRaw('(YEAR(NOW()) - YEAR(pf.data_nascimento)) <= ' + options.idadeMais)
        // }
        // if (options.anoMais) {
        //   query.whereRaw('(YEAR(NOW()) - YEAR(f.data_adesao)) >= ' + options.anoMais)
        // }

        .where((query: any) => {

          if (options.dashboard) {
            if (options.patenteClasse) {
              query.where('patentes.sigpq_tipo_carreira_id', options.patenteClasse)
            }
          }
        })

        .where(function (item: any): void {

          if (options.search) {


            item.orWhere('p.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pf.apelido', 'like', `%${options.search}%`)

            // item.orWhere('tc.nome', 'like', `%${options.search}%`)
            // item.orWhere('es.nome', 'like', `%${options.search}%`)
            item.orWhere('se.nome', 'like', `%${options.search}%`)
            item.orWhere('f.nip', 'like', `%${options.search}%`)
            item.orWhere('f.numero_processo', 'like', `%${options.search}%`)
            item.orWhere('f.numero_agente', 'like', `%${options.search}%`)
            item.orWhereRaw("concat(p.nome_completo, ' ',pf.apelido) like ?", `%${options.search}%`)

            const date = new Date(options.search);
            if (!isNaN(date.getTime())) {
              const [day, month, year] = options.search.split('/');

              let data = ""
              if (day && month && year) {
                data = `${year}-${month}-${day}`
              } else if (day && month) {
                data = `${month}-${day}`
              } else {
                data = day
              }
              item.orWhere('p.created_at', 'like', `%${data}%`)
            }

          }
        })

      if (options.page) {
        const pagination = await query.paginate(options.page, options.perPage || 10);

        pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {
          const documento = await Database.from({ f: 'sigpq_documentos' })
            .select(
              'id',
              'nid',
              'data_emissao',
              'data_expira'
            )
            .whereNotIn('f.nid', ['Pessoal', 'Profissional'])
            .where('f.pessoafisica_id', item?.id)
            .where('f.eliminado', false)
            .first()

          return {
            ...item,
            orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id),
            documento
          };
        }));

        return pagination;
      } else {
        const items = await query;
        const all = await Promise.all(items.map(async (item: any) => {
          const documento = await Database.from({ f: 'sigpq_documentos' })
            .select(
              'id',
              'nid',
              'data_emissao',
              'data_expira'
            )
            .whereNotIn('f.nid', ['Pessoal', 'Profissional'])
            .where('f.pessoafisica_id', item?.id)
            .where('f.eliminado', false)
            .first()
          return {
            ...item,
            orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id),
            documento
          };
        }));
        return all;
      }

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  } */

  public async editarStado(id: any, input: any): Promise<any> {
    try {
      await Database.from("sigpq_funcionario_estados")
        .where("pessoafisica_id", id)
        .update(input);
      return true;
    } catch (error) {
      return Error("Não foi possível atualizar o estado do agente");
    }
  }

  public async editar(input: any, request: any, id: any): Promise<any> {
    // console.log(input);

    let pessoaIdExiste: any = null;

    let foto_efectivo = "";
    let foto_civil = "";

    const fileFE: any = null;
    const fileFC: any = null;

    // const numeroAutomatico = await this.#numeroAutomaticoService.gerarNumeroAutomatico('Numero_Processo_Agente');

    if ((await this.buscarNip(input.nip, id)) && input.nip) {
      return Error("Número do nip já existe");
    }

    if (
      (await this.buscarAgentePoNumero(input.numero_agente, id)) &&
      input.numero_agente
    ) {
      return Error("Número do agente já existe");
    }

    if ((await this.buscarNPS(input.nps, id)) && input.nps) {
      return Error("Número do nps já existe");
    }

    const trx = await Database.transaction();

    try {
      const pessoa = {
        nome_completo: input.nome_completo,
        activo: input.activo,
        user_id: input.user_id,
        email_pessoal: input.email,
        updated_at: this.dateTime,
      };

      await Database.from("pessoas")
        .useTransaction(trx)
        .where("id", id)
        .update(pessoa);

      input["pessoafisica_id"] = id;

      let resultDocumento;

      if (input.nid) {
        const bi = await Database.from("sigpq_documentos")
          .where("pessoafisica_id", id)
          .where("sigpq_tipo_documento_id", 1)
          .whereNotIn("nid", ["Profissional", "Pessoal"])
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const docBi = {
          nid: input.nid,
          pessoafisica_id: id,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 1,
          data_expira: input.data_expira,
          data_emissao: input?.data_emissao,
        };

        if (bi) {
          resultDocumento = await this.#crudDocumentoBaseRepository.editar(
            docBi,
            bi.id,
            trx
          );
        } else {
          resultDocumento = await this.#crudDocumentoBaseRepository.registar(
            docBi,
            trx
          );
        }

        if (resultDocumento instanceof Error) {
          return resultDocumento;
        }
      }

      // Carta de condução
      if (input.numero_carta_conducao) {
        const cartaConducao = await Database.from("sigpq_documentos")
          .where("pessoafisica_id", id)
          .where("sigpq_tipo_documento_id", 2)
          .whereNotIn("nid", ["Profissional", "Pessoal"])
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const docCartaConducao = {
          nid: input.numero_carta_conducao,
          pessoafisica_id: id,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 2,
          data_expira: input.data_expira_carta_conducao,
        };

        if (cartaConducao) {
          resultDocumento = await this.#crudDocumentoBaseRepository.editar(
            docCartaConducao,
            cartaConducao.id,
            trx
          );
        } else {
          resultDocumento = await this.#crudDocumentoBaseRepository.registar(
            docCartaConducao,
            trx
          );
        }

        if (resultDocumento instanceof Error) {
          return resultDocumento;
        }
      }

      // Passaporte
      if (input.numero_passaporte) {
        const passaporte = await Database.from("sigpq_documentos")
          .where("pessoafisica_id", id)
          .where("sigpq_tipo_documento_id", 4)
          .whereNotIn("nid", ["Profissional", "Pessoal"])
          .where("activo", true)
          .where("eliminado", false)
          .first();
        const docPassaporte = {
          nid: input.numero_passaporte,
          pessoafisica_id: id,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 4,
          data_expira: input.data_expira_passaporte,
        };

        if (passaporte) {
          resultDocumento = await this.#crudDocumentoBaseRepository.editar(
            docPassaporte,
            passaporte.id,
            trx
          );
        } else {
          resultDocumento = await this.#crudDocumentoBaseRepository.registar(
            docPassaporte,
            trx
          );
        }
      }

      if (resultDocumento instanceof Error) {
        return resultDocumento;
      }

      if (request.file("foto_civil")) {
        const fileFC = request.file("foto_civil");
        foto_civil = fileFC ? await uploadFile(id, fileFC) : null;
      } else {
        foto_civil = input?.foto_civil;
      }

      if (request.file("foto_efectivo")) {
        const fileFE = request.file("foto_efectivo");
        foto_efectivo = fileFE ? await uploadFile(id, fileFE) : null;
      } else {
        foto_efectivo = input?.foto_efectivo;
      }

      const pessoaFisica = {
        estado: input.estado,
        apelido: input.apelido,
        foto_civil: foto_civil,
        genero: input.genero,
        nome_mae: input.nome_mae,
        nome_pai: input.nome_pai,
        iban: input.iban,
        data_nascimento: input.data_nascimento,
        nacionalidade_id: 1,
        naturalidade_id: input.naturalidade_id,
        estado_civil_id: input.estado_civil_id,
        local_nascimento: input.local_nascimento,
        municipio_id: input.municipio_id,
        distrito_id: input.distrito_id,
        regime_id: input.regime_id,
        updated_at: this.dateTime,
      };

      await Database.from("pessoafisicas")
        .useTransaction(trx)
        .where("id", id)
        .update(pessoaFisica);

      if (input.contacto) {
        const cont = await Database.from("sigpq_contactos")
          .where("pessoa_id", id)
          .where("sigpq_tipo_contacto_id", 1)
          .where("activo", true)
          .where("descricao", "Telefone")
          .where("eliminado", false)
          .first();

        if (cont) {
          const contacto = {
            contacto: input.contacto,
            user_id: input.user_id,
            descricao: "Telefone",
            updated_at: this.dateTime,
          };

          await Database.from("sigpq_contactos")
            .useTransaction(trx)
            .where("pessoa_id", id)
            .where("sigpq_tipo_contacto_id", 1)
            .where("descricao", "Telefone")
            .where("activo", true)
            .where("eliminado", false)
            .update(contacto);
        } else {
          const contacto = {
            contacto: input.contacto,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            user_id: input.user_id,
            descricao: "Telefone",
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          await Database.insertQuery()
            .table("sigpq_contactos")
            .useTransaction(trx)
            .insert(contacto);
        }
      }

      if (input.contacto_alternativo) {
        const cont = await Database.from("sigpq_contactos")
          .where("pessoa_id", id)
          .where("sigpq_tipo_contacto_id", 1)
          .where("descricao", "Telefone alternativo")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        if (cont) {
          const contacto = {
            contacto: input.contacto_alternativo,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            descricao: "Telefone alternativo",
            user_id: input.user_id,
            updated_at: this.dateTime,
          };

          await Database.from("sigpq_contactos")
            .useTransaction(trx)
            .where("pessoa_id", id)
            .where("sigpq_tipo_contacto_id", 1)
            .where("descricao", "Telefone alternativo")
            .where("activo", true)
            .where("eliminado", false)
            .update(contacto);
        } else {
          const contacto = {
            contacto: input.contacto_alternativo,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            descricao: "Telefone alternativo",
            user_id: input.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          await Database.insertQuery()
            .table("sigpq_contactos")
            .useTransaction(trx)
            .insert(contacto);
        }
      }
      if (input.contacto_profissional) {
        const cont = await Database.from("sigpq_contactos")
          .where("pessoa_id", id)
          .where("sigpq_tipo_contacto_id", 1)
          .where("descricao", "Telefone de serviço")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        if (cont) {
          const contacto = {
            contacto: input.contacto_profissional,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            descricao: "Telefone alternativo",
            user_id: input.user_id,
            updated_at: this.dateTime,
          };

          await Database.from("sigpq_contactos")
            .useTransaction(trx)
            .where("pessoa_id", id)
            .where("sigpq_tipo_contacto_id", 1)
            .where("descricao", "Telefone de serviço")
            .where("activo", true)
            .where("eliminado", false)
            .update(contacto);
        } else {
          const contacto = {
            contacto: input.contacto_profissional,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            descricao: "Telefone de serviço",
            user_id: input.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          await Database.insertQuery()
            .table("sigpq_contactos")
            .useTransaction(trx)
            .insert(contacto);
        }
      }

      if (
        input.sigpq_tipo_habilitacao_literaria_id &&
        !isNaN(input.sigpq_tipo_habilitacao_literaria_id)
      ) {
        let anexo_ch: any = "";
        if (request.file("habilitacao_literaria_certificado")) {
          const fileCH = request.file("habilitacao_literaria_certificado");
          anexo_ch = fileCH ? await uploadFile(id + "/individual", fileCH) : "";
        } else {
          anexo_ch = input.habilitacao_literaria_certificado;
        }

        const passaporte = {
          anexo: anexo_ch,
          nid: "Pessoal",
          pessoafisica_id: id,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 3,
          updated_at: this.dateTime,
        };

        const h = await Database.from("sigpq_habilitacaoliterarias")
          .where("pessoafisica_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const habilitacaoliteraria: any = {
          sigpq_tipo_habilitacaoliteraria_id:
            input.sigpq_tipo_habilitacao_literaria_id,
          user_id: input.user_id,
          updated_at: this.dateTime,
        };

        if (!h) {
          const doc = await Database.insertQuery()
            .table("sigpq_documentos")
            .useTransaction(trx)
            .insert({ ...passaporte, created_at: this.dateTime });
          habilitacaoliteraria.sigpq_documento_id = doc[0];
          await Database.insertQuery()
            .table("sigpq_habilitacaoliterarias")
            .useTransaction(trx)
            .insert({
              ...habilitacaoliteraria,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        } else {
          const doc = h.sigpq_documento_id
            ? await Database.from("sigpq_documentos")
                .where("id", h?.sigpq_documento_id)
                .where("pessoafisica_id", id)
                .first()
            : null;
          let newDoc: any = null;

          if (!doc) {
            newDoc = await Database.insertQuery()
              .table("sigpq_documentos")
              .insert(passaporte)
              .useTransaction(trx);
            habilitacaoliteraria.sigpq_documento_id = newDoc[0];
          } else {
            await Database.from("sigpq_documentos")
              .where("id", h.sigpq_documento_id)
              .where("pessoafisica_id", id)
              .update(passaporte)
              .useTransaction(trx);
          }
          await Database.from("sigpq_habilitacaoliterarias")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .where("eliminado", false)
            .update(habilitacaoliteraria);
        }
      }

      if (input.sigpq_tipo_curso_id && !isNaN(input.sigpq_tipo_curso_id)) {
        const c = await Database.from("sigpq_cursos")
          .where("pessoafisica_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .first();

        if (c) {
          const curso = {
            sigpq_tipo_curso_id: input.sigpq_tipo_curso_id,
            user_id: input.user_id,
            updated_at: this.dateTime,
          };

          await Database.from("sigpq_cursos")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(curso);
        } else {
          const curso = {
            sigpq_tipo_curso_id: input.sigpq_tipo_curso_id,
            pessoafisica_id: id,
            user_id: input.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };
          await Database.insertQuery()
            .table("sigpq_cursos")
            .useTransaction(trx)
            .insert(curso);
        }
      }

      let anexo_provimento: any = null;

      if (request.file("anexo")) {
        const fileProvimento = request.file("anexo");
        anexo_provimento = fileProvimento
          ? await uploadFile(id + "/individual", fileProvimento)
          : null;
      } else {
        anexo_provimento = input.anexo;
      }

      const passaporte = {
        anexo: anexo_provimento,
        nid: "Profissional",
        pessoafisica_id: id,
        user_id: input.user_id,
        sigpq_tipo_documento_id: 21,
        updated_at: this.dateTime,
      };

      const provimento: any = {
        patente_id: input.patente_id,
        data_provimento: input.data_ordem ?? null,

        ordem_data: input?.data_ordem ?? null,
        ordem_descricao:
          input.regime_id == 1 && input?.numero_ordem
            ? extensao_ordem(input?.data_ordem, input?.numero_ordem)
            : null,
        despacho_descricao:
          input?.regime_id == 2 && input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,

        despacho_data: input?.data_despacho ?? null,
        numero_despacho:
          input?.numero_despacho && input?.regime_id == 2
            ? input?.numero_despacho
            : null,
        numero_ordem:
          input.regime_id == 1 && input?.numero_ordem
            ? input?.numero_ordem
            : null,

        acto_progressao_id: input?.sigpq_acto_progressao_id ?? 3,
        user_id: input.user_id,
        updated_at: this.dateTime,
      };

      const p: any = await Database.from("sigpq_provimentos")
        .select("*")
        .where("pessoa_id", id)
        .where("activo", true)
        .first();

      if (!p) {
        const documento = await Database.insertQuery()
          .insert({ created_at: this.dateTime, ...passaporte })
          .useTransaction(trx)
          .table("sigpq_documentos");

        provimento.sigpq_documento_id = documento[0];
        await Database.insertQuery()
          .insert({
            ...provimento,
            pessoa_id: id,
            user_id: input.user_id,
            created_at: this.dateTime,
          })
          .useTransaction(trx)
          .table("sigpq_provimentos");
      } else {
        const d = p.sigpq_documento_id
          ? await Database.from("sigpq_documentos")
              .where("id", p.sigpq_documento_id)
              .where("pessoafisica_id", id)
          : null;

        let newDoc: any = null;

        if (!d) {
          newDoc = await Database.insertQuery()
            .table("sigpq_documentos")
            .insert({
              created_at: this.dateTime,
              ...passaporte,
            })
            .useTransaction(trx);

          provimento.sigpq_documento_id = newDoc[0];
        } else {
          await Database.from("sigpq_documentos")
            .where("id", p.sigpq_documento_id)
            .where("pessoafisica_id", id)
            .update(passaporte)
            .useTransaction(trx);
        }
        await Database.from("sigpq_provimentos")
          .useTransaction(trx)
          .where("pessoa_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .update(provimento);
      }

      const funcionario = {
        nip: input.nip,
        nps: input?.nps,
        foto_efectivo: foto_efectivo,
        pseudonimo: input.pseudonimo,
        numero_agente: input?.numero_agente,
        sigpq_tipo_vinculo_id: input.sigpq_tipo_vinculo_id,
        sigpq_tipo_sanguineo_id: input?.sigpq_tipo_sanguineo_id,
        data_adesao: input.data_adesao,
        descricao: input.descricao,
        updated_at: this.dateTime,
      };

      await Database.from("sigpq_funcionarios")
        .useTransaction(trx)
        .where("id", id)
        .update(funcionario);

      if (input.email_servico) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ email_servico: input.email_servico });
      }

       if (input.contacto_servico) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ contacto_servico: input.contacto_servico });
      }

      if (input.seccao) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ seccao: input.seccao });
      }

      if (input.tipo_cargo_id) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ tipo_cargo_id: input.tipo_cargo_id });
      }

      if (input.brigada) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ brigada: input.brigada });
      }


      if (input.tipo_orgao) {
        await Database.from("sigpq_funcionarios")
          .useTransaction(trx)
          .where("id", id)
          .update({ tipo_estrutura_organica_id: input.tipo_orgao });
      }

      if (input.residencia_bi) {
        const c = await Database.from("sigpq_enderecos")
          .where("pessoa_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const enderecoBi = {
          residencia_actual: input.residencia_bi,
          user_id: input.user_id,
          updated_at: this.dateTime,
        };

        if (c) {
          await Database.from("sigpq_enderecos")
            .useTransaction(trx)
            .where("pessoa_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(enderecoBi);
        } else {
          await Database.insertQuery()
            .table("sigpq_enderecos")
            .useTransaction(trx)
            .insert({
              ...enderecoBi,
              pessoa_id: id,
              created_at: this.dateTime,
            });
        }
      }
      if (input.residencia_actual) {
        const c = await Database.from("sigpq_enderecos")
          .where("pessoa_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const enderecoActual = {
          residencia_actual: input.residencia_actual,
          user_id: input.user_id,
          updated_at: this.dateTime,
        };

        if (c) {
          await Database.from("sigpq_enderecos")
            .useTransaction(trx)
            .where("pessoa_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(enderecoActual);
        } else {
          await Database.insertQuery()
            .table("sigpq_enderecos")
            .useTransaction(trx)
            .insert({
              ...enderecoActual,
              pessoa_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (input.sigpq_situacao_id) {
        const c = await Database.from("sigpq_funcionario_estados")
          .where("pessoafisica_id", id)
          // .where('activo', true)
          .where("eliminado", false)
          .first();

        const estadoFuncionario = {
          pessoafisica_id: id,
          sigpq_situacao_id: input.sigpq_situacao_id,
          sigpq_estado_id: input?.sigpq_estado_id,
          // sigpq_estado_reforma_id: input?.sigpq_estado_reforma_id ?? 0,
          // activo: 1,
          updated_at: this.dateTime,
        };

        if (c) {
          await Database.from("sigpq_funcionario_estados")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            // .where('activo', true)
            .where("eliminado", false)
            .update(estadoFuncionario);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_estados")
            .useTransaction(trx)
            .insert({
              ...estadoFuncionario,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (input.orgao_id && !isNaN(input.orgao_id)) {
        const orgao_colocado = {
          pessoajuridica_id: input.orgao_id,
          // numero_ordem: input?.numero_ordem,
          numero_guia: input?.numero_guia ?? null,
          // ordem_data: input?.data_ordem,
          // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          despacho: input?.numero_despacho,
          situacao: "actual",
          user_id: input.user_id,
          nivel_colocacao: "muito-alto",
          updated_at: this.dateTime,
        };

        const d = await Database.from("sigpq_funcionario_orgaos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("nivel_colocacao", "muito-alto")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        if (d) {
          await Database.from("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .update(orgao_colocado);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert({
              ...orgao_colocado,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (input.departamento_id && !isNaN(input.departamento_id)) {
        const d = await Database.from("sigpq_funcionario_orgaos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("nivel_colocacao", "alto")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const orgao_colocado = {
          pessoajuridica_id: input.departamento_id,
          // numero_ordem: input?.numero_ordem,
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho,
          // ordem_data: input?.data_ordem,
          // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          situacao: "actual",
          nivel_colocacao: "alto",
          user_id: input.user_id,
          updated_at: this.dateTime,
        };

        if (d) {
          await Database.from("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .where("id", d.id)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(orgao_colocado);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert({
              ...orgao_colocado,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }
      if (input.unidade_id && !isNaN(input.unidade_id)) {
        const u = await Database.from("sigpq_funcionario_orgaos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("nivel_colocacao", "moderado")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const orgao_colocado = {
          pessoajuridica_id: input.unidade_id,
          // numero_ordem: input?.numero_ordem,
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho ?? null,
          // ordem_data: input?.data_ordem,
          // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          situacao: "actual",
          nivel_colocacao: "moderado",
          user_id: input.user_id,
          created_at: this.dateTime,
        };

        if (u) {
          await Database.from("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .where("id", u.id)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(orgao_colocado);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert({
              ...orgao_colocado,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }
      if (input.seccao_id && !isNaN(input.seccao_id)) {
        const s = await Database.from("sigpq_funcionario_orgaos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("nivel_colocacao", "medio")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const orgao_colocado = {
          pessoajuridica_id: input.seccao_id,
          // numero_ordem: input?.numero_ordem,
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho ?? null,
          // ordem_data: input?.data_ordem,
          // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          situacao: "actual",
          nivel_colocacao: "medio",
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        if (s) {
          await Database.from("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .where("id", s.id)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(orgao_colocado);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert({
              ...orgao_colocado,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }
      if (input.posto_id && !isNaN(input.posto_id)) {
        const s = await Database.from("sigpq_funcionario_orgaos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("nivel_colocacao", "baixo")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const orgao_colocado = {
          pessoajuridica_id: input.posto_id,
          // numero_ordem: input?.numero_ordem,
          numero_guia: input?.numero_guia ?? null,
          despacho: input?.numero_despacho ?? null,
          despacho_descricao: input?.numero_despacho
            ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
            : null,
          despacho_data: input?.data_despacho ?? null,
          situacao: "actual",
          nivel_colocacao: "baixo",
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        if (s) {
          await Database.from("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .where("id", s.id)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(orgao_colocado);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert({
              ...orgao_colocado,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (
        input?.sigpq_tipo_cargo_id &&
        !isNaN(input?.sigpq_tipo_cargo_id) &&
        input?.numero_despacho_nomeacao
      ) {
        let anexo_nomeacao: any = null;

        if (request.file("anexo_nomeacao")) {
          const fileNomeacao = request.file("anexo_nomeacao");
          anexo_nomeacao = fileNomeacao
            ? await uploadFile(id + "/individual", fileNomeacao)
            : null;
        } else {
          anexo_nomeacao = input.anexo_nomeacao;
        }

        const passaporte = {
          anexo: anexo_nomeacao,
          nid: "Profissional",
          pessoafisica_id: id,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 21,
        };

        const item = await Database.from("sigpq_cargos")
          .where("pessoafisica_id", id)
          .where("situacao", "actual")
          .where("activo", true)
          .where("eliminado", false)
          .first();

        const data: any = {
          sigpq_tipo_cargo_id: input.sigpq_tipo_cargo_id,
          pessoajuridica_id: input.orgao_id,
          patente_id: input.patente_id,
          numero_despacho: input?.numero_despacho_nomeacao
            ? extensao_despacho(
                input?.data_despacho_nomeacao,
                input?.numero_despacho_nomeacao
              )
            : null,
          numero_ordem: input?.numero_despacho_nomeacao ?? null,
          sigpq_acto_nomeacao_id: input?.sigpq_acto_nomeacao_id,
          situacao: "actual",
          data: input?.data_despacho_nomeacao ?? null,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        if (item) {
          const d = p.item
            ? await Database.from("sigpq_documentos")
                .where("id", item.sigpq_documento_id)
                .where("pessoafisica_id", id)
            : null;

          let newDoc: any = null;

          if (!d) {
            newDoc = await Database.insertQuery()
              .table("sigpq_documentos")
              .insert({
                ...passaporte,
                created_at: this.dateTime,
                updated_at: this.dateTime,
              })
              .useTransaction(trx);

            data.sigpq_documento_id = newDoc[0];
          } else {
            await Database.from("sigpq_documentos")
              .where("id", item.sigpq_documento_id)
              .where("pessoafisica_id", id)
              .update({
                updated_at: this.dateTime,
                ...passaporte,
              })
              .useTransaction(trx);
          }

          await Database.from("sigpq_cargos")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(data);
        } else {
          const documento = await Database.insertQuery()
            .insert({
              created_at: this.dateTime,
              updated_at: this.dateTime,
              ...passaporte,
            })
            .useTransaction(trx)
            .table("sigpq_documentos");

          await Database.insertQuery()
            .table("sigpq_cargos")
            .useTransaction(trx)
            .insert({
              sigpq_documento_id: documento[0],
              ...data,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (input?.sigpq_tipo_funcao_id && !isNaN(input?.sigpq_tipo_funcao_id)) {
        const item = await Database.from("sigpq_funcaos")
          .where("pessoafisica_id", id)
          .where("activo", true)
          .where("situacao", "actual")
          .where("eliminado", false)
          .first();

        const data = {
          sigpq_tipo_funcao_id: input.sigpq_tipo_funcao_id,
          pessoajuridica_id: input.orgao_id,
          patente_id: input.patente_id,
          // numero_despacho: extensao_despacho(input?.data_despacho_nomeacao, input?.numero_despacho_nomeacao),
          // numero_ordem: input?.numero_despacho_nomeacao,
          // sigpq_acto_nomeacao_id: input?.sigpq_acto_nomeacao_id,
          situacao: "actual",
          // data: input?.data_despacho_nomeacao,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        if (item) {
          await Database.from("sigpq_funcaos")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(data);
        } else {
          await Database.insertQuery()
            .table("sigpq_funcaos")
            .useTransaction(trx)
            .insert({
              ...data,
              pessoafisica_id: id,
              created_at: this.dateTime,
            });
        }
      }

      if (
        input?.sigpq_tipo_categoria_id &&
        !isNaN(input?.sigpq_tipo_categoria_id)
      ) {
        const item = await Database.from("sigpq_carreiras")
          .where("pessoafisica_id", id)
          .where("activo", true)
          .where("eliminado", false)
          .first();

        if (item) {
          const data = {
            sigpq_tipo_carreira_id: input.sigpq_tipo_categoria_id,
            pessoajuridica_id: input.orgao_id,
            user_id: input.user_id,
            updated_at: this.dateTime,
          };

          await Database.from("sigpq_carreiras")
            .useTransaction(trx)
            .where("pessoafisica_id", id)
            .where("activo", true)
            .where("eliminado", false)
            .update(data);
        } else {
          const data = {
            sigpq_tipo_carreira_id: input.sigpq_tipo_categoria_id,
            pessoajuridica_id: input.orgao_id,
            pessoafisica_id: id,
            user_id: input.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          await Database.insertQuery()
            .table("sigpq_carreiras")
            .useTransaction(trx)
            .insert(data);
        }
      }

      await trx.commit();
      return true;
    } catch (e) {
      // if (pessoaIdExiste) {
      //   await deleteDirectory(pessoaIdExiste)
      // }
      // if (fileFE) {
      //   await deleteFileUrl(foto_efectivo)
      // }
      // if (fileFC) {
      //   await deleteFileUrl(foto_civil)
      // }

      await trx.rollback();
      console.log(e);
      throw new NotUpdateException(null);
    }
  }

  public async alterarFoto(pessoaId: any, file: any = null): Promise<any> {
    let foto_civil = null;
    let foto_efectivo = null;

    try {
      const fileFC = file.foto_civil;
      const fileFE = file.foto_efectivo;

      // Verificar se os arquivos foram enviados
      if (!fileFC && !fileFE) {
        throw new Error("Nenhuma foto foi selecionada");
      }

      if (fileFC) {
        // remover foto anterior
        // const antiga = await Database.from('pessoafisicas').where('id', pessoaId).first()
        // if (antiga) {
        //   await deleteFileUrl(antiga.foto_civil)
        // }

        foto_civil = await uploadFile(pessoaId, fileFC);
        await Database.from("pessoafisicas")
          .where("id", pessoaId) // substitua 'id' pela coluna de identificação e pelo valor da ID correspondente
          .update({ foto_civil, updated_at: this.dateTime });
      }

      if (fileFE) {
        // remover foto anterior
        // const antiga = await Database.from('sigpq_funcionarios').where('id', pessoaId).first()
        // if (antiga) {
        //   await deleteFileUrl(antiga.foto_efectivo)
        // }

        foto_efectivo = await uploadFile(pessoaId, fileFE);
        await Database.from("sigpq_funcionarios")
          .where("id", pessoaId) // substitua 'id' pela coluna de identificação e pelo valor da ID correspondente
          .update({ foto_efectivo, updated_at: this.dateTime });
      }
    } catch (e) {
      // if (foto_efectivo) {
      //   await deleteFileUrl(foto_efectivo)
      // }
      // if (foto_civil) {
      //   await deleteFileUrl(foto_civil)
      // }
      console.log(e);
      throw new NotCreatedException(null);
    }
  }

  public async eliminar(id: number) {
    const buscarAgente = await Database.from("pessoas")
      .where("eliminado", true)
      .where("id", id)
      .first();

    if (buscarAgente) {
      return Error("Agente não existe");
    }
    try {
      const agente = {
        updated_at: this.dateTime,
        eliminado: true,
      };
      return await Database.from("pessoas").where("id", id).update(agente);
      return;
    } catch (error) {
      console.log("Erro ao eliminar o agente:", error);
    }
  }

  // .innerJoin('users as usuario', 'usuario.pessoa_id', 'pf.id')
  public async listarTodos_Anterior(options: any): Promise<any> {
    const trx = await Database.transaction();
    //console.log("Filtros:",options)
    try {
      let query: DatabaseQueryBuilderContract = Database.from({
        f: "sigpq_funcionarios",
      })
        .useTransaction(trx)
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo"),
          "p.activo",
          "pj.sigla",
          Database.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.id",
          "fe.duracao_inatividade",
          "fe.sigpq_estado_id",
          "fe.sigpq_situacao_id",
          "fe.sigpq_estado_reforma_id",
          "situacao_estado.nome as nome_fora_atividade",
          "es.nome as motivo_desistencia",
          "regimes.quadro",
          Database.raw("upper(se.nome) as estado"),
          "patentes.nome as patente_nome",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          ),
          Database.raw(
            "DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        // .innerJoin("tipo_estrutura_organicas as t", "t.id", "f.tipo_estrutura_organica_id")
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "p.id"
        )
        .innerJoin(
          "pessoajuridicas as pj",
          "pj.id",
          "sigpq_funcionario_orgaos.pessoajuridica_id"
        )
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .innerJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin(
          "sigpq_estados as situacao_estado",
          "situacao_estado.id",
          "fe.sigpq_estado_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_reforma_id")

        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("sigpq_funcionario_orgaos.nivel_colocacao", "muito-alto")
        // .where('c.activo', true)

        .where("p.eliminado", false)
        .orderBy("p.updated_at", "desc")

        .where((query: any) => {
          if (options.idadeMenos || options.idadeMais) {
            if (options.idadeMenos == options.idadeMais) {
              query.whereRaw(`
                  CASE
                    WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) > ${options.idadeMenos}
                  END
                `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) = ' + options.idadeMenos)
            } else if (options.idadeMenos < options.idadeMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos} and  TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) <= ${options.idadeMais}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >= ' + options.idadeMenos + ' and (YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) <= ' + options.idadeMais)
            } else if (options.idadeMenos && !options.idadeMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >= ' + options.idadeMenos)
            } else if (
              !options.idadeMenos &&
              options.idadeMais &&
              options.idadeMais > 18
            ) {
              query.whereRaw(`
                CASE
                  WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, pessoasfisicas.data_nascimentom CURDATE()) <= ${options.idadeMais}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >=18 and (YEAR(NOW()) - YEAR(pf.data_nascimento)) <= ' + options.idadeMais)
            } else if (options.idadeMenos > options.idadeMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMais}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(sigpq_provimentos.data_provimento AS DATE))) >= ' + options.idadeMenos)
            }
          }
        })
        .where((query: any) => {
          if (options.anoMenos || options.anoMais) {
            if (options.anoMenos == options.anoMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(f.data_adesao) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) = ' + options.anoMenos)
            } else if (options.anoMenos < options.anoMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(f.data_adesao) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos} and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                END
              `);

              // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos + ' and (YEAR(NOW()) - YEAR(DATE(f.data_adesao))) <= ' + options.anoMais)
            } else if (options.anoMenos && !options.anoMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(f.data_adesao) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)
            } else if (
              !options.anoMenos &&
              options.anoMais &&
              options.anoMais > 18
            ) {
              query.whereRaw(`
                CASE
                  WHEN DATE(f.data_adesao) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >=18 and (YEAR(NOW()) - YEAR(f.data_adesao)) <= ' + options.anoMais)
            } else if (options.anoMenos > options.anoMais) {
              query.whereRaw(`
                CASE
                  WHEN DATE(f.data_adesao) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                END
              `);
              // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)
            }
          }
        })
        .where((query: any) => {
          if (options.regimeId) {
            query.where("pf.regime_id", Number(options.regimeId));
          }
        })

        .where((query: any) => {
          if (options.patenteId) {
            query.where("patentes.id", Number(options.patenteId));
          }
        })
        .where((query: any) => {
          //query.orderBy('f.data_adesao', 'asc');
          if (options.tipoVinculoId) {
            query.where(
              "f.sigpq_tipo_vinculo_id",
              Number(options.tipoVinculoId)
            );
          }

          if (options.sigpq_estado_reforma_id) {
            query.where(
              "fe.sigpq_estado_reforma_id",
              Number(options.sigpq_estado_reforma_id)
            );
          }
        })
        .where((query: any) => {
          if (options.tipoOrgao_id) {
            query.whereLike(
              "pj.orgao_comando_provincial",
              options.tipoOrgao_id
            );
          }
        })
        .where((query: any) => {
          if (options.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where(
                "sigpq_funcionario_orgaos.pessoajuridica_id",
                options.orgaoId
              );
            }
            if (options.tipoOrgaoId) {
              query.where(
                "pj.tipo_estrutura_organica_sigla",
                options.tipoOrgaoId
              );
            }
          } else {
            query.where(
              "sigpq_funcionario_orgaos.pessoajuridica_id",
              options.orgao?.id
            );
          }
        })
        .where((query: any) => {
          if (options.genero) {
            query.where("pf.genero", options.genero);
          }
        })

        .where((query: any) => {
          if (options.estadoId) {
            query.where("fe.sigpq_estado_id", options.estadoId);
          }
        })
        .where((query: any) => {
          if (options.situacaoId) {
            query.where("fe.sigpq_situacao_id", options.situacaoId);
          }
        })

        .where((query: any) => {
          if (options.forcaPassiva) {
            query.where("fe.sigpq_situacao_id", "<>", options.forcaPassiva);
          }
        })

        // if (options.idadeMais) {
        //   query.whereRaw('(YEAR(NOW()) - YEAR(pf.data_nascimento)) <= ' + options.idadeMais)
        // }
        // if (options.anoMais) {
        //   query.whereRaw('(YEAR(NOW()) - YEAR(f.data_adesao)) >= ' + options.anoMais)
        // }

        .where((query: any) => {
          if (options.dashboard) {
            if (options.patenteClasse) {
              query.where(
                "patentes.sigpq_tipo_carreira_id",
                options.patenteClasse
              );
            }
          }
        })

        .where(function (item: any): void {
          if (options.search) {
            item.orWhere("p.nome_completo", "like", `%${options.search}%`);
            item.orWhere("pf.apelido", "like", `%${options.search}%`);

            // item.orWhere('tc.nome', 'like', `%${options.search}%`)
            // item.orWhere('es.nome', 'like', `%${options.search}%`)
            item.orWhere("se.nome", "like", `%${options.search}%`);
            item.orWhere("f.nip", "like", `%${options.search}%`);
            item.orWhere("f.numero_processo", "like", `%${options.search}%`);
            item.orWhere("f.numero_agente", "like", `%${options.search}%`);
            item.orWhereRaw(
              "concat(p.nome_completo, ' ',pf.apelido) like ?",
              `%${options.search}%`
            );

            const date = new Date(options.search);
            if (!isNaN(date.getTime())) {
              const [day, month, year] = options.search.split("/");

              let data = "";
              if (day && month && year) {
                data = `${year}-${month}-${day}`;
              } else if (day && month) {
                data = `${month}-${day}`;
              } else {
                data = day;
              }
              item.orWhere("p.created_at", "like", `%${data}%`);
            }
          }
        });

      //.distinct('pf.id')

      if (options.funcao_id) {
        query
          .innerJoin("sigpq_cargos as cargo", "cargo.pessoafisica_id", "f.id")
          .where("cargo.sigpq_tipo_cargo_id", options.funcao_id)
          .orderBy("f.data_adesao", "asc");
      }

      if (options.situacaoId == 5) {
        if (options.sigpq_excluir_estado_reforma_id && !options.estadoId) {
          query.whereNotIn(
            "fe.sigpq_estado_reforma_id",
            options.sigpq_excluir_estado_reforma_id
          );
        }
      }

      /* if (options.orderby) {
        const orderByOption = options.orderby.toUpperCase(); // Converter o valor fornecido para maiúsculas
        if (orderByOption === 'PATENTE') {
            console.log("Ordenando por PATENTE");
            query.orderBy('patentes.id', 'asc');
        } else if (orderByOption === 'NIP') {
            console.log("Ordenando por NIP");
            query.orderBy('f.nip', 'asc');
        } else if (orderByOption === 'NOME') {
            console.log("Ordenando por NOME");
            query.orderBy('p.nome_completo', 'asc');
        }
    } */

      if (options.page) {
        const pagination = await query.paginate(
          options.page,
          options.perPage || 10
        );

        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            const documento = await Database.from({ f: "sigpq_documentos" })
              .useTransaction(trx)
              .select("id", "nid", "data_emissao", "data_expira")
              .whereNotIn("f.nid", ["Pessoal", "Profissional"])
              .where("f.pessoafisica_id", item?.id)
              .where("f.eliminado", false)
              .first();
            /* const orgao_encontrado=await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id,trx)
          console.log("ACHEI O ORGAO:",orgao_encontrado) */
            const orgao = await this.acharOrgao_do_agente(item?.id, trx);
            return {
              ...item,
              orgao: orgao,
              documento,
            };
          })
        );

        return pagination;
      } else {
        const items = await query;
        const all = await Promise.all(
          items.map(async (item: any) => {
            const documento = await Database.from({ f: "sigpq_documentos" })
              .useTransaction(trx)
              .select("id", "nid", "data_emissao", "data_expira")
              .whereNotIn("f.nid", ["Pessoal", "Profissional"])
              .where("f.pessoafisica_id", item?.id)
              .where("f.eliminado", false)
              .first();
            /*  const orgao_encontrado=await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id,trx)
           console.log("ACHEI O ORGAO AQUI:",orgao_encontrado) */
            const orgao = await this.acharOrgao_do_agente(item?.id, trx);
            return {
              ...item,
              orgao: item?.id ? orgao : null,
              documento,
            };
          })
        );
        await trx.commit();
        return all;
      }
    } catch (e) {
      await trx.rollback();
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async listarTodos(options: any): Promise<any> {
    const trx = await Database.transaction();

    try {
      // Consulta direta usando RAW query
      return mysql2.from("users").select("*").limit(3);
    } catch (error) {
      await trx.rollback();
      console.error(error);
      throw new Error("Não foi possível listar os registos.");
    }
  }

  public async _listarTodos(options: any): Promise<any> {
    const trx = await Database.transaction();

    try {
      const query = this.construirQueryBase(trx);

      this.aplicarFiltros(query, options);

      if (options.page) {
        const pagination: any = await query.paginate(
          options.page,
          options.perPage || 10
        );
        pagination.rows = await this.enriquecerDados(pagination.rows, trx);
        return pagination;
      } else {
        const items = await query;
        const enrichedItems = await this.enriquecerDados(items, trx);
        await trx.commit();
        return enrichedItems;
      }
    } catch (error) {
      await trx.rollback();
      console.error(error);
      throw new Error("Não foi possível listar os registos.");
    }
  }

  private construirQueryBase(trx: any) {
    return (
      Database.from({ f: "sigpq_funcionarios" })
        .useTransaction(trx)
        ///.distinct('f.id')
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo"),
          "p.activo",
          "pj.sigla",
          Database.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.seccao",
          "f.brigada",
          "f.foto_efectivo",
          "f.id",
          // "t.id",
          // "t.name",
          "fe.duracao_inatividade",
          "fe.sigpq_estado_id",
          "fe.sigpq_situacao_id",
          "fe.sigpq_estado_reforma_id",
          "situacao_estado.nome as nome_fora_atividade",
          "es.nome as motivo_desistencia",
          "regimes.quadro",
          Database.raw("upper(se.nome) as estado"),
          "patentes.nome as patente_nome",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          ),
          Database.raw(
            "DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        // .innerJoin("tipo_estrutura_organicas as t", "t.id", "f.tipo_estrutura_organica_id")

        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "p.id"
        )
        .innerJoin(
          "pessoajuridicas as pj",
          "pj.id",
          "sigpq_funcionario_orgaos.pessoajuridica_id"
        )
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .innerJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin(
          "sigpq_estados as situacao_estado",
          "situacao_estado.id",
          "fe.sigpq_estado_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_reforma_id")
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("sigpq_funcionario_orgaos.nivel_colocacao", "muito-alto")
        .where("p.eliminado", false)
        .orderBy("p.updated_at", "desc")
    );
  }

  private aplicarFiltros(query: any, options: any) {
    if (options.idadeMenos || options.idadeMais) {
      this.filtrarPorIdade(query, options);
    }

    if (options.anoMenos || options.anoMais) {
      this.filtrarPorAno(query, options);
    }

    if (options.regimeId) {
      query.where("pf.regime_id", Number(options.regimeId));
    }

    if (options.patenteId) {
      query.where("patentes.id", Number(options.patenteId));
    }

    if (options.tipoVinculoId) {
      query.where("f.sigpq_tipo_vinculo_id", Number(options.tipoVinculoId));
    }

    if (options.sigpq_estado_reforma_id) {
      query.where(
        "fe.sigpq_estado_reforma_id",
        Number(options.sigpq_estado_reforma_id)
      );
    }

    if (options.tipoOrgao_id) {
      query.whereLike("pj.orgao_comando_provincial", options.tipoOrgao_id);
    }

    if (options.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
      if (options.tipoOrgaoId) {
        query.where("pj.tipo_estrutura_organica_sigla", options.tipoOrgaoId);
      }
    } else {
      query.where(
        "sigpq_funcionario_orgaos.pessoajuridica_id",
        options.orgao?.id
      );
    }

    if (options.genero) {
      query.where("pf.genero", options.genero);
    }

    if (options.estadoId) {
      query.where("fe.sigpq_estado_id", options.estadoId);
    }

    if (options.situacaoId) {
      query.where("fe.sigpq_situacao_id", options.situacaoId);
    }

    if (options.forcaPassiva) {
      query.where("fe.sigpq_situacao_id", "<>", options.forcaPassiva);
    }

    if (options.dashboard && options.patenteClasse) {
      query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
    }

    if (options.search) {
      this.filtrarPorSearch(query, options.search);
    }

    if (options.funcao_id) {
      query
        .innerJoin("sigpq_cargos as cargo", "cargo.pessoafisica_id", "f.id")
        .where("cargo.sigpq_tipo_cargo_id", options.funcao_id)
        .orderBy("f.data_adesao", "asc");
    }

    if (
      options.situacaoId == 5 &&
      options.sigpq_excluir_estado_reforma_id &&
      !options.estadoId
    ) {
      query.whereNotIn(
        "fe.sigpq_estado_reforma_id",
        options.sigpq_excluir_estado_reforma_id
      );
    }

    if (options.excluir_efectividade_e_inactividade) {
      query.whereNotIn(
        "fe.sigpq_situacao_id",
        options.excluir_efectividade_e_inactividade
      );
    }
  }

  private filtrarPorIdade(query: any, options: any) {
    if (options.idadeMenos == options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) = ${options.idadeMenos}
         END`
      );
    } else if (options.idadeMenos < options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) BETWEEN ${options.idadeMenos} AND ${options.idadeMais}
         END`
      );
    } else if (options.idadeMenos && !options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
         END`
      );
    } else if (
      !options.idadeMenos &&
      options.idadeMais &&
      options.idadeMais > 18
    ) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) BETWEEN 18 AND ${options.idadeMais}
         END`
      );
    } else if (options.idadeMenos > options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
         END`
      );
    }
  }

  private filtrarPorAno(query: any, options: any) {
    if (options.anoMenos == options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
         END`
      );
    } else if (options.anoMenos < options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) BETWEEN ${options.anoMenos} AND ${options.anoMais}
         END`
      );
    } else if (options.anoMenos && !options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
         END`
      );
    } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) BETWEEN 18 AND ${options.anoMais}
         END`
      );
    } else if (options.anoMenos > options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
         END`
      );
    }
  }

  private filtrarPorSearch(query: any, search: string) {
    query.where((item: any) => {
      item.orWhere("p.nome_completo", "like", `%${search}%`);
      item.orWhere("pf.apelido", "like", `%${search}%`);
      item.orWhere("se.nome", "like", `%${search}%`);
      item.orWhere("f.nip", "like", `%${search}%`);
      item.orWhere("f.numero_processo", "like", `%${search}%`);
      item.orWhere("f.numero_agente", "like", `%${search}%`);
      item.orWhereRaw(
        "concat(p.nome_completo, ' ', pf.apelido) like ?",
        `%${search}%`
      );

      const date = new Date(search);
      if (!isNaN(date.getTime())) {
        const [day, month, year] = search.split("/");
        let data = "";
        if (day && month && year) {
          data = `${year}-${month}-${day}`;
        } else if (day && month) {
          data = `${month}-${day}`;
        } else {
          data = day;
        }
        item.orWhere("p.created_at", "like", `%${data}%`);
      }
    });
  }

  private async enriquecerDados(items: any[], trx: any) {
    return Promise.all(
      items.map(async (item) => {
        const documento = await Database.from({ f: "sigpq_documentos" })
          .useTransaction(trx)
          .select("id", "nid", "data_emissao", "data_expira")
          .whereNotIn("f.nid", ["Pessoal", "Profissional"])
          .where("f.pessoafisica_id", item?.id)
          .where("f.eliminado", false)
          .first();

        const orgao = await this.acharOrgao_do_agente(item?.id, trx);

        return {
          ...item,
          orgao: item?.id ? orgao : null,
          documento,
        };
      })
    );
  }

  public async acharOrgao_do_agente(agente_id: string, trx: any): Promise<any> {
    if (!funcaoCompoatilhada_isValidString(agente_id)) return null;
    return await Database.from({ orgao_table: "sigpq_funcionario_orgaos" })
      .useTransaction(trx)
      .select(
        "p_aux.id",
        Database.raw("upper(p_aux.nome_completo) as nome"),
        Database.raw("upper(pd_aux.nome_completo) as nome_passado"),
        "p_aux.user_id",
        "p_aux.activo",
        "pj_aux.sigla",
        "pdf_aux.sigla as sigla_passado",
        "pdf_aux.descricao",
        Database.raw(
          "DATE_FORMAT(p_aux.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
        ),
        Database.raw(
          "DATE_FORMAT(p_aux.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
        )
      )
      .innerJoin(
        "sigpq_funcionario_orgaos as orgao",
        "orgao_table.pessoafisica_id",
        agente_id
      )
      .innerJoin(
        "pessoajuridicas as pj_aux",
        "pj_aux.id",
        "orgao_table.pessoajuridica_id"
      )
      .innerJoin("pessoas as p_aux", "p_aux.id", "pj_aux.id")
      .leftJoin(
        "pessoas as pd_aux",
        "pd_aux.id",
        "orgao_table.pessoajuridica_passado_id"
      )
      .leftJoin("pessoajuridicas as pdf_aux", "pdf_aux.id", "pd_aux.id")
      .where("p_aux.eliminado", false)
      .where("pj_aux.tipo_pessoajuridica_id", 1)
      .where("orgao_table.pessoafisica_id", agente_id)
      .where("orgao_table.eliminado", false)
      .where("orgao_table.activo", true)

      .first();
  }

  public async listarUm(id: any, response: any = null): Promise<any> {
    try {
      let query = Database.from({ f: "sigpq_funcionarios" })
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo  "),
          "p.email_pessoal",
          "p.user_id",
          "p.activo",
          Database.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "pf.nome_pai",
          "pf.nome_mae",
          "pf.nacionalidade_id",
          "pf.naturalidade_id",
          "pf.municipio_id",
          "municipios.nome as municipio",
          "distritos.nome as distrito",
          "pf.distrito_id",
          "pf.local_nascimento",
          "pf.iban",
          "pf.estado",
          "pf.foto_civil",
          "f.sigpq_tipo_sanguineo_id",
          "sigpq_tipo_sanguineos.nome as tipo_sanguineo",
          "estado_civils.nome as estado_civil_nome",
          "estado_civils.id as estado_civil_id",
          "f.nip",
          "f.nps",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.descricao",
          "f.pseudonimo",
          "f.id",
          "f.seccao",
          "f.brigada",
          "f.email_servico",
          "f.contacto_servico",
          "f.tipo_cargo_id",
          "sigpq_tipo_funcaos.nome as funcao",
          "f.tipo_estrutura_organica_id",
          "patentes.nome as patente_nome",
          "patentes.sigpq_tipo_carreira_id as patente_classe",
          "patentes.id as patente_id",
          "provincias.nome as naturalidade",
          "pais.nome as nacionalidade",
          "pais.id as pais_id",
          "regimes.nome as regime_nome",
          "regimes.quadro as regime_quadro",
          "regimes.id as regime_id",
          "sigpq_tipo_vinculos.nome as sigpq_tipo_vinculo_nome",
          "sigpq_tipo_vinculos.id as sigpq_tipo_vinculo_id",
          "vinculo.id as sigpq_vinculo_id",
          "sigpq_funcionario_estados.sigpq_estado_id",
          "sigpq_funcionario_estados.sigpq_situacao_id",
          "sigpq_funcionario_estados.sigpq_estado_reforma_id",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.data_adesao, '%Y/%m/%d') as data_adesao_to_extensao"
          ),
          Database.raw(
            "DATE_FORMAT(pf.data_nascimento, '%d/%m/%Y') as data_nascimento"
          ),
          Database.raw(
            "DATE_FORMAT(pf.data_nascimento, '%Y/%m/%d') as data_nascimento_to_extensao"
          ),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        // .innerJoin("tipo_estrutura_organicas as t", "t.id", "f.tipo_estrutura_organica_id")
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin("pais", "pais.id", "pf.nacionalidade_id")
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin("sigpq_tipo_funcaos", "sigpq_tipo_funcaos.id", "f.tipo_funcao_id") // NOVO
        .innerJoin(
          "sigpq_tipo_vinculos",
          "sigpq_tipo_vinculos.id",
          "f.sigpq_tipo_vinculo_id"
        )
        .leftJoin(
          "sigpq_tipo_vinculos as vinculo",
          "vinculo.sigpq_vinculo_id",
          "sigpq_tipo_vinculos.id"
        )
        .innerJoin(
          "sigpq_tipo_sanguineos",
          "sigpq_tipo_sanguineos.id",
          "f.sigpq_tipo_sanguineo_id"
        )
        .leftJoin(
          "sigpq_funcionario_estados",
          "sigpq_funcionario_estados.pessoafisica_id",
          "f.id"
        )
        .leftJoin("estado_civils", "estado_civils.id", "pf.estado_civil_id")
        .leftJoin("municipios", "municipios.id", "pf.municipio_id")
        .leftJoin("distritos", "distritos.id", "pf.distrito_id")
        .leftJoin("provincias", "provincias.id", "pf.naturalidade_id")

        .where("sigpq_provimentos.activo", true)
        .where("p.eliminado", false)
        .where("f.id", id)
        .first();

      const resp = await query;

      if (!resp) {
        return Error("Agente não encontrado.");
      }

      const sigpq_habilitacao_literaria =
        await this.#sigpqHabilitacaoLiterariaRepo.findByOne([
          { field: "pessoafisica_id", value: resp.id },
        ]);

      const sigpq_endereco = await this.#sigpqEnderecoRepo.findByOne([
        { field: "pessoa_id", value: resp.id },
      ]);

      const sigpq_contacto_pessoal = await this.#sigpqContactoRepo.findByOne([
        { field: "pessoa_id", value: resp.id },
        { field: "activo", value: true },
        { field: "descricao", value: "Telefone" },
      ]);
      const sigpq_contacto_alternativo =
        await this.#sigpqContactoRepo.findByOne([
          { field: "pessoa_id", value: resp.id },
          { field: "activo", value: true },
          { field: "descricao", value: "Telefone alternativo" },
        ]);
      const sigpq_contacto_profissional =
        await this.#sigpqContactoRepo.findByOne([
          { field: "pessoa_id", value: resp.id },
          { field: "activo", value: true },
          { field: "descricao", value: "Telefone de serviço" },
        ]);

      const sigpq_orgao = await Database.from({ f: "sigpq_funcionario_orgaos" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("pessoafisica_id", resp.id)
        .where("activo", true)
        .where("nivel_colocacao", "muito-alto")
        .where("eliminado", false)
        .first();

      const sigpq_tipo_orgao = sigpq_orgao
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_orgao.pessoajuridica_id)
            .first()
        : null;
      const sigpq_tipo_orgao_anterior = sigpq_orgao
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_orgao.pessoajuridica_passado_id)
            .first()
        : null;

      const sigpq_departamento = await Database.from({
        f: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("pessoafisica_id", resp.id)
        .where("activo", true)
        .where("nivel_colocacao", "alto")
        .where("eliminado", false)
        .first();

      const sigpq_tipo_departamento = sigpq_departamento
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_departamento.pessoajuridica_id)
            .first()
        : null;
      const sigpq_tipo_departamento_anterior = sigpq_departamento
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_departamento.pessoajuridica_passado_id)
            .first()
        : null;

      // const sigpq_unidade = await Database.from({ f: 'sigpq_funcionario_orgaos' })
      //   .select(
      //     '*',
      //     Database.raw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
      //     Database.raw("DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
      //   )
      //   .where('pessoafisica_id', resp.id)
      //   .where('activo', true)
      //   .where('nivel_colocacao', 'moderado')
      //   .where('eliminado', false)
      //   .first()

      // const sigpq_tipo_unidade = sigpq_unidade ? await Database.from({ p: 'pessoas' })
      //   .select(
      //     '*',
      //     Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
      //     Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
      //   )
      //   .innerJoin('pessoajuridicas as pj', 'pj.id', 'p.id')
      //   .where('p.id', sigpq_unidade.pessoajuridica_id)
      //   .first() : null
      // const sigpq_tipo_unidade_anterior = sigpq_unidade ? await Database.from({ p: 'pessoas' })
      //   .select(
      //     '*',
      //     Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
      //     Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
      //   )
      //   .innerJoin('pessoajuridicas as pj', 'pj.id', 'p.id')
      //   .where('p.id', sigpq_unidade.pessoajuridica_passado_id)
      //   .first() : null

      const sigpq_seccao = await Database.from({
        f: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("pessoafisica_id", resp.id)
        .where("activo", true)
        .where("nivel_colocacao", "medio")
        .where("eliminado", false)
        .first();

      const sigpq_tipo_seccao = sigpq_seccao
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_seccao.pessoajuridica_id)
            .first()
        : null;
      const sigpq_tipo_seccao_anterior = sigpq_seccao
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", sigpq_seccao.pessoajuridica_passado_id)
            .first()
        : null;

      const posto_policial = await Database.from({
        f: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("pessoafisica_id", resp.id)
        .where("activo", true)
        .where("nivel_colocacao", "baixo")
        .where("eliminado", false)
        .first();

      const sigpq_tipo_posto = posto_policial
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", posto_policial.pessoajuridica_id)
            .first()
        : null;
      const sigpq_tipo_posto_anterior = posto_policial
        ? await Database.from({ p: "pessoas" })
            .select(
              "*",
              Database.raw(
                "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
              ),
              Database.raw(
                "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
              )
            )
            .innerJoin("pessoajuridicas as pj", "pj.id", "p.id")
            .where("p.id", posto_policial.pessoajuridica_passado_id)
            .first()
        : null;

      const sigpq_curso = await Database.from({ c: "sigpq_cursos" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("c.pessoafisica_id", resp.id)
        .where("activo", true)
        .where("eliminado", false)
        .first();

      const sigpq_cargo = await Database.from({ c: "sigpq_cargos" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("sigpq_tipo_cargos as tc", "tc.id", "c.sigpq_tipo_cargo_id")
        // .innerJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        // .innerJoin('pessoas as p', 'p.id', 'pj.id')
        // .sigpq_tipo_funcaos

        .where("c.situacao", "actual")
        .where("c.pessoafisica_id", resp.id)
        .where("c.activo", true)
        .where("c.eliminado", false)
        .first();

      const sigpq_funcao = await Database.from({ f: "sigpq_funcaos" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
          )
        )
        .innerJoin(
          "sigpq_tipo_funcaos as tf",
          "tf.id",
          "f.sigpq_tipo_funcao_id"
        )
        // .innerJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        // .innerJoin('pessoas as p', 'p.id', 'pj.id')
        // .sigpq_tipo_funcaos
        .where("f.eliminado", false)
        .where("f.pessoafisica_id", resp.id)
        .where("f.activo", true)
        .where("f.situacao", "actual")
        .where("f.eliminado", false)
        .first();

      const sigpq_categoria = await Database.from({ c: "sigpq_carreiras" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("c.pessoafisica_id", resp.id)
        .where("activo", true)
        .where("eliminado", false)
        .first();

      const sigpq_provimento = await Database.from({ p: "sigpq_provimentos" })
        .select(
          "p.*",
          "patentes.*",
          "patentes.nome as patente",
          "sigpq_acto_progressaos.*",
          Database.raw(
            "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("patentes", "patentes.id", "p.patente_id")
        .leftJoin(
          "sigpq_acto_progressaos",
          "sigpq_acto_progressaos.id",
          "p.acto_progressao_id"
        )
        .where("pessoa_id", resp.id)
        .where("p.eliminado", false)
        .where("p.activo", true)
        .where("p.situacao", "actual")
        .first();

      const sigpq_funcionario_orgao = await Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          // 'fo.id',
          // 'fo.activo',
          // 'fo.user_id',
          // 'fo.pessoafisica_id',
          // 'fo.pessoajuridica_id',
          // 'fo.numero_guia',
          // 'fo.despacho',
          // 'fo.observacao',
          // 'pessoas.nome_completo',
          "*",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "fo.pessoajuridica_id")
        .where("fo.pessoafisica_id", resp.id)
        .where("fo.eliminado", false)
        .where("fo.activo", true)
        .where("fo.situacao", "actual")
        .where("fo.nivel_colocacao", "muito-alto")
        .orderBy("fo.created_at", "desc")
        .first();
      const sigpq_funcionario_departamento = await Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "fo.pessoajuridica_id")
        .where("fo.pessoafisica_id", resp.id)
        .where("fo.eliminado", false)
        .where("fo.activo", true)
        .where("fo.situacao", "actual")
        .where("fo.nivel_colocacao", "alto")
        .orderBy("fo.created_at", "desc")
        .first();
      const sigpq_funcionario_seccao = await Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "fo.pessoajuridica_id")
        .where("fo.pessoafisica_id", resp.id)
        .where("fo.eliminado", false)
        .where("fo.activo", true)
        .where("fo.situacao", "actual")
        .where("fo.nivel_colocacao", "medio")
        .orderBy("fo.created_at", "desc")
        .first();

      const sigpq_funcionario_unidade = await Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "fo.pessoajuridica_id")
        .where("fo.pessoafisica_id", resp.id)
        .where("fo.eliminado", false)
        .where("fo.activo", true)
        .where("fo.situacao", "actual")
        .where("fo.nivel_colocacao", "moderado")
        .orderBy("fo.created_at", "desc")
        .first();

      const sigpq_funcionario_posto = await Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "fo.pessoajuridica_id")
        .where("fo.pessoafisica_id", resp.id)
        .where("fo.eliminado", false)
        .where("fo.activo", true)
        .where("fo.situacao", "actual")
        .where("fo.nivel_colocacao", "baixo")
        .orderBy("fo.created_at", "desc")
        .first();

      const sigpq_familiars = await Database.from({ f: "sigpq_familiars" })
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .where("f.pessoafisica_id", resp.id)
        .where("f.eliminado", false)
        .clone();

      const sigpq_documentos = await Database.from({ d: "sigpq_documentos" })
        .select(
          "d.id",
          "d.nid",
          "d.anexo",
          "d.local_emissao",
          "d.data_emissao",
          "d.data_expira",
          "d.pessoafisica_id",
          "d.activo",
          "d.sigpq_tipo_documento_id",
          "sigpq_tipo_documentos.nome as sigpq_tipo_documento_nome",
          "d.descricao",
          Database.raw(
            "DATE_FORMAT(d.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(d.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin(
          "sigpq_tipo_documentos",
          "sigpq_tipo_documentos.id",
          "d.sigpq_tipo_documento_id"
        )
        .where("d.pessoafisica_id", resp.id)
        .where("d.eliminado", false)
        .clone();

      const documento = await Database.from({ f: "sigpq_documentos" })
        .select("id", "nid", "data_emissao", "data_expira")
        .whereNotIn("f.nid", ["Pessoal", "Profissional"])
        .where("f.pessoafisica_id", resp.id)
        .where("f.eliminado", false)
        .first();

      return {
        ...resp,
        sigpq_habilitacao_literaria,
        sigpq_endereco,
        sigpq_contacto_profissional,
        sigpq_contacto_pessoal,
        sigpq_contacto_alternativo,
        sigpq_orgao,
        sigpq_tipo_orgao,
        sigpq_tipo_orgao_anterior,
        sigpq_departamento,
        sigpq_tipo_departamento,
        sigpq_tipo_departamento_anterior,
        // sigpq_unidade,
        // sigpq_tipo_unidade,
        // sigpq_tipo_unidade_anterior,
        sigpq_seccao,
        sigpq_tipo_seccao,
        sigpq_tipo_seccao_anterior,
        sigpq_tipo_posto,
        sigpq_tipo_posto_anterior,
        sigpq_curso,
        sigpq_cargo,
        sigpq_funcao,
        sigpq_categoria,
        sigpq_provimento,
        sigpq_familiars,
        sigpq_documentos,
        sigpq_funcionario_orgao,
        sigpq_funcionario_posto,
        sigpq_funcionario_departamento,
        sigpq_funcionario_unidade,
        sigpq_funcionario_seccao,
        documento,
      };
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async buscarNip(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.nip", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }

  public async buscarAgentePoNumero(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.numero_agente", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }
  public async buscarNPS(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.nps", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }
}
