import Database, {
  DatabaseQueryBuilderContract
} from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import OrgaoCrudBaseRepository from "./../../config/direcao-ou-orgao/repositories/crud-base-repositorio";

export default class SigpqFuncionarioOrgaosRepository extends BaseModuloRepository {
  #orgaoCrudBaseRepository: OrgaoCrudBaseRepository;
  constructor() { 
    super("sigpq_funcionario_orgaos");

    this.#orgaoCrudBaseRepository = new OrgaoCrudBaseRepository();
  }

  public async listarTodos(options: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from({
        f: "sigpq_funcionarios"
      })
        .select(
          "p.nome_completo",
          "p.activo",
          "pj.sigla",
          // Database.raw(`CASE WHEN p.activo = 1 THEN 'sim' ELSE false END as activo`),
          "pf.apelido",
          "pf.genero",
          "pf.estado",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.id",
          "patentes.nome as patente_nome",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
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
        // .innerJoin('sigpq_funcionario_orgaos as fo', 'fo.pessoafisica_id', 'p.id')
        .where("sigpq_provimentos.activo", true)

        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)

        // .where('f.sigpq_tipo_vinculo_id', 1) // efectivo
        // .where('fo.pessoajuridica_id', 1)
        .where("p.eliminado", false)
        .orderBy("p.updated_at", "desc");

      if (options.regimeId) {
        query.where("pf.regime_id", Number(options.regimeId));
      }

      if (options.patenteId) {
        query.where("patentes.id", Number(options.patenteId));
      }

      if (options.tipoVinculoId) {
        query.where("f.sigpq_tipo_vinculo_id", Number(options.tipoVinculoId));
      }

      if (options.tipoOrgaoId) {
        query.whereLike("pj.orgao_comando_provincial", options.tipoOrgaoId);
      }

      // if (options.aceder_todos_agentes) {
      //   if (options.orgaoId) {
      //     query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId)
      //   }
      // } else {
      //   query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      // }
      if (options.pessoajuridica_id) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.pessoajuridica_id
        );
      }

      if (options.genero) {
        query.where("pf.genero", options.genero);
      }

      if (options.dashboard) {
        if (options.patenteClasse) {
          query.where("patentes.classe", options.patenteClasse);
        }
      }

      query.where(function (item: any): void {
        if (options.search) {
          item.orWhere("p.nome_completo", "like", `%${options.search}%`);
          item.orWhere("pf.apelido", "like", `%${options.search}%`);
          item.orWhere("f.nip", "like", `%${options.search}%`);
          item.orWhere("f.numero_processo", "like", `%${options.search}%`);
          item.orWhere("f.numero_agente", "like", `%${options.search}%`);
          item.orWhereRaw(
            "concat(p.nome_completo, ' ',pf.apelido) like ?",
            `%${options.search}%`
          );
          // item.orWhere('pj.sigla', 'like', `%${options.search}%`)

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

      if (options.page) {
        const pagination = await query.paginate(
          options.page,
          options.perPage || 10
        );
        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            return {
              ...item,
              // documento: await this.#documentoRepo.findByOne([{ field: 'pessoafisica_id', value: item.id }]),
              orgao:
                (await this.#orgaoCrudBaseRepository.listarPorPessoa(
                  item.id
                )) || null
            };
          })
        );

        return pagination;
      } else {
        const items = await query;
        const all = await Promise.all(
          items.map(async (item: any) => {
            return {
              ...item,
              // documento: await this.#documentoRepo.findByOne([{ field: 'pessoafisica_id', value: item.id }]),
              orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(
                item.id
              )
            };
          })
        );
        return all;
      }
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
