export default interface UtilizadorENTRADA {
    username: string
    email: string
    password: string
    notificar_por_email?: boolean
    forcar_alterar_senha?: boolean 
    pessoa_id: number
    user_id: number
    activo: boolean
    descricao?: string
}
