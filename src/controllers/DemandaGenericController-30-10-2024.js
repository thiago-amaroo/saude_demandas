import fs from "fs";
import modeloAgendamentos from "../models/Demanda-agendamentos.js";


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

    //definindo se nome do campo do bd será especialidade(consultas) ou exame (exames)
    let campoDemanda = "";
    if(this.nomeDemanda === "demandas_consultas") {  campoDemanda = "especialidade"; }
    if(this.nomeDemanda === "demandas_exames") {  campoDemanda = "exame"; }
     
     
    //Pegando nomes da especialidade ou exame do bd e pondo em um array para checar se ja existe. Se nao existe cria, se existe, vai atualizar o mes
    let arrayNomes =[];
    try { 
      const consultaNomes = await this.modeloDemanda.find({}, [campoDemanda]);
      consultaNomes.forEach((elemento) => arrayNomes.push( elemento[ [campoDemanda] ] ) );
    } catch (erro) {
      console.log(erro);
    }
    
    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    fs.readFile("uploadsTemp/demandasDb.csv", "utf-8", async (erro, conteudo) => { 
      //try do fs leitura do arquivo
      try {
        if(erro) throw erro;
      
        //esse array tira os \r da string e divide a string de texto na quebra de linha
        //Primeira linha: ano. Segunda linha: mes
        //Ex: saida:  [2024, 'janeiro', 'acupuntura;2','alergologia;6']
        const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
        const ano = array1[0].trim().replaceAll(";","");
        const mes = array1[1].trim().replaceAll(";","");
       
        const arrayNomesArquivo = [];

        try {
          //esse array percorre o array de string. Comeca no indice 2 pq indice 0 = ano e indice 1 = mes (as duas primeiras linhas do arquivo)
          for(let i = 2; i < array1.length; i++) {
            const arrayInternoDividido = array1[i].split(";"); //Ex: saida:  [  ['acupuntura', '2']  ]
            
            //Se nome do recurso ja esta no BD, porem nao esta no arquivo, significa que saiu da demanda. Preciso zerar o numero de pacientes do mes do arquivo
            //Se sai da demanda no mes seguinte, nao tem problema, pq vai estar zerado e listaDemandas só lista os recursos maior que 0
            //Mas se sai no mesmo mes, recurso nao vai estar no arquivo e preciso zerar o mes no bd. Colocando todos recursos do arquivo em um array
            arrayNomesArquivo.push(arrayInternoDividido[0]);

            //Se nome do recurso nao existe no bd, precisa o recurso com o ano com todos os meses zerados e apenas mes atual com valor
            if(!arrayNomes.includes(arrayInternoDividido[0])) {
              const arrayObjetosInterno = { 
                [campoDemanda]: arrayInternoDividido[0],
                pacientes: { 
                  ano: ano,  
                  [mes]: arrayInternoDividido[1]
                }
              };
              try {
                let demanda = new this.modeloDemanda(arrayObjetosInterno);
                await demanda.save(); 

                console.log(ano);
                console.log(mes);
                console.log(arrayObjetosInterno);
        
              } catch(errobd) {
                console.log(errobd);
              }
            } else { //se recurso ja existe no bd, verificar se ja existe o objeto ano criado no recurso dentro do array pacientes
              const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: arrayInternoDividido[0] } );
              //Se objeto ano nao existe, incluir:
              //pegando dados existentes no objeto ano do array pacientes. Ex: anoObjeto = { ano: '2023', outubro: '10' } }
              const anoObjeto = recurso.pacientes.find((elemento) => elemento.ano === ano );

              if( !anoObjeto ) {
                const objetoAtualizado = {
                  ano: ano, 
                  [mes]: arrayInternoDividido[1]
                };
                //inserir objetoAtualizado no array pacientes 
                await this.modeloDemanda.updateOne( { [campoDemanda]: arrayInternoDividido[0] }, { $push: { pacientes: objetoAtualizado } });
                
              } else {
                //Se ja tem nome do recurso e ja tem o ano a ser atualizado no bd, adiciona ou atualiza o mes solicitado no arquivo
                const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: arrayInternoDividido[0] } );
                let item = recurso.pacientes.find((elemento) => elemento.ano === ano); 
                item[mes] = arrayInternoDividido[1];
                //aviso ao mongoose qual campo foi altera. Se nao tiver um schema estruturado, preciso fazer isso pq mongoose usa setters do schema para saber qual campo foi modificado
                //recurso.markModified("pacientes");
                console.log(recurso);
                await recurso.save();
              }
            }
          }

          //Verificando se recurso existe no BD e NAO existe mais no arquivo para zerar o valor no BD
          const nomeExisteBdENaoNoArquivo = arrayNomes.filter((elementoBD) => !arrayNomesArquivo.includes(elementoBD));
          if(nomeExisteBdENaoNoArquivo.length > 0) {
            for (let i = 0; i < nomeExisteBdENaoNoArquivo.length; i++) {
              const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: nomeExisteBdENaoNoArquivo[i] } );
              let item = recurso.pacientes.find((elemento) => elemento.ano === ano); 
              item[mes] = 0;
              //aviso ao mongoose qual campo foi altera. Se nao tiver um schema estruturado, preciso fazer isso pq mongoose usa setters do schema para saber qual campo foi modificado
              //recurso.markModified("pacientes");
              await recurso.save();
            }
          }
          //console.log(arrayNomes);
          //console.log(arrayNomesArquivo);
          //console.log(nomeExisteBdENaoNoArquivo);
  
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
    const mesAtual = dataAtual.getMonth(); //retorna numero de 0 a 11. Janeiro = 0
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mesAtualExtenso = meses[mesAtual];
    const anoAtual = dataAtual.getFullYear().toString();

    let demandasFinal = [];
    let somaPacientesDemanda = 0;
    let somaPacientesAgendados = 0;

    try {
      //busca todos os recursos, pegando apenas os campos
      const demandasResultado = await this.modeloDemanda.find( {} ).sort( { [nomeRecurso]: 1 } );
      //console.log(demandasResultado);

      for (let i = 0; i < demandasResultado.length; i++ ) {

        const buscaAno = demandasResultado[i].pacientes.find((elemento2) => elemento2.ano === anoAtual );

        //so adiciona ao objeto se valor de pacientes no mes é > 0. Pq pode ser que recurso nao esta mais no arquivo demanda, mas esta no bd zerado
        if(buscaAno[mesAtualExtenso] > 0) {
          //somando total de demandas:
          somaPacientesDemanda += buscaAno[mesAtualExtenso];

          const objeto = { 
            _id: demandasResultado[i]["_id"],
            [nomeRecurso]: demandasResultado[i][ [nomeRecurso] ] ,
            qtde_pacientes: buscaAno[mesAtualExtenso],
          };


          //Inserindo quantidade de pacientes agendados do mes
          const agendados = await modeloAgendamentos.find( { recurso: demandasResultado[i][nomeRecurso]  } ).countDocuments();
          somaPacientesAgendados += agendados;

          objeto.agendado = agendados;
          demandasFinal.push(objeto);
        }

      };

      res.status(200).render(`${this.nomeDemanda}`, { demandas: demandasFinal, somaPacientesDemanda: somaPacientesDemanda, somaPacientesAgendados: somaPacientesAgendados, role: req.role, usuario: req.usuario });

    } catch(erro) {
      console.log(erro);
    }
  };



  async mostraDetalhesDemanda (req, res) {
    let nomeRecurso = "";
    if(this.nomeDemanda === "demandas_consultas") {  nomeRecurso = "especialidade"; }
    if(this.nomeDemanda === "demandas_exames") {  nomeRecurso = "exame"; }

    const { idRecurso, ano } = req.params;

    try {
      const demandaResultado = await this.modeloDemanda.findOne( { _id: idRecurso } );
      const demandaResultadoAno = demandaResultado.pacientes.find((elemento) => elemento.ano === ano);

      //colocando em um array [ [janeiro, 0], [fevereiro, 10]... ]. Retirando o primeiro elemento que seria [ano: 2024 ]
      const arrayMeses = Object.entries(demandaResultadoAno._doc).slice(1);
    
      //pegando o maior valor de pacientes dos meses do ano para usar no calculo de porcentagem do grafico
      function compareFn(a, b) {
        return b - a;
      }
      const maiorValorPacienteMes = Object.values(demandaResultadoAno._doc).sort(compareFn) [1]; //Ex: [2024, 0, 6...]. Ordeno por desc: [2024, 6, 0..] e pego o segundo elemento, excluindo o primeiro que é o ano
      
      //colocando no array meses a largura que a barra do grafico tera em cada mes. Sera o terceiro elemento. Ex: [ [janeiro, 10, 60 ]]
      const arrayMesesPorcentagem = arrayMeses.map((elemento) => {
        if( elemento[1] > 0 ) {
          const porcentagem = (elemento[1] * 100) / maiorValorPacienteMes;
          elemento.push(porcentagem);
          return elemento;
        } else {
          elemento.push(0);
          return elemento;
        }
      });

      console.log(arrayMesesPorcentagem);

      const demandaResultadoFinal = {
        recurso: demandaResultado[nomeRecurso],
        meses: arrayMesesPorcentagem,
        maiorValorPaciente: maiorValorPacienteMes,
        ano: ano
      };

      res.status(200).json(demandaResultadoFinal);

    } catch (erro) {
      console.log(erro);
    }
  }



}

export default DemandaGenericController;