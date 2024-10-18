const form = document.getElementById("form-cadastro");
const pMensagem = document.getElementById("p-mensagem");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuarioDigitado = form["input-usuario"].value;
  const senhaDigitado = form["input-senha"].value;
  const roleDigitado = form["input-role"].value;

  const dados = {
    usuario: usuarioDigitado,
    senha: senhaDigitado,
    role: roleDigitado
  };
  
  fetch("/admin/cadastro", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  })
    .then(response => response.json())
    .then(data => {
      if(data.cadastro) {
        alert("Cadastro efetuado com sucesso.");
        window.location.href = "/admin";
      } else {
        pMensagem.innerHTML = `Erro: ${data.mensagem} `;
      }
      console.log(data);
    })
    .catch(error => console.log(error));

});