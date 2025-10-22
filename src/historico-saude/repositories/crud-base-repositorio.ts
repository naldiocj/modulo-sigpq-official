import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");

const {
  uploadFile,
  deleteFileUrl,
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");

export default class CrudBaseRepository extends BaseModuloRepository {
  constructor() {
    super("sigpq_funcionario_historico_saudes");
  }

  public async registar(input: any, file: any, trxParam = null): Promise<any> {
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = [
        "tipo_historico_saude",
        "grau_parentesco",
        "qual_historico_saude",
        "tempo_historico_saude",
        "funcionario_id",
      ];

      validate = mapearCampos(input, camposDesejados, []);
    } catch (error) {
      console.log(error.message);
      return Error(error.message);
    }

    const dateTime = new Date();

    const trx = trxParam ? trxParam : await Database.transaction();

    try {
      // const pip = file.file("anexo");
      // const anexo = pip
      //   ? await uploadFile(input.pessoafisica_id + "/parente", pip)
      //   : null;

      const historico = {
        ...validate,
        created_at: dateTime,
        updated_at: dateTime,
      };

      await Database.insertQuery() // 👈 gives an instance of insert query builder
        .table("sigpq_funcionario_historico_saudes")
        .useTransaction(trx)
        .insert(historico);

      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      // await deleteFileUrl(input.pessoafisica_id + '/parente')
      trxParam ? trxParam : await trx.rollback();
      console.log(e);
      return Error("Não foi possível criar um novo registo.");
    }
  }
  public async editar(
    id: any,
    input: any,
    file: any,
    trxParam = null
  ): Promise<any> {
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = [
        "tipo_historico_saude",
        "grau_parentesco",
        "qual_historico_saude",
        "tempo_historico_saude",
        "funcionario_id",
      ];

      validate = mapearCampos(input, camposDesejados, []);
    } catch (error) {
      // console.log(error.message);
      return Error(error.message);
    }

    const dateTime = new Date();

    const trx = trxParam ? trxParam : await Database.transaction();

    try {
      // let anexo: any;
      // if (input?.anexo) {
      //   anexo = input.anexo;
      // } else {
      //   const pip = file.file("anexo");
      //   console.log(input);
      //   anexo = pip
      //     ? await uploadFile(input.pessoafisica_id + "/parente", pip)
      //     : null;
      // }

      const historico = {
        ...validate,
        updated_at: dateTime,
      };
      await Database.from("sigpq_funcionario_historico_saudes")
        .where("id", id)
        .where("funcionario_id", input.funcionario_id)
        .update(historico)
        .useTransaction(trx);
      // await Database
      //   .insertQuery() // 👈 gives an instance of insert query builder
      //   .table('sigpq_familiars')
      //   .useTransaction(trx)
      //   .insert(familia)

      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      // await deleteFileUrl(input.pessoafisica_id + '/parente')
      trxParam ? trxParam : await trx.rollback();
      return Error("Não foi possível criar um novo registo.");
    }
  }

  public async activo(id: any, input: any, trxParam = null): Promise<any> {
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = ["activo"];

      validate = mapearCampos(input, camposDesejados, [""]);
    } catch (error) {
      console.log(error.message);
      return Error(error.message);
    }

    const dateTime = new Date();

    const trx = trxParam ? trxParam : await Database.transaction();

    try {
      const curso = {
        ...validate,
        updated_at: dateTime,
      };

      await Database.from("sigpq_familiars")
        .where("id", id)
        .update(curso)
        .useTransaction(trx);

      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      trxParam ? trxParam : await trx.rollback();
      console.log(e);
      throw new Error("Não foi possível editar um novo registo.");
    }
  }

  // public async editar(input: any, id: any, trxParam = null): Promise<any> {
  //   let validate = []
  //   try {

  //     const camposDesejados: (keyof any)[] = ['nid', 'pessoafisica_id', 'user_id',];

  //     validate = mapearCampos(input, camposDesejados, [
  //       'anexo',
  //       'data_expira',
  //       'local_emissao',
  //       'data_emissao',
  //     ]);

  //   } catch (error) {
  //     console.log(error.message);
  //     return Error(error.message)
  //   }

  //   const dateTime = new Date()

  //   const trx = trxParam ? trxParam : await Database.transaction()

  //   try {

  //     const documento = {
  //       ...validate,
  //       local_emissao: input?.local_emissao,
  //       data_emissao: input?.data_emissao,
  //       data_expira: input?.data_expira,
  //       updated_at: dateTime
  //     }

  //     await Database
  //       .from('sigpq_documentos')
  //       .useTransaction(trx)
  //       .where('id', id)
  //       .where('activo', true)
  //       .where('eliminado', false)
  //       .update(documento)

  //     return trxParam ? trxParam : await trx.commit()

  //   } catch (e) {
  //     trxParam ? trxParam : await trx.rollback()
  //     console.log(e);
  //     throw new Error('Não foi possível criar um novo registo.');
  //   }

  // }

  public async listarTodos(options: any): Promise<any> {
    try {
      const query: DatabaseQueryBuilderContract = Database.from({
        f: "sigpq_funcionario_historico_saudes",
      })
        .select(
          "f.id",
          "f.tipo_historico_saude",
          "f.grau_parentesco",
          "f.qual_historico_saude",
          "f.tempo_historico_saude",
          "f.funcionario_id",
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        // .innerJoin(
        //   "sigpq_funcionarios as func",
        //   "sigpq_funcionarios.id",
        //   "f.funcionario_id"
        // )
        // .where("f.eliminado", false)
        .orderBy("f.created_at", "desc")
        .where((query: any) => {
          if (options.funcionario_id) {
            query.where("f.funcionario_id", options.funcionario_id);
          }
          // if (options.activo) {
          //   query.where("f.activo", options.activo);
          // }
        })
        // .where(function (item: any): void {
        //   if (options.search) {
        //     item.where(
        //       "sigpq_funcionarios.nome",
        //       "like",
        //       `%${options.search}%`
        //     );
        //     item.orWhere("f.nome", "like", `%${options.search}%`);
        //     item.orWhere("f.contacto", "like", `%${options.search}%`);
        //     item.orWhere(
        //       "sigpq_tipo_documentos.nome",
        //       "like",
        //       `%${options.search}%`
        //     );
        //   }
        // })
        .clone();

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async eliminar(id: any, trxParam = null): Promise<any> {
    const dateTime = new Date();

    const trx = trxParam ? trxParam : await Database.transaction();

    try {
      const documento = {
        // eliminado: true,
        updated_at: dateTime,
      };

      await Database.from("sigpq_funcionario_historico_saudes")
        .useTransaction(trx)
        .where("id", id)
        .update(documento);

      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      trxParam ? trxParam : await trx.rollback();
      console.log(e);
      throw new Error("Não foi possível criar um novo registo.");
    }
  }

  public async listarTodosPorPessoa(idPessoa: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from({
        d: "sigpq_documentos",
      })
        .select(
          "d.id",
          "p.nome_completo",
          "d.nid",
          Database.raw(
            "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
          ),
          Database.raw(
            "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
          )
        )
        .innerJoin("pessoas as p", "p.id", "d.pessoafisica_id")
        .where("d.eliminado", false)
        .where("p.id", idPessoa);

      return await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
