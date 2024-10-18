import jwt from "jsonwebtoken";

function gerarJwt(payload) {
  const tokenJwt = jwt.sign(payload, process.env.SEGREDO_JWT, {
    expiresIn: "10h"
  });

  return tokenJwt;
}

export default gerarJwt;