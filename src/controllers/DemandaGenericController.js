import modeloAgendamentos from "../models/Demanda-agendamentos.js";
import lerArquivo from "../utils/lerArquivo.js";


class DemandaGenericController {
  constructor(modeloDemanda, nomeDemanda) {
    this.modeloDemanda = modeloDemanda, //armazena o modelo da demanda (consulta ou exame) para realizar operacoes na demandas_consultas ou demandas_exames
    this.nomeDemanda = nomeDemanda; //armazena o texto do nome da demanda (demandas_consultas ou demandas_exames) p/ redirecionar para  view, ou mostrar nome do bd atualizado
  }
 
  async atualizaDemandas(req, res, next)  {
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

    try {

      const consultaNomes = await this.modeloDemanda.find({}, [campoDemanda]);
      consultaNomes.forEach((elemento) => arrayNomes.push( elemento[ [campoDemanda] ] ) );
  
      //esse array tira os \r da string e divide a string de texto na quebra de linha
      //Primeira linha: ano. Segunda linha: mes
      //Ex: saida:  [2024, 'janeiro', 'acupuntura;2','alergologia;6']
      const array1 =  await lerArquivo();
      //se retornou erro da funcao lerArquivo array1 = objeto erro e array1.code tem codigo do erro
      if(array1.code) {
        next(array1);
      }

      const ano = array1[0].trim().replaceAll(";","");
      const mes = array1[1].trim().replaceAll(";","");
       
      const arrayNomesArquivo = [];
  
      //esse array percorre o array de string. Comeca no indice 2 pq indice 0 = ano e indice 1 = mes (as duas primeiras linhas do arquivo)
      //Ex: array1 = ['acumputura;2', 'alergologia;3'] 
      for(let i = 2; i < array1.length; i++) { 
        const arrayInternoDividido = array1[i].split(";"); //Ex: arrayInternoDividido = ['acupuntura', '2']. 

        //Tirando espaços extras
        const nomeDoRecursoSemEspacos = arrayInternoDividido[0].trim();
           
        //Se nome do recurso ja esta no BD, porem nao esta no arquivo, significa que saiu da demanda. Preciso zerar o numero de pacientes do mes do arquivo
        //Se sai da demanda no mes seguinte, nao tem problema, pq vai estar zerado e listaDemandas só lista os recursos maior que 0
        //Mas se sai no mesmo mes, recurso nao vai estar no arquivo e preciso zerar o mes no bd. Colocando todos recursos do arquivo em um array
        arrayNomesArquivo.push( nomeDoRecursoSemEspacos );

        //Se nome do recurso nao existe no bd, precisa o recurso com o ano com todos os meses zerados e apenas mes atual com valor
        if(!arrayNomes.includes( nomeDoRecursoSemEspacos )) {

          const arrayObjetosInterno = { 
            [campoDemanda]: nomeDoRecursoSemEspacos,
            pacientes: { 
              ano: ano,  
              [mes]: arrayInternoDividido[1]
            }
          };
        
          let demanda = new this.modeloDemanda(arrayObjetosInterno);
          await demanda.save(); 

          console.log(ano);
          console.log(mes);
          console.log(arrayObjetosInterno);
        
        } else { //se recurso ja existe no bd, verificar se ja existe o objeto ano criado no recurso dentro do array pacientes

          const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: nomeDoRecursoSemEspacos } );
          //Se objeto ano nao existe, incluir:
          //pegando dados existentes no objeto ano do array pacientes. Ex: anoObjeto = { ano: '2023', outubro: '10' } }
          const anoObjeto = recurso.pacientes.find((elemento) => elemento.ano === ano );
  
          if( !anoObjeto ) {
            const objetoAtualizado = {
              ano: ano, 
              [mes]: arrayInternoDividido[1]
            };
              //inserir objetoAtualizado no array pacientes 
            await this.modeloDemanda.updateOne( { [campoDemanda]: nomeDoRecursoSemEspacos }, { $push: { pacientes: objetoAtualizado } });
                  
          } else {
            //Se ja tem nome do recurso e ja tem o ano a ser atualizado no bd, adiciona ou atualiza o mes solicitado no arquivo
            const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: nomeDoRecursoSemEspacos } );
            let item = recurso.pacientes.find((elemento) => elemento.ano === ano); 
            item[mes] = arrayInternoDividido[1];
            //aviso ao mongoose qual campo foi altera. Se nao tiver um schema estruturado, preciso fazer isso pq mongoose usa setters do schema para saber qual campo foi modificado
            //recurso.markModified("pacientes");
            console.log(recurso);
            await recurso.save();
          }
        }
      } //fecha for

      //Verificando se recurso existe no BD e NAO existe mais no arquivo para zerar o valor no BD
      const nomeExisteBdENaoNoArquivo = arrayNomes.filter((elementoBD) => !arrayNomesArquivo.includes(elementoBD));
      console.log(nomeExisteBdENaoNoArquivo);
      if(nomeExisteBdENaoNoArquivo.length > 0) {
        for (let i = 0; i < nomeExisteBdENaoNoArquivo.length; i++) {

          const recurso = await this.modeloDemanda.findOne( { [campoDemanda]: nomeExisteBdENaoNoArquivo[i] } );
          let item = recurso.pacientes.find((elemento) => elemento.ano === ano); 
          //Se recurso nao esta no arquivo, demanda zerou. Mas se zerou no primeiro dia de janeiro do ano seguinte, nao vou ter o objeto
          //do ano no recurso pq como recurso nao esta mais no arquivo, nao cria nada no bd. Entao só vai zerar o mes, se o ano do arquivo
          //ja existir e for maior que zero. Ex: demanda acumputura de setembro estava 2. Em setembro mesmo zerou e saiu do arquivo
          //nesse caso ano ja existe e o mes esta maior que zero (2). ele vai zerar setembro no bd. Se setembro fecha com 2 e zero no primeiro dia de 
          //outubro, no arquivo vai estar para atualizar outubro e no bd já vai estar zerado por padrao, entao nao precisa atualizar bd.
          //Se tinha demanda em dez/24 e zerou em 1 jan/25, ao atualizar jan/25 ele cria o ano 2025 na demanda com meses zerados
          //Caso recurso retorne à demanda e ao arquivo, será inserido o objeto ano com valor apenas no mes a atualizar
          if( item  ) {
            if(  item[mes] > 0 ) {
              item[mes] = 0;
              //aviso ao mongoose qual campo foi altera. Se nao tiver um schema estruturado, preciso fazer isso pq mongoose usa setters do schema para saber qual campo foi modificado
              //recurso.markModified("pacientes");
              await recurso.save();
            }
          } else {
            //Se eu nao tiver o ano no recurso que nao tem mais no arquivo (demanda zerou), pode ser que zerou no dia 1. de janeiro do ano seguinte
            //Nesse caso, nao terei objeto ano no recurso pq nao foi criado pois nao estava no arquivo. 
            //Entao ele cria o objeto ano com o meses zerados. Dessa forma, mesmo que recurso nao esteja no arquivo, os anos sao criados zerados
            const objetoAtualizado = {
              ano: ano, 
              [mes]: 0
            };
            recurso.pacientes.push(objetoAtualizado);
            await recurso.save();
            //inserir objetoAtualizado no array pacientes 
            //await this.modeloDemanda.updateOne( { [campoDemanda]: arrayInternoDividido[0] }, { $push: { pacientes: objetoAtualizado } });
          } 
        }
      }
    
      res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: `Banco de dados ${this.nomeDemanda} atualizado com sucesso.`, role: req.role, usuario: req.usuario } );
      
    } catch(erro) {
      console.log(erro);
      erro.localDoErro = "admin";
      erro.mensagem = `Erro ao atualizar o banco de dados ${this.nomeDemanda}: "${erro}"`;
      next(erro);
    }
    //console.log(arrayNomes);
    //console.log(arrayNomesArquivo);
    //console.log(nomeExisteBdENaoNoArquivo);
        
  };

  

  async listaDemandas (req, res, next) {
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
        if( buscaAno && buscaAno[mesAtualExtenso] > 0 ) {
          //somando total de demandas:
          somaPacientesDemanda += buscaAno[mesAtualExtenso];

          const objeto = { 
            _id: demandasResultado[i]["_id"],
            [nomeRecurso]: demandasResultado[i][ [nomeRecurso] ] ,
            qtde_pacientes: buscaAno[mesAtualExtenso],
          };

          //Inserindo quantidade de pacientes agendados do mes
          const agendados = await modeloAgendamentos.find( { recurso: demandasResultado[i][nomeRecurso].trim()  } ).countDocuments();
          somaPacientesAgendados += agendados;

          //console.log( `${demandasResultado[i][nomeRecurso]}: ${agendados} `);
          objeto.agendado = agendados;
          demandasFinal.push(objeto);
        }

      };

      //console.log(demandasFinal);
      res.status(200).render(`${this.nomeDemanda}`, { demandas: demandasFinal, somaPacientesDemanda: somaPacientesDemanda, somaPacientesAgendados: somaPacientesAgendados, role: req.role, usuario: req.usuario });

    } catch(erro) {
      console.log(erro);
      erro.localDoErro = this.nomeDemanda;
      erro.mensagem = `Erro ao carregar a pagina "${this.nomeDemanda}": "${erro}"`;
      next(erro);
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
          elemento.push(porcentagem.toFixed(2));
          return elemento;
        } else {
          elemento.push(0);
          return elemento;
        }
      });

      //array de anos para poder escolher qual ano mostrar grafico
      const arrayAnos = demandaResultado.pacientes.map((elemento) => elemento.ano );
 
      console.log(arrayMesesPorcentagem);

      const demandaResultadoFinal = {
        recurso: demandaResultado[nomeRecurso],
        meses: arrayMesesPorcentagem,
        maiorValorPaciente: maiorValorPacienteMes,
        ano: ano,
        todosAnos: arrayAnos
      };

      res.status(200).json(demandaResultadoFinal);

    } catch (erro) {
      console.log(erro);
    }
  }



  async mostraGraficoTotalDemandasAno(req, res) {
    
    const ano = req.params.ano;

    const meses = {
      0: "janeiro",
      1: "fevereiro",
      2: "marco",
      3: "abril",
      4: "maio",
      5: "junho",
      6: "julho",
      7: "agosto",
      8: "setembro",
      9: "outubro",
      10: "novembro",
      11: "dezembro"
    };

    try {
      
      const recursos = await this.modeloDemanda.find( {} );

      // [ [janeiro, 500], [fevereiro, 600] ] total de demandas do mes
      const arrayResultados = [];

      //for dos meses. Executara 12 vezes uma para cada mes percorrendo todas as especialidades e somando valor do mes de cada uma
      for(let i = 0; i < 12; i++ ) {
        let somaDoMes = 0; //ex: soma de janeiro de todos recursos

        for(let j = 0; j < recursos.length; j++) {
          const objetoAno = recursos[j].pacientes.find((elemento) => elemento.ano === ano);
          if(objetoAno) {
            somaDoMes += objetoAno[meses[i]]; 
          }
        } //for especialidades
        
        const arrayResultadoMes = [ meses[i], somaDoMes ];
        arrayResultados.push( arrayResultadoMes );

      }//for do mes

      console.log(arrayResultados);

      //pegando o maior valor de pacientes dos meses do ano para usar no calculo de porcentagem do grafico
      function compareFn(a, b) {
        return b - a;
      }
      const maiorValor = arrayResultados.map((elemento) => elemento[1]).sort(compareFn)[0];
       
      //colocando no array meses a largura que a barra do grafico tera em cada mes. Sera o terceiro elemento. Ex: [ [janeiro, 500, 60 ]]
      const arrayMesesPorcentagem = arrayResultados.map((elemento) => {
        if( elemento[1] > 0 ) {
          const porcentagem = (elemento[1] * 100) / maiorValor;
          elemento.push(porcentagem.toFixed(2));
          return elemento;
        } else {
          elemento.push(0);
          return elemento;
        }
      });


      //array de anos para poder escolher qual ano mostrar grafico. Busco todos os anos dos recursos, pego ano em array e removo duplicados
      const arrayAnos = [];
      for(let i = 0; i < recursos.length; i++) {
        const objetoAno = recursos[i].pacientes.map((elemento) => elemento.ano );
        arrayAnos.push(...objetoAno); 
        
      }
      //removendo anos repetidos
      const arrayAnosNaoRepetidos = [...new Set(arrayAnos)];

      const demandaResultadoFinal = {
        meses: arrayMesesPorcentagem,
        maiorValorPaciente: maiorValor,
        ano: ano,
        todosAnos: arrayAnosNaoRepetidos
      };

      console.log(demandaResultadoFinal);
      res.status(200).json(demandaResultadoFinal);


    } catch(erro) {
      console.log(erro);
    }


  }

}



export default DemandaGenericController;