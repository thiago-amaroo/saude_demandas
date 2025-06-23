const url = window.location.pathname;
const recurso = url.substring(18);

const elementosRecurso = document.querySelectorAll(".botao");

elementosRecurso.forEach((elemento) => {
  elemento.addEventListener("click", () => {
    //Chamando o modal de confirmacao de login que esta no arquivo ejs
    // eslint-disable-next-line no-undef
    $(function() { // vai executar com o DOM estiver pronto.
      // eslint-disable-next-line no-undef
      var myModal = new bootstrap.Modal(document.getElementById("ModalDetalhes")); // ref modal
      myModal.show(); // chama o comando show para abrir
    });

    const data_atual = new Date();
    const ano = data_atual.getFullYear();
    mostraDetalhes(elemento.id, ano); 
  });
});



function mostraDetalhes(idRecurso, ano) {

  //Limpando a div modal-conteudo e div modal-mensagem do modal
  document.querySelector("#modal-conteudo").innerHTML ="" ;
  document.querySelector("#modal-mensagem-erro").style.display = "none";
  document.querySelector("#modal-mensagem-sucesso").style.display = "none";  

  fetch(`/publico/demandas/${recurso}/${idRecurso}/${ano}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(dados),
  })
    .then(response => response.json())
    .then(data => {
    
      let cabecalho = "";
      cabecalho += `: Recurso ${data.recurso} - Ano: ${data.ano} <br>`;
      if(recurso === "recursos_internos") {
        cabecalho += ": Atendimentos";
      } else {
        cabecalho += ": Demandas";
      }
      document.querySelector("#ModalDetalhesLabel").innerHTML = cabecalho;
      let html ="";
      html += "<select id=\"troca-ano-detalhes\">";

      for(let i = 0; i < data.todosAnos.length; i++) {
        html += `<option value=${data.todosAnos[i]} data-ano=${data.todosAnos[i]}> ${data.todosAnos[i]} </option> `;
      }
      
      html += `
        </select>
        <br> <br>

        <table width="100%"> `;

      for( let i = 0; i < data.meses.length; i++ ) {
        html += `
                <tr>
                    <td width="10%">
                        ${ data.meses[i][0].substring(0,3).toUpperCase() }: 
                    </td>
                    <td width="8%">
                        <b> ${data.meses[i][1]} </b>
                    </td>
                    <td> 
                        <img src="/imgs/barra.png" height="20px" width=${data.meses[i][2]}%>
                    </td>
                </tr>
          ` ;
      }

      html += "</table>";
      document.querySelector("#modal-conteudo").innerHTML = html;

      //adicionando atributo selected ao ano escolhido
      //O seu select:
      const selectedoption = document.getElementById("troca-ano-detalhes");
      //As opções do seu select. Isto aqui é uma coleção:
      const options = selectedoption.options;

      for(let i = 0; i < options.length; i++) {
        if ( options[i].value === data.ano) {
          options[i].setAttribute("selected", "true");
        }
      }

      //Funcao para chamar mostraDetalhes e atualizar ano de acordo com escolhido no select
      const trocaAno = document.getElementById("troca-ano-detalhes");
      trocaAno.addEventListener("change", function () {
        const selecionada = this.options[this.selectedIndex];
        const anoSelecionado = selecionada.getAttribute("data-ano");
        if (anoSelecionado) mostraDetalhes(idRecurso, anoSelecionado);
      });

    })
    .catch(error => console.log(error));
}






//GRAFICO ANUAL
const imgGraficoAnual = document.getElementById("grafico-anual");
const data_atual = new Date();
const ano = data_atual.getFullYear();

imgGraficoAnual.addEventListener("click", () => {
  //Chamando o modal de confirmacao de login que esta no arquivo ejs
  // eslint-disable-next-line no-undef
  $(function() { // vai executar com o DOM estiver pronto.
    // eslint-disable-next-line no-undef
    var myModal = new bootstrap.Modal(document.getElementById("ModalGraficoAnual")); // ref modal
    myModal.show(); // chama o comando show para abrir
  });
  mostraGraficoAnual(ano);
});


function mostraGraficoAnual(ano) {

  //Limpando a div modal-conteudo e div modal-mensagem do modal
  document.querySelector("#modal-grafico-anual-conteudo").innerHTML ="" ;
  document.querySelector("#modal-grafico-anual-mensagem-erro").style.display = "none";
  document.querySelector("#modal-grafico-anual-mensagem-sucesso").style.display = "none";  

  fetch(`/publico/demandas/${recurso}/${ano}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(dados),
  })
    .then(response => response.json())
    .then(data => {
 

      let cabecalho = "";
      cabecalho += `Ano ${data.ano} -`;
      if(recurso === "recursos_internos") {
        cabecalho += " Atendimentos - Recursos Internos";
      } else if (recurso === "consultas") {
        cabecalho += " Demandas - Consultas";
      } else {
        cabecalho += " Demandas - Exames";
      }

      document.querySelector("#ModalGraficoAnualLabel").innerHTML = cabecalho;
      let html = "";
      html += "<select id=\"troca-ano-detalhes-anual\">";

      for(let i = 0; i < data.todosAnos.length; i++) {
        html += `<option value=${data.todosAnos[i]} data-ano=${data.todosAnos[i]}> ${data.todosAnos[i]} </option> `;
      }
      
      html += `
        </select>
        <br> <br>

        <table width="100%"> `;

      for( let i = 0; i < data.meses.length; i++ ) {
        html += `
                <tr>
                    <td width="10%">
                        ${ data.meses[i][0].substring(0,3).toUpperCase() }: 
                    </td>
                    <td width="8%">
                        <b> ${data.meses[i][1]} </b>
                    </td>
                    <td> 
                        <img src="/imgs/barra.png" height="20px" width=${data.meses[i][2]}%>
                    </td>
                </tr>
          ` ;
      }

      html += "</table>";

      document.querySelector("#modal-grafico-anual-conteudo").innerHTML = html;

      //adicionando atributo selected ao ano escolhido
      //O seu select:
      const selectedoption = document.getElementById("troca-ano-detalhes-anual");
      //As opções do seu select. Isto aqui é uma coleção:
      const options = selectedoption.options;

      for(let i = 0; i < options.length; i++) {
        if ( options[i].value === data.ano) {
          options[i].setAttribute("selected", "true");
        }
      }

      //Funcao para chamar mostraDetalhes e atualizar ano de acordo com escolhido no select
      const trocaAno = document.getElementById("troca-ano-detalhes-anual");
      trocaAno.addEventListener("change", function () {
        const selecionada = this.options[this.selectedIndex];
        const anoSelecionado = selecionada.getAttribute("data-ano");
        if (anoSelecionado) mostraGraficoAnual(anoSelecionado);
      });
    })
    .catch(error => console.log(error));
}

// const anoSelecionado = selecionada.getAttribute("data-ano");
// if (anoSelecionado) mostraGraficoAnual(anoSelecionado);
// mudei para nao repetir variavel ano que funcao recebe como parametro

//era 
// const ano = selecionada.getAttribute("data-ano");
// if (ano) mostraGraficoAnual(ano);