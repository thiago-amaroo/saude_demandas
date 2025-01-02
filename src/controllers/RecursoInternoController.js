import modeloRecursosInternos from "../models/Recurso-Interno.js";
import lerArquivo from "../utils/lerArquivo.js";


class RecursoInternoController {

  static atualizaRecursosInternos = async (req, res, next) => {
    //deletando todos os documentos da colecao no mongodb atlas
    // try { 
    //   await modeloRecursosInternos.deleteMany({});
    // } catch (erro) {
    //   console.log(erro);
    // }


    //Pegando nomes do recurso interno do bd e pondo em um array para checar se ja existe. Se nao existe cria, se existe, vai atualizar o mes
    let arrayNomes =[];
   
    try {

      const consultaNomes = await modeloRecursosInternos.find({}, "recurso" );
      consultaNomes.forEach((elemento) => arrayNomes.push( elemento["recurso"] ) );

    
      //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
      //esse array tira os \r da string e divide a string de texto na quebra de linha
      //Primeira linha: ano. Segunda linha: mes
      //Ex: saida:  [2024, 'janeiro', 'raio-x;0;30','psicologia;25;30']
      const array1 = await lerArquivo();
      //se retornou erro da funcao lerArquivo array1 = objeto erro e array1.code tem codigo do erro
      if(array1.code) {
        next(array1);
      }

      const ano = array1[0].trim().replaceAll(";","");
      const mes = array1[1].trim().replaceAll(";","");
   
      //esse array percorre o array de string. Comeca no indice 2 pq indice 0 = ano e indice 1 = mes (as duas primeiras linhas do arquivo)
      for(let i = 2; i < array1.length; i++) {
        const arrayInternoDividido = array1[i].split(";"); //Ex: saida:  [  ['raio-x', '0', '30']  ]
            
        //Se nome do recurso nao existe no bd, precisa criar o recurso com o ano com todos os meses zerados e apenas mes atual com valor
        if(!arrayNomes.includes(arrayInternoDividido[0])) {
          const arrayObjetosInterno = { 
            recurso: arrayInternoDividido[0],
            pacientes: { 
              ano: ano,  
              [mes]: {
                demanda: arrayInternoDividido[1],
                atendidos: arrayInternoDividido[2]
              }
            }
          };
        
          let demanda = new modeloRecursosInternos(arrayObjetosInterno);
          await demanda.save(); 

          console.log(ano);
          console.log(mes);
          console.log(arrayObjetosInterno);
        
       
        } else { //se recurso ja existe no bd, verificar se ja existe o ano criado no recurso
        
          const recurso = await modeloRecursosInternos.findOne( { recurso: arrayInternoDividido[0] } );
          //Se ano nao existe, incluir:
          //pegando dados existentes no objeto ano do array pacientes. Ex: anoObjeto = { ano: '2023', outubro: '10' } }
          const anoObjeto = recurso.pacientes.find((elemento) => elemento.ano === ano );

          if( !anoObjeto ) {
            const objetoAtualizado = {
              ano: ano, 
              [mes]: {
                demanda: arrayInternoDividido[1],
                atendidos: arrayInternoDividido[2]
              }
            };
            //inserir objetoAtualizado no array pacientes 
            await modeloRecursosInternos.updateOne( { recurso: arrayInternoDividido[0] }, { $push: { pacientes: objetoAtualizado } });
                
          } else {
          //Se ja tem nome do recurso e ja tem o ano a ser atualizado no bd, adiciona ou atualiza o mes solicitado no arquivo
            const recurso = await modeloRecursosInternos.findOne( { recurso: arrayInternoDividido[0] } );
            let item = recurso.pacientes.find((elemento) => elemento.ano === ano); 
            item[mes] = {
              demanda: arrayInternoDividido[1],
              atendidos: arrayInternoDividido[2]
            };
            //aviso ao mongoose qual campo foi altera. Se nao tiver um schema estruturado, preciso fazer isso pq mongoose usa setters do schema para saber qual campo foi modificado
            //recurso.markModified("pacientes");
            console.log(recurso);
            await recurso.save();
          }
        }
      }

      res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados \"Recursos Internos\" atualizado com sucesso.", role: req.role, usuario: req.usuario } );

    } catch(erro) {
      erro.localDoErro = "admin";
      erro.mensagem = `Erro ao atualizar o banco de dados "recursos_internos": "${erro}"`;
      next(erro);
    }
  };
  

  static listaRecursosInternos = async ( req, res, next ) => {

    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); //retorna numero de 0 a 11. Janeiro = 0
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mesAtualExtenso = meses[mesAtual];
    const anoAtual = dataAtual.getFullYear().toString();

    let demandasRecursosInternosFinal = [];
    let somaPacientesDemandaSemPrevencao = 0;
    let somaPacientesAtendidosSemPrevencao = 0;

    let somaPacientesDemandaComPrevencao = 0;
    let somaPacientesAtendidosComPrevencao = 0;

    try {
      //busca todos os recursos, pegando apenas os campos
      const demandasRecursosInternos = await modeloRecursosInternos.find( {} ).sort( { recurso: 1 } );

      for (let i = 0; i < demandasRecursosInternos.length; i++ ) {

        const buscaAno = demandasRecursosInternos[i].pacientes.find((elemento2) => elemento2.ano === anoAtual );

        if( buscaAno ) {
          //somando total de demandas: Soma com prevencao no nome separado dos que nao tem prevencao no nome

          if( demandasRecursosInternos[i]["recurso"].includes("prevenção") ) {
            somaPacientesDemandaComPrevencao += buscaAno[mesAtualExtenso]["demanda"];
            somaPacientesAtendidosComPrevencao += buscaAno[mesAtualExtenso]["atendidos"];
          } else {
            somaPacientesDemandaSemPrevencao += buscaAno[mesAtualExtenso]["demanda"];
            somaPacientesAtendidosSemPrevencao += buscaAno[mesAtualExtenso]["atendidos"];
          }

          const objeto = { 
            _id: demandasRecursosInternos[i]["_id"],
            recurso: demandasRecursosInternos[i]["recurso"] ,
            demanda: buscaAno[mesAtualExtenso]["demanda"],
            atendidos: buscaAno[mesAtualExtenso]["atendidos"]
          };

          demandasRecursosInternosFinal.push(objeto);
        }
      };

      //somando totais de com prevencao e de sem prevencao
      let somaPacientesDemandaTotal = somaPacientesDemandaComPrevencao + somaPacientesDemandaSemPrevencao;
      let somaPacientesAtendidosTotal = somaPacientesAtendidosComPrevencao +somaPacientesAtendidosSemPrevencao;

      res.status(200).render("demandas_recursos_internos", { 
        demandasRecursosInternos: demandasRecursosInternosFinal, 
        somaPacientesDemandaComPrevencao: somaPacientesDemandaComPrevencao, 
        somaPacientesAtendidosComPrevencao: somaPacientesAtendidosComPrevencao, 
        somaPacientesDemandaSemPrevencao: somaPacientesDemandaSemPrevencao,
        somaPacientesAtendidosSemPrevencao: somaPacientesAtendidosSemPrevencao,
        somaPacientesDemandaTotal: somaPacientesDemandaTotal,
        somaPacientesAtendidosTotal: somaPacientesAtendidosTotal,
        role: req.role, 
        usuario: req.usuario 
      });

    } catch(erro) {
      console.log(erro);
      erro.localDoErro = "recursos_internos";
      erro.mensagem = `Erro ao carregar a pagina "recursos_internos": "${erro}"`;
      next(erro);
    }
  };


  static mostraDetalhesRecursoInterno = async (req, res ) => {
    //grafico dos recursos internos mostra numero de atendimentos e nao de demandas. Pq demandas sao quase sempre zero
    const { idRecurso, ano } = req.params;

    try {
      const demandaRecursoInternoResultado = await modeloRecursosInternos.findOne( { _id: idRecurso } );
      const demandaRecursoInternoResultadoAno = demandaRecursoInternoResultado.pacientes.find((elemento) => elemento.ano === ano);

      //colocando em um array [ [janeiro, {demanda: 0, atendidos: 10} ], [ [fevereiro, {demanda: 0, atendidos: 10} ]... ]. Retirando o primeiro elemento que seria [ano: 2024 ]
      const arrayMeses = Object.entries(demandaRecursoInternoResultadoAno._doc);//.sort();//.slice(1);
      console.log(arrayMeses);
      //pegando valor dos atendidos e deixando assim: [ [janeiro,  10 ], [ [fevereiro,  10]... ]. E removendo o [ano, 2024]
      //Quando chega na propriedade ano, map nao retorna nada, entao no array fica [ undefined ] onde era o elemento ano: 2024
      const arrayMesesAtendidos = arrayMeses.map((elemento) => {
        if( elemento[0] !== "ano") {
          const arrayAlterado =  [ elemento[0], elemento[1].atendidos ] ;  
          return arrayAlterado;
        }
      });
      //removendo undefined ( era o array que tinha ano: 2024 ) do array final
      const arrayMesesAtendidosFinal = arrayMesesAtendidos.filter((elemento) => elemento != undefined);

    
      console.log(arrayMesesAtendidosFinal);
    
      //pegando o maior valor de pacientes dos meses do ano para usar no calculo de porcentagem do grafico
      function compareFn(a, b) {
        return b - a;
      }
      //Pegando maior valor. Coloco em um array só o numero de atendidos (elemento[1]). depois ordeno e pego o primeiro (maior)
      const maiorValorAtendimentoMes = arrayMesesAtendidosFinal.map((elemento) => elemento[1] ).sort(compareFn) [0];
      console.log(maiorValorAtendimentoMes); 
      
      //colocando no array meses a largura que a barra do grafico tera em cada mes. Sera o terceiro elemento. Ex: [ [janeiro, 10, 60 ]]
      const arrayMesesPorcentagem = arrayMesesAtendidosFinal.map((elemento) => {
        if( elemento[1] > 0 ) {
          const porcentagem = (elemento[1] * 100) / maiorValorAtendimentoMes;
          elemento.push(porcentagem);
          return elemento;
        } else {
          elemento.push(0);
          return elemento;
        }
      });

      //array de anos para poder escolher qual ano mostrar grafico
      const arrayAnos = demandaRecursoInternoResultado.pacientes.map((elemento) => elemento.ano );
 
      const demandaRecursoInternoFinal = {
        recurso: demandaRecursoInternoResultado["recurso"],
        meses: arrayMesesPorcentagem,
        //maiorValorPaciente: maiorValorAtendimentoMes,
        ano: ano,
        todosAnos: arrayAnos
      };

      res.status(200).json(demandaRecursoInternoFinal);

    } catch (erro) {
      console.log(erro);
    }

  };




  static mostraGraficoTotalRecursosInternosAno = async (req, res) => {
    
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
      
      const recursos = await modeloRecursosInternos.find( {} );

      // [ [janeiro, 500], [fevereiro, 600] ] total de demandas do mes
      const arrayResultados = [];

      //for dos meses. Executara 12 vezes uma para cada mes percorrendo todos os recursos e somando valor do mes de cada uma
      for(let i = 0; i < 12; i++ ) {
        let somaDoMes = 0; //ex: soma de janeiro de todos recursos

        for(let j = 0; j < recursos.length; j++) {
          const objetoAno = recursos[j].pacientes.find((elemento) => elemento.ano === ano);
          if(objetoAno) {
            somaDoMes += objetoAno[meses[i]].atendidos; 
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
        const objetoAno = recursos[i].pacientes.map((elemento) => elemento.ano);
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

      res.status(200).json(demandaResultadoFinal);


    } catch(erro) {
      console.log(erro);
    }


  };


}

export default RecursoInternoController;

