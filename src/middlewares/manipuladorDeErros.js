// eslint-disable-next-line no-unused-vars
function manipuladorDeErros (erro, req, res, next)  {


  if (erro.localDoErro === "admin" ) {
    res.status(500).render("areaAdmin", { bdAtualizado: false, mensagem: erro.mensagem, role: req.role, usuario: req.usuario } );

  } else if (erro.localDoErro === "demandas_consultas" ) { 
    res.status(500).render("demandas_consultas", { erro: erro, mensagem: erro.mensagem, role: req.role, usuario: req.usuario } );

  } else if (erro.localDoErro === "demandas_exames" ) {
    res.status(500).render("demandas_exames", { erro: erro, mensagem: erro.mensagem, role: req.role, usuario: req.usuario } );

  } else if (erro.localDoErro === "recursos_internos" ) {
    res.status(500).render("demandas_recursos_internos", { erro: erro, mensagem: erro.mensagem, role: req.role, usuario: req.usuario } );

  }  else {
    //new ErroBase().enviarResposta(res);
  }
};

export default manipuladorDeErros;
