import fs from "fs";
import modeloAgendados from "../models/Demanda-agendado.js";

//Atualiza a colecao agendados com consultas e exames juntos

class DemandaAgendadosController {

  static atualizaAgendados = async (req, res) => {
    //deletando todos os documentos da colecao no mongodb atlas
    try { 
      await modeloAgendados.deleteMany({});
    } catch (erro) {
      console.log(erro);
    }
  
    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    fs.readFile("uploadsTemp/demandasDb.csv", "utf-8", async (erro, conteudo) => { 
      //try do fs leitura do arquivo
      try {
        if(erro) throw erro;
  
        //esse array tira os \r da string e divide a string de texto na quebra de linha
        //Ex: saida:  ['acupuntura;2','alergologia;6']
        const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
    
        //esse array percorre o array de string
        const arrayObjetos = array1.map(( elemento ) => {
          const arrayInternoDividido = elemento.split(";"); //Ex: saida:  [  ['acupuntura', '2', '1']  ]
          const arrayObjetosInterno = { 
            recurso: arrayInternoDividido[0],
            oferta: Number(arrayInternoDividido[1]),
            agendado: Number(arrayInternoDividido[2])
          };
          return arrayObjetosInterno;
        } );
  
        //inserindo objetos do array no BD
        try {
          for (let i = 0; i < arrayObjetos.length; i++ ) {
            //Preciso verificar se recurso ja tem no BD. Pq no arquivo csv recursos se repetem. Se já existe, precisa somar
            //Ex: acumputura, 1, 1 - em barretos tinha 1 vaga, agendei 1 pessoa
            //acumptura, 2, 1 - em bebedouro tinha 2 vagas e agendei 1 pessoa
            //resultado: acumputura, 3, 2 - total de 3 vagas e 2 agendamentos
          
            //recursoExiste é o objeto com dados atuais do recurso que já está no bd
            const recursoExiste = await modeloAgendados.findOne( { recurso: arrayObjetos[i].recurso } ); //Ex. saida: {recurso: dermatologia, oferta: 2, agendado: 1}  

            //se ja tem o nome do recurso, soma a oferta e tambem o agendamento
            if( recursoExiste ) {
              await modeloAgendados.updateOne( { recurso: recursoExiste.recurso }, { oferta: recursoExiste.oferta + arrayObjetos[i].oferta, agendado: recursoExiste.agendado + arrayObjetos[i].agendado } );
            } else {
              let agendados = new modeloAgendados(arrayObjetos[i]);
              await agendados.save();
            }
          }
          res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados Agendados atualizado com sucesso.", role: req.role, usuario: req.usuario } );
            
        } catch(errobd) {
          console.log(errobd);
          res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao atualizar o Banco de dados Agendados.", role: req.role, usuario: req.usuario } );
        }
          
        
      } catch(erro) { //catch da leitura do arquivo
        console.log(erro);
        res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao ler o arquivo.", role: req.role, usuario: req.usuario } );
      }
    });
    
  };
}

export default DemandaAgendadosController;