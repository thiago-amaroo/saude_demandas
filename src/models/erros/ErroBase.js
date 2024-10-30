class ErroBase extends Error {
  constructor(mensagem = "Erro interno do servidor", status = 500) {
    super();
    this.message = mensagem,
    this.status = status;
  }

  enviarResposta(req, res) {
    res.status(this.status).render("areaAdmin", { bdAtualizado: false, mensagem: this.message, role: req.role, usuario: req.usuario } );
  }
}

export default ErroBase;






//extend Error, classe de erros nativa do JS
// class ErroBase extends Error {
//   constructor(mensagem = "Erro interno do servidor", status = 500) {
//     super();
//     this.message = mensagem,
//     this.status = status;
//   }
  
//   enviarResposta(res) {
//     res.status(this.status).send({
//       mensagem: this.message,
//       status: this.status });
//   }
// }
  
// export default ErroBase;