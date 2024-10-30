import fs from "fs";
import url from "url";
import path from "path";

async function lerArquivo(req, res) {

  const caminhoAtual = url.fileURLToPath(import.meta.url);
  const diretorio = path.join(caminhoAtual, "../../..", "uploadsTemp/demandasDb.csv");

  try { 
    //lendo o arquivo que foi feito o upload no midleware anterior a chamada do controlador
    const conteudo =  fs.readFileSync(diretorio, "utf-8");

    //Ex: saida:  [2024, 'janeiro', 'acupuntura;2','alergologia;6']
    const array1 = conteudo.toLowerCase().replaceAll("\r","").split("\n");
    
    return array1;
    
  } catch (erro) {
    console.log(erro);
    res.status(500).render("areaAdmin", { bdAtualizado: false, mensagem: "Erro ao ler o arquivo.", role: req.role, usuario: req.usuario } );
  }

           
}


export default lerArquivo;