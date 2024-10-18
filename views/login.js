const form = document.getElementById("form-login");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuario = form["input-usuario"].value;
  const senha = form["input-senha"].value;

  const dados = {
    usuario: usuario,
    senha: senha
  };
  
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  })
    .then(response => response.json())
    .then(data => {
      //se retornou login = true
      if(data.logado) {
        window.location.href = "/demandas/consultas";
      } else {
        //se deu erro mostra mensagem de erro na tela de login
        document.getElementById("p-erro").innerHTML = data.mensagem;
        console.log(data);
      }
    })
    .catch(error => console.log(error));

});