export default interface IDocumento {
  nid: string,
  anexo?: string,
  local_emissao?: Date,
  data_emissao?: Date,
  data_expira?: Date,
  pessoafisica_id: number,
  sigpq_tipo_documento_id: number,
  user_id: number
}

// TValoresIniciais
// type VIDocumento = {
//   sigpq_tipo_documento_id: number; // Campo opcional
//   pessoafisica_id: number; // Campo obrigatório
// };

// camposDesejados
// const MapDocumento = [
//   'ndi',
//   'anexo',
//   'local_emissao',
//   'data_emissao',
//   'data_expira',
//   'pessoajuridica_id',
//   'sigpq_tipo_documento_id',
//   'user_id'
// ]

// valoresIniciais
// const IntDocumento = {
//   pessoajuridica_id: 1,
//   sigpq_tipo_documento_id: 1,
//   user_id: 1
// }

