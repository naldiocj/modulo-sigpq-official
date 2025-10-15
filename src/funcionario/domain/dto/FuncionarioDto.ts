export interface FuncionarioINPUT {
    nip: number
    user_id: number
    data_adesao: Date
    pseudomino: string
    descricao: string
    numero_agente: string
    foto_efectivo: string
    anexo_processo: string
    numero_processo: string
    sigpq_tipo_vinculo_id: number
}

export interface FuncionarioOUTPUT {
    id: number
    nip: number
    user_id: number
    data_adesao: Date
    pseudomino: string
    descricao: string
    numero_agente: string
    foto_efectivo: string
    anexo_processo: string
    numero_processo: string
    sigpq_tipo_vinculo_id: number
}
