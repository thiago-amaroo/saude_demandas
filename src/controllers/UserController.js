import users from "../models/User.js";
import autenticarUsuario from "../utils/autenticarUsuario.js";
import criaHasheSalSenha from "../utils/criarHashESalSenha.js";
import gerarJwt from "../utils/gerarJwt.js";

class LoginController {

  static mostrarLogin = (req, res) => {
    //checar se usuario ja esta logado e possui o cookie com o token:
    //middleware estaLogado.js coloca propriedade logado = true na requisicao
    if(req.logado) {
      res.status(200).redirect("/demandas/consultas");
    } else {
      res.status(200).render("login");
    }
  };

  static mostrarCadastro = (req, res) => {
    res.status(200).render("cadastro", { role: req.role, usuario: req.usuario } );
  };

  static mostraAreaAdmin = (req, res) => {
    res.status(200).render("areaAdmin", { role: req.role, usuario: req.usuario });
  };

  static fazerLogin = async (req, res) => {
    const { usuario, senha } = req.body;
    //checando se digitou usuario e senha
    if (!usuario || !senha ) {
      res.status(400).json( { logado: false, mensagem: "Nome de Usuario e senha obrigatorios" });
    } else {

      try {
        //checando se existe usuario digitado
        const usuarioBdObjeto = await users.findOne( { "usuario": usuario } );
        if(!usuarioBdObjeto) {
          res.status(200).json( { logado: false, mensagem: "Nome de Usuario nao encontrado" } );
        } else {
          //checando se senha do usuario é valida
          const autenticado = autenticarUsuario(senha, usuarioBdObjeto);
          if(!autenticado) {
            res.status(200).json( { logado: false, mensagem: "Senha invalida" } );
          } else {
            //se tudo deu certo, faz login, cria jwt contendo usuario digitado e a role desse usuario do bd e envia cookie
            const tokenJwt = gerarJwt( {usuario: usuario, role: usuarioBdObjeto.role } );
            console.log(usuarioBdObjeto.role);
            res.status(200).cookie("tokenJwt", tokenJwt).json( { logado: true, mensagem: "Usuario logado  com sucesso" } );
          }
        }
      } catch (erro) {
        console.log(erro);
      }

    }
    
  };

  static fazerCadastro = async (req, res) => {
    const { usuario, senha, role } = req.body;
    //verifica se digitou usuario e senha
    if (!usuario || !senha || !role ) {
      res.status(400).json( { cadastro: false, mensagem: "Nome de Usuario, senha e role obrigatorios" });
    } else {
      //cria hash e sal senha
      const { hashSenha, salSenha } = criaHasheSalSenha(senha);
     
      try {
        const userJaExiste = await users.findOne( { usuario: usuario } );
        //verifica se usuario ja existe no bd
        if(userJaExiste !== null) {
          res.status(200).json( {cadastro: false, mensagem: "Usuario ja existe"} );
        } else {
          let user = new users( { usuario: usuario, hashSenha: hashSenha, salSenha: salSenha, role: role } );
          await user.save();
          res.status(201).json( {cadastro: true, mensagem: "Cadastro realizado com sucesso"} );

        }
      } catch (erro) {
        console.log(erro);
      }
    }
  };

  static logout = async ( req, res ) => {
    res.clearCookie("tokenJwt").redirect("/login");
  };


  // static listaUsers = async (req, res) => {
  //   try {
  //     const usuarios = await users.find();
  //     res.status(200).send(usuarios);
  //   } catch (erro) {
  //     console.log(erro);
  //   }
  // };
  
}

export default LoginController;