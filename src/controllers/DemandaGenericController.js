import fs from "fs";
import modeloAgendados from "../models/Demanda-agendado.js";


class DemandaGenericController {
  constructor(modeloDemanda, nomeDemanda) {
    this.modeloDemanda = modeloDemanda, //armazena o modelo da demanda (consulta ou exame) para realizar operacoes na demandas_consultas ou demandas_exames
    this.nomeDemanda = nomeDemanda; //armazena o texto do nome da demanda (demandas_consultas ou demandas_exames) p/ redirecionar para  view, ou mostrar nome do bd atualizado
  }
 

  async atualizaDemandas(req, res)  {
    //deletando todos os documentos da colecao no mongodb atlas
    // try { 
    //   await this.modeloDemanda.deleteMany({});
    // } catch (erro) {
    //   console.log(erro);
    // }

    //definindo se nome do campo do bd será especialidade(consultas) ou exame (exames)
    let campoDemanda = "";
    if(this.nomeDemanda === "demandas_consultas") {  campoDemanda = "especialidade"; }
    if(this.nomeDemanda === "demandas_exames") {  campoDemanda = "exame"; }
     
     
    //Pegando nomes da especialidade ou exame do bd e pondo em um array para checar se ja existe. Se nao existe cria, se existe, vai atualizar o mes
    let arrayNomes =[];
    const consultaNomes = await this.modeloDemanda.find({}, [campoDemanda]);
    consultaNomes.forEach((elemento) => arrayNomes.push( elemento[ [campoDemanda] ] ) );
    console.log(arrayNomes);
    
    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    fs.readFile("uploadsTemp/demandasDb.csv", "utf-8", async (erro, conteudo) => { 
      //try do fs leitura do arquivo
      try {
        if(erro) throw erro;
      
        //esse array tira os \r da string e divide a string de texto na quebra de linha
        //Ex: saida:  ['acupuntura;2','alergologia;6']
        const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
        const mes = array1[0].trim();
       
        try {
          //esse array percorre o array de string
          for(let i = 1; i < array1.length; i++) {
            const arrayInternoDividido = array1[i].split(";"); //Ex: saida:  [  ['acupuntura', '2']  ]
            
            //Se nome do recurso nao existe no bd, precisa incluir com todos os meses zerados e apensa mes atual com valor
            if(!arrayNomes.includes(arrayInternoDividido[0])) {
              const arrayObjetosInterno = { 
                [campoDemanda]: arrayInternoDividido[0],
                [mes]: arrayInternoDividido[1]
              };
              try {
                let demanda = new this.modeloDemanda(arrayObjetosInterno);
                await demanda.save();
        
              } catch(errobd) {
                console.log(errobd);
              }
            } else { //se recurso ja existe no bd, apenas atualizar o mes corrente com valores
              try {
                await this.modeloDemanda.updateOne( { [campoDemanda]: arrayInternoDividido[0] }, { [mes]: arrayInternoDividido[1] } );
                
              } catch (errobd) {
                console.log(errobd);
              }
            }
          }
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

    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mesAtualExtenso = meses[mesAtual];

    try {
      //busca todos os recursos, pegando apenas os campos nome do recurso e quantidade de pacientes do mes atual
      const demandasResultado = await this.modeloDemanda.find( {},  [ [nomeRecurso],[mesAtualExtenso]] ).sort( { [nomeRecurso]: 1 } );

      let demandasFinal = [];

      for (let i = 0; i < demandasResultado.length; i++ ) {
        //console.log(demandasResultado[i]);
        const agendados = await modeloAgendados.findOne ( { recurso: demandasResultado[i][nomeRecurso]  } );
        //console.log(agendados);
        if(agendados) {
          const objetoFinal = {
            ...demandasResultado[i]._doc,
            qtde_pacientes: demandasResultado[i][mesAtualExtenso],
            oferta: agendados.oferta,
            agendado: agendados.agendado
          };
          demandasFinal.push(objetoFinal);
        } else {
          const objetoFinal = {
            ...demandasResultado[i]._doc,
            qtde_pacientes: demandasResultado[i][mesAtualExtenso],
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