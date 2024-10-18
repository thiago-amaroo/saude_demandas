import fs from "fs";
import modeloAgendados from "../models/Demanda-agendado.js";


class DemandaGenericController {
  constructor(modeloDemanda, nomeDemanda) {
    this.modeloDemanda = modeloDemanda, //armazena o modelo da demanda (consulta ou exame) para realizar operacoes na demandas_consultas ou demandas_exames
    this.nomeDemanda = nomeDemanda; //armazena o texto do nome da demanda (demandas_consultas ou demandas_exames) p/ redirecionar para  view, ou mostrar nome do bd atualizado
  }
 

  async atualizaDemandas(req, res)  {
    //deletando todos os documentos da colecao no mongodb atlas
    try { 
      await this.modeloDemanda.deleteMany({});
    } catch (erro) {
      console.log(erro);
    }

    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    fs.readFile("uploadsTemp/demandasDb.csv", "utf-8", (erro, conteudo) => { 
      //try do fs leitura do arquivo
      try {
        if(erro) throw erro;

        //definindo se nome do campo do bd será especialidade(consultas) ou exame (exames)
        let campoDemanda = "";
        if(this.nomeDemanda === "demandas_consultas") {  campoDemanda = "especialidade"; }
        if(this.nomeDemanda === "demandas_exames") {  campoDemanda = "exame"; }
        
        //esse array tira os \r da string e divide a string de texto na quebra de linha
        //Ex: saida:  ['acupuntura;2','alergologia;6']
        const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
  
        //esse array percorre o array de string
        const arrayObjetos = array1.map(( elemento ) => {
          const arrayInternoDividido = elemento.split(";"); //Ex: saida:  [  ['acupuntura', '2']  ]
          const arrayObjetosInterno = { 
            [campoDemanda]: arrayInternoDividido[0],
            qtde_pacientes: Number(arrayInternoDividido[1])
          };
          return arrayObjetosInterno;
        } );

        //inserindo objetos do array no BD
        try {
          arrayObjetos.forEach( async (elemento) => {
            let demanda = new this.modeloDemanda(elemento);
            await demanda.save();
          });
          res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: `Banco de dados ${this.nomeDemanda} atualizado com sucesso.`, role: req.role, usuario: req.usuario } );
          
        } catch(errobd) {
          console.log(errobd);
          res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: `Erro ao atualizar o banco de dados ${this.nomeDemanda}.`, role: req.role, usuario: req.usuario } );
        }
        
      
      } catch(erro) { //catch da leitura do arquivo
        console.log(erro);
        res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao ler o arquivo.", role: req.role, usuario: req.usuario } );
      }
    });
  };

  

  async listaDemandas (req, res) {
    //definindo se nome do campo do bd será especialidade(consultas) ou exame (exames)
    let nomeRecurso = "";
    if(this.nomeDemanda === "demandas_consultas") {  nomeRecurso = "especialidade"; }
    if(this.nomeDemanda === "demandas_exames") {  nomeRecurso = "exame"; }

    try {
      const demandasResultado = await this.modeloDemanda.find().sort( { [nomeRecurso]: 1 } );

      
      let demandasFinal = [];

      for (let i = 0; i < demandasResultado.length; i++ ) {
        //console.log(demandasResultado[i]);
        const agendados = await modeloAgendados.findOne ( { recurso: demandasResultado[i][nomeRecurso]  } );
        //console.log(agendados);
        if(agendados) {
          const objetoFinal = {
            ...demandasResultado[i]._doc,
            oferta: agendados.oferta,
            agendado: agendados.agendado
          };
          demandasFinal.push(objetoFinal);
        } else {
          const objetoFinal = {
            ...demandasResultado[i]._doc,
            oferta: "-",
            agendado: "-"
          };
          demandasFinal.push(objetoFinal);
        }

        
         
      }; 
      console.log(demandasFinal); 
       

      res.status(200).render(`${this.nomeDemanda}`, { demandas: demandasFinal, role: req.role, usuario: req.usuario });

    } catch(erro) {
      console.log(erro);
    }
  };



}

export default DemandaGenericController;