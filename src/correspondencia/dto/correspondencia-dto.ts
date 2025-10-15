

export type DTOCorrespondncia = {
    tipo_natureza_id: number
    importancia_id: number,
    tipo_correspondencia_id: number
    procedencia_correspondencia_id: number
    nota?: string
    assunto:string,
    numero_oficio: string
    pessoajuridicas_id: any
    remetente_id: number
    user_id: number
}