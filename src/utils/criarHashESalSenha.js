import { randomBytes, scryptSync } from "crypto";

function criaHasheSalSenha(senhaDigitada) {
  const salSenha = randomBytes(16).toString("hex");

  const hashSenha = scryptSync(senhaDigitada, salSenha, 64).toString("hex"); //64 tamanho da senha

  return {
    salSenha: salSenha,
    hashSenha: hashSenha
  };
}

export default criaHasheSalSenha;