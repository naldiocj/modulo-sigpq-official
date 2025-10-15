
function validarCorrespondencia(input: any) {
    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')


    try {
        const camposDesejados: any[] = ['numero_oficio', 'tipo_natureza_id', 'importancia_id', 'tipo_correspondencia_id', 'nota', 'assunto', 'procedencia_correspondencia_id', 'remetente_id']

        const valoresIniciais: any[] = [
            'estado'
        ]

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[]
    } catch (error) {
        return error!.message as string
    }
}


module.exports = validarCorrespondencia