import jsonwebtoken from "jsonwebtoken";

async function estaLogado(req, res, next) {
  const cookie = req.cookies.tokenJwt ;
 
  //verificando se cookie existe:
  if(typeof(cookie) === "undefined" || cookie === "" || cookie === null ) {
    //aqui abre uma excecao se estiver tentando acessar /login sem cookie. Mesmo sem cookie, da next() e vai para controlador que mostraLogin
    //esse middleware é chamado para /login tbm, pq se validar o token coloca req.logado = true e lá no controlador do login
    //consigo redirecionar para /admin (area Admin) caso o usuario ja tenha um cookie com token validado e tente acessar tela de login de novo
    if(req.url === "/login") {
      next();
    } else {
      res.status(401).send( "Acesso não autorizado" );
    }
  } else {
    //tenta traduzir cookie e da next pra rota (esse middleware vai ser colcoado antes da chamada do controlador na rota)
    //Se token nao conseguir validar, cai no catch automatico e no erro retorna undefined
    try {
      const token = await jsonwebtoken.verify(cookie, process.env.SEGREDO_JWT);

      //se usuario estiver tentando acessar /login e já tiver o jwt no cookie validado, passa logado=true na req para redirecionar para fora de login
      req.logado = true;

      //Coloco a role de cada usuario na requisicao. Ai nos controladores, sempre passo variavel role = req.role para as views ejs. 
      //Com isso consigo mostrar alguns itens apenas para alguns usuarios
      req.role = token.role;
      req.usuario = token.usuario;
      
      //checando se usuario é admin para ter acesso às rotas admins. Se comecar com /admin precisar ter token.role === admin
      if(req.url.substring(0,6) === "/admin" && token.role !== "admin") {
        res.status(401).send( "Acesso não autorizado");
      } else {
        
        next();

      }
    } catch(erro) {
      console.log("erro ", erro);
      res.status(401).send( "Acesso não autorizado");
    }
  }

}
export default estaLogado;