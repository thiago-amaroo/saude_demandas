import modeloAgendamentos from "../models/Demanda-agendamentos.js";
import lerArquivo from "../utils/lerArquivo.js";

//Atualiza a colecao agendados com consultas e exames juntos

class DemandaAgendadosController {

  static atualizaAgendamentos = async (req, res, next) => {
    //deletando todos os documentos da colecao no mongodb atlas
    try { 

      await modeloAgendamentos.deleteMany({});
  
      //esse array tira os \r da string e divide a string de texto na quebra de linha
      //Primeira linha: ano. Segunda linha: mes
      //Ex: saida:  [2024, 'janeiro', 'acupuntura;2','alergologia;6']
      const array1 =  await lerArquivo();
      //se retornou erro da funcao lerArquivo array1 = objeto erro e array1.code tem codigo do erro
      if(array1.code) {
        next(array1);
      }
    
      //esse array percorre o array de string
      const arrayObjetos = array1.map(( elemento ) => {
        const arrayInternoDividido = elemento.split(";"); //Ex: saida:  [  ['raio-x', 'data do agendamento]  ]
        const arrayObjetosInterno = { 
          recurso: arrayInternoDividido[0].trim(),
          data: arrayInternoDividido[1].trim()
        };
        return arrayObjetosInterno;
      } );
  
      //inserindo objetos do array no BD

      for (let i = 0; i < arrayObjetos.length; i++ ) {
        let agendamentos = new modeloAgendamentos(arrayObjetos[i]);
        await agendamentos.save();
      }
          
      res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados Agendamentos atualizado com sucesso.", role: req.role, usuario: req.usuario } );
            

          
        
    } catch(erro) {
      console.log(erro);
      erro.localDoErro = "admin";
      erro.mensagem = `Erro ao atualizar o banco de dados agendamentos: "${erro}"`;
      next(erro);
    }

    
  };
}

export default DemandaAgendadosController;