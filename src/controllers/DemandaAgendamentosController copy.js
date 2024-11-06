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
          recurso: arrayInternoDividido[0],
          agendado: Number(arrayInternoDividido[1])
        };
        return arrayObjetosInterno;
      } );
  
      //inserindo objetos do array no BD

      for (let i = 0; i < arrayObjetos.length; i++ ) {
        //Preciso verificar se recurso ja tem no BD. Pq no arquivo csv recursos se repetem. Se já existe, precisa somar
        //Ex: acumputura, 1, 1 - em barretos tinha 1 vaga, agendei 1 pessoa
        //acumptura, 2, 1 - em bebedouro tinha 2 vagas e agendei 1 pessoa
        //resultado: acumputura, 3, 2 - total de 3 vagas e 2 agendamentos
          
        //recursoExiste é o objeto com dados atuais do recurso que já está no bd
        const recursoExiste = await modeloAgendamentos.findOne( { recurso: arrayObjetos[i].recurso } ); //Ex. saida: {recurso: dermatologia, oferta: 2, agendado: 1}  

        //se ja tem o nome do recurso, soma a oferta e tambem o agendamento
        if( recursoExiste ) {
          await modeloAgendamentos.updateOne( { recurso: recursoExiste.recurso }, { oferta: recursoExiste.oferta + arrayObjetos[i].oferta, agendado: recursoExiste.agendado + arrayObjetos[i].agendado } );
        } else {
          let agendados = new modeloAgendamentos(arrayObjetos[i]);
          await agendados.save();
        }
      }
      res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados Agendados atualizado com sucesso.", role: req.role, usuario: req.usuario } );
           
        
    } catch(erro) { //catch da leitura do arquivo
      console.log(erro);
      erro.localDoErro = "admin";
      erro.mensagem = `Erro ao atualizar o banco de dados "Agendamentos": "${erro}"`;
      next(erro);
    }
  };
    

}

export default DemandaAgendadosController;