import CrudBaseRepository from "./crud-base-repositorio"
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import Database from "@ioc:Adonis/Lucid/Database";
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";

const {
  gerarUnicoNumeroParaProcesso,
} = require("App/@piips/shared/metodo-generico/Gerar-Numero-Unico");

export default class ImportFuncionarioRepository {
  dateTime = new Date();
  #funcionario: CrudBaseRepository;
  #numeroAutomaticoService: any;

  constructor() {
    this.#funcionario = new CrudBaseRepository()
    this.#numeroAutomaticoService = new NumeroAutomaticoService();
  }

  public async importCsv(): Promise<any> {
    try {
      const filePath = path.join(process.cwd(), 'DNI.csv');
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const records: any[] = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          },
          (err, records) => {
            if (err) reject(err);
            else resolve(records);
          }
        );
      });

      const funcionarios = records.map((record: any) => {
        return {
          nome_completo: record.NOME_COMPLETO,
          tipo: "pf",
          activo: true,
          user_id: 1,
          email: '',
          apelido: record.NOME_COMPLETO.split(' ')[0],
          genero: record.SEXO === 'M' ? 'M' : 'F',
          data_nascimento: record.DATA_NASCIMENTO ? record.DATA_NASCIMENTO.split('/').reverse().join('-') : null,
          naturalidade_id: 1,
          estado_civil_id: 1,
          local_nascimento: '',
          municipio_id: 1,
          distrito_id: 1,
          regime_id: 1,
          numero_agente: record.NUMERO_AGENTE,
          sigpq_tipo_sanguineo_id: 1,
          sigpq_tipo_vinculo_id: 1,
          data_adesao: record.DATA_INGRESSO,
          orgao_id: 1,
          // patente_categoria: record.PATENTE_CATEGORIA,
          sigpq_tipo_funcao_id: 1,
          sigpq_tipo_cargo_id: 1,
          nid: '',
          data_expira: '',
          residencia_bi: '',
          data_emissao: '',
          contacto: '',
          contacto_alternativo: '',
          contacto_profissional: '',
          nome_mae: '',
          nome_pai: '',
          iban: '',
          habilitacoes_literarias: record.HABILITACOES_LITERARIAS,
          sigpq_situacao_id: null,
          sigpq_estado_id: null
        }
      });

      const results = [];
      for (const funcionario of funcionarios) {
        // funcionario.patente_id = await this.#buscarPatenteId(funcionario.patente_categoria);
        const result = await this.importFuncionarioDirectly(funcionario);
        results.push(result);
      }

      return results;
    } catch (e) {
      console.log(e);

      return Error("Não foi possível importar os registos.");
    }
  }

  #normalizar(str: string): string {
    return str
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ªº]/g, (m) => m === 'ª' ? 'A' : 'O')
      .replace(/[.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async #buscarPatenteId(patenteCategoria: string): Promise<number> {
    if (!patenteCategoria || patenteCategoria.trim() === '') return 1;

    const patentes = await Database.from('patentes')
      .where('activo', true)
      .where('eliminado', false)
      .select('id', 'nome');

    const inputNorm = this.#normalizar(patenteCategoria);
    const inputNoSpace = inputNorm.replace(/\s+/g, '');

    for (const p of patentes) {
      const dbNorm = this.#normalizar(p.nome);
      const dbNoSpace = dbNorm.replace(/\s+/g, '');

      if (dbNorm === inputNorm || dbNoSpace === inputNoSpace) {
        return p.id;
      }
    }

    for (const p of patentes) {
      const dbNorm = this.#normalizar(p.nome);
      const dbNoSpace = dbNorm.replace(/\s+/g, '');

      if (dbNoSpace.includes(inputNoSpace) || inputNoSpace.includes(dbNoSpace)) {
        return p.id;
      }
    }

    const firstWord = inputNorm.split(' ')[0];
    for (const p of patentes) {
      const dbNorm = this.#normalizar(p.nome);
      if (dbNorm.includes(firstWord)) {
        return p.id;
      }
    }

    const excecoes: Record<string, string> = {
      'SUPERINDENTE': 'Superintendente',
    };
    for (const [key, value] of Object.entries(excecoes)) {
      if (this.#normalizar(key) === inputNorm) {
        const match = patentes.find(p => this.#normalizar(p.nome) === this.#normalizar(value));
        if (match) return match.id;
      }
    }

    return 1;
  }

  private async importFuncionarioDirectly(input: any): Promise<any> {
    let pessoaIdExiste: any = null;
    let funcionarioId: any = null;

    let foto_efectivo = "";
    let foto_civil = "";

    const numeroAutomatico = "";
    // await this.#numeroAutomaticoService.gerarNumeroAutomatico(
    //   "Numero_Processo_Agente"
    // );

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
        data_expira: input.data_expira ? input.data_expira : null,
        local_emissao: input.residencia_bi ? input.residencia_bi : null,
        data_emissao: input.data_emissao ? input.data_emissao : null,
      };

      await Database.insertQuery()
        .table("sigpq_documentos")
        .useTransaction(trx)
        .insert(documento);

      const pessoaFisica = {
        id: pessoaId,
        foto_civil: foto_civil,
        estado: input.estado ? input.estado : "activo",
        apelido: input.apelido,
        genero: input.genero,
        nome_mae: input.nome_mae,
        nome_pai: input.nome_pai,
        iban: input.iban,
        data_nascimento: input.data_nascimento ? input.data_nascimento.split('/').reverse().join('-') : null,
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

      if (input.habilitacoes_literarias) {
        const tipoHabilitacao = await Database.from("sigpq_tipo_habilitacaoliterarias")
          .where("nome", input.habilitacoes_literarias)
          .first();

        if (tipoHabilitacao) {
          const habilitacaoliteraria = {
            pessoafisica_id: pessoaId,
            sigpq_tipo_habilitacaoliteraria_id: tipoHabilitacao.id,
            user_id: input.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          await Database.insertQuery()
            .table("sigpq_habilitacaoliterarias")
            .useTransaction(trx)
            .insert(habilitacaoliteraria);
        }
      }

      const funcionario = {
        id: pessoaId,
        nip: input?.nip,
        nps: input?.nps,
        niic: input?.niic,
        numero_processo: null, //gerarUnicoNumeroParaProcesso(numeroAutomatico),
        pseudonimo: input?.pseudonimo,
        numero_agente: input?.numero_agente,
        seccao: input?.seccao,
        brigada: input?.brigada,
        linguas_internacionais: input?.linguas_internacionais,
        linguas_nacionais: input?.linguas_nacionais,
        numero_calcado: input?.numero_calcado,
        numero_camisa: input?.numero_camisa,
        numero_calca: input?.numero_calca,
        motivo_situacao_laboral: input?.motivo_situacao_laboral,
        tipo_funcao_id: input?.sigpq_tipo_funcao_id,
        email_servico: input?.email_servico,
        contacto_servico: input?.contacto_servico,
        tipo_cargo_id: input?.sigpq_tipo_cargo_id,
        foto_efectivo: foto_efectivo,
        sigpq_tipo_vinculo_id: input?.sigpq_tipo_vinculo_id,
        sigpq_tipo_sanguineo_id: input?.sigpq_tipo_sanguineo_id,
        data_adesao: input.data_adesao ? input.data_adesao.split('/').reverse().join('-') : null,
        descricao: input.descricao,
        tipo_estrutura_organica_id: input?.tipo_orgao ?? null,
        orgao_proveniencia: input?.orgao_proveniencia,
        // patente_id: input?.patente_id ?? 1,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      const fc = await Database.insertQuery()
        .table("sigpq_funcionarios")
        .useTransaction(trx)
        .insert(funcionario);

      funcionario.id = fc[0];
      funcionarioId = fc[0];

      if (input.sigpq_situacao_id) {
        const estadoFuncionario = {
          pessoafisica_id: pessoaId,
          sigpq_situacao_id: input.sigpq_situacao_id,
          sigpq_estado_id: input?.sigpq_estado_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        await Database.insertQuery()
          .table("sigpq_funcionario_estados")
          .useTransaction(trx)
          .insert(estadoFuncionario);
      } else {
        const estadoFuncionario = {
          pessoafisica_id: pessoaId,
          sigpq_situacao_id: 1,
          sigpq_estado_id: 1,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };
        await Database.insertQuery()
          .table("sigpq_funcionario_estados")
          .useTransaction(trx)
          .insert(estadoFuncionario);
      }


      // const orgao_colocado = {
      //   pessoajuridica_id: input.orgao_id,
      //   pessoafisica_id: pessoaId[0],
      //   numero_guia: input?.numero_guia ?? null,
      //   despacho: input?.numero_despacho,
      //   despacho_descricao: null,
      //   despacho_data: input?.data_despacho ?? null,
      //   situacao: "actual",
      //   user_id: input.user_id,
      //   nivel_colocacao: "muito-alto",
      //   created_at: this.dateTime,
      //   updated_at: this.dateTime,
      // };

      // await Database.insertQuery()
      //   .table("sigpq_funcionario_orgaos")
      //   .useTransaction(trx)
      //   .insert(orgao_colocado);

      await trx.commit();
      return funcionarioId;
    } catch (e) {
      // await this.#numeroAutomaticoService.gerarNumeroAutomaticoDesconto(
      //   "Numero_Processo_Agente"
      // );

      await trx.rollback();
      console.log(e);
      return Error("Registro não pode ser inserido na base de dados.");
    }
  }
}
