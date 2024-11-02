import express from "express";
import UserController from "../controllers/UserController.js";
import estaLogado from "../middlewares/estaLogado.js";

const router = express.Router();

router
  .get("/inicio", estaLogado, UserController.mostraInicio)
  .get("/login", estaLogado, UserController.mostrarLogin) //chama estaLogado para verificar se ja esta logado e redirecionar
  .post("/login", UserController.fazerLogin)
  //.get("/users", UserController.listaUsers)

  
  .get("/logout", UserController.logout)

  .get("/admin/cadastro", estaLogado, UserController.mostrarCadastro)
  .post("/admin/cadastro", estaLogado, UserController.fazerCadastro)

  .get("/admin", estaLogado, UserController.mostraAreaAdmin);

  

  

  


  

export default router;