// function validarFuncao(input: any) {

//     const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

//     try {

//         const camposDesejados: any[] = ['patente_id','numero_despacho_nomeacao','data_despacho_nomeacao','pessoafisica_id','pessoajuridica_id', 'situacao', "sigpq_tipo_funcao_id", 'sigpq_acto_nomeacao_id','user_id'];

//         const valoresIniciais: any[] = [
//             'descricao'
//         ];

//         return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

//     } catch (error) {
//         return error.message as string
//     }

// }

// module.exports = validarFuncao

function validarFuncao(input: any) {

        const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')
    
        try {
    
            const camposDesejados: any[] = ['patente_id','pessoafisica_id','pessoajuridica_id', 'situacao', "sigpq_tipo_funcao_id",'user_id'];
    
            const valoresIniciais: any[] = [
                'descricao'
            ];
    
            return mapearCampos(input, camposDesejados, valoresIniciais) as any[];
    
        } catch (error) {
            return error.message as string
        }
    
    }
    
    module.exports = validarFuncao
