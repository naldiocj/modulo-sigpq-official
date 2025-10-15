type P = 'pf' | 'pj'

export default class PessoaModel {
    readonly _id?: number;
    numero_ordem?: number;
    nome_completo: string = "";
    email_pessoal?: number;
    tipo: P = "pf";
    activo?: boolean = true
    user_id?: number;

    constructor() { }

    public get id(): number | undefined {
        return this._id
    }
}