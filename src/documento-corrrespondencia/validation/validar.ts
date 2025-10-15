
function validarDocumento(input: any) {
  const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')


  try {
    const camposDesejados: any[] = ['numero_oficio','correspondencia_id', 'user_id','pessoajuridica_id']

    const valoresIniciais: any[] = [

    ]

    return mapearCampos(input, camposDesejados, valoresIniciais) as any[]
  } catch (error) {
    return error!.message as string
  }
}


module.exports = validarDocumento
