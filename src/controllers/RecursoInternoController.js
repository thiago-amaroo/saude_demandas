import modeloRecursosInternos from "../models/Recurso-Interno.js";
import lerArquivo from "../utils/lerArquivo.js";


class RecursoInternoController {

  static atualizaRecursosInternos = async (req, res) => {
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

    } catch(erro) {
      console.log(erro);
    }
    
    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    //esse array tira os \r da string e divide a string de texto na quebra de linha
    //Primeira linha: ano. Segunda linha: mes
    //Ex: saida:  [2024, 'janeiro', 'raio-x;0;30','psicologia;25;30']
    const array1 = await lerArquivo(req, res);

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
        try {
          let demanda = new modeloRecursosInternos(arrayObjetosInterno);
          await demanda.save(); 

          console.log(ano);
          console.log(mes);
          console.log(arrayObjetosInterno);
        
        } catch(errobd) {
          console.log(errobd);
          res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao atualizar o banco de dados\"Recursos Internos\".", role: req.role, usuario: req.usuario } );

        }
      } else { //se recurso ja existe no bd, verificar se ja existe o ano criado no recurso
        try {
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
        } catch(erro) {
          console.log(erro);
          res.status(200).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao atualizar o banco de dados\"Recursos Internos\".", role: req.role, usuario: req.usuario } );
        }
      }
    }

  
    res.status(200).render("areaAdmin", { bdAtualizado: true, mensagem: "Banco de dados \"Recursos Internos\" atualizado com sucesso.", role: req.role, usuario: req.usuario } );

  };


  static listaRecursosInternos = async ( req, res ) => {

    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); //retorna numero de 0 a 11. Janeiro = 0
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mesAtualExtenso = meses[mesAtual];
    const anoAtual = dataAtual.getFullYear().toString();

    let demandasRecursosInternosFinal = [];
    let somaPacientesDemanda = 0;
    let somaPacientesAtendidos = 0;

    try {
      //busca todos os recursos, pegando apenas os campos
      const demandasRecursosInternos = await modeloRecursosInternos.find( {} ).sort( { recurso: 1 } );
      console.log(demandasRecursosInternos);

      for (let i = 0; i < demandasRecursosInternos.length; i++ ) {

        const buscaAno = demandasRecursosInternos[i].pacientes.find((elemento2) => elemento2.ano === anoAtual );

        //somando total de demandas:
        somaPacientesDemanda += buscaAno[mesAtualExtenso]["demanda"];
        somaPacientesAtendidos += buscaAno[mesAtualExtenso]["atendidos"];

        const objeto = { 
          _id: demandasRecursosInternos[i]["_id"],
          recurso: demandasRecursosInternos[i]["recurso"] ,
          demanda: buscaAno[mesAtualExtenso]["demanda"],
          atendidos: buscaAno[mesAtualExtenso]["atendidos"]
        };

        demandasRecursosInternosFinal.push(objeto);
      };

      console.log(demandasRecursosInternosFinal);

      res.status(200).render("demandas_recursos_internos", { demandasRecursosInternos: demandasRecursosInternosFinal, somaPacientesDemanda: somaPacientesDemanda, somaPacientesAtendidos: somaPacientesAtendidos, role: req.role, usuario: req.usuario });

    } catch(erro) {
      console.log(erro);
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

      console.log(arrayMesesPorcentagem);

      const demandaRecursoInternoFinal = {
        recurso: demandaRecursoInternoResultado["recurso"],
        meses: arrayMesesPorcentagem,
        //maiorValorPaciente: maiorValorAtendimentoMes,
        ano: ano
      };

      res.status(200).json(demandaRecursoInternoFinal);

    } catch (erro) {
      console.log(erro);
    }

  };

}

export default RecursoInternoController;

