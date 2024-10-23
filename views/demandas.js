const elementosRecurso = document.querySelectorAll(".botao");

elementosRecurso.forEach((elemento) => {
  elemento.addEventListener("click", () => {
    //Chamando o modal de confirmacao de login que esta no arquivo ejs
    $(function() { // vai executar com o DOM estiver pronto.
      var myModal = new bootstrap.Modal(document.getElementById("ModalDetalhes")); // ref modal
      myModal.show(); // chama o comando show para abrir
    });

    const data_atual = new Date();
    const ano = data_atual.getFullYear();
    mostraDetalhes(elemento.id, ano); 
  });
});



function mostraDetalhes(idRecurso, ano) {
  console.log(ano);
  console.log(idRecurso);
  //Limpando a div modal-conteudo e div modal-mensagem do modal
  document.querySelector("#modal-conteudo").innerHTML ="" ;
  document.querySelector("#modal-mensagem-erro").style.display = "none";
  document.querySelector("#modal-mensagem-sucesso").style.display = "none";  

  fetch(`/demandas/consultas/${idRecurso}/${ano}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    //body: JSON.stringify(dados),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      document.querySelector("#ModalDetalhesLabel").innerHTML = `Recurso ${data.recurso} - Ano: ${data.ano}`;
      document.querySelector("#modal-conteudo").innerHTML = `
        <select id="troca-ano">
        <option value="2024"> 2024 </option>
        </select>
        <br> <br>

        <table width="100%"> `;

      for( let i = 0; i < data.meses; i++ ) {
            
        document.querySelector("#modal-conteudo").innerHTML =+ `
                <tr>
                    <td width="20%">
                        ${data.meses[i][0]}
                    </td>
                    <td> 
                        <img src="/imgs/barra.png" height="12px" width=100%>
                    </td>
                </tr>
          ` ;
      }

      document.querySelector("#modal-conteudo").innerHTML =+ "</table>";
    })
    .catch(error => console.log(error));
}






