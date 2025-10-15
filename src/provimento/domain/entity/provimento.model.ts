// import { Entity, right, left } from 'App/Core/domain'
// // import {
// //   NetworkAlreadyExistError,
// // } from 'app/modules/addons/network-management/domain/error/network-already-exist-error'
// // import { NetworkNetmaskRequiredError } from '../error/network-netmask-required-error'

// // type Errors = NetworkAlreadyExistError | NetworkNetmaskRequiredError

// type Tipo = 'GRADUACAO' | 'PROMOCAO'

// interface ProvimentoProps {
//     tipo: Tipo
//     pessoa_id: number
//     patente_id: number
//     acto_progressao_id: number
//     user_id: number
//     numero_despacho: number
//     data_provimento: Date
//     anexo: string
//     activo: boolean
//     descricao: string
//     eliminado: boolean
// }

// export class ProvimentoEntity extends Entity<ProvimentoProps> {
//     public get tipo(): Tipo {
//         return this.props.tipo
//     }

//     public get pessoa_id(): number {
//         return this.props.pessoa_id
//     }

//     public get patente_id(): number {
//         return this.props.patente_id
//     }

//     public get acto_progressao_id(): number {
//         return this.props.acto_progressao_id
//     }

//     public get user_id(): number {
//         return this.props.user_id
//     }

//     public get numero_despacho(): number {
//         return this.props.numero_despacho
//     }

//     public get data_provimento(): Date {
//         return this.props.data_provimento
//     }

//     public get anexo(): string {
//         return this.props.anexo
//     }

//     public get descricao(): string {
//         return this.props.descricao
//     }

//     public get activo(): boolean {
//         return this.props.activo
//     }

//     public get eliminado(): boolean {
//         return this.props.eliminado
//     }

//     public adicionar_pessoa_id(pessoa_id: number): void {
//         this.props.pessoa_id = pessoa_id
//     }

//     public adicionar_patente_id(patente_id: number): void {
//         this.props.patente_id = patente_id
//     }

//     public adicionar_adicionar_acto_progressao_id(acto_progressao_id: number): void {
//         this.props.acto_progressao_id = acto_progressao_id
//     }

//     public adicionar_adicionar_user_id(user_id: number): void {
//         this.props.user_id = user_id
//     }

//     public adicionar_numero_despacho(numero_despacho: number): void {
//         this.props.numero_despacho = numero_despacho
//     }

//     public adicionar_data_provimento(data_provimento: Date): void {
//         this.props.data_provimento = data_provimento
//     }

//     public adicionar_anexo(anexo: string): void {
//         this.props.anexo = anexo
//     }

//     public adicionar_descricao(descricao: string): void {
//         this.props.descricao = descricao
//     }

//     public adicionar_adicionar_activo(activo: boolean): void {
//         this.props.activo = activo
//     }

//     public validar(): any {
//         // public validar (): Either<Errors, boolean> {
//         // if (!this.props.range_ips || !this.props.range_ips.length) {
//         //     return left(new NetworkAlreadyExistError())
//         // }

//         // if (!this.props.netmask || !this.props.netmask.length) {
//         //     return left(new NetworkNetmaskRequiredError())
//         // }

//         // if (!this.props.permissions || this.props.permissions.length <= 0) {
//         //   return left(new PermissionAreMissingError())
//         // }

//         return right(true)
//     }

//     public static create(props: ProvimentoEntity) {
//         const provimentoEntity = new ProvimentoEntity({
//             tipo: props.tipo,
//             pessoa_id: props.pessoa_id,
//             patente_id: props.patente_id,
//             acto_progressao_id: props.acto_progressao_id,
//             user_id: props.user_id,
//             numero_despacho: props.numero_despacho,
//             data_provimento: props.data_provimento,
//             anexo: props.anexo,
//             activo: props.activo,
//             descricao: props.descricao,
//             eliminado: props.eliminado
//         })

//         const validation = provimentoEntity.validar()

//         if (validation.isLeft()) {
//             return left(validation.value)
//         }

//         return right(provimentoEntity)
//     }

// }
