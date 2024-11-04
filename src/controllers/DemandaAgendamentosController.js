import fs from "fs";
import modeloAgendamentos from "../models/Demanda-agendamentos.js";

//Atualiza a colecao agendados com consultas e exames juntos

class DemandaAgendadosController {

  static atualizaAgendamentos = async (req, res) => {
    //deletando todos os documentos da colecao no mongodb atlas
    try { 
      await modeloAgendamentos.deleteMany({});
    } catch (erro) {
      console.log(erro);
    }
  
    //lendo o arquivo que foi feito o upload no middleware anterior a chamada do controlador
    fs.readFile("uploadsTemp/demandasDb.csv", "utf-8", async (erro, conteudo) => { 
      //try do fs leitura do arquivo
      try {
        if(erro) throw erro;
  
        //esse array tira os \r da string e divide a string de texto na quebra de linha
        //Ex: saida:  ['acupuntura;2','alergologia;6']
        const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
    
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
        try {
          for (let i = 0; i < arrayObjetos.length; i++ ) {
            let agendamentos = new modeloAgendamentos(arrayObjetos[i]);
            await agendamentos.save();
          }
          
          res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados Agendamentos atualizado com sucesso.", role: req.role, usuario: req.usuario } );
            
        } catch(errobd) {
          console.log(errobd);
          res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao atualizar o Banco de dados Agendamentos.", role: req.role, usuario: req.usuario } );
        }
          
        
      } catch(erro) { //catch da leitura do arquivo
        console.log(erro);
        res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao ler o arquivo.", role: req.role, usuario: req.usuario } );
      }
    });
    
  };
}

export default DemandaAgendadosController;