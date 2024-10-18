import { scryptSync, timingSafeEqual } from "crypto";

function autenticarUsuario(senhaDigitada, usuario) {
  //criando senha hash para testar
  const hashTeste = scryptSync(senhaDigitada, usuario.salSenha, 64);

  //hash guardada no banco esta em string. preciso dela em buffer
  const hashReal = Buffer.from(usuario.hashSenha, "hex");

  const autenticado = timingSafeEqual(hashTeste, hashReal); //retorna booleano
    
  return autenticado;
}

export default autenticarUsuario;